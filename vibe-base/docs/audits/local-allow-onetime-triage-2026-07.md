# local allow 一回性棚卸し（A-21）

> 生成: scripts/audit-local-allow-onetime.mjs（読み取り専用・削除は一切行わない）
> 対象: .claude/settings.local.json permissions.allow 463件
> 分類件数: 削除候補=139 / 保持=324 / E-1/E-2申し送り=0

マスターが行単位で承認した行のみ削除する（段階展開: 最初の1件→JSON parse検証→残り継続）。

| ルール文字列 | 分類 | 判定理由 |
|---|---|---|
| `Bash(cd:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(done)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebSearch` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:smaregi.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:ubiregi.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:okagekk.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:squareup.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:cashlesspayment.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:012cloud.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.recruit.co.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.meti.go.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.inshokuten.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:paymentsjapan.or.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:news.yahoo.co.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:dime.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:usen.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(for dir in annotations browser_recordings code_tracker context_state html_artifacts knowledge playground scratch)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(do echo "=== $dir ===")` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Read(//c/Users/user/.gemini/antigravity/**)` | 削除候補 | 絶対パス含む |
| `WebFetch(domain:review.kouheikosehira.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:microscope-lp.vercel.app)` | 保持 | 汎用パターン・再利用可能性あり |
| `Read(//c/Users/user/.agents/skills/find-skills/**)` | 削除候補 | 絶対パス含む |
| `Read(//c/Users/user/.agents/**)` | 削除候補 | 絶対パス含む |
| `Read(//c/Users/user/.agents/skills/**)` | 削除候補 | 絶対パス含む |
| `WebFetch(domain:vibe-coding.kouheikosehira.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Read(//c/Users/user/Desktop/Misfits/projects/x-poster/src/products/**)` | 削除候補 | 絶対パス含む |
| `Read(//c/Users/user/Desktop/Misfits/projects/x-poster/**)` | 削除候補 | 絶対パス含む |
| `WebFetch(domain:aiueo.kouheikosehira.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(cd "C:\\Users\\user\\Desktop\\Misfits\\projects\\x-poster" && npx tsc --noEmit 2>&1 \| head -40)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(cd "C:/Users/user/Desktop/Misfits/projects/x-poster" && npx tsc --noEmit 2>&1 \| head -40)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(pushd "C:/Users/user/Desktop/Misfits/projects/x-poster" && npx tsc --noEmit 2>&1 \| head -50 ; popd)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し・pushd/popd/一時ディレクトリ参照 |
| `Read(//c/Users/user/.claude/**)` | 削除候補 | 絶対パス含む |
| `Read(//c/Users/user/.claude/projects/**)` | 削除候補 | 絶対パス含む |
| `Bash(du -sh ~/.claude/ 2>&1 && du -sh ~/.claude/*/ 2>&1)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(which clasp:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(clasp --version)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(cd "C:\\Users\\user\\Desktop\\Misfits\\projects\\x-poster" && npx tsc --noEmit 2>&1)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(lsof -ti:3456)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(xargs kill:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(netstat -ano)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(cd "C:\\Users\\user\\Desktop\\Misfits\\projects\\x-poster" && pm2 restart misfits-poster 2>&1)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(cd "C:\\Users\\user\\Desktop\\Misfits\\projects\\x-poster" && pm2 list 2>&1)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(cd "C:\\Users\\user\\Desktop\\Misfits\\projects\\x-poster" && pm2 start "npx tsx src/index.ts" --name misfits-poster 2>&1)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(cd "C:\\Users\\user\\Desktop\\Misfits\\projects\\x-poster" && pm2 start npx --name misfits-poster -- tsx src/index.ts 2>&1)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(pm2 logs:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(pm2 delete:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(cd "C:\\Users\\user\\Desktop\\Misfits\\projects\\x-poster" && pm2 save 2>&1)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(pm2 list:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(cd /c/Users/user/Desktop/vibe-base/agent-ag/review-analysis-bot/review-app && npm install prisma @prisma/client @google/generative-ai 2>&1)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(cd /c/Users/user/Desktop/vibe-base && node scripts/ga4-report.mjs 2>&1)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `WebFetch(domain:skills.sh)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(for f:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(pm2 info:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(pm2 show:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(cd "C:\\Users\\user\\Desktop\\Misfits\\projects\\x-poster" && npx tsc --noEmit 2>&1 && echo "BUILD OK")` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(pm2 restart:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(cd C:/Users/user/Desktop/vibe-base/agent-ag/review-analysis-bot/review-app && npx tsc --noEmit 2>&1 \| head -20)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(cloudflared --version)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(nslookup review.kouheikosehira.com 2>&1 \| head -10; echo "---"; nslookup vibe-coding.kouheikosehira.com 2>&1 \| head -10)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(claude mcp:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:stape.io)` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__ga4__get_account_summaries` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__ga4__run_report` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(cd /c/Users/user/Desktop/vibe-base/agent-ag/review-analysis-bot/review-app && npx tsc --noEmit 2>&1 \| head -20)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(printf 'https://review.kouheikosehira.com' \| npx vercel env add NEXT_PUBLIC_SITE_URL production 2>&1)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `WebFetch(domain:review-app-orpin-ten.vercel.app)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:app.review.kouheikosehira.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(cd "C:/Users/user/Desktop/vibe-base" && node scripts/ga4-report.mjs)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(cd "C:/Users/user/Desktop/vibe-base" && node scripts/ga4-daily-sources.mjs)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(cd "C:/Users/user/Desktop/vibe-base" && node scripts/ga4-daily-all.mjs)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(cd "C:/Users/user/Desktop/vibe-base" && node -e "const f = require\('./ga4-service-account.json'\); console.log\(f.client_email\);")` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(cd "C:/Users/user/Desktop/vibe-base" && node scripts/ga4-daily-review.mjs)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `WebFetch(domain:www.itreview.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:business-tenpo-dx.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:style-provider.co.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:airregi.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(cd "C:\\Users\\user\\Desktop\\vibe-base\\agent-ag\\aiueo-lp" && for f in index.html features.html pricing.html use-cases.html comparison.html src/main.css api/signup.js package.json vercel.json; do wc -l "$f"; done)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(cd /c/Users/user/Desktop/vibe-base/agent-ag/aiueo-app && wc -l frontend/src/components/*.jsx \| sort -n)` | 削除候補 | 絶対パス含む |
| `Bash(cd /c/Users/user/Desktop/vibe-base/agent-ag/aiueo-app && wc -l frontend/src/utils/*.js \| sort -n)` | 削除候補 | 絶対パス含む |
| `Bash(cd /c/Users/user/Desktop/vibe-base/agent-ag/aiueo-app && wc -l frontend/src/api/*.js \| sort -n)` | 削除候補 | 絶対パス含む |
| `Bash(cd /c/Users/user/Desktop/vibe-base/agent-ag/aiueo-app && node -e "const pkg = require\('./frontend/package.json'\); const deps = Object.keys\(pkg.dependencies \|\| {}\).length; const devDeps = Object.keys\(pkg.devDependencies \|\| {}\).length; console.log\('Dependencies: ' + deps\); console.log\('Dev Dependencies: ' + devDeps\); console.log\('Total: ' + \(deps + devDeps\)\);")` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Read(//c/Users/user/Desktop/vibe-base/**)` | 削除候補 | 絶対パス含む |
| `Bash(printf '\\nFRONTEND UTILITIES:\\n')` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(printf '\\nFRONTEND API CLIENTS:\\n')` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(printf nHOOKS:n)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(start:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(unzip:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(ssh:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(scp:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:mobile-order-system.vercel.app)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(du:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(nslookup:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Read(//tmp/**)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:aiueo-test-client.vercel.app)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(tasklist:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(for d:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(do echo:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Read(//c/Users/user/Desktop/vibe-base/$d/.vercel/**)` | 削除候補 | 絶対パス含む |
| `WebFetch(domain:aiueo-lp.vercel.app)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:localhost)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(pkill:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:claude.ai)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:kutikomi.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:effectual.co.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:meo.tryhatch.co.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.gyro-n.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:kigyolog.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:strate.biz)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:faq.ranktoolap.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.location-connect.net)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.meo-freaks.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:meetsmore.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:prtimes.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:sheepdog.co.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.ruby.or.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.green-japan.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:paiza.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:sg.wantedly.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:builtwith.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:herp.careers)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:morejob.co.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:jobs.forkwell.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:levtech-direct.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:findy-code.io)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:tryhatch.co.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:jobseek.ne.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.aspicjapan.org)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:coralcap.co)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(findstr /i node)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(handle64.exe "query_engine-windows.dll.node")` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(printf '980563669848-o886ibvsopepsago15454qca72nkrmqe.apps.googleusercontent.com')` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.remotion.dev)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:github.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.npmjs.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:raw.githubusercontent.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(for product:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:omotenashi-trainer.vercel.app)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:developers.googleblog.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:stitch.withgoogle.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:blog.google)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:codelabs.developers.google.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.sotaaz.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:birdeye.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:legal.podium.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.yext.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:hello.podium.page)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:help.yext.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:podium.pactsafe.io)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:investors.yext.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:cdn2.birdeye.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Read(//c/Users/user/Downloads/**)` | 削除候補 | 絶対パス含む |
| `WebFetch(domain:note.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:terms.help-note.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:support.google.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.jiji.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:corp.itmedia.co.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:policies.google.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(tr ';' '\\n')` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `WebFetch(domain:www.reviewflowz.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.feedbackrobot.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.socialpilot.co)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.reviewtrackers.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:help.feedbackrobot.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:jp.can-ly.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:leapdog.co.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:service.honichi.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:fama.startrise.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash("C:/Users/user/Desktop/vibe-base/archive/mission-log-20260322.md":*)` | 削除候補 | 絶対パス含む |
| `Bash(cygpath:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(where chrome:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(where msedge:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Read(//c/Program Files/Google/Chrome/Application/**)` | 削除候補 | 絶対パス含む |
| `Read(//c/Program Files \(x86\)/Microsoft/Edge/Application/**)` | 削除候補 | 絶対パス含む |
| `Bash("/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --print-to-pdf="C:\\Users\\user\\Desktop\\web-page-classification.pdf" --no-margins "file:///C:/Users/user/Desktop/vibe-base/docs/web-page-classification.html" 2>&1)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash("/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --print-to-pdf="C:/Users/user/Desktop/インターネットの階層比喩.pdf" --no-margins "file:///C:/Users/user/Desktop/vibe-base/tmp/internet-hierarchy.html" 2>&1)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash("/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --print-to-pdf="C:/Users/user/Desktop/WEBページ分類体系.pdf" --no-margins "file:///C:/Users/user/Desktop/vibe-base/tmp/web-understanding-combined.html" 2>&1)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash("/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --print-to-pdf="C:/Users/user/Desktop/客の動機と提供すべきWEBサービス.pdf" --no-margins "file:///C:/Users/user/Desktop/vibe-base/tmp/web-understanding-combined.html" 2>&1)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(chmod:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(printf '{""""tool_input"""":{""""file_path"""":""""C:\\\\\\\\Users\\\\\\\\user\\\\\\\\Desktop\\\\\\\\vibe-base\\\\\\\\products\\\\\\\\foodee\\\\\\\\app\\\\\\\\public\\\\\\\\index.html""""}}')` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(xxd /tmp/hook-test-input.json)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.notion.so)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(gcloud --version)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:agentskills.so)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:medium.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:chromedevtools.github.io)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:aiueo-pvfjmbmn3-rahisekos-projects.vercel.app)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(ffmpeg -version)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(where ffmpeg:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(winget install:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(export PATH="$PATH:/c/Users/user/AppData/Local/Microsoft/WinGet/Links")` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Read(//c/Users/user/AppData/Local/Microsoft/WinGet/Links/**)` | 削除候補 | 絶対パス含む |
| `Read(//c/ProgramData/**)` | 削除候補 | 絶対パス含む |
| `Read(//c/Program Files/**)` | 削除候補 | 絶対パス含む |
| `Read(//c//**)` | 削除候補 | 絶対パス含む |
| `Bash(FFMPEG_PATH="/c/Users/user/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin")` | 削除候補 | 絶対パス含む |
| `Bash("$FFMPEG_PATH/ffmpeg.exe" -version)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(where jq:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:review-bs19rejwi-rahisekos-projects.vercel.app)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:coconala.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:crowdworks.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.lancers.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash("/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --print-to-pdf="C:/Users/user/Desktop/coconala-final-report.pdf" --no-margins "file:///C:/Users/user/Desktop/vibe-base/tmp/coconala-final-report.html" 2>&1)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(2)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(where wkhtmltopdf:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash("/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --print-to-pdf="C:/Users/user/Desktop/ai-concierge-listing-drafts.pdf" --no-margins "file:///C:/Users/user/Desktop/ai-concierge-listing-drafts.html" 2>&1)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(python3 gen_sop_html.py)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:ai-concierge-nu-lyart.vercel.app)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:ai-answer.kouheikosehira.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(python:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash("/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --print-to-pdf="C:/Users/user/Desktop/AI-Answer-システム仕様書.pdf" --no-margins "file:///C:/Users/user/Desktop/vibe-base/products/ai-concierge/tmp/coconala-spec-sheet.html" 2>&1)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(for file:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(xargs -I{} basename {})` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Read(//c/Users/user/Desktop/**)` | 削除候補 | 絶対パス含む |
| `Bash(xargs -I {} bash -c "echo '=== {} ===' && head -50 '{}'")` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(xargs -I{} echo "T\(templates\): {}")` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(xargs -I{} echo "C\(checklists\): {}")` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(xargs -I{} echo "B\(boilerplate\): {}")` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `WebFetch(domain:docs.google.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:doc-0g-3o-docstext.googleusercontent.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(uipro init:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:dify.ai)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:docs.dify.ai)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.architjn.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:miichisoft.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:forum.dify.ai)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:openai.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.anthropic.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:docs.docker.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:help.openai.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:ai.google.dev)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(python3:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(docker info:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(wsl --status)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(pwsh:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:unsplash.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.pexels.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:images.pexels.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:gemini.google.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(where python:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(where python3:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(where pip:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(where pip3:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(pipx:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(yt-dlp:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(rdt search:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe:*)` | 削除候補 | 絶対パス含む |
| `Bash(pip list:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(py:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(/c/Program Files/Google/Chrome/Application/chrome.exe:*)` | 削除候補 | 絶対パス含む |
| `Bash("/c/Program Files/Google/Chrome/Application/chrome.exe" --remote-debugging-port=9222 --no-first-run --user-data-dir="C:/tmp/chrome-debug")` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(findstr 9222)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:developer.chrome.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:googlechromelabs.github.io)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash("C:/Users/user/Desktop/vibe-base/.chrome-for-testing/chrome/win64-147.0.7727.50/chrome-win64/chrome.exe" --remote-debugging-port=9222 --headless=new --disable-gpu --no-sandbox --no-first-run about:blank)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash("C:/Users/user/Desktop/vibe-base/.chrome-for-testing/chrome/win64-147.0.7727.50/chrome-win64/chrome.exe" --remote-debugging-port=9222 --no-first-run --disable-default-apps about:blank)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash("C:/Program Files/Google/Chrome/Application/chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\\\\tmp\\\\chrome-debug" "https://ground.line.me/ja/index.html")` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(dir '/c/Users/user/Desktop/vibe-base/.claude/skills/animation-extract/')` | 削除候補 | 絶対パス含む |
| `Bash(schtasks /query /fo LIST /v)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(reg query:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(schtasks /query /fo CSV /nh)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(iconv -f cp932 -t utf-8)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(schtasks /query /fo CSV)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(schtasks:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(where pdftoppm:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(where pdftotext:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(pip show:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(pdftotext "C:/Users/user/Downloads/The_Conversion_Science_Playbook.pdf" -)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(pdftotext "C:/Users/user/Downloads/The_Conversion_Science_Playbook.pdf" "C:/Users/user/Desktop/vibe-base/analysis/data/conversion-playbook.txt")` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(pdftotext -layout "C:/Users/user/Downloads/The_Conversion_Science_Playbook.pdf" -)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(where py:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(awk '{s+=$1} END {printf "%.2f MB\\n", s/1024/1024}')` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(kill -0 by73x1l68)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `WebFetch(domain:docs.claude.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(playwright install:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__playwright__browser_snapshot` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__playwright__browser_evaluate` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__playwright__browser_take_screenshot` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__playwright__browser_navigate` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__playwright__browser_resize` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(rsync -av --exclude='app/.env' --exclude='app/.env.vercel' --exclude='app/.env.local' --exclude='app/node_modules' --exclude='app/dist' --exclude='app/.vercel' --exclude='tmp' --exclude='memory' --exclude='*.mp4' /c/Users/user/Desktop/vibe-base/products/ai-concierge/ /c/Users/user/Desktop/ai-answer/)` | 削除候補 | 絶対パス含む |
| `Bash(code --version)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(/c/Users/user/AppData/Local/Microsoft/WindowsApps/python3:*)` | 削除候補 | 絶対パス含む |
| `Bash(/c/Users/user/AppData/Local/Python/bin/python.exe C:/Users/user/Desktop/vibe-base/.claude/skills/perfect-web-clone/scripts/extract_page.py https://layers.to/explore --output page_data.json)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(/c/Users/user/AppData/Local/Python/bin/python.exe C:/Users/user/Desktop/vibe-base/.claude/skills/perfect-web-clone/scripts/chunk_content.py page_data.json --output chunks/ --max-tokens 50000)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `mcp__playwright__browser_hover` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__playwright__browser_run_code` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.minkou.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__playwright__browser_console_messages` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(yarn --version)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(yarn install:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(yarn dev:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:mulmocast.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(/c/Users/user/AppData/Local/Microsoft/WindowsApps/python.exe:*)` | 削除候補 | 絶対パス含む |
| `WebFetch(domain:coconala-support.zendesk.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:yorudakedesignblog.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:coconala-guide.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__playwright__browser_click` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__playwright__browser_network_requests` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__playwright__browser_navigate_back` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(iconv -f CP932 -t UTF-8)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(wmic path:*)` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__playwright__browser_close` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(awk -F'\|' '{print $2}')` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(cscript //nologo "_internal/install_macros.vbs" "C:/Users/user/Desktop/vibe-base/tmp/test-delivery/")` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(cscript //nologo "_internal/install_macros.vbs" "C:/Users/user/Desktop/vibe-base/tmp/test-delivery2/")` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(cscript //nologo "C:/Users/user/Desktop/vibe-base/tmp/test-delivery2/_internal/install_macros.vbs" "C:/Users/user/Desktop/vibe-base/tmp/test-delivery2/")` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(awk -F: '{sum += $NF} END {print sum}')` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(awk -F: '{print $1}')` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(awk -F: '{$NF=""; print}')` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `WebFetch(domain:replicate.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(xargs -I{} stat --printf='%Y %n\\n' {})` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(awk '$1 > 1744588800 && $1 < 1744675200')` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(xargs -I{} stat -c '%y\|%n' {})` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(PYTHONIOENCODING=utf-8 python)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:jp.pinterest.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:akiharublog.net)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:maru-coin.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:webdesign-mame.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(PYTHONIOENCODING=utf-8 python *)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(findstr :3000)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(findstr LISTENING)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(findstr ":3000 ")` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(uv *)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(export PATH="$PATH:/c/Users/user/.local/bin")` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(nlm --help)` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__notebooklm-mcp__notebook_list` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__notebooklm-mcp__batch` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__notebooklm-mcp__notebook_create` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:docs.anthropic.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__notebooklm-mcp__server_info` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(claude -p "just say OK" --model opusplan)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `mcp__notebooklm-mcp__note` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(printenv REPLICATE_API_TOKEN)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:pricepertoken.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:bfl.ai)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:docs.bfl.ml)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:docs.bfl.ai)` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__notebooklm-mcp__source_add` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(awk '/^## Opus Check-out: 2026-04-18 \\\(Session 183\\\)/,/EOF/' MISSION_LOG.md)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(sed -n '210,$p' MISSION_LOG.md)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `mcp__notebooklm-mcp__notebook_query` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(sed -n '228,$p' MISSION_LOG.md)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Skill(schedule)` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__claude_ai_Google_Drive__read_file_content` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(xargs -I {} grep -l "Kouhei@1002" {})` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `WebFetch(domain:lme.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:tayori.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:d4cus.net)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:webcreate.cc)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:hira-line.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:ivygain.co.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:aotsuki.net)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:zenn.dev)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(./.venv/Scripts/python.exe demo_jujutsu.py)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(./.venv/Scripts/python.exe launch_only.py)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(./.venv/Scripts/python.exe route_a1_filename_tag.py)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(./.venv/Scripts/python.exe scripts/auto_subtitle.py)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:submagic.co)` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__playwright__browser_file_upload` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__playwright__browser_wait_for` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(./.venv/Scripts/python.exe scripts/batch_subtitle.py)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(./.venv/Scripts/python.exe scripts/gen_trimmer_voice.py)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(./.venv/Scripts/python.exe scripts/gen_trimmer_images.py)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(./.venv/Scripts/python.exe scripts/gen_trimmer_images_slow.py)` | 保持 | 汎用パターン・再利用可能性あり |
| `Read(//c/c/Users/user/Desktop/vibe-base/**)` | 削除候補 | 絶対パス含む |
| `mcp__claude_ai_Canva__list-brand-kits` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__claude_ai_Canva__search-designs` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__claude_ai_Canva__generate-design` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:kouheikosehira.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:portfolio.kouheikosehira.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(awk '{print $NF}')` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `WebFetch(domain:mikhail.io)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:giuseppegurgone.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:help.apiyi.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(notepad *)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(awk -F: '{print $1":"$2}')` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(awk -F: '{print $NF}')` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `WebFetch(domain:blog.segmind.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.justinwetch.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:x.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__notebooklm-mcp__notebook_get` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__notebooklm-mcp__source_get_content` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__notebooklm-mcp__source_delete` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(xxd)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:linear.app)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:stripe.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:tailwindui.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:vercel.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:klim.co.nz)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.apple.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(claude --version)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(claude update *)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(nlm login *)` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__notebooklm-mcp__notebook_describe` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(sed -n '395,$p' MISSION_LOG.md)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(sed -n '184,188p' MISSION_LOG.md)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(sed -n '278,332p' MISSION_LOG.md)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(sed -n '186,328p' MISSION_LOG.md)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(head -n 184 MISSION_LOG.md)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(printf '<!-- Session 211 \(エージェントTask含む\) → archive/mission-log-20260427-s211.md に退避済み -->\\n\\n')` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(sed -n '329,$p' MISSION_LOG.md)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(awk '/^### CL-14/,/^### CL-15/' docs/ops/product-cycle.md)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(xargs -I{} echo "CL-14 項目数: {}")` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(awk 'NR>=281 && /^## Check-out: 2026-04-27 \\\(Session 214\\\)/,/^## Check-out: 2026-04-27 \\\(Session 213\\\)/' MISSION_LOG.md)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(awk 'NR<281 {print} NR==281 {print "<!-- Session 214 → archive/mission-log-20260427-s214.md に退避済み -->"} NR>335 {print}' MISSION_LOG.md)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(sed -n '406,469p' MISSION_LOG.md)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(head -405 MISSION_LOG.md)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(printf '<!-- Session 221 → archive/mission-log-20260428-s221.md に退避済み -->\\n\\n')` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(tail -n +470 MISSION_LOG.md)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `WebFetch(domain:docs.x.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:devcommunity.x.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(command -v jq)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `WebFetch(domain:docs.cloud.google.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(Get-ChildItem -Path "C:\\Users\\user\\Desktop\\vibe-base" -Filter ".env*" -Recurse -ErrorAction SilentlyContinue)` | 削除候補 | 絶対パス含む |
| `Bash(Select-Object -ExpandProperty FullName)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `WebFetch(domain:smileplanet.net)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(where magick *)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.smileplanet.net)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:rss.itmedia.co.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:alistairmavin.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.datacamp.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.pixelmojo.io)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:arxiv.org)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:yurenju.blog)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:dev.to)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:automationpanda.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:venturebeat.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:mer.vin)` | 保持 | 汎用パターン・再利用可能性あり |
| `PowerShell(Start-Process "C:\\Users\\user\\Desktop\\�q��\\�d�v\\meishi_kosehira.pdf")` | 削除候補 | 絶対パス含む |
| `PowerShell(Start-Process "C:\\Users\\user\\Desktop\\�q��\\�d�v\\meishi_kosehira_back.pdf")` | 削除候補 | 絶対パス含む |
| `mcp__bb3fdcd6-cfc5-4ea1-835d-20369206d831__search-designs` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__bb3fdcd6-cfc5-4ea1-835d-20369206d831__get-design-content` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:hattan.info)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.graphic.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.megaprint.jp)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.qrcode.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:oddplan.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:raksul.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:hattool.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.meishi-house.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.meishi-house.net)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:ixdf.org)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:t3l.org)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:mitekaku.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:www.nippon.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:goworkship.com)` | 保持 | 汎用パターン・再利用可能性あり |
| `WebFetch(domain:hnrss.org)` | 保持 | 汎用パターン・再利用可能性あり |
| `Write(//c/Users/user/Desktop/倉庫/事業戦略/ナレッジ/公式情報/**)` | 削除候補 | 絶対パス含む |
| `Write(//c/Users/user/Desktop/倉庫/事業戦略/ナレッジ/トレンド/**)` | 削除候補 | 絶対パス含む |
| `Write(//c/Users/user/Desktop/倉庫/事業戦略/ナレッジ/分析/**)` | 削除候補 | 絶対パス含む |
| `Edit(//c/Users/user/Desktop/倉庫/事業戦略/ナレッジ/公式情報/**)` | 削除候補 | 絶対パス含む |
| `Edit(//c/Users/user/Desktop/倉庫/事業戦略/ナレッジ/トレンド/**)` | 削除候補 | 絶対パス含む |
| `Edit(//c/Users/user/Desktop/倉庫/事業戦略/ナレッジ/分析/**)` | 削除候補 | 絶対パス含む |
| `Bash(git show *)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(diff -q /tmp_root_coach_claude.md products/coach/CLAUDE.md)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(git -C /c/Users/user/.claude/tmp-x-recovery/x-auto-post show origin/master:queue.json)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(git -C /c/Users/user/.claude/tmp-x-recovery/x-auto-post show origin/master:queue-meta.json)` | 削除候補 | 絶対パス含む・固有引数3語以上・ワイルドカード無し |
| `Bash(node --check api/replace.js)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(node --check api/documents.js)` | 削除候補 | 固有引数3語以上・ワイルドカード無し |
| `Bash(node scripts/propagate-hooks.mjs)` | 保持 | 汎用パターン・再利用可能性あり |
| `Bash(node scripts/check-hooks-syntax.mjs)` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__chrome-devtools__click` | 保持 | 汎用パターン・再利用可能性あり |
| `mcp__chrome-devtools__take_snapshot` | 保持 | 汎用パターン・再利用可能性あり |

