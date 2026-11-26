/**
 * 汎用CSS 17項目計測 + 3VPスクリーンショット + リンク検証スクリプト
 *
 * 用途: 参考サイトのCSS値をPuppeteerで自動計測し、JSON+PNG+リンク検証結果を出力
 * 依存: puppeteer (npm install --save-dev puppeteer)
 * 使い方: node puppeteer-css-measure-2026.mjs <url1> [url2] [url3] [--out <dir>]
 *
 * 例:
 *   node puppeteer-css-measure-2026.mjs https://tayori.com https://tidio.com
 *   node puppeteer-css-measure-2026.mjs https://lme.jp --out ./output
 *
 * 出力:
 *   measure-{site}-{YYYY-MM-DD}.json  — CSS 17項目計測結果
 *   {site}-desktop-1440.png           — デスクトップスクリーンショット
 *   {site}-tablet-768.png             — タブレットスクリーンショット
 *   {site}-mobile-375.png             — モバイルスクリーンショット
 *
 * 計測項目: base font-size / font-family / font-size / font-weight /
 *           line-height / letter-spacing / text colors / bg colors /
 *           borders / padding / margin / gap / max-width / heights /
 *           border-radius / box-shadow / opacity
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// ── Args ──
const args = process.argv.slice(2);
const urls = [];
let outDir = '.';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--out' && args[i + 1]) { outDir = args[++i]; }
  else if (args[i].startsWith('http')) { urls.push(args[i]); }
}
if (urls.length === 0) {
  console.log('Usage: node puppeteer-css-measure-2026.mjs <url1> [url2] [--out <dir>]');
  process.exit(1);
}

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-375', width: 375, height: 812 },
];
const today = new Date().toISOString().slice(0, 10);

function siteNameFromUrl(url) {
  try { return new URL(url).hostname.replace(/^www\./, '').split('.')[0]; }
  catch { return 'unknown'; }
}

async function dismissDialogs(page) {
  await page.evaluate(() => {
    document.querySelectorAll('button, [role="button"], a').forEach(btn => {
      const t = (btn.textContent || '').toLowerCase();
      if (/accept|agree|ok|close|dismiss|同意|承諾|閉じる|cookie/.test(t)) {
        try { btn.click(); } catch {}
      }
    });
  });
}

async function scrollPage(page) {
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollBy(0, 500));
    await new Promise(r => setTimeout(r, 400));
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));
}

async function measureCSS(page) {
  return await page.evaluate(() => {
    const gs = (el) => window.getComputedStyle(el);
    const result = {};
    result['1_html_base_font_size'] = gs(document.documentElement).fontSize;
    const typoSel = { h1:'h1', h2:'h2', h3:'h3', p:'p', small:'small', nav_a:'nav a, header a', button:'button, [role="button"]' };
    const typo = {};
    for (const [key, sel] of Object.entries(typoSel)) {
      const el = document.querySelector(sel);
      if (el) { const s = gs(el); typo[key] = { fontFamily: s.fontFamily.split(',').slice(0,2).join(','), fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing }; }
    }
    result['2_font_family'] = typo;
    result['3_font_size'] = Object.fromEntries(Object.entries(typo).map(([k,v])=>[k,v.fontSize]));
    result['4_font_weight'] = Object.fromEntries(Object.entries(typo).map(([k,v])=>[k,v.fontWeight]));
    result['5_line_height'] = Object.fromEntries(Object.entries(typo).map(([k,v])=>[k,v.lineHeight]));
    result['6_letter_spacing'] = Object.fromEntries(Object.entries(typo).map(([k,v])=>[k,v.letterSpacing]));
    const tc = {}; ['h1','h2','h3','p','a','button','span','li'].forEach(t=>{ const el=document.querySelector(t); if(el) tc[t]=gs(el).color; });
    result['7_text_colors'] = tc;
    const bc = {}; ['body','main','header','footer','section','nav'].forEach(s=>{ const el=document.querySelector(s); if(el){ const bg=gs(el).backgroundColor; if(bg&&bg!=='rgba(0, 0, 0, 0)') bc[s]=bg; }});
    result['8_bg_colors'] = bc;
    const collect = (sel, limit, fn) => { const r=[]; document.querySelectorAll(sel).forEach(el=>{ if(r.length>=limit)return; const v=fn(el); if(v) r.push(v); }); return r; };
    result['9_borders'] = collect('*', 25, el => { const s=gs(el); return parseFloat(s.borderTopWidth)>0 ? {tag:el.tagName.toLowerCase(),class:(el.className||'').toString().slice(0,40),borderColor:s.borderColor,borderWidth:s.borderTopWidth} : null; }).slice(0,15);
    result['10_padding'] = collect('section,div,header,footer,main', 30, el => { const r=el.getBoundingClientRect(); if(r.width>100||r.height>50){ const p=gs(el).padding; if(p&&p!=='0px') return {tag:el.tagName.toLowerCase(),class:(el.className||'').toString().slice(0,40),padding:p}; } return null; }).slice(0,15);
    result['11_margin'] = collect('section,div,h1,h2,h3,p', 25, el => { const m=gs(el).margin; return m&&m!=='0px' ? {tag:el.tagName.toLowerCase(),class:(el.className||'').toString().slice(0,40),margin:m} : null; }).slice(0,15);
    result['12_gap'] = collect('*', 20, el => { const s=gs(el); return (s.display==='flex'||s.display==='grid')&&s.gap&&s.gap!=='normal'&&s.gap!=='0px' ? {tag:el.tagName.toLowerCase(),class:(el.className||'').toString().slice(0,40),gap:s.gap,display:s.display} : null; }).slice(0,15);
    result['13_max_width'] = collect('*', 15, el => { const mw=gs(el).maxWidth; return mw!=='none' ? {tag:el.tagName.toLowerCase(),class:(el.className||'').toString().slice(0,40),maxWidth:mw} : null; }).slice(0,10);
    const h = {}; ['header','nav','footer','button','h1','h2','h3'].forEach(s=>{ const el=document.querySelector(s); if(el) h[s]=el.getBoundingClientRect().height+'px'; });
    result['14_heights'] = h;
    result['15_border_radius'] = collect('*', 20, el => { const br=gs(el).borderRadius; return br&&br!=='0px' ? {tag:el.tagName.toLowerCase(),class:(el.className||'').toString().slice(0,40),borderRadius:br} : null; }).slice(0,15);
    result['16_box_shadow'] = collect('*', 25, el => { const bs=gs(el).boxShadow; return bs&&bs!=='none' ? {tag:el.tagName.toLowerCase(),class:(el.className||'').toString().slice(0,40),boxShadow:bs} : null; }).slice(0,15);
    result['17_opacity'] = collect('*', 20, el => { const o=gs(el).opacity; return o!=='1' ? {tag:el.tagName.toLowerCase(),class:(el.className||'').toString().slice(0,40),opacity:o} : null; }).slice(0,10);
    return result;
  });
}

(async () => {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  for (const url of urls) {
    const site = siteNameFromUrl(url);
    console.log(`\n${'='.repeat(50)}\nMEASURING: ${site} (${url})\n${'='.repeat(50)}`);
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1440, height: 900 });
    try { await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }); } catch { console.log('  Timeout, continuing...'); }
    await new Promise(r => setTimeout(r, 2000));
    await dismissDialogs(page);
    await new Promise(r => setTimeout(r, 1000));
    await scrollPage(page);

    console.log('  [1/3] CSS measurement...');
    try {
      const css = await measureCSS(page);
      const jp = path.join(outDir, `measure-${site}-${today}.json`);
      fs.writeFileSync(jp, JSON.stringify(css, null, 2));
      console.log(`  Saved: ${jp}`);
    } catch (e) { console.log(`  Error: ${e.message}`); }

    console.log('  [2/3] Screenshots...');
    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await new Promise(r => setTimeout(r, 1000));
      const fp = path.join(outDir, `${site}-${vp.name}.png`);
      await page.screenshot({ path: fp, fullPage: true });
      console.log(`    ${fp}`);
    }

    console.log('  [3/3] Links...');
    const ld = await page.evaluate(() => {
      const links = []; document.querySelectorAll('a').forEach(a => { const h=a.getAttribute('href')||''; let t='INTERNAL'; if(h==='#'||h==='')t='DEAD'; else if(h.startsWith('#'))t=document.getElementById(h.slice(1))?'ANCHOR_OK':'ANCHOR_MISS'; else if(h.startsWith('http'))t='EXTERNAL'; links.push({text:(a.textContent||'').trim().slice(0,60),href:h.slice(0,80),type:t}); });
      return links.slice(0, 30);
    });
    const dead = ld.filter(l=>l.type==='DEAD').length;
    console.log(`  Links: ${ld.length} (dead:${dead})`);
    await page.close();
  }
  await browser.close();
  console.log('\nDone.');
})();
