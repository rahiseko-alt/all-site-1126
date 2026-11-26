/**
 * GA4 横断 KPI レポートスクリプト
 *
 * 全自律プロダクトのKPIを一括取得する。
 * Usage: node scripts/ga4-report.mjs
 *
 * プロパティ追加方法:
 *   PRODUCTS 配列に { propertyId, name, kpi, hostFilter } を追記するだけ。
 *   hostFilter: 複数プロダクトが同一プロパティを共有する場合に hostname で絞り込む。
 *               単一プロパティ専用なら null でよい。
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';

// 実クレデンシャルは repo 外へ移設済（2026-07-10・S-1）。repo 内に実体を置くな。
// 上書きしたい場合は環境変数 GA4_KEY_PATH を使う。
const KEY_PATH =
  process.env.GA4_KEY_PATH ?? 'C:/Users/user/.secrets/vibe-base/ga4-service-account.json';

const client = new BetaAnalyticsDataClient({ keyFilename: KEY_PATH });

// ── プロダクト設定 ────────────────────────────────────────────
const PRODUCTS = [
  {
    propertyId: '527491834',
    name: 'Aiueo LP',
    url: 'https://aiueo.kouheikosehira.com',
    hostFilter: null,
    kpi: { stage1UU: 100, stage2WAU: 30 },
  },
  {
    propertyId: '528114219',
    name: 'クチコミ分析AI LP',
    url: 'https://review.kouheikosehira.com',
    hostFilter: null,
    kpi: { stage1UU: 100, stage2WAU: 30 },
  },
  {
    propertyId: '527745619',  // ← G-3D20LK4PWB のプロパティID（数字のみ）
    name: 'ブログ収益化LP',
    url: 'https://vibe-coding.kouheikosehira.com',
    hostFilter: null,
    kpi: { stage1PV: 500 },
  },
  {
    propertyId: '529306281',
    name: 'omotenashi-trainer',
    url: 'https://omotenashi-trainer.vercel.app',
    hostFilter: null,
    kpi: { stage1UU: 100 },
  },
  {
    propertyId: '530023433',
    name: 'foodee',
    url: 'https://foodee.kouheikosehira.com',
    hostFilter: null,
    kpi: { stage1UU: 100 },
  },
  {
    propertyId: '527918361',
    name: 'Microscope LP',
    url: 'https://microscope-lp.vercel.app',  // 凍結中・独自ドメイン未割当
    hostFilter: null,
    kpi: { stage1UU: 100 },
  },
];

// ─────────────────────────────────────────────────────────────
const PENDING = [];

async function reportProduct(product) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  ${product.name}  (${product.url})`);
  console.log('='.repeat(50));

  const dimensionFilter = product.hostFilter ? {
    filter: {
      fieldName: 'hostName',
      stringFilter: { value: product.hostFilter, matchType: 'EXACT' },
    },
  } : undefined;

  // 基本指標（7日 + 28日）
  const [summary] = await client.runReport({
    property: `properties/${product.propertyId}`,
    dateRanges: [
      { startDate: '7daysAgo', endDate: 'today' },
      { startDate: '28daysAgo', endDate: 'today' },
    ],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
    ],
    ...(dimensionFilter ? { dimensionFilter } : {}),
  });

  const rows = summary.rows || [];
  for (const row of rows) {
    const rangeVal = row.dimensionValues?.[0]?.value || '';
    const [uu, sessions, pv, avgDuration, bounceRate] = row.metricValues.map(m => m.value);
    const label = rangeVal.includes('date_range_0') ? '直近7日' : '直近28日';
    console.log(`[${label}] UU: ${uu} / セッション: ${sessions} / PV: ${pv} / 滞在: ${Math.round(parseFloat(avgDuration))}秒 / 直帰率: ${(parseFloat(bounceRate) * 100).toFixed(1)}%`);
  }

  // KPIステージ判定
  const row28 = rows.find(r => r.dimensionValues?.[0]?.value?.includes('date_range_1'));
  if (row28 && product.kpi.stage1UU) {
    const monthlyUU = parseInt(row28.metricValues[0].value);
    const target = product.kpi.stage1UU;
    const pct = (monthlyUU / target * 100).toFixed(0);
    const judge = monthlyUU >= target ? '✅ 達成' : monthlyUU >= target * 0.5 ? '⚠️  50%達成' : '❌ 未達';
    console.log(`[KPI Stage1] 月間UU ${monthlyUU} / 目標 ${target} (${pct}%) → ${judge}`);
  }
  if (row28 && product.kpi.stage1PV) {
    const monthlyPV = parseInt(row28.metricValues[2].value);
    const target = product.kpi.stage1PV;
    const pct = (monthlyPV / target * 100).toFixed(0);
    const judge = monthlyPV >= target ? '✅ 達成' : '❌ 未達';
    console.log(`[KPI Stage1] 月間PV ${monthlyPV} / 目標 ${target} (${pct}%) → ${judge}`);
  }

  // 流入元 Top5（28日）
  const [sources] = await client.runReport({
    property: `properties/${product.propertyId}`,
    dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'sessionSource' }],
    metrics: [{ name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 5,
    ...(dimensionFilter ? { dimensionFilter } : {}),
  });

  const srcRows = sources.rows || [];
  if (srcRows.length) {
    console.log('[流入元 Top5(28日)]');
    for (const r of srcRows) {
      console.log(`  ${r.dimensionValues[0].value}: ${r.metricValues[0].value} sessions`);
    }
  } else {
    console.log('[流入元] データなし');
  }
}

async function main() {
  console.log('=== GA4 横断 KPI レポート ===');
  console.log(`実行日時: ${new Date().toLocaleString('ja-JP')}\n`);

  for (const product of PRODUCTS) {
    try {
      await reportProduct(product);
    } catch (err) {
      console.error(`  ⚠️ エラー: ${err.message}`);
      if (err.message.includes('permission') || err.message.includes('PERMISSION_DENIED')) {
        console.error('  → サービスアカウントにGA4の閲覧権限が付与されていない可能性があります。');
      }
    }
  }

  if (PENDING.length) {
    console.log(`\n${'='.repeat(50)}`);
    console.log('  未設定プロダクト（要マスター対応）');
    console.log('='.repeat(50));
    for (const p of PENDING) {
      console.log(`⚠️  ${p.name}: ${p.reason}`);
    }
  }

  console.log('\n=== レポート完了 ===');
}

main().catch(err => {
  console.error('GA4 API エラー:', err.message);
  if (err.message.includes('permission')) {
    console.error('→ サービスアカウントにGA4の閲覧権限が付与されていない可能性があります。');
  }
  if (err.message.includes('API has not been used') || err.message.includes('disabled')) {
    console.error('→ GA4 Data API が有効化されていません。');
  }
  process.exit(1);
});
