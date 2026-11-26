#!/usr/bin/env node
  // PreToolUse:Write|Edit — 運用エリア統合ゲート
  // 新エリア追加時: AREAS配列に1エントリ追加するだけ
  // 既存hookと同じパターン: stdin からJSON受信 → 判定 → block or pass

  const AREAS = [
    {
      name: 'plans',
      pathPattern: /[/\\]docs[/\\]ops[/\\]plans[/\\]/,
      validate: () => null,
    },
    {
      name: 'research-bank',
      pathPattern: /[/\\]docs[/\\]research-bank[/\\]/,
      validate: (toolName, input) => {
        const filePath = (input.file_path || '').replace(/\\/g, '/');
        // index.html の更新は許可（昇格時に総司令が更新する）
        if (filePath.endsWith('/index.html')) return null;
        // .gitkeep は無視
        if (filePath.endsWith('.gitkeep')) return null;
        // /deep-research スキル経由の書込は通す（スキル本体で品質担保）
        // 手動書込は禁止
        return 'research-bank への手動書込は禁止です。\n\n正しいフロー:\n  1. `/deep-research` スキルを起動\n  2. STEP 1-3 で調査・レポート生成\n
  3. STEP 4-A でスキルが research-bank に直行保存\n\n詳細: docs/ops/research-bank-sop.md';
      },
    },
  ];

  // --- メイン処理 ---
  let data = '';
  process.stdin.on('data', chunk => (data += chunk));
  process.stdin.on('end', () => {
    try {
      const input = JSON.parse(data);
      const toolName = input.tool_name || '';
      const toolInput = input.tool_input || {};
      const filePath = (toolInput.file_path || '').replace(/\\/g, '/');

      if (!filePath) {
        process.exit(0);
      }

      for (const area of AREAS) {
        if (area.pathPattern.test(filePath)) {
          const error = area.validate(toolName, toolInput);
          if (error) {
            console.log(JSON.stringify({
              decision: 'block',
              reason: `⛔ [${area.name}-gate] ${error}`,
            }));
          }
          process.exit(0);
        }
      }

      // どのエリアにも該当しない → docs/ops/{subdir}/ パターンなら未登録エリアとしてブロック
      const opsMatch = filePath.match(/\/docs\/ops\/([^/]+)\//);
      if (opsMatch) {
        const subdir = opsMatch[1];
        // .gitkeep は通す
        if (filePath.endsWith('.gitkeep')) {
          process.exit(0);
        }
        console.log(JSON.stringify({
          decision: 'block',
          reason: `⛔ [未登録エリア] docs/ops/${subdir}/ はarea-gate.mjsに未登録です。\n\n手順書を先に読め:
  docs/standards/checklists/area-setup-checklist.md\n\nこのエリアを使うには、vest1チェックリストの4項目（SOP / Rules / Hook /
  動線マップ）を先に完了してください。自己流で作るな。`,
        }));
        process.exit(0);
      }

      // 上記以外 → 通過
      process.exit(0);
    } catch (e) {
      // JSON解析失敗 → 安全側に倒して通過
      process.exit(0);
    }
  });