"""
ABC分析 xlsx VEST テンプレート生成スクリプト

目的:
- docs/standards/templates/abc-analysis-template.xlsx を生成
- 5シート構成（1_input / 2_analysis / 3_a_stats / 4_scatter / 5_meta）
- 数式で計算（マスター手動更新可）
- 初回インスタンス abc-cat230-2026-04-14.xlsx も同時生成

使い方:
    python scripts/abc-analysis/build_template.py

依存: openpyxl
"""
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.chart import ScatterChart, Reference, Series
from openpyxl.chart.trendline import Trendline
from openpyxl.utils import get_column_letter
from pathlib import Path
import json
import sys


REPO_ROOT = Path(__file__).resolve().parent.parent.parent
TEMPLATE_PATH = REPO_ROOT / "docs" / "standards" / "templates" / "abc-analysis-template.xlsx"
INSTANCE_PATH = REPO_ROOT / "journal" / "monetization" / "drafts" / "abc-cat230-2026-04-14.xlsx"
CAT230_DATA = REPO_ROOT / "tmp" / "abc-analysis-data.json"


# ---------- スタイル定義 ----------
HDR_FILL = PatternFill(start_color="F4F4F4", end_color="F4F4F4", fill_type="solid")
HDR_FONT = Font(bold=True, size=11, color="555555")
TITLE_FONT = Font(bold=True, size=14, color="2a5d84")
NOTE_FONT = Font(italic=True, size=10, color="777777")

A_FILL = PatternFill(start_color="ECFDF5", end_color="ECFDF5", fill_type="solid")
B_FILL = PatternFill(start_color="FFFBEB", end_color="FFFBEB", fill_type="solid")
C_FILL = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")

BORDER_THIN = Border(
    left=Side(style='thin', color='DDDDDD'),
    right=Side(style='thin', color='DDDDDD'),
    top=Side(style='thin', color='DDDDDD'),
    bottom=Side(style='thin', color='DDDDDD'),
)


def style_header_row(ws, row, col_start, col_end):
    for col in range(col_start, col_end + 1):
        cell = ws.cell(row=row, column=col)
        cell.fill = HDR_FILL
        cell.font = HDR_FONT
        cell.border = BORDER_THIN
        cell.alignment = Alignment(horizontal="center", vertical="center")


def auto_width(ws, cols):
    """各列の幅を内容に合わせて広げる（日本語対応で1.8倍）"""
    for col_idx, width in cols.items():
        ws.column_dimensions[get_column_letter(col_idx)].width = width


def build_workbook(data_rows=None, category_info=None):
    """
    data_rows: list of dict with keys: rank, title, seller, price, reviews, note
               None の場合は空テンプレート
    category_info: dict with keys: category_id, category_name, fetched_at, total_samples, excluded
    """
    wb = openpyxl.Workbook()

    # =========================================
    # Sheet 1: 1_input（raw data 入力用）
    # =========================================
    ws1 = wb.active
    ws1.title = "1_input"

    ws1["A1"] = "ABC分析 入力シート（raw data）"
    ws1["A1"].font = TITLE_FONT
    ws1.merge_cells("A1:G1")

    ws1["A2"] = "使い方: 3行目以降に80件のデータを貼り付け。評価数0は自動除外。順位は取得時のランキング順位（元順位）"
    ws1["A2"].font = NOTE_FONT
    ws1.merge_cells("A2:G2")

    # Header
    headers = ["元順位", "タイトル", "出品者", "価格 (円)", "評価数", "星評価", "備考"]
    for i, h in enumerate(headers, 1):
        ws1.cell(row=4, column=i, value=h)
    style_header_row(ws1, 4, 1, 7)

    # Data rows (default template: 100 rows)
    max_data_rows = 100
    if data_rows:
        for idx, row in enumerate(data_rows, 5):
            ws1.cell(row=idx, column=1, value=row.get("rank"))
            ws1.cell(row=idx, column=2, value=row.get("title"))
            ws1.cell(row=idx, column=3, value=row.get("seller"))
            ws1.cell(row=idx, column=4, value=row.get("price"))
            ws1.cell(row=idx, column=5, value=row.get("reviews"))
            ws1.cell(row=idx, column=6, value=row.get("rating"))
            ws1.cell(row=idx, column=7, value=row.get("note", ""))

    auto_width(ws1, {1: 8, 2: 40, 3: 22, 4: 12, 5: 10, 6: 10, 7: 25})

    # =========================================
    # Sheet 2: 2_analysis（降順ソート + 累計% + ABC判定）
    # =========================================
    ws2 = wb.create_sheet("2_analysis")

    ws2["A1"] = "ABC分析 計算シート"
    ws2["A1"].font = TITLE_FONT
    ws2.merge_cells("A1:H1")

    ws2["A2"] = "1_input の有効データ（評価>0）を評価数降順で並べ、累計%を計算し A/B/C分類する"
    ws2["A2"].font = NOTE_FONT
    ws2.merge_cells("A2:H2")

    headers2 = ["#", "元順位", "タイトル", "出品者", "価格", "評価数", "累計%", "分類"]
    for i, h in enumerate(headers2, 1):
        ws2.cell(row=4, column=i, value=h)
    style_header_row(ws2, 4, 1, 8)

    # 計算行はインスタンス作成時に data_rows から直接埋める（数式で自動ソートは困難なので値ベース）
    if data_rows:
        # 有効データ（評価>0）をフィルタ + 降順ソート
        valid = [r for r in data_rows if (r.get("reviews") or 0) > 0]
        valid.sort(key=lambda r: -(r.get("reviews") or 0))
        total = sum(r.get("reviews") or 0 for r in valid)

        cum = 0
        for i, r in enumerate(valid, 1):
            reviews = r.get("reviews") or 0
            cum += reviews
            pct = cum / total * 100 if total else 0
            grp = "A" if pct <= 80.0 else ("B" if pct <= 95.0 else "C")

            row_num = 4 + i
            ws2.cell(row=row_num, column=1, value=i)
            ws2.cell(row=row_num, column=2, value=r.get("rank"))
            ws2.cell(row=row_num, column=3, value=r.get("title"))
            ws2.cell(row=row_num, column=4, value=r.get("seller"))
            ws2.cell(row=row_num, column=5, value=r.get("price"))
            ws2.cell(row=row_num, column=6, value=reviews)
            ws2.cell(row=row_num, column=7, value=round(pct, 1))
            ws2.cell(row=row_num, column=8, value=grp)

            # グループ色
            fill = {"A": A_FILL, "B": B_FILL, "C": C_FILL}[grp]
            for c in range(1, 9):
                ws2.cell(row=row_num, column=c).fill = fill
                ws2.cell(row=row_num, column=c).border = BORDER_THIN

    auto_width(ws2, {1: 6, 2: 8, 3: 40, 4: 22, 5: 12, 6: 10, 7: 10, 8: 8})

    # =========================================
    # Sheet 3: 3_a_stats（A群統計）
    # =========================================
    ws3 = wb.create_sheet("3_a_stats")

    ws3["A1"] = "A群 統計サマリ"
    ws3["A1"].font = TITLE_FONT
    ws3.merge_cells("A1:D1")

    stats_rows = [
        ["項目", "値", "", ""],
        ["A群件数", "", "", ""],
        ["総評価数", "", "", ""],
        ["A群占有率", "", "", ""],
        ["A群 価格 中央値", "", "", ""],
        ["A群 価格 最小", "", "", ""],
        ["A群 価格 最大", "", "", ""],
        ["A群 最頻価格帯（5000円刻）", "", "", ""],
    ]
    for i, row in enumerate(stats_rows, 3):
        for j, val in enumerate(row, 1):
            ws3.cell(row=i, column=j, value=val)
    style_header_row(ws3, 3, 1, 2)

    # 値を計算
    if data_rows:
        valid = [r for r in data_rows if (r.get("reviews") or 0) > 0]
        valid.sort(key=lambda r: -(r.get("reviews") or 0))
        total = sum(r.get("reviews") or 0 for r in valid)

        cum = 0
        a_group = []
        for r in valid:
            reviews = r.get("reviews") or 0
            cum += reviews
            pct = cum / total * 100 if total else 0
            if pct <= 80.0:
                a_group.append(r)

        a_prices = [r.get("price") or 0 for r in a_group]
        a_prices_sorted = sorted(a_prices)
        n = len(a_prices_sorted)
        median = (a_prices_sorted[n//2-1] + a_prices_sorted[n//2]) / 2 if n % 2 == 0 and n > 0 else (a_prices_sorted[n//2] if n > 0 else 0)

        # ビン
        bins = {}
        for p in a_prices:
            bin_key = (p // 5000) * 5000
            bins[bin_key] = bins.get(bin_key, 0) + 1
        top_bin = max(bins.items(), key=lambda x: x[1]) if bins else (0, 0)
        mode_label = f"¥{top_bin[0]:,}〜¥{top_bin[0]+4999:,} ({top_bin[1]}件)"

        a_reviews = sum(r.get("reviews") or 0 for r in a_group)

        ws3.cell(row=4, column=2, value=f"{len(a_group)} 件")
        ws3.cell(row=5, column=2, value=f"{a_reviews:,} ({a_reviews/total*100:.1f}%)")
        ws3.cell(row=6, column=2, value=f"{a_reviews/total*100:.1f}%")
        ws3.cell(row=7, column=2, value=f"¥{median:,.0f}")
        ws3.cell(row=8, column=2, value=f"¥{min(a_prices):,}" if a_prices else "-")
        ws3.cell(row=9, column=2, value=f"¥{max(a_prices):,}" if a_prices else "-")
        ws3.cell(row=10, column=2, value=mode_label)

        # A群の詳細テーブル（別領域）
        ws3.cell(row=12, column=1, value="A群 詳細一覧").font = Font(bold=True, size=12, color="047857")
        a_hdr = ["#", "元順位", "タイトル", "出品者", "価格", "評価数"]
        for i, h in enumerate(a_hdr, 1):
            ws3.cell(row=13, column=i, value=h)
        style_header_row(ws3, 13, 1, 6)

        for idx, r in enumerate(a_group, 1):
            row_num = 13 + idx
            ws3.cell(row=row_num, column=1, value=idx)
            ws3.cell(row=row_num, column=2, value=r.get("rank"))
            ws3.cell(row=row_num, column=3, value=r.get("title"))
            ws3.cell(row=row_num, column=4, value=r.get("seller"))
            ws3.cell(row=row_num, column=5, value=r.get("price"))
            ws3.cell(row=row_num, column=6, value=r.get("reviews"))
            for c in range(1, 7):
                ws3.cell(row=row_num, column=c).fill = A_FILL

    auto_width(ws3, {1: 30, 2: 22, 3: 40, 4: 22, 5: 12, 6: 10})

    # =========================================
    # Sheet 4: 4_scatter（散布図データ + 散布図）
    # =========================================
    ws4 = wb.create_sheet("4_scatter")

    ws4["A1"] = "散布図データ（価格 × 評価数）"
    ws4["A1"].font = TITLE_FONT
    ws4.merge_cells("A1:E1")

    ws4["A3"] = "#"
    ws4["B3"] = "価格"
    ws4["C3"] = "評価数"
    ws4["D3"] = "分類"
    ws4["E3"] = "出品者"
    style_header_row(ws4, 3, 1, 5)

    if data_rows:
        valid = [r for r in data_rows if (r.get("reviews") or 0) > 0]
        valid.sort(key=lambda r: -(r.get("reviews") or 0))
        total = sum(r.get("reviews") or 0 for r in valid)

        cum = 0
        for i, r in enumerate(valid, 1):
            reviews = r.get("reviews") or 0
            cum += reviews
            pct = cum / total * 100 if total else 0
            grp = "A" if pct <= 80.0 else ("B" if pct <= 95.0 else "C")

            row_num = 3 + i
            ws4.cell(row=row_num, column=1, value=i)
            ws4.cell(row=row_num, column=2, value=r.get("price"))
            ws4.cell(row=row_num, column=3, value=reviews)
            ws4.cell(row=row_num, column=4, value=grp)
            ws4.cell(row=row_num, column=5, value=r.get("seller"))

            fill = {"A": A_FILL, "B": B_FILL, "C": C_FILL}[grp]
            for c in range(1, 6):
                ws4.cell(row=row_num, column=c).fill = fill

        # 散布図を追加（簡易版、グループ色分けは ScatterChart で難しいので単一系列）
        chart = ScatterChart()
        chart.title = "価格 × 評価数"
        chart.x_axis.title = "価格 (円)"
        chart.y_axis.title = "評価数"
        chart.legend = None
        chart.height = 10
        chart.width = 18

        last_row = 3 + len(valid)
        xvalues = Reference(ws4, min_col=2, min_row=4, max_row=last_row)
        yvalues = Reference(ws4, min_col=3, min_row=4, max_row=last_row)
        series = Series(yvalues, xvalues, title_from_data=False)
        chart.series.append(series)
        ws4.add_chart(chart, "G3")

    auto_width(ws4, {1: 6, 2: 12, 3: 10, 4: 8, 5: 22})

    # =========================================
    # Sheet 5: 5_meta（調査メタデータ）
    # =========================================
    ws5 = wb.create_sheet("5_meta")

    ws5["A1"] = "調査メタデータ"
    ws5["A1"].font = TITLE_FONT
    ws5.merge_cells("A1:B1")

    meta_rows = [
        ["項目", "値"],
        ["カテゴリID", ""],
        ["カテゴリ名", ""],
        ["取得日", ""],
        ["取得手段", "WebFetch × Nページ"],
        ["ソートキー", "ranking"],
        ["総サンプル件数", ""],
        ["有効件数（評価>0）", ""],
        ["除外件数（評価=0）", ""],
        ["総評価数", ""],
        ["A群件数", ""],
        ["B群件数", ""],
        ["C群件数", ""],
        ["作成者", "vibe-base 司令塔"],
        ["ハンドブック参照", "docs/standards/coconala-listing-handbook.html §1"],
    ]
    for i, row in enumerate(meta_rows, 3):
        ws5.cell(row=i, column=1, value=row[0])
        ws5.cell(row=i, column=2, value=row[1])
    style_header_row(ws5, 3, 1, 2)

    if category_info:
        ws5.cell(row=4, column=2, value=category_info.get("category_id"))
        ws5.cell(row=5, column=2, value=category_info.get("category_name"))
        ws5.cell(row=6, column=2, value=category_info.get("fetched_at"))
        ws5.cell(row=7, column=2, value=category_info.get("fetch_method", "WebFetch × 4 pages"))
        ws5.cell(row=9, column=2, value=category_info.get("total_samples"))
        ws5.cell(row=10, column=2, value=category_info.get("valid_samples"))
        ws5.cell(row=11, column=2, value=category_info.get("excluded"))
        ws5.cell(row=12, column=2, value=category_info.get("total_reviews"))
        ws5.cell(row=13, column=2, value=category_info.get("a_count"))
        ws5.cell(row=14, column=2, value=category_info.get("b_count"))
        ws5.cell(row=15, column=2, value=category_info.get("c_count"))

    auto_width(ws5, {1: 24, 2: 40})

    return wb


def main():
    TEMPLATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    INSTANCE_PATH.parent.mkdir(parents=True, exist_ok=True)

    # 1. 空テンプレート作成
    wb_template = build_workbook(data_rows=None, category_info=None)
    wb_template.save(TEMPLATE_PATH)
    sys.stdout.buffer.write(f"[OK] Template: {TEMPLATE_PATH}\n".encode('utf-8'))

    # 2. cat230 初回インスタンス作成
    # カテゴリ230 の80件データを手動で定義（さっき ABC分析した元データ）
    cat230_data = [
        (1, "自動化・自動購入ツールを開発します", "tanaka_s_001", 45000, 651),
        (2, "Excel VBAによる自動化。なんでも承ります", "いき育児中", 29000, 439),
        (3, "GAS|スプレッドシート自動化・効率化を支援します", "いき育児中", 25000, 9),
        (4, "GASによる業務自動化システム作成します", "エイトさん", 5000, 65),
        (5, "ブラウザ操作・API連携自動化ツールを開発します", "エイトさん", 25000, 19),
        (6, "エクセルの占いツールをカスタマイズして提供します", "占いプログラマDeguchi", 3000, 350),
        (7, "PythonでWebスクレイピングツール作成します", "エイトさん", 10000, 585),
        (8, "業務改善＆アクセスアップします", "AlbaniaWork", 5000, 17),
        (9, "エクセル、スプレッドシート、各種効率化を請負ます", "室内森林浴届け隊", 3000, 412),
        (10, "無茶ぶり上等！ハイエンドExcelツール開発します", "いき育児中", 100000, 97),
        (11, "繰り返す面倒なExcel作業自動化！効率化します", "カスミExcel VBA講師", 3000, 314),
        (12, "面倒なPC作業の自動化・RPAのご相談に乗ります", "yousystem", 75000, 99),
        (13, "自動化・自動予約ツールを開発します", "tanaka_s_001", 45000, 78),
        (14, "Pythonを使ってスクレイピングします", "いとシステムズ", 6000, 2),
        (15, "Google Apps Scriptで自動化します", "n00518", 3000, 892),
        (16, "ネットショップ運営全般の面倒な作業自動化します", "ECエンジニアneger", 50000, 148),
        (17, "Python 画像処理 自動化ツール作成します", "gえふ", 18000, 10),
        (18, "コード開示！Excel VBA・マクロ開発承ります", "キタノネコセンセイ", 15000, 225),
        (19, "Google AppSheetアプリ作成します", "blue202501", 6000, 6),
        (20, "X(Twitter)自動投稿│API代0でできます", "夕凪", 5000, 17),
        (21, "フリマ-コピー出品ツールで複数サイト一括展開します", "ゆうなぎ", 30000, 54),
        (22, "LINE予約システム（月額制）提供します", "ayan LINE Bot屋", 3000, 202),
        (23, "GASツール作成します", "ひろあき", 5000, 8),
        (24, "API連携でデータ取得・投稿・通知を自動化します", "エイトさん", 15000, 86),
        (25, "あなた専用の業務効率化ツールをなんでも開発します", "伊那葉", 10000, 1),
        (26, "webアプリで業務の仕組み化をお手伝いします", "reinforce", 50000, 0),
        (27, "Octoparse（オクトパス）設定を代行します", "ココ生活", 3000, 169),
        (28, "エクセルから簡単移行！ラクな業務システム開発します", "ネットショップエンジニア", 25000, 3),
        (29, "PythonやGASで自動化ツールを開発します", "Tsubasa107", 3000, 3),
        (30, "PowerPlatform支援します", "PowerDX", 3000, 24),
        (31, "WEBスクレイピング出来ます", "RPA_miyazaki", 28000, 41),
        (32, "高品質|高耐久なデータ収集ツールを開発します", "CHAPPY_Engineer", 8000, 153),
        (33, "保育園・介護施設等 複雑なシフト管理を支援します", "Clearf Studio", 5000, 6),
        (34, "チケット購入、予約のbot作成します", "SOTIA若林", 35000, 3),
        (35, "Excelツール作成させていただきます", "鶴屋一樹", 9000, 226),
        (36, "現役エンジニアがPythonでツールを作成します", "きたえぞ", 3000, 1),
        (37, "フリマ新着監視ツール高速監視くん販売します", "フージー", 7000, 20),
        (38, "シフト自動作成ツールを提供致します", "とにとにさん", 5000, 17),
        (39, "面倒な手作業を自動化！n8nで業務効率UPします", "かずさん", 10000, 3),
        (40, "GAS・スプレッドシートなんでも対応します", "キタノネコセンセイ", 15000, 1),
        (41, "エクセル、マクロ、VBAなど自動化ツールを作ります", "海野ひろし", 10000, 6),
        (42, "楽天ROOM自動投稿ツールを提供いたします", "owasoft", 7000, 4),
        (43, "Power Platformのお悩みを解決します", "mikihisa", 10000, 46),
        (44, "Twitter自動投稿ツールを開発・提供いたします", "monika", 10000, 6),
        (45, "あなたのAccess課題をサポートします", "kamedassou", 9000, 5),
        (46, "EXCEL/GAS業務効率化ご相談お受けいたします", "フィリアちゃんねる", 3000, 16),
        (47, "SNS-定期投稿ツールで投稿作業をゼロにします", "ゆうなぎ", 15000, 16),
        (48, "Shopee出品準備を自動化するツール提供します", "TommyDev", 30000, 1),
        (49, "OutlookVBAでメール業務を自動化します", "らくはた", 3000, 1),
        (50, "LINE WORKS通知システムの追加改修承ります", "Kimihaya", 15000, 2),
        (51, "ＸとThreads自動投稿でインプと売上伸ばします", "ゆはな", 7000, 5),
        (52, "X運用の定型作業を自動化します", "さなね", 10000, 1),
        (53, "Googleのスプレッドシートなどの作成代行します", "パンダPatagonia", 3000, 32),
        (54, "Pythonでスクレイピングします", "かずさん", 3000, 77),
        (55, "業務改善・自動化・効率化GASツール開発します", "鳥獣戯画_千春堂", 7000, 5),
        (56, "エクセルVBAで作ります・直します", "ochuchun", 4000, 161),
        (57, "PowerPlatformで業務フローを構築します", "issei", 10000, 1),
        (58, "面倒なExcel作業をマクロで自動化します", "永冨寛治", 3000, 3),
        (59, "メルカリ販売履歴を抽出しエクセル・スプシ出力します", "Masaki", 6000, 5),
        (60, "フリマサイトの自動化ツールを販売します", "マクロマン", 5000, 53),
        (61, "Accessでの台帳作成をお手伝いします", "jiseramu", 8000, 18),
        (62, "Excelで業務用フォーマットを作成します", "大手メーカーSCM H", 8000, 1),
        (63, "EXCELマクロでツールお作りします", "Digital工房オノ", 3000, 55),
        (64, "Excel/GAS/Pythonで業務自動化します", "Giftation", 25000, 2),
        (65, "ノーコードであなたの仕事を自動化します", "かずさん", 6000, 4),
        (66, "製造販売用の在庫管理エクセルシートを提供します", "SEタケ", 6000, 5),
        (67, "Power Automateフローを一緒に作ります", "越後龍之介", 5500, 36),
        (68, "不動産業務自動化システムご相談します", "龍光和尚", 300, 1),
        (69, "貴社の業務で自動化できる箇所を一緒に考えます", "ヨハク", 6000, 2),
        (70, "エクセル/Excel作業させていただきます", "crane_design", 3000, 220),
        (71, "EXCELのマクロ作成します", "ohr", 6000, 992),
        (72, "AutoCADなどの設計業務効率化します", "配管設計こう", 5000, 26),
        (73, "ファイル名一括変更フォーマット作ります", "カクシカ", 3000, 1),
        (74, "RPA・自動化ツールを開発します", "SNchan", 5000, 7),
        (75, "業務効率化！AppSheetで簡単アプリ作成します", "fujii0812", 6000, 1),
        (76, "Threads（スレッズ）予約投稿ツール提供します", "Moon_2424", 5000, 16),
        (77, "給与計算を全自動化！Excel作ります", "coco_spade", 5000, 3),
        (78, "HPにAIチャットボットを導入します", "星川システムオフィス", 4000, 2),
        (79, "簡単なVBA・GAS自動化を作成します", "Toma Works", 5000, 1),
        (80, "Google Apps Scriptの作成します", "n_masao", 3000, 142),
    ]

    data_rows = [
        {"rank": r[0], "title": r[1], "seller": r[2], "price": r[3], "reviews": r[4], "rating": None, "note": ""}
        for r in cat230_data
    ]

    # 計算値
    valid = [r for r in data_rows if r["reviews"] > 0]
    valid_sorted = sorted(valid, key=lambda r: -r["reviews"])
    total = sum(r["reviews"] for r in valid_sorted)
    cum = 0
    a_count = b_count = c_count = 0
    for r in valid_sorted:
        cum += r["reviews"]
        pct = cum / total * 100
        if pct <= 80.0:
            a_count += 1
        elif pct <= 95.0:
            b_count += 1
        else:
            c_count += 1

    category_info = {
        "category_id": 230,
        "category_name": "業務自動化・効率化支援",
        "fetched_at": "2026-04-14",
        "fetch_method": "WebFetch × 4 pages (ranking sort)",
        "total_samples": 80,
        "valid_samples": len(valid),
        "excluded": 80 - len(valid),
        "total_reviews": total,
        "a_count": a_count,
        "b_count": b_count,
        "c_count": c_count,
    }

    wb_instance = build_workbook(data_rows=data_rows, category_info=category_info)
    wb_instance.save(INSTANCE_PATH)
    sys.stdout.buffer.write(f"[OK] Instance: {INSTANCE_PATH}\n".encode('utf-8'))
    sys.stdout.buffer.write(f"     A={a_count} B={b_count} C={c_count} total_reviews={total}\n".encode('utf-8'))


if __name__ == "__main__":
    main()
