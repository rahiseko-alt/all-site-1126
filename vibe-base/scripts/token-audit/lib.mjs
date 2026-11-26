// トークン監査 共通ライブラリ。audit.mjs/verify.mjs/category-model-crosstab.mjs/strategy-analysis.mjs が共有する。
// 2026-07-04 検証パネル(code-reviewer)指摘により、サブエージェント transcript(<sessionId>/subagents/agent-*.jsonl)
// を非再帰走査で欠落させていたバグを根治するため新設。
import fs from "fs";
import os from "os";
import path from "path";

export const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
export const REPO_ROOT = path.resolve(SCRIPT_DIR, "..", "..");
export const PROJECTS_DIR = path.join(os.homedir(), ".claude", "projects");
export const OUT_DIR = path.join(REPO_ROOT, "outputs");

export const pricing = JSON.parse(fs.readFileSync(path.join(SCRIPT_DIR, "pricing.json"), "utf8"));
export const workMap = JSON.parse(fs.readFileSync(path.join(SCRIPT_DIR, "work-map.json"), "utf8"));

export function classifyCwd(cwd) {
  if (!cwd) return "unclassified";
  const normalized = cwd.replace(/\\/g, "/");
  for (const rule of workMap.rules) {
    if (normalized.includes(rule.pattern)) return rule.category;
  }
  return workMap.default_category;
}

function normalizeModelId(model) {
  // サブエージェントは "claude-haiku-4-5-20251001" のような日付付き解決済みIDで記録されることがある。
  // pricing.json はエイリアス("claude-haiku-4-5")のみを持つため、末尾の -YYYYMMDD を剥がして再照合する。
  return model.replace(/-\d{8}$/, "");
}

export function priceEntryFor(model, isoTimestamp) {
  let entry = pricing.models[model];
  if (!entry) entry = pricing.models[normalizeModelId(model)];
  if (!entry) return null;
  if (entry.intro_until && isoTimestamp && isoTimestamp.slice(0, 10) <= entry.intro_until) {
    return entry.intro;
  }
  return entry;
}

export function costParts(usage, model, isoTimestamp) {
  const p = priceEntryFor(model, isoTimestamp);
  if (!p) return null;
  const M = 1_000_000;
  const cc5 = usage.cache_creation?.ephemeral_5m_input_tokens ?? usage.cache_creation_input_tokens ?? 0;
  const cc1h = usage.cache_creation?.ephemeral_1h_input_tokens ?? 0;
  return {
    output: (usage.output_tokens || 0) / M * p.output,
    input: (usage.input_tokens || 0) / M * p.input,
    cache_read: (usage.cache_read_input_tokens || 0) / M * p.cache_read,
    cache_write: (cc5 / M * p.cache_write_5m) + (cc1h / M * p.cache_write_1h),
  };
}

export function costOf(usage, model, isoTimestamp) {
  const parts = costParts(usage, model, isoTimestamp);
  if (!parts) return { cost: 0, priced: false };
  return { cost: parts.output + parts.input + parts.cache_read + parts.cache_write, priced: true };
}

const SESSION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 全 project ディレクトリを走査し、
 *  (a) <proj>/<sessionId>.jsonl (本体セッション)
 *  (b) <proj>/<sessionId>/subagents/agent-*.jsonl (サブエージェント transcript・従来欠落していた分)
 * の両方を列挙する。各エントリに isSubagent フラグと(あれば) agentType/description(.meta.jsonから) を付与。
 */
export function listAllUsageFiles() {
  const files = [];
  const projectDirs = fs.readdirSync(PROJECTS_DIR).filter((d) => {
    try { return fs.statSync(path.join(PROJECTS_DIR, d)).isDirectory(); } catch { return false; }
  });

  for (const proj of projectDirs) {
    const dir = path.join(PROJECTS_DIR, proj);
    let entries;
    try { entries = fs.readdirSync(dir); } catch { continue; }

    for (const entry of entries) {
      const entryPath = path.join(dir, entry);
      if (entry.endsWith(".jsonl")) {
        files.push({ proj, file: entryPath, isSubagent: false, agentType: null });
        continue;
      }
      // <sessionId>/ ディレクトリ配下の subagents/ を探索
      if (!SESSION_ID_RE.test(entry)) continue;
      let stat;
      try { stat = fs.statSync(entryPath); } catch { continue; }
      if (!stat.isDirectory()) continue;
      const subDir = path.join(entryPath, "subagents");
      if (!fs.existsSync(subDir)) continue;
      for (const subFile of fs.readdirSync(subDir)) {
        if (!subFile.endsWith(".jsonl")) continue;
        let agentType = null, description = null;
        const metaPath = path.join(subDir, subFile.replace(/\.jsonl$/, ".meta.json"));
        if (fs.existsSync(metaPath)) {
          try {
            const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
            agentType = meta.agentType || null;
            description = meta.description || null;
          } catch { /* ignore malformed meta */ }
        }
        files.push({ proj, file: path.join(subDir, subFile), isSubagent: true, agentType, description, parentSessionId: entry });
      }
    }
  }
  return files;
}
