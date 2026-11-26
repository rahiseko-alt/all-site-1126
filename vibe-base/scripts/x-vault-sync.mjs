#!/usr/bin/env node
/**
 * x-vault-sync.mjs — x-auto-post の分析サマリ + 内部改善(session-report) を Obsidian vault へ転記する。
 *
 * 設計方針（vault 連携 B 方式・司令塔 cross-boundary tool）:
 *  - クラウド(Actions)が repo に生成した reports/*.md と、本体 push 済の docs/session-reports/*.md を、
 *    origin/master の ref から読み（working tree 非依存）、frontmatter + 日付名で vault の各フォルダへ書く。
 *  - `git pull` しない（dirty working tree でも壊れない）。`git fetch` + `git show origin/master:<path>`。
 *  - MASTER_VAULT_ROOT が未設定なら既定パスへ fallback。vault フォルダ不在は fail-closed（非0終了）。
 *  - 単一ファイルは同日付名で上書き（べき等）。glob(session-report) は basename そのままで保存するため、
 *    毎日 origin/master 全件を全同期しても vault は session-report と 1:1 で累積しない（取りこぼし自己回復）。
 *  - 正常完了で last-success state を記録する（verify が連続失敗を検知するための証跡）。
 *  - Windows タスクスケジューラから日次実行する想定。
 *
 * 実行: node scripts/x-vault-sync.mjs
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { recordSuccess } from "./_lib/vault-sync-state.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// x-auto-post は 2026-07-05 に旧 vibe-base リポの rename で GitHub 独立（checkout-5）。
// reports/*.md は独立リポ側の Actions が生成するため、x 系 target はこちらの origin/master を読む。
const X_REPO_ROOT = "C:/Users/user/Desktop/ClaudeCode/x-auto-post-repo";
const DEFAULT_VAULT = "C:/Users/user/Desktop/倉庫/事業戦略/ナレッジ";
const VAULT_ROOT = process.env.MASTER_VAULT_ROOT || DEFAULT_VAULT;

// 転記対象。outDir = vault 配下フォルダ名。repoRoot = 読み元リポ（省略時 REPO_ROOT）。
//  - 単一: repoPath を読み `${date}_${suffix}.md` で保存。
//  - glob: pattern に一致する全ファイルを origin/master から列挙し basename で保存（冪等全同期）。
const TARGETS = [
  {
    repoRoot: X_REPO_ROOT,
    repoPath: "products/x-auto-post/reports/analytics-summary.md",
    outDir: "分析",
    suffix: "x-auto-post-analytics-summary",
    source: "x-auto-post-analytics",
    fmType: "analytics",
    category: "分析",
    topic: "x-auto-post",
    tags: ["type/analytics", "status/参照用", "product/x-auto-post"],
    required: true,
    note: "",
  },
  {
    repoRoot: X_REPO_ROOT,
    repoPath: "products/x-auto-post/reports/competitor-insights.md",
    outDir: "分析",
    suffix: "x-auto-post-competitor-insights",
    source: "x-auto-post-competitor",
    fmType: "competitor",
    category: "分析",
    topic: "x-auto-post",
    tags: ["type/competitor", "status/参照用", "product/x-auto-post"],
    required: false,
    note: "\n> テキスト転用禁止。フォーマット/時間帯/話題傾向のみを発信改善に活用する。\n",
  },
  {
    kind: "glob",
    pattern: "docs/session-reports/*.md",
    outDir: "セッション改善",
    source: "vibe-base-session-checkout",
    fmType: "session-report",
    category: "セッション改善",
    topic: "内部改善",
    tags: ["type/session-report", "status/参照用", "topic/内部改善"],
    required: false,
    note: "\n> 司令塔(vibe-base)の内部改善ログ(session checkout)を自動転記。原本は本体 repo を参照。\n",
  },
];

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function stamp() {
  const d = new Date();
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { date, time };
}

function showFromOrigin(repoPath, repoRoot = REPO_ROOT) {
  // 指定リポの origin/master の ref から読む（working tree 非依存）。不在は null。
  // execFileSync で引数配列を渡しシェルを介さない（パスにメタ文字が来てもインジェクション不可）。
  try {
    return execFileSync("git", ["show", `origin/master:${repoPath}`], {
      cwd: repoRoot,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

function globToRegExp(pattern) {
  // `*` は同一階層内の任意（`/` を含まない）にのみマッチ。
  const esc = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*");
  return new RegExp("^" + esc + "$");
}

function listFromOrigin(pattern, repoRoot = REPO_ROOT) {
  // 指定リポの origin/master の追跡ファイルから pattern 一致を列挙。不在/失敗は空配列。
  try {
    const out = execFileSync("git", ["ls-tree", "-r", "--name-only", "origin/master"], {
      cwd: repoRoot,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const re = globToRegExp(pattern);
    return out.split("\n").map((s) => s.trim()).filter(Boolean).filter((p) => re.test(p));
  } catch {
    return [];
  }
}

function frontmatter(t, { date, time }) {
  return [
    "---",
    `source: ${t.source}`,
    `published: ${date}`,
    `fetched: ${time}`,
    `category: ${t.category}`,
    `type: ${t.fmType}`,
    "status: 参照用",
    `topic: ${t.topic}`,
    `tags: [${t.tags.join(", ")}]`,
    "---",
    "",
  ].join("\n");
}

function main() {
  // 1. vault フォルダ存在確認（fail-closed）。
  if (!existsSync(VAULT_ROOT)) {
    fail(`vault フォルダが存在しません: ${VAULT_ROOT}（MASTER_VAULT_ROOT を確認）`);
  }

  // 2. TARGETS が参照する各リポの origin/master を最新化（pull はしない）。
  const repoRoots = [...new Set(TARGETS.map((t) => t.repoRoot || REPO_ROOT))];
  for (const root of repoRoots) {
    if (!existsSync(root)) {
      fail(`読み元リポが存在しません: ${root}（別PC運用時は x-auto-post-repo の clone が必要）`);
    }
    try {
      execFileSync("git", ["-c", "http.version=HTTP/1.1", "fetch", "origin", "master"], {
        cwd: root,
        stdio: ["ignore", "ignore", "pipe"],
      });
    } catch (e) {
      fail(`git fetch に失敗 (${root}): ${e.message}`);
    }
  }

  const { date, time } = stamp();
  let written = 0;
  for (const t of TARGETS) {
    const root = t.repoRoot || REPO_ROOT;
    const outDir = join(VAULT_ROOT, t.outDir);
    mkdirSync(outDir, { recursive: true });

    if (t.kind === "glob") {
      const files = listFromOrigin(t.pattern, root);
      if (files.length === 0) {
        console.error(`WARN: glob 一致0件のため skip: ${t.pattern}`);
        continue;
      }
      for (const repoPath of files) {
        const body = showFromOrigin(repoPath, root);
        if (body === null) continue;
        // basename で保存（冪等・累積しない）。
        const outPath = join(outDir, basename(repoPath));
        writeFileSync(outPath, frontmatter(t, { date, time }) + body + t.note, "utf-8");
        written += 1;
      }
      console.log(`[vault-sync] ${t.pattern} → ${outDir}（${files.length} 件同期）`);
      continue;
    }

    const body = showFromOrigin(t.repoPath, root);
    if (body === null) {
      if (t.required) fail(`必須ソースが origin/master に不在: ${t.repoPath}（読み元: ${root}）`);
      console.error(`WARN: ソース不在のため skip: ${t.repoPath}`);
      continue;
    }
    const outPath = join(outDir, `${date}_${t.suffix}.md`);
    writeFileSync(outPath, frontmatter(t, { date, time }) + body + t.note, "utf-8");
    console.log(`[vault-sync] 書き出し: ${outPath}`);
    written += 1;
  }

  if (written === 0) fail("転記対象が0件でした。");

  // 3. 正常完了を state に記録（verify が連続失敗を検知するための証跡）。
  recordSuccess(date, time, written);
  console.log(`[vault-sync] 完了: ${written} 件を転記し last-success を記録（${date}）。`);
}

main();
