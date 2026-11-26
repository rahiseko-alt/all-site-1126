#!/usr/bin/env node
/**
 * scripts/automation/feed-fetch.mjs  （リスト③ C-1）
 *
 * feed-check の「取得→vault 保存」までを無人化する二段構成の前段。schtasks 日次 07:50。
 * 対象は sources.yml の **type: xml-feed かつ default: true** のみ（html-diff / x-mcp は AI 判断を要すため
 * セッション内 skill に残す）。**分析工程（skill STEP4 ノイズ判定・STEP5.5〜）は自動化しない** — 本 job は
 * 新着を vault に落とすだけで、注入を見たセッション内 AI が feed-check skill の分析から続行する。
 *
 * 冪等性（skill STEP2 と同一規約）: 重複判定は vault 内 .md frontmatter の `url:` 集合と照合（URL 基準・
 * ファイル名不使用）。既存ファイルは上書きしない（新規作成のみ・flag 'wx'）。
 *
 * 出力: 新着のみ $MASTER_VAULT_ROOT\公式情報\ または \トレンド\ に skill STEP5 命名/frontmatter で保存。
 *   新着0件は無通知。新着>0 または取得失敗のみ state に warn を残し C-R で次セッションへ注入。
 *
 * 使い方: node scripts/automation/feed-fetch.mjs [--dry-run]
 *   --dry-run: 取得のみ（vault 保存も state 書込もしない）。件数だけ報告して EXIT 0。
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import yaml from 'js-yaml';
import { recordRun } from './_lib/state.mjs';

const JOB = 'feed-fetch';
const DRY_RUN = process.argv.includes('--dry-run');
const FETCH_TIMEOUT_MS = 15000;
// feed 毎の新着保存上限（reverse-chronological 前提の recent window）。openai-blog=1040 / prtimes=200 等の
// アーカイブ全件フィードで初回に実 vault を数百件フラッドするのを防ぐ。「新着＝直近」の意味に沿う。
// 古い backlog の網羅は自動 importer の範囲外（必要なら feed-check skill で AI が全掃引する）。
const MAX_NEW_PER_FEED = 25;
const DEFAULT_VAULT = 'C:/Users/user/Desktop/倉庫/事業戦略/ナレッジ';
const VAULT_ROOT = process.env.MASTER_VAULT_ROOT || DEFAULT_VAULT;
const SOURCES_YML = path.join(homedir(), '.claude', 'skills', 'feed-check', 'sources.yml');
const CATEGORY_DIRS = { 公式情報: '公式情報', トレンド: 'トレンド' };
// 除去するトラッキング/キャッシュバスタ系クエリパラメータ（dedup キー安定化用）。網羅は原理的に不可能なため
// 代表的なものに限る。取りこぼしても cap 先→dedup 順で影響は「稀な重複保存」に留まる（上書きはしない）。
const TRACKING_PARAM = /^(utm_|fbclid$|gclid$|dclid$|msclkid$|yclid$|mc_eid$|mc_cid$|_hsenc$|_hsmi$|ref$|ref_src$|source$|cmpid$|spm$|igshid$|si$)/i;

// ---- URL 正規化（vault 側・取得側の両方に同一適用＝冪等の要）----
function normalizeUrl(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  let u;
  try {
    u = new URL(s);
  } catch {
    return s.replace(/\/+$/, ''); // 絶対 URL 化できない値は末尾スラッシュだけ落として素通し
  }
  u.hostname = u.hostname.toLowerCase();
  u.hash = '';
  for (const key of [...u.searchParams.keys()]) {
    if (TRACKING_PARAM.test(key)) u.searchParams.delete(key);
  }
  let out = u.toString();
  if (u.search === '') out = out.replace(/\?$/, '');
  // 末尾スラッシュ除去（pathname が "/" だけの時は残す）。
  if (u.pathname !== '/' && out.endsWith('/')) out = out.slice(0, -1);
  return out;
}

// ---- sources.yml から xml-feed かつ default:true を抽出 ----
function loadTargetSources() {
  const doc = yaml.load(readFileSync(SOURCES_YML, 'utf-8'));
  const src = (doc && doc.sources) || {};
  const out = [];
  for (const [name, cfg] of Object.entries(src)) {
    if (!cfg || cfg.type !== 'xml-feed') continue;
    if (cfg.default !== true) continue; // 明示 default:true のみ（プラン指定）
    out.push({ name, url: cfg.url, category: cfg.category === '公式情報' ? '公式情報' : 'トレンド' });
  }
  return out;
}

// ---- 既存 vault URL 集合（frontmatter url: を全 .md から回収し正規化）----
function buildExistingUrlSet() {
  const set = new Set();
  for (const dir of Object.values(CATEGORY_DIRS)) {
    const abs = path.join(VAULT_ROOT, dir);
    let files;
    try {
      files = readdirSync(abs).filter((f) => f.endsWith('.md'));
    } catch {
      continue;
    }
    for (const f of files) {
      try {
        const text = readFileSync(path.join(abs, f), 'utf-8');
        const m = text.match(/^url:\s*(.+)$/m);
        if (m) set.add(normalizeUrl(m[1]));
      } catch {}
    }
  }
  return set;
}

// ---- fetch（タイムアウト + 1 回リトライ）----
async function fetchText(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: ctrl.signal, headers: { 'user-agent': 'feed-fetch/1.0' } });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      clearTimeout(timer);
      if (attempt === 1) throw e;
    }
  }
}

// ---- 軽量 Atom/RSS パーサ（外部 XML 依存なし）----
function decodeEntities(s) {
  return String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, '&')
    .trim();
}

function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? decodeEntities(m[1]) : null;
}

function parseFeed(xml) {
  const entries = [];
  const isAtom = /<entry[\s>]/.test(xml) && /<feed[\s>]/.test(xml);
  const blocks = xml.match(isAtom ? /<entry[\s>][\s\S]*?<\/entry>/gi : /<item[\s>][\s\S]*?<\/item>/gi) || [];
  for (const b of blocks) {
    const title = pick(b, 'title') || '(no title)';
    let link = null;
    if (isAtom) {
      // rel="alternate" 優先、無ければ最初の href。
      const alt = b.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i);
      const any = b.match(/<link[^>]*href=["']([^"']+)["']/i);
      link = alt ? alt[1] : any ? any[1] : null;
    } else {
      link = pick(b, 'link') || pick(b, 'guid');
    }
    const published = pick(b, 'published') || pick(b, 'updated') || pick(b, 'pubDate') || pick(b, 'dc:date');
    const summary = pick(b, 'summary') || pick(b, 'description') || pick(b, 'content') || '';
    if (link) entries.push({ title, link: link.trim(), published, summary });
  }
  return entries;
}

// ---- 保存 ----
function pad(n) {
  return String(n).padStart(2, '0');
}
function todayStr(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function nowStamp(d = new Date()) {
  return `${todayStr(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toPubDate(raw) {
  if (!raw) return '';
  const t = Date.parse(raw);
  return Number.isNaN(t) ? '' : todayStr(new Date(t));
}
function sanitizeTitle(title) {
  return String(title)
    .replace(/[\\/:*?"<>|]/g, ' ') // FS 禁則文字
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)
    .replace(/\s+$/, '')
    .replace(/[. ]+$/, ''); // 末尾のドット/空白（Windows で不可）
}

function saveNote(entry, source, category, normUrl) {
  const dir = path.join(VAULT_ROOT, CATEGORY_DIRS[category]);
  mkdirSync(dir, { recursive: true });
  const base = `${todayStr()}_${source}_${sanitizeTitle(entry.title) || 'untitled'}`;
  const fm = [
    '---',
    `title: ${entry.title.replace(/\n/g, ' ')}`,
    `source: ${source}`,
    `url: ${normUrl}`,
    `published: ${toPubDate(entry.published)}`,
    `fetched: ${nowStamp()}`,
    `category: ${category}`,
    '---',
    '',
    `# ${entry.title}`,
    '',
    `> 公開日: ${toPubDate(entry.published) || '(不明)'} / 取得日: ${nowStamp()}`,
    `> 出典: [${source}](${normUrl})`,
    '',
    decodeEntities(entry.summary).slice(0, 2000),
    '',
    '## 分析',
    '',
    '（未実施: feed-check skill の STEP4 以降をセッション内で実行する）',
    '',
  ].join('\n');

  // 上書き禁止（新規作成のみ）。ファイル名衝突は連番を付す。
  for (let i = 0; i < 50; i++) {
    const name = i === 0 ? `${base}.md` : `${base}-${i + 1}.md`;
    const full = path.join(dir, name);
    try {
      writeFileSync(full, fm, { encoding: 'utf-8', flag: 'wx' });
      return name;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
    }
  }
  throw new Error(`ファイル名衝突を解決できません: ${base}`);
}

async function main() {
  if (!existsSync(VAULT_ROOT)) {
    if (!DRY_RUN) recordRun(JOB, { completed: false, warn: `vault フォルダ不在: ${VAULT_ROOT}` });
    process.stderr.write(`[feed-fetch] vault 不在: ${VAULT_ROOT}\n`);
    process.exit(1);
  }

  const sources = loadTargetSources();
  const existing = DRY_RUN ? new Set() : buildExistingUrlSet();
  let newCount = 0;
  let fetchFails = 0;
  const failedNames = [];
  const seenThisRun = new Set();

  for (const s of sources) {
    let xml;
    try {
      xml = await fetchText(s.url);
    } catch (e) {
      fetchFails++;
      failedNames.push(s.name);
      process.stderr.write(`[feed-fetch] ${s.name} 取得失敗: ${e.message}\n`);
      continue;
    }
    const entries = parseFeed(xml);
    // 冪等性の要: cap を dedup の「前」に適用する。フィードは reverse-chronological 前提で、
    // 最新 MAX_NEW_PER_FEED 件だけを候補窓にし、その後 vault dedup する。候補窓が毎回同じ最新 N 件で
    // 固定されるため、再実行時は全て dedup されて新着0＝冪等。古い backlog（窓の外）は見ない＝フラッド防止。
    // （dedup 後に cap する順序だと、保存済み分が dedup されて次の backlog 25 件が毎回新着化し非冪等になる）。
    const windowEntries = entries.slice(0, MAX_NEW_PER_FEED);
    const capped = entries.length - windowEntries.length;
    let srcNew = 0;
    for (const entry of windowEntries) {
      const norm = normalizeUrl(entry.link);
      if (!norm) continue;
      if (existing.has(norm) || seenThisRun.has(norm)) continue; // 既存 or 同一実行内重複
      seenThisRun.add(norm);
      srcNew++;
      newCount++;
      if (!DRY_RUN) saveNote(entry, s.name, s.category, norm);
    }
    process.stdout.write(
      `[feed-fetch] ${s.name}: entries=${entries.length} new=${srcNew}${capped ? ` (最新${MAX_NEW_PER_FEED}件窓の外 ${capped} 件は対象外)` : ''}\n`
    );
  }

  const summary = `対象 ${sources.length} feed / 新着 ${newCount} 件 / 取得失敗 ${fetchFails} 件${failedNames.length ? ' (' + failedNames.join(',') + ')' : ''}`;
  process.stdout.write(`[feed-fetch] ${DRY_RUN ? '[dry-run] ' : ''}${summary}\n`);

  if (DRY_RUN) {
    process.exit(0); // dry-run は state を書かない
  }

  // 新着>0 または取得失敗のみ warn（＝C-R 注入）。新着0かつ失敗0は健全（無通知）。
  let warn = null;
  if (fetchFails > 0 && newCount > 0) {
    warn = `新着 ${newCount} 件・分析未実施（feed-check skill の STEP4 以降を実行）／取得失敗 ${fetchFails} 件: ${failedNames.join(',')}`;
  } else if (fetchFails > 0) {
    warn = `feed 取得失敗 ${fetchFails} 件: ${failedNames.join(',')}`;
  } else if (newCount > 0) {
    warn = `新着 ${newCount} 件・分析未実施（feed-check skill の STEP4 以降を実行）`;
  }

  recordRun(JOB, {
    // 全 feed 失敗のみ未完扱い。対象0件（default:true な xml-feed が縮退で0件）は正常終了＝completed
    // （`0 < 0` で誤って未完→滞留 warn が出続けるのを防ぐ）。
    completed: sources.length === 0 || fetchFails < sources.length,
    warn,
    metrics: { last_new: newCount, last_fetch_fails: fetchFails },
  });
  process.exit(0);
}

main().catch((e) => {
  if (!DRY_RUN) recordRun(JOB, { completed: false, warn: `feed-fetch 異常終了: ${e.message}` });
  process.stderr.write(`[feed-fetch] FATAL: ${e.stack || e.message}\n`);
  process.exit(1);
});
