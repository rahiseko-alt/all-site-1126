# failures.md から退避した [S✓]（機械強制済）エントリ

> 2026-07-10 退避。`failures.md` が byte 上限（28000）に達したため、既に hook / script で
> 機械強制されており再読の必要がない `[S✓]` 7 件をここへ移した。
> `scripts/failures-recent.sh` は元々 `[S✓]` を抜粋から除外しているため、運用上の影響はない。

- [S✓] 2026-05-26 完遂 plan claim 後は 3 検証者 (A=達成済再走 / B=見落とし grep / C=新規バグ) を general-purpose agent 並列起動で網羅率を担保（機構: verify-agent + orchestration-discipline 規律3）
- [S✓] 2026-05-25 本番一括 JSON 書換は `scripts/_lib/json-canary.mjs` 経由必須・fixture canary FAIL なら本番未変更を sha256 で保証
- [S✓] 2026-05-23 大規模 refactor / filter-repo 移設後は対象 path の全 grep + 全 .mjs hook CLI 単体実行 `echo '{}' | node {hook} 2>&1` で `ERR_MODULE_NOT_FOUND` 確認必須（機構: scripts/check-hook-integrity.mjs + check-hooks-syntax.mjs）
- [S✓] 2026-05-26 hook 故障時の機能停止隠蔽防止に CI gate / jsonl 定期 grep を組合せ（機構: scripts/check-hook-runtime-errors.mjs + check-in A-22）
- [S✓] 2026-04-23 Check-in でタグだけ抽出禁止・中身決着事項まで読了義務・直前訂正逆行禁止（機構: scripts/check-in-verify.sh）
- [S✓] 2026-04-23 司令塔は §0 構成 + §4 戻し のみ・§1-§3 はプロダクトエージェント領域・マスター個人事情を尋問するな（機構: area-gate hook）
- [S✓] 2026-07-09 書込 deny hook の matcher が `Write|Edit|MultiEdit` のみで `echo >`/`cp`/`sed -i` の Bash 経路から完全迂回できた（security-reviewer が blocking 検出）／再発防止: 書込を止める hook は matcher に **Bash を必ず含め**シェル書込動詞も判定する
