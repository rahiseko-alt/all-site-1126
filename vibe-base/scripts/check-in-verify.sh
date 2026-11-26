#!/usr/bin/env bash
# Check-in 機械検証スクリプト
# 起源: docs/ops/self-verification-sop.md §1-A
# 用途: セッション開始時に Check-in 区切り（A）の機械検証を一括実行
# K1-K5 パターン: docs/ops/agent-rules.md「自己検証 NG パターン早見表」参照
# 終了コード: 0=全 OK / 0=WARN（マスター承認の上で進行可）/ 1=NG（即時停止）

set +e

# 段階 2 分割後: GOV=本 script の repo / PRODUCTS=兄弟 vibe-base
GOV="$(cd "$(dirname "$0")/.." && pwd)"
PRODUCTS="$(node "$GOV/scripts/repo-paths.mjs" --products-root)"
if [ -z "$PRODUCTS" ]; then
  echo "FATAL: productsRepoRoot 解決失敗（vibe-base 不在 or repo-paths.mjs 異常）"
  exit 1
fi

OK=0
WARN=0
NG=0

echo "=== Check-in 機械検証（self-verification-sop §1-A）==="

# （A-1 PC 表バージョン照合 / B-4 旧パス検知 は PC 表廃止に伴い削除・2026-06-06）
# PC 表のバージョン照合役割は照合リスト checklist-version + /plan-finalize Stage 0.5 へ一時移植したが、当該照合リストも 2026-07-18 に全廃・バージョン照合機構自体を撤去。
# K1（タグ≠中身）/ K5（正本一本化漏れ）の概念は self-verification-sop / agent-rules に存続（PC 表固有実装のみ撤去）。

# D-3: runbook.md 全プロダクト存在確認（K2 書いてある ≠ 効いている検知）
echo ""
echo "--- D-3: runbook.md 全プロダクト存在確認（K2 書いてある ≠ 効いている検知）---"
MISSING_COUNT=0
MISSING_LIST=""
for d in "$PRODUCTS"/products/*/; do
  p=$(basename "$d")
  # 構造未整備プロダクトは除外
  case "$p" in
    doutor-clone) continue ;;
  esac
  # CLAUDE.md がないディレクトリは「プロダクトとして整備されていない」とみなしスキップ
  if [ ! -f "$d/CLAUDE.md" ]; then
    continue
  fi
  if [ ! -f "$d/runbook.md" ]; then
    MISSING_COUNT=$((MISSING_COUNT + 1))
    MISSING_LIST="${MISSING_LIST}    - ${p}\n"
  fi
done
if [ "$MISSING_COUNT" -eq 0 ]; then
  echo "  OK: 全プロダクトに runbook.md 存在"
  OK=$((OK + 1))
else
  echo "  WARN (K2): runbook.md 不在 ${MISSING_COUNT} 件"
  printf "$MISSING_LIST"
  WARN=$((WARN + 1))
fi

# E-2: 恒常差分混入の事前警告（コミット時の巻き込み防止）
echo ""
echo "--- E-2: 恒常差分（xlsx / settings.local.json）の状況 ---"
XLSX_DIRTY=$(git -C "$PRODUCTS" status --short 2>/dev/null | grep -cE '\.xlsx$|\.xlsm$' || echo 0)
SETTINGS_DIRTY=$(git -C "$PRODUCTS" status --short 2>/dev/null | grep -c 'settings.local.json' || echo 0)
echo "  xlsx/xlsm 変更: ${XLSX_DIRTY} 件（コミット時に除外要）"
echo "  settings.local.json 変更: ${SETTINGS_DIRTY} 件（恒常差分、propagate-hooks 由来）"

# E-2b: settings.local.json 行数しきい値（700 行超で WARN）
LOCAL_LINES=$(wc -l < ".claude/settings.local.json" 2>/dev/null || echo 0)
if [ "$LOCAL_LINES" -gt 700 ]; then
  echo "  WARN (E-2b): settings.local.json ${LOCAL_LINES} 行（700 超）棚卸し推奨: node scripts/cleanup-settings.mjs"
else
  echo "  OK (E-2b): settings.local.json ${LOCAL_LINES} 行（700 行以内）"
fi

# A-4: propagate-hooks 同期確認（公式仕様準拠化後: hooks/deny/migration の3行末尾を判定）
echo ""
echo "--- A-4: propagate-hooks 同期確認 ---"
HOOK_LINES=$(node "$GOV/scripts/propagate-hooks.mjs" 2>&1 | tail -3)
echo "$HOOK_LINES" | sed 's/^/  /'
# 各行（hooks updated / deny updated / migrated）の N が >0 なら WARN
HAS_UPDATE=0
HAS_ZERO=0
while IFS= read -r line; do
  if echo "$line" | grep -qE '^[1-9][0-9]*/[0-9]+ '; then
    HAS_UPDATE=1
  elif echo "$line" | grep -qE '^0/[0-9]+ '; then
    HAS_ZERO=1
  fi
done <<< "$HOOK_LINES"
if [ "$HAS_UPDATE" -gt 0 ]; then
  echo "  WARN: hook/deny/migration 同期で差分検出（settings.json/settings.local.json 更新の可能性）"
  WARN=$((WARN + 1))
elif [ "$HAS_ZERO" -gt 0 ]; then
  OK=$((OK + 1))
else
  echo "  NG: propagate-hooks 実行失敗"
  NG=$((NG + 1))
fi

# A-5: settings.json/settings.local.json 公式仕様準拠確認
echo ""
echo "--- A-5: settings 公式仕様準拠（19 項目） ---"
node "$GOV/scripts/check-settings-spec.mjs" > /tmp/settings-spec.log 2>&1
SPEC_EXIT=$?
SPEC_SUMMARY=$(grep '集計:' /tmp/settings-spec.log | tail -1)
echo "  $SPEC_SUMMARY"
if [ "$SPEC_EXIT" -eq 0 ]; then
  OK=$((OK + 1))
else
  echo "  NG: 公式仕様違反検出"
  grep -E '^  ❌|^違反項目|^  -' /tmp/settings-spec.log | head -10 | sed 's/^/    /'
  NG=$((NG + 1))
fi

# A-6: スキル配置規律（CLAUDE.md §5.3 / .claude/rules/skill-deployment.md）
echo ""
echo "--- A-6: スキル配置規律（user-level 単一正本）---"
node "$GOV/scripts/check-skills-spec.mjs" > /tmp/skills-spec.log 2>&1
SKILLS_EXIT=$?
SKILLS_SUMMARY=$(grep -E '^  OK:|^  WARN:|^  NG:' /tmp/skills-spec.log | head -3)
echo "$SKILLS_SUMMARY" | sed 's/^/  /'
if [ "$SKILLS_EXIT" -eq 0 ]; then
  OK=$((OK + 1))
else
  echo "  NG: スキル配置規律違反検出"
  grep -E '^  NG:' /tmp/skills-spec.log | head -10 | sed 's/^/    /'
  NG=$((NG + 1))
fi

# A-7: coach lesson-slides.html ADDRESSING + LETTERBOX 規約（位置番号 1 本化 + letterbox v2 規定 8 件・Session 291 v2）
echo ""
echo "--- A-7: coach lesson-slides.html ADDRESSING + LETTERBOX 規約 ---"
node "$GOV/scripts/check-lesson-slides-canonical.mjs" > /tmp/lesson-slides-canon.log 2>&1
LESSON_EXIT=$?
head -1 /tmp/lesson-slides-canon.log | sed 's/^/  /'
if [ "$LESSON_EXIT" -eq 0 ]; then
  OK=$((OK + 1))
else
  echo "  NG: ADDRESSING/LETTERBOX 規約違反検出"
  grep -E '^  -|^    ' /tmp/lesson-slides-canon.log | head -15 | sed 's/^/    /'
  NG=$((NG + 1))
fi

# A-9: memory.md 分散運用 v2.0 構造確認（P1-P4 見出し + 行数 cap）
echo ""
echo "--- A-9: memory.md 構造確認（分散運用 v2.0 β 統合型）---"
MEMORY_PATHS="$GOV/memory.md"
for d in "$PRODUCTS"/products/*/; do
  if [ -f "$d/CLAUDE.md" ]; then
    MEMORY_PATHS="$MEMORY_PATHS ${d}memory.md"
  fi
done
MEMORY_MISSING=0
MEMORY_HEADER_NG=0
MEMORY_OVER_200=0
MEMORY_OVER_110=0
MEMORY_NG_LIST=""
MEMORY_WARN_LIST=""
for mp in $MEMORY_PATHS; do
  if [ ! -f "$mp" ]; then
    MEMORY_MISSING=$((MEMORY_MISSING + 1))
    MEMORY_NG_LIST="${MEMORY_NG_LIST}    - 不在: ${mp}\n"
    continue
  fi
  # P1-P4 見出し存在確認
  MISSING_HEADERS=""
  grep -q '^## P1' "$mp" || MISSING_HEADERS="${MISSING_HEADERS}P1 "
  grep -q '^## P2' "$mp" || MISSING_HEADERS="${MISSING_HEADERS}P2 "
  grep -q '^## P3' "$mp" || MISSING_HEADERS="${MISSING_HEADERS}P3 "
  grep -q '^## P4' "$mp" || MISSING_HEADERS="${MISSING_HEADERS}P4 "
  if [ -n "$MISSING_HEADERS" ]; then
    MEMORY_HEADER_NG=$((MEMORY_HEADER_NG + 1))
    MEMORY_NG_LIST="${MEMORY_NG_LIST}    - 見出し欠落: ${mp} (${MISSING_HEADERS})\n"
  fi
  # 行数 cap
  LINES=$(wc -l < "$mp")
  if [ "$LINES" -gt 200 ]; then
    MEMORY_OVER_200=$((MEMORY_OVER_200 + 1))
    MEMORY_NG_LIST="${MEMORY_NG_LIST}    - 200 行超: ${mp} (${LINES} 行)\n"
  elif [ "$LINES" -gt 110 ]; then
    MEMORY_OVER_110=$((MEMORY_OVER_110 + 1))
    MEMORY_WARN_LIST="${MEMORY_WARN_LIST}    - 110 行超 (archive 推奨): ${mp} (${LINES} 行)\n"
  fi
done
if [ "$MEMORY_MISSING" -eq 0 ] && [ "$MEMORY_HEADER_NG" -eq 0 ] && [ "$MEMORY_OVER_200" -eq 0 ]; then
  if [ "$MEMORY_OVER_110" -eq 0 ]; then
    echo "  OK: 全 memory.md 構造正常（P1-P4 見出し存在・110 行以内）"
    OK=$((OK + 1))
  else
    echo "  WARN: 110 行超 ${MEMORY_OVER_110} 件（archive 推奨・importance L から優先削除）"
    printf "$MEMORY_WARN_LIST"
    WARN=$((WARN + 1))
  fi
else
  echo "  NG: memory.md 構造違反（不在 ${MEMORY_MISSING} / 見出し欠落 ${MEMORY_HEADER_NG} / 200 行超 ${MEMORY_OVER_200}）"
  printf "$MEMORY_NG_LIST"
  NG=$((NG + 1))
fi

# A-11: 観察タスクの memory.md 書込禁止確認（Session 298 確立・Session 297 規定撤回）
# 起源: .claude/rules/session-lifecycle.md「観察タスクの memory.md 書込禁止」
# 目的: §継続観察 subsection / sunset-after 実 entry が memory.md に残存していないか確認
#       検出対象（実 entry のみ・説明文引用は除外）:
#         ① 行頭 `### 継続観察` (subsection 見出し)
#         ② 行頭 `数字. ` で始まり `[sunset-after:Session 数字]` を含む行（Session 297 旧 entry 形式）
echo ""
echo "--- A-11: 観察タスクの memory.md 書込禁止確認（Session 298 確立）---"
OBSERVATION_NG=0
OBSERVATION_NG_LIST=""
for mp in $MEMORY_PATHS; do
  [ -f "$mp" ] || continue
  HITS=$(grep -nE '^### 継続観察|^[0-9]+\..*\[sunset-after:Session [0-9]+\]' "$mp" 2>/dev/null)
  if [ -n "$HITS" ]; then
    OBSERVATION_NG=$((OBSERVATION_NG + 1))
    OBSERVATION_NG_LIST="${OBSERVATION_NG_LIST}${mp}:\n${HITS}\n"
  fi
done
if [ "$OBSERVATION_NG" -eq 0 ]; then
  echo "  OK: §継続観察 subsection / sunset-after 実 entry 残存ゼロ（説明文引用は除外）"
  OK=$((OK + 1))
else
  echo "  NG: 観察タスク残骸を保有する memory.md ${OBSERVATION_NG} 件（Session 297 旧規定の残骸・削除要）"
  printf "$OBSERVATION_NG_LIST" | head -20 | sed 's/^/    /'
  NG=$((NG + 1))
fi

# A-12: path-resolver 動作 + MISSION_LOG live 残骸ゼロ確認
# 目的: ①path-resolver が vibe-base ルート検出に成功 ②product 配下からも product ルート検出 ③MISSION_LOG live 残骸が許容範囲内
echo ""
echo "--- A-12: path-resolver 動作 + MISSION_LOG live 残骸（Session 297）---"
RESOLVER_NG=0

# ① --vibe-root が EXIT 0
(cd "$PRODUCTS" && node ~/.claude/skills/_shared/resolve-paths.mjs --vibe-root) > /tmp/resolver-vibe.log 2>&1
if [ $? -ne 0 ]; then
  echo "  NG: --vibe-root EXIT non-zero"
  sed 's/^/    /' /tmp/resolver-vibe.log
  RESOLVER_NG=1
fi

# ② products/coach/ で --product-root が実パス出力（coach 不在環境ではスキップ）
if [ -d "$PRODUCTS/products/coach" ]; then
  PRODUCT_OUT=$(cd "$PRODUCTS/products/coach" && node ~/.claude/skills/_shared/resolve-paths.mjs --product-root 2>&1)
  PRODUCT_EXIT=$?
  if [ $PRODUCT_EXIT -ne 0 ] || [ -z "$PRODUCT_OUT" ]; then
    echo "  NG: --product-root from products/coach 失敗 (EXIT=$PRODUCT_EXIT, out='$PRODUCT_OUT')"
    RESOLVER_NG=1
  fi
fi

# ③ live ファイルの MISSION_LOG 残骸（履歴文脈以外）
# git ls-files ベース（gitignore 自動考慮・tmp/ や .bak 等を自動除外）
LIVE_RESIDUAL=$(git -C "$GOV" ls-files '*.md' '*.html' '*.sh' '*.mjs' '*.py' 2>/dev/null \
  | grep -v "^archive/" \
  | grep -v "^journal/claude-code-book/" \
  | grep -v "audits/ai-maturity-2026-05-19" \
  | (cd "$GOV" && xargs grep -l "MISSION_LOG" 2>/dev/null) \
  | wc -l)

if [ "$RESOLVER_NG" -eq 0 ]; then
  if [ "$LIVE_RESIDUAL" -le 50 ]; then
    echo "  OK: path-resolver 動作 + MISSION_LOG live 残骸 ${LIVE_RESIDUAL} 件（履歴文脈許容範囲）"
    OK=$((OK + 1))
  else
    echo "  WARN: MISSION_LOG live 残骸 ${LIVE_RESIDUAL} 件（50 件超・履歴以外の残存疑い）"
    WARN=$((WARN + 1))
  fi
else
  echo "  NG: path-resolver 動作不全（A 群スキル機能停止状態）"
  NG=$((NG + 1))
fi

# A-19: サブエージェント定義 frontmatter 検証（正本 ~/.claude/agents/・Session 303 確立）
echo ""
echo "--- A-19: サブエージェント定義 frontmatter 検証（~/.claude/agents/）---"
node "$GOV/scripts/check-agents-spec.mjs" > /tmp/agents-spec.log 2>&1
AGENTS_EXIT=$?
grep -E '^  OK:|^  WARN:|^  NG:' /tmp/agents-spec.log | head -3 | sed 's/^/  /'
if [ "$AGENTS_EXIT" -eq 0 ]; then
  OK=$((OK + 1))
else
  echo "  NG: エージェント定義 frontmatter 違反検出"
  grep -E '^  NG:' /tmp/agents-spec.log | head -10 | sed 's/^/    /'
  NG=$((NG + 1))
fi

# A-19b: Codex サブエージェント mirror 同期検証（.claude/agents 正本 → .codex/agents 生成物）
echo ""
echo "--- A-19b: Codex サブエージェント mirror 同期検証（.codex/agents）---"
node "$GOV/scripts/sync-codex-agents-from-claude.mjs" --check > /tmp/codex-agents-sync.log 2>&1
CODEX_AGENTS_EXIT=$?
grep -E '^OK:|^DRIFT:|^EXTRA:|^NG:' /tmp/codex-agents-sync.log | head -10 | sed 's/^/  /'
if [ "$CODEX_AGENTS_EXIT" -eq 0 ]; then
  OK=$((OK + 1))
else
  echo "  NG: Codex agent mirror drift 検出（.claude/agents を正本として同期せよ）"
  NG=$((NG + 1))
fi

# A-19c: サブエージェント正本 → repo バックアップ の同期検証（2026-07-09 確立）
# ~/.claude/ は git 管理外。ミラー漏れは「PC 初期化でサブだけ消える」事故になる。
# 特に job-application-write-gate のように「サブ経由でしか書けない」hook を repo に持つ場合、
# サブ消滅で親も deny され、誰もそのファイルを書けないデッドロックに陥る。
echo ""
echo "--- A-19c: サブエージェント repo バックアップ同期検証（~/.claude/agents → .claude/agents）---"
node "$GOV/scripts/backup-agents.mjs" --check > /tmp/agents-backup.log 2>&1
AGENTS_BACKUP_EXIT=$?
grep -E '^OK:|^MISSING:|^DRIFT:|^EXTRA:|^NG:' /tmp/agents-backup.log | head -10 | sed 's/^/  /'
if [ "$AGENTS_BACKUP_EXIT" -eq 0 ]; then
  OK=$((OK + 1))
else
  echo "  NG: agent 正本と repo バックアップの乖離検出（node scripts/backup-agents.mjs で同期せよ）"
  NG=$((NG + 1))
fi

# A-20: hook syntax 構文検査（hook-runner pass-through 機能停止隠蔽リスク恒久対策・Session 2026-05-27 確立）
echo ""
echo "--- A-20: hook syntax 構文検査（全 .claude/hooks/*.mjs 再帰）---"
node "$GOV/scripts/check-hooks-syntax.mjs" > /tmp/hooks-syntax.log 2>&1
HOOKS_SYNTAX_EXIT=$?
grep -E '^scanned:|^OK:|^NG:' /tmp/hooks-syntax.log | head -3 | sed 's/^/  /'
if [ "$HOOKS_SYNTAX_EXIT" -eq 0 ]; then
  OK=$((OK + 1))
else
  echo "  NG: hook .mjs に SyntaxError 検出（hook-runner pass-through で隠蔽されない設計）"
  grep -E '^- |^    ' /tmp/hooks-syntax.log | head -10 | sed 's/^/    /'
  NG=$((NG + 1))
fi

echo ""
echo "--- B-5: 廃止 hook 再登録ガード（休眠hookの誤再登録検知・2026-06-04 / pc-version-gate 追加 2026-06-06）---"
# measure-gate / animation-gate / animation-verify-gate は design ガバナンス載せ替え(2026-06-04)で
# settings.json から登録解除・本体 .sh は休眠維持。
# pc-version-gate は PC 表廃止(2026-06-06)で登録解除・本体削除済。
# 将来エージェントが残骸を見て「使えるhook」と誤解し settings.json へ再登録すると
# 金太郎飴の計測模写ゲート / 廃止済 PC 表照合が復活する。AI自己規律に頼らず機械ブロックする。
RETIRED_HITS=$(grep -rl "measure-gate\|animation-gate\|animation-verify-gate\|pc-version-gate" --include=settings.json "$GOV/.claude" "$GOV/products" 2>/dev/null)
if [ -z "$RETIRED_HITS" ]; then
  echo "  OK: 廃止 hook は全 settings.json に未登録（design 系=休眠維持・pc-version-gate=削除済）"
  OK=$((OK + 1))
else
  echo "  NG: 廃止 hook が settings.json に再登録されている（休眠解除＝禁止）:"
  echo "$RETIRED_HITS" | sed 's/^/    /'
  echo "    → 旧計測模写ゲートは /web-design へ載せ替え済。PC 表照合の後継だった照合リストも 2026-07-18 に全廃済。再登録を取り消せ。"
  NG=$((NG + 1))
fi

# B-6: memory.md P1 直近 plan path デッドリンク検証（新方式「product plan + 毎チェックイン照合」接続線・2026-06-07）
# 起源: .claude/rules/product-development.md「進捗管理」/ docs/ops/agent-rules.md 進捗管理ルール正本と形式
# 目的: 各 product memory.md の P1 に常駐する直近 plan path を抽出し、
#       (a) 行が在れば参照先ファイル実在を test -f で確認（デッドリンク = NG）
#       (b) 行が無い product は軽量方針で NG にしない（空枠 plan の強制作成はしない）
# 対象限定: products/*/memory.md（CLAUDE.md 保有）の P1 セクションのみ。
#           司令塔 memory.md は散文に plan-mode 参照が多く誤検知源のため除外。
echo ""
echo "--- B-6: memory.md P1 直近 plan path デッドリンク検証（新方式・軽量: path 無しは NG にしない）---"
PLAN_DEAD=0
PLAN_OK_COUNT=0
PLAN_SKIP_COUNT=0
PLAN_DEAD_LIST=""
for d in "$PRODUCTS"/products/*/; do
  [ -f "$d/CLAUDE.md" ] || continue
  mp="${d}memory.md"
  [ -f "$mp" ] || continue
  mdir=$(dirname "$mp")
  # P1 セクション（## P1 〜 次の ## PN）のみを対象に plan path を抽出（plans/ ディレクトリ or plan-*.md）
  P1_BLOCK=$(awk '/^## P1/{f=1;next} /^## P[0-9]/{f=0} f' "$mp")
  PLAN_REFS=$(echo "$P1_BLOCK" | grep -oE '([~A-Za-z0-9_./-]*/)?plans?/[A-Za-z0-9_./-]+\.md|[A-Za-z0-9_./-]*plan-[A-Za-z0-9_./-]+\.md' 2>/dev/null | sort -u)
  if [ -z "$PLAN_REFS" ]; then
    PLAN_SKIP_COUNT=$((PLAN_SKIP_COUNT + 1))
    continue
  fi
  while IFS= read -r ref; do
    [ -z "$ref" ] && continue
    resolved="${ref/#\~/$HOME}"   # ~ を $HOME へ展開
    # 実在判定: 絶対/HOME 解決 → vibe-base 基準 → memory.md ディレクトリ基準 の順
    if [ -f "$resolved" ] || [ -f "$PRODUCTS/$ref" ] || [ -f "$mdir/$ref" ]; then
      PLAN_OK_COUNT=$((PLAN_OK_COUNT + 1))
    else
      PLAN_DEAD=$((PLAN_DEAD + 1))
      PLAN_DEAD_LIST="${PLAN_DEAD_LIST}    - デッドリンク: ${mp} → ${ref}"$'\n'
    fi
  done <<< "$PLAN_REFS"
done
if [ "$PLAN_DEAD" -eq 0 ]; then
  echo "  OK: plan path デッドリンクなし（実在 ${PLAN_OK_COUNT} 件 / plan path 無し ${PLAN_SKIP_COUNT} 件は軽量 skip）"
  OK=$((OK + 1))
else
  echo "  NG: memory.md P1 の直近 plan path デッドリンク ${PLAN_DEAD} 件（参照先不在・path 記載と実体の乖離）"
  printf '%s' "$PLAN_DEAD_LIST"
  NG=$((NG + 1))
fi

# E-1（15行上限）は廃止（2026-06-19）。product memory.md の行数基準は A-9（110/200行）に一本化。

# B-7: memory.md 引継ぎ @参照デッドリンク検証（鮮度ドリフト②パス誤記の予防・2026-06-19）
# 起源: docs/session-reports/2026-06-19 memory @参照ドリフト根治 plan
# 目的: 各 memory.md の引継ぎ @参照（@docs/... @ops/... @../../docs/... 等）が実在ファイルを
#       指すか検証。session-reports/ 欠落等の誤記を NG 化し、checkin で発見できない陳腐化を捕捉。
# 解決基準: レポートには3種の正当な置き場（root docs/session-reports / 製品 docs/ / 製品 ops/）が
#           あるため単一基準を強制せず、ルート($PRODUCTS) / 製品dir / memory.md dir / HOME / 埋込相対
#           のいずれかで実在すれば OK とする多段解決。@行が無い memory.md は skip（NG にしない）。
# 対象: products/*/memory.md（CLAUDE.md 保有）+ 司令塔 memory.md（$PRODUCTS/memory.md）。
#       MEMORY.md(auto-memory) は単一ポインタ化で日付参照を持たない設計のため対象外。
echo ""
echo "--- B-7: memory.md 引継ぎ @参照デッドリンク検証（多段解決・@行無しは skip）---"
REF_DEAD=0
REF_OK=0
REF_SKIP=0
REF_DEAD_LIST=""
check_one_memory_ref() {
  mp="$1"
  [ -f "$mp" ] || return
  mdir=$(dirname "$mp")
  # @ で始まり末尾が .md/.html の「引継ぎクラス」参照のみ抽出（session-reports/checkout/handover/handoff）。
  # memory.md 散文の無関係な doc/plan @リンクは検証対象外（汎用検証だと誤NGで共有 check-in を止めるため）。
  # P1 plan path は B-6 が別途担保済。
  refs=$(grep -oE '@[A-Za-z0-9_./~-]+\.(md|html)' "$mp" 2>/dev/null | sed 's/^@//' | grep -iE 'session-reports|checkout|handover|handoff' | sort -u)
  if [ -z "$refs" ]; then
    REF_SKIP=$((REF_SKIP + 1)); return
  fi
  while IFS= read -r r; do
    [ -z "$r" ] && continue
    resolved="${r/#\~/$HOME}"   # ~ を $HOME へ展開
    if [ -f "$resolved" ] || [ -f "$PRODUCTS/$r" ] || [ -f "$mdir/$r" ]; then
      REF_OK=$((REF_OK + 1))
    else
      REF_DEAD=$((REF_DEAD + 1))
      REF_DEAD_LIST="${REF_DEAD_LIST}    - デッドリンク: ${mp} → @${r}"$'\n'
    fi
  done <<< "$refs"
}
for d in "$PRODUCTS"/products/*/; do
  [ -f "$d/CLAUDE.md" ] || continue
  check_one_memory_ref "${d}memory.md"
done
check_one_memory_ref "$PRODUCTS/memory.md"
if [ "$REF_DEAD" -eq 0 ]; then
  echo "  OK: 引継ぎ @参照デッドリンクなし（実在 ${REF_OK} 件 / @行無し ${REF_SKIP} 件は skip）"
  OK=$((OK + 1))
else
  echo "  NG: memory.md 引継ぎ @参照デッドリンク ${REF_DEAD} 件（参照先不在・session-reports/ 欠落等の誤記）"
  printf '%s' "$REF_DEAD_LIST"
  NG=$((NG + 1))
fi

# A-22: hook 実行時故障スキャン（hook-errors.jsonl の exit_code=1 隠れ故障検知）
# 目的: 静的検査(A-20/check-hook-integrity)では分からない「実行して失敗した hook」を検知。
#       hook-runner pass-through で無言素通りした故障（kosespark secret-gate 型）を炙り出す。
# 起源: failures.md [S]「hook-runner pass-through 機能停止隠蔽」/ 2026-06-17 maturity-audit 施策2
echo ""
echo "--- A-22: hook 実行時故障スキャン（exit_code=1 隠れ故障）---"
node "$GOV/scripts/check-hook-runtime-errors.mjs" --days 14 --list > /tmp/hook-runtime.log 2>&1
HOOK_RT_EXIT=$?
grep -E '^  走査行|^  対象窓|^  実行時故障|^  OK:|^   - ' /tmp/hook-runtime.log | head -12 | sed 's/^/  /'
if [ "$HOOK_RT_EXIT" -eq 0 ]; then
  OK=$((OK + 1))
else
  echo "  WARN: 実行時故障 hook を検知（無言素通りの疑い・該当 hook を CLI 単体起動で切り分け）"
  WARN=$((WARN + 1))
fi

# A-21: failures.md 昇格カバレッジ（報告専用・非ゲート）
# 目的: failures→機械検証の昇格を可視化（[S] 未昇格バックログ件数を check-in で提示）
# 起源: docs/session-reports/2026-06-17-vibe-base-maturity-audit.md 施策1
echo ""
echo "--- A-21: failures.md 昇格カバレッジ（報告専用）---"
node "$GOV/scripts/failures-coverage.mjs" 2>/dev/null | sed 's/^/  /' || echo "  （failures-coverage.mjs 実行不可・スキップ）"

# A-21+: failure-loop 効果検証（[S✓] 機構デッドリンク・昇格後再発検知・報告専用・WARN基調）
# 目的: failures.md の [S✓] 機械検証昇格が指す機構（*.mjs/*.sh/A-NN）が実在するか、
#       昇格済み対策が promotedDate 以降に再発していないかを検知する。
# 起源: 失敗自己学習ループ plan §6-4（Step 4）
echo ""
echo "--- [A-21+] failure-loop 効果検証（[S✓]デッドリンク・昇格後再発）---"
if command -v node >/dev/null 2>&1 && [ -f "$GOV/scripts/failure-loop.mjs" ]; then
  node "$GOV/scripts/failure-loop.mjs" --effect > /tmp/failure-loop-effect.log 2>&1
  sed 's/^/  /' /tmp/failure-loop-effect.log
  EFFECT_WARN_COUNT=$(sed -n 's/^集計: WARN \([0-9][0-9]*\) 件.*/\1/p' /tmp/failure-loop-effect.log | tail -1)
  if [ -z "$EFFECT_WARN_COUNT" ]; then EFFECT_WARN_COUNT=1; fi
  if [ "$EFFECT_WARN_COUNT" -eq 0 ]; then
    OK=$((OK + 1))
  else
    WARN=$((WARN + 1))
  fi
else
  echo "  WARN A-21+ 実行不能（node 不在 or scripts/failure-loop.mjs 不在）"
  WARN=$((WARN + 1))
fi

# A-23: vault 反映滞留検知（「二重の網」Tier2）
# 目的: 内部改善(session-report)の vault 自動転記が止まっていないかを最終成功日(state)で検知。
#       無人 schtasks(x-vault-sync) が静かに死んでも /pc-checkin 時にマスターが視認できる。
# 起源: 「内部改善→vault常時反映→過去と混ざる→新発想」循環の確実性設計（part1 反映パイプライン）
echo ""
echo "--- A-23: vault 反映滞留検知（内部改善の堆積が止まっていないか）---"
node "$GOV/scripts/check-vault-reflection-drift.mjs" --days 7 > /tmp/vault-drift.log 2>&1
VAULT_DRIFT_EXIT=$?
grep -E '^  走査対象|^  最終成功日|^  OK:|^  NG:|^  対応:' /tmp/vault-drift.log | head -6 | sed 's/^/  /'
if [ "$VAULT_DRIFT_EXIT" -eq 0 ]; then
  OK=$((OK + 1))
else
  echo "  WARN: vault 反映が7日超滞留（node scripts/x-vault-sync.mjs を手動実行 or タスク再登録で復旧）"
  WARN=$((WARN + 1))
fi

# A-24: agent effectiveness（telemetry 鮮度 + dead agent + パネルログ整合 + 多様性）
# 目的: サブエージェント発火実績を計測し、(1) telemetry の鮮度停止 (2) 30日ゼロ発火の dead agent
#       (3) 検証パネル発火に対する runs.jsonl 記録漏れ (4) 指摘重複率/採用率の劣化 を機械検知する。
# 起源: plan ~/.claude/plans/jaunty-knitting-panda.md（検証パネル5レンズ + 計測層 + 閉ループ）
echo ""
echo "--- A-24: agent effectiveness（telemetry 鮮度 + dead agent + パネルログ整合 + 多様性）---"
node "$GOV/scripts/agent-telemetry.mjs" --check > /tmp/agent-telemetry-check.log 2>&1
TELEMETRY_CHECK_EXIT=$?
grep -E '^  WARN:|^  INFO:|^  OK:|^集計:' /tmp/agent-telemetry-check.log | sed 's/^/  /'
# 権威ある「集計: WARN N 件」行を直接パース（生 WARN 行の grep -c は loadState 自己修復等の
# 無関係な診断行を誤カウントするため使わない・レンズ② Warning 指摘の恒久対応）
TELEMETRY_WARN_COUNT=$(sed -n 's/^集計: WARN \([0-9][0-9]*\) 件.*/\1/p' /tmp/agent-telemetry-check.log | tail -1)
# 集計行が取れない（--check 異常終了等）場合は WARN 扱いに倒す
if [ -z "$TELEMETRY_WARN_COUNT" ]; then TELEMETRY_WARN_COUNT=1; fi
if [ "$TELEMETRY_CHECK_EXIT" -eq 0 ] && [ "$TELEMETRY_WARN_COUNT" -eq 0 ]; then
  OK=$((OK + 1))
else
  # A-24 は WARN 基調（NG にしない・plan 指示）。実行自体が失敗した場合のみ NG にせず WARN 扱い。
  WARN=$((WARN + 1))
fi

# A-27: failure-loop 自己学習ループ健全性（鮮度 + 自己回復スキャン + hook 棚卸し）
# 目的: 失敗自己学習ループ自体が形骸化（停止・取りこぼし）していないか、hook の降格/過剰検知/
#       辞書調整の候補が溜まっていないかを check-in 時に機械検知する（A-24 と同じ WARN 基調・常時 EXIT 0）。
# 起源: 失敗自己学習ループ plan §6-6（Step 4）
echo ""
echo "--- [A-27] failure-loop 自己学習ループ健全性（鮮度・自己回復・hook棚卸し）---"
if command -v node >/dev/null 2>&1 && [ -f "$GOV/scripts/failure-loop.mjs" ]; then
  node "$GOV/scripts/failure-loop.mjs" --check > /tmp/failure-loop-check.log 2>&1
  sed 's/^/  /' /tmp/failure-loop-check.log
  CHECK_WARN_COUNT=$(sed -n 's/^集計: WARN \([0-9][0-9]*\) 件.*/\1/p' /tmp/failure-loop-check.log | tail -1)
  if [ -z "$CHECK_WARN_COUNT" ]; then CHECK_WARN_COUNT=1; fi
  if [ "$CHECK_WARN_COUNT" -eq 0 ]; then
    OK=$((OK + 1))
  else
    # A-27 は WARN 基調（NG にしない）。実行自体が失敗した場合のみ NG にせず WARN 扱い。
    WARN=$((WARN + 1))
  fi
else
  echo "  WARN A-27 実行不能（node 不在 or scripts/failure-loop.mjs 不在）"
  WARN=$((WARN + 1))
fi

# A-25: sop-index 実体整合（docs/ops/ 直下との乖離検知）
# 目的: sop-index.md の自動生成区間が docs/ops/ 直下の実体と乖離していないかを検知する。
#       手動更新は放置されると腐るため（2026-04-28以降未更新だった実績）、自動生成+機械検知に置換。
# 起源: plan ~/.claude/plans/vibe-base-s-group-remediation.md（S-2）
echo ""
echo "--- A-25: sop-index 実体整合（docs/ops/ 直下との乖離検知）---"
node "$GOV/scripts/generate-sop-index.mjs" --check > /tmp/sop-index-check.log 2>&1
SOP_INDEX_CHECK_EXIT=$?
sed 's/^/  /' /tmp/sop-index-check.log
if [ "$SOP_INDEX_CHECK_EXIT" -eq 0 ]; then
  OK=$((OK + 1))
else
  echo "  WARN: sop-index.md が docs/ops/ 実体と乖離（node scripts/generate-sop-index.mjs で再生成）"
  WARN=$((WARN + 1))
fi

# A-28: automation state 照合（自動実行 job の warn/滞留検知・C-R Tier2）
# 目的: feed-fetch/hook-errors/token-audit/gsap-watch/settings-inventory の各 job が warn を立てている
#       or 最終成功が滞留していないかを check-in 時に機械検知する（無人 job の静かな死を炙り出す）。
#       state 不在（job 未登録/未実行）は健全扱い＝誤 WARN を出さない。
# 起源: plan ~/.claude/plans/concurrent-wiggling-avalanche.md（③自動実行化 リスト③ C-R）
echo ""
echo "--- A-28: automation state 照合（自動実行 job の warn/滞留）---"
node "$GOV/scripts/automation/check-automation-state.mjs" > /tmp/automation-state.log 2>&1
AUTOMATION_STATE_EXIT=$?
grep -E '^  走査対象|^  OK:|^  WARN' /tmp/automation-state.log | head -8 | sed 's/^/  /'
if [ "$AUTOMATION_STATE_EXIT" -eq 0 ]; then
  OK=$((OK + 1))
else
  echo "  WARN: 自動実行 job に異常/滞留（runbook docs/ops/automation-jobs.md 参照・該当 wrapper を手動実行で切り分け）"
  WARN=$((WARN + 1))
fi

# A-29: 大義システムの通電鮮度検知（「効いている」ことを最後に確かめたのはいつか）
# 目的: H2大義「大義システムを全 product へ配備し、新規 product にも既定で配備されること」の
#       退行検知。完了条件は「配った先で**機械が回る**こと」。
# なぜ存在検査ではないか（2026-07-17 の失敗そのもの）:
#       初版は `plan-daigi-gate.mjs` の実体が在るかだけを数え、29 件在ったので「配備完了」と
#       判定した。**その時点で product セッションには User スコープの root-guard が
#       「hook が 1 本もロードされていません」という嘘を注入しており、それを読んだ AI が
#       「機械が全部死んでいる」と誤報告していた。** ファイルの存在は「書いてある」の確認で
#       あって「効いている」の確認ではない（3 つの再発パターンの 2 番目）。存在検査は残さない
#       ——残すと弱い方が PASS を出し続け、強い検査の不在を隠す。
# 判定: 通電テスト（実際に claude を起動して hook 実行ログを見る）の最終 PASS からの経過日数。
#       通電テスト自体は重い（29 product・約 8 分）ため check-in では回さず、鮮度だけ見る。
# 対処: node scripts/daigi-smoke-test.mjs
# 起源: plan ~/.claude/plans/humming-singing-yeti.md（M5・マスター指示「直した後に全部通電テストしろ」）
echo ""
echo "--- A-29: 大義システムの通電鮮度（最後に「効いている」を確かめた日）---"
DAIGI_STAMP="$GOV/tmp/daigi-smoke-last-pass.txt"
if [ ! -f "$DAIGI_STAMP" ]; then
  echo "  WARN: 通電テストの成功記録が無い（＝配った機械が効いているか一度も確かめていない）"
  echo "    → 対処: node scripts/daigi-smoke-test.mjs"
  WARN=$((WARN + 1))
else
  DAIGI_LAST=$(cat "$DAIGI_STAMP" 2>/dev/null | head -1)
  DAIGI_AGE=$(node -e "const d=new Date(process.argv[1]);const n=Math.floor((Date.now()-d.getTime())/86400000);console.log(isNaN(n)?999:n)" "$DAIGI_LAST" 2>/dev/null)
  if [ -z "$DAIGI_AGE" ]; then DAIGI_AGE=999; fi
  if [ "$DAIGI_AGE" -le 14 ]; then
    echo "  OK: 通電テスト最終 PASS = $DAIGI_LAST（${DAIGI_AGE} 日前・全 product で発火確認済）"
    OK=$((OK + 1))
  else
    echo "  WARN: 通電テストが ${DAIGI_AGE} 日前（最終 PASS = $DAIGI_LAST）。効いているかの確認が古い"
    echo "    → 対処: node scripts/daigi-smoke-test.mjs"
    WARN=$((WARN + 1))
  fi
fi

# 集計
echo ""
echo "=== 集計 ==="
echo "  OK:   $OK"
echo "  WARN: $WARN"
echo "  NG:   $NG"
echo ""

if [ "$NG" -gt 0 ]; then
  echo "❌ NG 検知。docs/ops/self-verification-sop.md §2 NG 即時対応フローを実行せよ。"
  echo "   1. 作業即時停止 → 2. マスター報告（K パターン名 + 検出区切り + 検出箇所）→ 3. 方針合意 → 4. 修正 → 5. 再検証"
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo "⚠️  WARN 検知。マスター承認の上で進行可、または対処後に再実行。"
  exit 0
else
  echo "✅ Check-in 機械検証 全項目 OK"
  exit 0
fi
