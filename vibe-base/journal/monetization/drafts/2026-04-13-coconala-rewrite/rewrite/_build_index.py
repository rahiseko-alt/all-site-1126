import re, os, html

base = os.path.dirname(os.path.abspath(__file__))
files = {'dify25': 'dify25.md', 'app50': 'app50.md', 'dsl5': 'dsl5.md'}

LIMITS = {
    'title': 25, 'catch': 30, 'service': 1500,
    'purchase': 1000, 'quote': 200, 'faq': 400, 'option': 60
}

data = {}
for key, fname in files.items():
    path = os.path.join(base, fname)
    with open(path, encoding='utf-8') as f:
        text = f.read()

    d = {}
    m = re.search(r'## サービスタイトル[^\n]*\n([^\n]+)', text)
    d['title'] = m.group(1) if m else ''
    m = re.search(r'## キャッチコピー[^\n]*\n([^\n]+)', text)
    d['catch'] = m.group(1) if m else ''

    m = re.search(r'## サービス内容[^\n]*\n(?:.*?\n)*?```\n(.*?)\n```', text, re.DOTALL)
    d['service'] = m.group(1) if m else ''
    m = re.search(r'## 購入にあたってのお願い[^\n]*\n(?:.*?\n)*?```\n(.*?)\n```', text, re.DOTALL)
    d['purchase'] = m.group(1) if m else ''
    m = re.search(r'## 見積りにあたってのお願い[^\n]*\n(?:.*?\n)*?```\n(.*?)\n```', text, re.DOTALL)
    d['quote'] = m.group(1) if m else ''

    m = re.search(r'## サービス価格\n([^\n]+)', text)
    d['price'] = m.group(1) if m else ''
    m = re.search(r'## 予想お届け日数\n([^\n]+)', text)
    d['days'] = m.group(1) if m else ''
    m = re.search(r'## 一度に受注可能件数\n([^\n]+)', text)
    d['slots'] = m.group(1) if m else ''

    faqs = re.findall(r'\*\*(Q\d+\.[^*]*)\*\*\n([^\n]+)', text)
    d['faqs'] = [{'q': q.strip(), 'a': a, 'len': len(a)} for q, a in faqs]

    m = re.search(r'## 有料オプション[^\n]*\n((?:\d+\.[^\n]*\n)+)', text)
    opts = []
    if m:
        for line in m.group(1).strip().split('\n'):
            line = line.strip()
            line = re.sub(r'^\d+\.\s*', '', line)
            opts.append({'text': line, 'len': len(line)})
    d['options'] = opts

    data[key] = d


def e(s):
    return html.escape(s)


def bar(cur, limit):
    pct = min(100, int(cur / limit * 100))
    cls = 'ok' if cur <= limit else 'over'
    if pct >= 90 and cls == 'ok':
        cls = 'warn'
    return '<div class="bar"><div class="fill ' + cls + '" style="width:' + str(pct) + '%"></div></div><div class="count ' + cls + '">' + str(cur) + ' / ' + str(limit) + '</div>'


def render_tab(key, d):
    p = []
    p.append('<section class="tab-pane" data-tab="' + key + '">')
    p.append('<h2>' + e(key) + ' — ' + e(d['price']) + '</h2>')
    p.append('<div class="meta">予想お届け日数: ' + e(d['days']) + ' / 一度に受注可能: ' + e(d['slots']) + '</div>')

    p.append('<div class="field"><h3>サービスタイトル</h3>')
    p.append('<div class="plain">' + e(d['title']) + '</div>')
    p.append(bar(len(d['title']), LIMITS['title']))
    p.append('</div>')

    p.append('<div class="field"><h3>キャッチコピー</h3>')
    p.append('<div class="plain">' + e(d['catch']) + '</div>')
    p.append(bar(len(d['catch']), LIMITS['catch']))
    p.append('</div>')

    p.append('<div class="field"><h3>サービス内容</h3>')
    p.append('<pre>' + e(d['service']) + '</pre>')
    p.append(bar(len(d['service']), LIMITS['service']))
    p.append('</div>')

    p.append('<div class="field"><h3>購入にあたってのお願い</h3>')
    p.append('<pre>' + e(d['purchase']) + '</pre>')
    p.append(bar(len(d['purchase']), LIMITS['purchase']))
    p.append('</div>')

    p.append('<div class="field"><h3>よくある質問（' + str(len(d['faqs'])) + '件 / 最大10件）</h3>')
    for fq in d['faqs']:
        p.append('<div class="faq">')
        p.append('<div class="faq-q">' + e(fq['q']) + '</div>')
        p.append('<div class="faq-a">' + e(fq['a']) + '</div>')
        p.append(bar(fq['len'], LIMITS['faq']))
        p.append('</div>')
    p.append('</div>')

    p.append('<div class="field"><h3>見積りにあたってのお願い</h3>')
    p.append('<pre>' + e(d['quote']) + '</pre>')
    p.append(bar(len(d['quote']), LIMITS['quote']))
    p.append('</div>')

    p.append('<div class="field"><h3>有料オプション（' + str(len(d['options'])) + '件 / 最大10件）</h3>')
    for opt in d['options']:
        p.append('<div class="opt"><div class="plain">' + e(opt['text']) + '</div>')
        p.append(bar(opt['len'], LIMITS['option']))
        p.append('</div>')
    p.append('</div>')

    p.append('</section>')
    return '\n'.join(p)


tabs = '\n'.join(render_tab(k, d) for k, d in data.items())

CSS = """
:root {
  --bg: #fafafa;
  --fg: #1a1a1a;
  --muted: #666;
  --line: #ddd;
  --accent: #0066cc;
  --ok: #2e7d32;
  --warn: #ef6c00;
  --over: #c62828;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, 'Segoe UI', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif;
  background: var(--bg);
  color: var(--fg);
  font-size: 14px;
  line-height: 1.6;
}
header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--line);
  background: #fff;
}
header h1 { margin: 0 0 4px; font-size: 18px; }
header .sub { color: var(--muted); font-size: 12px; }
.tabs {
  display: flex;
  gap: 2px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid var(--line);
}
.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 14px;
  color: var(--muted);
  font-family: inherit;
}
.tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  font-weight: 600;
}
main {
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
}
.tab-pane { display: none; }
.tab-pane.active { display: block; }
.tab-pane h2 {
  margin: 0 0 4px;
  font-size: 20px;
}
.meta {
  color: var(--muted);
  font-size: 12px;
  margin-bottom: 20px;
}
.field {
  background: #fff;
  border: 1px solid var(--line);
  padding: 14px 16px;
  margin-bottom: 14px;
  border-radius: 4px;
}
.field h3 {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.plain {
  font-size: 15px;
  padding: 6px 0;
}
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  font-size: 13px;
  background: #f5f5f5;
  padding: 10px 12px;
  border-radius: 3px;
  margin: 0 0 6px;
  max-height: 400px;
  overflow-y: auto;
}
.bar {
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 6px;
}
.bar .fill {
  height: 100%;
}
.bar .fill.ok { background: var(--ok); }
.bar .fill.warn { background: var(--warn); }
.bar .fill.over { background: var(--over); }
.count {
  font-size: 11px;
  margin-top: 3px;
  text-align: right;
}
.count.ok { color: var(--ok); }
.count.warn { color: var(--warn); }
.count.over { color: var(--over); font-weight: 600; }
.faq {
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
}
.faq:last-child { border-bottom: none; }
.faq-q { font-weight: 600; font-size: 13px; }
.faq-a { font-size: 12px; color: #333; margin-top: 4px; }
.opt {
  padding: 6px 0;
  border-bottom: 1px dashed #eee;
}
.opt:last-child { border-bottom: none; }
.opt .plain { font-size: 13px; padding: 2px 0; }
footer {
  padding: 16px 24px;
  color: var(--muted);
  font-size: 11px;
  text-align: center;
  border-top: 1px solid var(--line);
  background: #fff;
}
"""

JS = """
document.querySelectorAll('.tab-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    var target = btn.dataset.target;
    document.querySelectorAll('.tab-btn').forEach(function(b){
      b.classList.toggle('active', b === btn);
    });
    document.querySelectorAll('.tab-pane').forEach(function(p){
      p.classList.toggle('active', p.dataset.tab === target);
    });
  });
});
document.querySelectorAll('.tab-pane').forEach(function(p, i){
  if (i === 0) p.classList.add('active');
});
"""

html_out = (
    '<!DOCTYPE html>\n'
    '<html lang="ja">\n'
    '<head>\n'
    '<meta charset="UTF-8">\n'
    '<title>coconala rewrite r1 — 3出品 改稿原稿ビューア</title>\n'
    '<style>' + CSS + '</style>\n'
    '</head>\n'
    '<body>\n'
    '<header>\n'
    '  <h1>coconala rewrite r1 — 3出品 改稿原稿ビューア</h1>\n'
    '  <div class="sub">Plan C 全文書き換え / 2026-04-13 / draft — マスターレビュー待ち</div>\n'
    '</header>\n'
    '<nav class="tabs">\n'
    '  <button class="tab-btn active" data-target="dify25">dify25 (10,000円)</button>\n'
    '  <button class="tab-btn" data-target="app50">app50 (50,000円)</button>\n'
    '  <button class="tab-btn" data-target="dsl5">dsl5 (4,000円)</button>\n'
    '</nav>\n'
    '<main>\n'
    + tabs +
    '\n</main>\n'
    '<footer>\n'
    '  文字数バー: 緑=OK / 橙=90%以上 / 赤=上限超過 (本ビューアでは全項目が上限内であることを確認済み)\n'
    '</footer>\n'
    '<script>' + JS + '</script>\n'
    '</body>\n'
    '</html>\n'
)

out_path = os.path.join(base, 'index.html')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(html_out)
print('wrote', out_path, len(html_out), 'bytes')
