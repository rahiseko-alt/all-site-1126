"""
monetization.xlsx 初期ビルドスクリプト

⚠️ 初回のみ実行する。既存 monetization.xlsx を上書きするため、
通常運用では scripts/monetization/sync.py を使うこと。
再構築が必要な場合は --force フラグで明示的に実行。

全9シートで1ファイル統合管理:
  1. index          - 目次・バージョン・運用ルール
  2. catalog        - 出品マスタ（現価格・URL・差別化軸）
  3. sales-daily    - 日次売上統計（long format、Session 169 で Deta.xlsx から移行済み）
  4. history        - 価格・改稿履歴
  5. abc-analysis   - カテゴリ別ABC分析サマリ
  6. categories     - 既知カテゴリ一覧
  7. strategy       - ハイブリッド戦略確定事項
  8. pipeline       - 案件パイプライン
  9. notes          - 雑記・決定事項

使い方:
    python scripts/monetization/build.py          # 既存ファイルがあればエラー終了
    python scripts/monetization/build.py --force  # 既存ファイルを上書き再構築

依存: openpyxl
"""
import argparse
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from pathlib import Path
from datetime import datetime, date
import sys

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
OUT_PATH = REPO_ROOT / "monetization.xlsx"
# Deta.xlsx は Session 169 で monetization.xlsx に統合済み、削除済み。
# 再ビルド時は Deta.xlsx があれば sales-daily に取り込むが、無ければスキップ。
DETA_PATH = REPO_ROOT / "Deta.xlsx"


HDR_FILL = PatternFill(start_color="F4F4F4", end_color="F4F4F4", fill_type="solid")
HDR_FONT = Font(bold=True, size=11, color="333333")
TITLE_FONT = Font(bold=True, size=14, color="2a5d84")
NOTE_FONT = Font(italic=True, size=10, color="777777")
BORDER = Border(
    left=Side(style='thin', color='DDDDDD'),
    right=Side(style='thin', color='DDDDDD'),
    top=Side(style='thin', color='DDDDDD'),
    bottom=Side(style='thin', color='DDDDDD'),
)


def style_header(ws, row, col_start, col_end):
    for col in range(col_start, col_end + 1):
        c = ws.cell(row=row, column=col)
        c.fill = HDR_FILL
        c.font = HDR_FONT
        c.border = BORDER
        c.alignment = Alignment(horizontal="center", vertical="center")


def set_widths(ws, widths):
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w


# ==================================================
# 公開中6件の catalog データ（MCP取得済）
# ==================================================
CATALOG_DATA = [
    {
        "id": 4150334,
        "code": "ai-answer-full",
        "legacy_code": "app50",
        "title": "管理画面付LINE AIボットを開発・設置します",
        "catch": "面倒な返信を24時間AIに丸投げ。管理画面で会話も把握",
        "category_id": 772,
        "category_name": "AIチャットボット制作",
        "current_price": 50000,
        "prev_price": 50000,
        "price_changed": "",
        "listed_date": "2026-04-05",  # Session 122
        "url": "https://coconala.com/services/4150334",
        "status": "公開中",
        "phase": "Phase 1",
        "差別化軸": "管理画面付き + LINE連携 + 半自動オンボーディング（既存AI Answer全機能流用）",
        "note": "AI Answer 汎用版（Route 1 同価格で機能上）",
    },
    {
        "id": 4156668,
        "code": "dify-build",
        "legacy_code": "dify25",
        "title": "DifyでLINE連携AIボットを構築します",
        "catch": "DifyでLINE問合せ対応を自動化。月額費用ゼロで運用",
        "category_id": 772,
        "category_name": "AIチャットボット制作",
        "current_price": 10000,
        "prev_price": 25000,
        "price_changed": "2026-xx",
        "listed_date": "2026-04-06",  # 推定
        "url": "https://coconala.com/services/4156668",
        "status": "公開中",
        "phase": "Phase 1",
        "差別化軸": "3コース選択制（月額費用ゼロ運用）",
        "note": "Dify構築コース。¥25k→¥10k値下げ済。A群中央値帯",
    },
    {
        "id": 4155893,
        "code": "dify-dsl",
        "legacy_code": "dsl5",
        "title": "LINE対応Dify DSLボットを納品します",
        "catch": "Dify設計図を4千円で納品。LINE対応手順書付きで即稼働",
        "category_id": 772,
        "category_name": "AIチャットボット制作",
        "current_price": 4000,
        "prev_price": 5000,
        "price_changed": "2026-xx",
        "listed_date": "2026-04-06",  # 推定
        "url": "https://coconala.com/services/4155893",
        "status": "公開中",
        "phase": "Phase 1",
        "差別化軸": "DSL単体納品、手順書付き即稼働",
        "note": "¥5k→¥4k値下げ済。cat772 A群最低帯に位置",
    },
    {
        "id": 4159766,
        "code": "ai-answer-hotel",
        "legacy_code": "宿泊app50",
        "title": "宿泊業の予約率と運営効率をAIが改善します",
        "catch": "24時間AI対応で離脱を防ぎ、スタッフの工数も削減",
        "category_id": 772,
        "category_name": "AIチャットボット制作",
        "current_price": 50000,
        "prev_price": 50000,
        "price_changed": "",
        "listed_date": "2026-04-06",  # Session 127
        "url": "https://coconala.com/services/4159766",
        "status": "公開中",
        "phase": "Phase 1",
        "差別化軸": "宿泊業特化（予約率・運営効率）",
        "note": "AI Answer 宿泊業特化版",
    },
    {
        "id": 4159775,
        "code": "ai-answer-realestate",
        "legacy_code": "不動産app50",
        "title": "不動産の反響速度とリードの質をAIで改善します",
        "catch": "深夜でも即時対応、条件整理済みの反響を届けます",
        "category_id": 772,
        "category_name": "AIチャットボット制作",
        "current_price": 50000,
        "prev_price": 50000,
        "price_changed": "",
        "listed_date": "2026-04-06",
        "url": "https://coconala.com/services/4159775",
        "status": "公開中",
        "phase": "Phase 1",
        "差別化軸": "不動産業特化（反響速度・リードの質）",
        "note": "AI Answer 不動産業特化版",
    },
    {
        "id": 4159789,
        "code": "ai-answer-lawyer",
        "legacy_code": "士業app50",
        "title": "士業の集客コストを下げ実働率を上げます",
        "catch": "AIが初期相談をスクリーニング、専門家は実務に集中",
        "category_id": 772,
        "category_name": "AIチャットボット制作",
        "current_price": 50000,
        "prev_price": 50000,
        "price_changed": "",
        "listed_date": "2026-04-06",
        "url": "https://coconala.com/services/4159789",
        "status": "公開中",
        "phase": "Phase 1",
        "差別化軸": "士業特化（集客コスト削減・実働率向上）",
        "note": "AI Answer 士業特化版",
    },
]

# 旧シート名 → 新コードネームマップ（sales-daily 移行用）
LEGACY_TO_CODE = {
    "0": "total",
    "app50": "ai-answer-full",
    "dify25": "dify-build",
    "dsl5": "dify-dsl",
    "宿泊app50": "ai-answer-hotel",
    "不動産app50": "ai-answer-realestate",
    "士業app50": "ai-answer-lawyer",
}


def build():
    wb = openpyxl.Workbook()

    # ============================================
    # 1. index
    # ============================================
    ws = wb.active
    ws.title = "index"

    ws["A1"] = "monetization.xlsx — マネタイズ作戦 統合管理ファイル"
    ws["A1"].font = TITLE_FONT
    ws.merge_cells("A1:C1")

    ws["A2"] = f"作成日: {date.today()} / バージョン: v1.0 / Session 169 新設"
    ws["A2"].font = NOTE_FONT
    ws.merge_cells("A2:C2")

    ws["A4"] = "【このファイルは何か】"
    ws["A4"].font = Font(bold=True, size=12)
    ws["A5"] = "マネタイズ作戦（ココナラ出品）の全情報を統合管理する SSoT（Single Source of Truth）。"
    ws["A6"] = "価格・売上・戦略・調査・案件パイプラインの正本。memory/text.md/memory.md の記述と矛盾したらこのファイルが優先。"
    ws.merge_cells("A5:C5")
    ws.merge_cells("A6:C6")

    ws["A8"] = "【シート目次】"
    ws["A8"].font = Font(bold=True, size=12)

    idx_rows = [
        ("シート", "役割", "書き込み頻度"),
        ("1. index", "目次・運用ルール", "低"),
        ("2. catalog", "出品マスタ（現価格・URL・差別化軸）", "中"),
        ("3. sales-daily", "日次売上統計（日付×商品）", "高（毎日）"),
        ("4. history", "価格・改稿履歴", "低"),
        ("5. abc-analysis", "カテゴリ別ABC分析サマリ", "低"),
        ("6. categories", "既知カテゴリ一覧", "低"),
        ("7. strategy", "ハイブリッド戦略確定事項", "超低"),
        ("8. pipeline", "案件パイプライン", "中"),
        ("9. notes", "雑記・決定事項", "中"),
    ]
    for i, row in enumerate(idx_rows, 9):
        for j, val in enumerate(row, 1):
            ws.cell(row=i, column=j, value=val)
    style_header(ws, 9, 1, 3)

    ws["A20"] = "【運用ルール】"
    ws["A20"].font = Font(bold=True, size=12)
    rules = [
        "1. 全エージェントはセッション開始時に catalog シートを必ず読む",
        "2. 価格変更時は即 catalog シート更新（history にも1行追加）",
        "3. memory/text.md/memory.md の価格記載はこのファイルより古い可能性がある。矛盾したら catalog 優先",
        "4. 出品の追加・停止は catalog の状態列で管理",
        "5. 新規コードネームは価格を含めない不変名で命名（例: ai-answer-full、dify-dsl）",
        "6. 読み書きは scripts/monetization/ 配下のスクリプトで行う（手動編集も可）",
    ]
    for i, r in enumerate(rules, 21):
        ws.cell(row=i, column=1, value=r)
        ws.merge_cells(start_row=i, end_row=i, start_column=1, end_column=4)

    set_widths(ws, [25, 40, 15, 10])

    # ============================================
    # 2. catalog
    # ============================================
    ws = wb.create_sheet("catalog")

    ws["A1"] = "出品カタログ（SSoT）"
    ws["A1"].font = TITLE_FONT
    ws.merge_cells("A1:M1")

    catalog_headers = [
        "ID", "コード", "旧コード", "正式タイトル", "キャッチコピー",
        "カテゴリID", "カテゴリ名", "現価格", "前回価格", "価格改定日",
        "出品日", "URL", "状態", "Phase", "差別化軸", "備考"
    ]
    for i, h in enumerate(catalog_headers, 1):
        ws.cell(row=3, column=i, value=h)
    style_header(ws, 3, 1, len(catalog_headers))

    for i, c in enumerate(CATALOG_DATA, 4):
        ws.cell(row=i, column=1, value=c["id"])
        ws.cell(row=i, column=2, value=c["code"])
        ws.cell(row=i, column=3, value=c["legacy_code"])
        ws.cell(row=i, column=4, value=c["title"])
        ws.cell(row=i, column=5, value=c["catch"])
        ws.cell(row=i, column=6, value=c["category_id"])
        ws.cell(row=i, column=7, value=c["category_name"])
        ws.cell(row=i, column=8, value=c["current_price"])
        ws.cell(row=i, column=9, value=c["prev_price"])
        ws.cell(row=i, column=10, value=c["price_changed"])
        ws.cell(row=i, column=11, value=c["listed_date"])
        ws.cell(row=i, column=12, value=c["url"])
        ws.cell(row=i, column=13, value=c["status"])
        ws.cell(row=i, column=14, value=c["phase"])
        ws.cell(row=i, column=15, value=c["差別化軸"])
        ws.cell(row=i, column=16, value=c["note"])

    set_widths(ws, [10, 22, 15, 42, 45, 10, 20, 10, 10, 12, 12, 45, 10, 10, 40, 40])

    # ============================================
    # 3. sales-daily （Deta.xlsx から移行）
    # ============================================
    ws = wb.create_sheet("sales-daily")

    ws["A1"] = "日次売上統計（long format、Deta.xlsx 吸収版）"
    ws["A1"].font = TITLE_FONT
    ws.merge_cells("A1:G1")

    sd_headers = ["日付", "曜日", "コード", "表示数", "閲覧数", "販売数", "備考"]
    for i, h in enumerate(sd_headers, 1):
        ws.cell(row=3, column=i, value=h)
    style_header(ws, 3, 1, 7)

    # Deta.xlsx から読み込み
    if DETA_PATH.exists():
        wb_deta = openpyxl.load_workbook(DETA_PATH, data_only=True)
        row_idx = 4
        for sheet_name in wb_deta.sheetnames:
            code = LEGACY_TO_CODE.get(sheet_name, sheet_name)
            if code == "total":
                continue  # 全合計シートは別扱い（sales-daily は商品単位）
            ws_deta = wb_deta[sheet_name]
            for r in range(4, ws_deta.max_row + 1):
                dt = ws_deta.cell(row=r, column=1).value
                if not isinstance(dt, (datetime, date)):
                    continue
                dow = ws_deta.cell(row=r, column=2).value
                views = ws_deta.cell(row=r, column=3).value
                browses = ws_deta.cell(row=r, column=4).value
                sales = ws_deta.cell(row=r, column=5).value
                note = ws_deta.cell(row=r, column=7).value or ""
                # 値が全部 None ならスキップ（未記録日）
                if views in (None, 0) and browses in (None, 0) and sales in (None, 0):
                    continue
                ws.cell(row=row_idx, column=1, value=dt)
                ws.cell(row=row_idx, column=2, value=dow)
                ws.cell(row=row_idx, column=3, value=code)
                ws.cell(row=row_idx, column=4, value=views)
                ws.cell(row=row_idx, column=5, value=browses)
                ws.cell(row=row_idx, column=6, value=sales)
                ws.cell(row=row_idx, column=7, value=note)
                row_idx += 1
    else:
        sys.stdout.buffer.write(b"[WARN] Deta.xlsx not found, sales-daily will be empty\n")

    set_widths(ws, [12, 6, 22, 10, 10, 10, 30])

    # ============================================
    # 4. history
    # ============================================
    ws = wb.create_sheet("history")

    ws["A1"] = "価格・改稿履歴"
    ws["A1"].font = TITLE_FONT
    ws.merge_cells("A1:F1")

    h_headers = ["日付", "ID", "コード", "項目", "旧値", "新値", "理由"]
    for i, h in enumerate(h_headers, 1):
        ws.cell(row=3, column=i, value=h)
    style_header(ws, 3, 1, 7)

    history_rows = [
        ("2026-04-06", 4156668, "dify-build", "価格", "¥25,000", "¥10,000", "Session 167 Plan C リライト + 価格改定"),
        ("2026-04-06", 4155893, "dify-dsl", "価格", "¥5,000", "¥4,000", "Session 167 Plan C リライト + 価格改定"),
        ("2026-04-14", None, None, "SSoT新設", "散在", "monetization.xlsx 統合管理", "Session 169: Deta.xlsx吸収 + catalog SSoT化"),
    ]
    for i, r in enumerate(history_rows, 4):
        for j, val in enumerate(r, 1):
            ws.cell(row=i, column=j, value=val)

    set_widths(ws, [12, 10, 22, 15, 15, 15, 50])

    # ============================================
    # 5. abc-analysis
    # ============================================
    ws = wb.create_sheet("abc-analysis")

    ws["A1"] = "カテゴリ別 ABC分析サマリ"
    ws["A1"].font = TITLE_FONT
    ws.merge_cells("A1:J1")

    ws["A2"] = "詳細 raw data は abc-cat{ID}-YYYY-MM-DD.xlsx の初回インスタンス参照（journal/monetization/drafts/）"
    ws["A2"].font = NOTE_FONT
    ws.merge_cells("A2:J2")

    abc_headers = [
        "分析日", "カテゴリID", "カテゴリ名", "総サンプル", "有効", "総評価数",
        "A群件数", "A群占有率", "A群中央値", "A群最頻帯", "空白地帯", "備考"
    ]
    for i, h in enumerate(abc_headers, 1):
        ws.cell(row=4, column=i, value=h)
    style_header(ws, 4, 1, len(abc_headers))

    abc_data = [
        ("2026-04-14", 230, "業務自動化・効率化支援", 80, 72, 5838, 14, "78.5%", 3500, "¥3,000-4,999 (8件)", "¥4,000-9,000 (3件のみ)", "cat230: 独占者あり、激戦"),
        ("2026-04-14", 772, "AIチャットボット制作", 80, 24, 283, 7, "77.7%", 10000, "¥5,000-9,999 (2件)", "¥25k帯（dify25既に独占）/ ¥40k-49k / ¥60k-69k", "cat772: 若い高単価市場、独占者不在"),
    ]
    for i, r in enumerate(abc_data, 5):
        for j, val in enumerate(r, 1):
            ws.cell(row=i, column=j, value=val)

    set_widths(ws, [12, 10, 24, 10, 8, 10, 10, 10, 12, 24, 30, 40])

    # ============================================
    # 6. categories
    # ============================================
    ws = wb.create_sheet("categories")

    ws["A1"] = "既知カテゴリ一覧"
    ws["A1"].font = TITLE_FONT
    ws.merge_cells("A1:F1")

    cat_headers = ["ID", "カテゴリ名", "親カテゴリ", "ABC分析状況", "分析日", "備考"]
    for i, h in enumerate(cat_headers, 1):
        ws.cell(row=3, column=i, value=h)
    style_header(ws, 3, 1, len(cat_headers))

    cat_data = [
        (230, "業務自動化・効率化支援", "IT相談・システム開発", "✅ 済", "2026-04-14", "Session 168+169 で分析。A群激戦"),
        (772, "AIチャットボット制作", "AI導入・生成AI活用相談", "✅ 済", "2026-04-14", "Session 169 で分析。若い高単価"),
        (10, "動画編集・映像制作", "—", "未", "", "rest-video-pack 着手前に必須"),
        (11, "IT相談・システム開発", "—", "未", "", "cat230 の親。未分析"),
        (16, "集客・マーケティング相談", "—", "未", "", "rest-reviewai-pro 候補"),
        (22, "Web制作・HP作成・EC構築", "—", "未", "", "Session 169 で上位20件参照のみ"),
        (28, "AI導入・生成AI活用相談", "—", "未", "", "cat772 の親"),
        (231, "プログラミング・ソフト開発", "IT相談・システム開発", "未", "", "cat230 の隣接カテゴリ"),
    ]
    for i, r in enumerate(cat_data, 4):
        for j, val in enumerate(r, 1):
            ws.cell(row=i, column=j, value=val)

    set_widths(ws, [8, 24, 24, 14, 12, 35])

    # ============================================
    # 7. strategy
    # ============================================
    ws = wb.create_sheet("strategy")

    ws["A1"] = "ハイブリッド参入戦略（Session 169 確定）"
    ws["A1"].font = TITLE_FONT
    ws.merge_cells("A1:D1")

    ws["A3"] = "【原則】新規参入は以下2択のみ（空白地帯高単価は成長後戦略）"
    ws["A3"].font = Font(bold=True, size=11, color="b91c1c")

    rows = [
        ["", "", "", ""],
        ["Route", "内容", "例", "注意"],
        ["Route 1", "同価格で圧倒的に機能が上", "A群中央値 ¥10,000 で多言語+管理画面+半自動オンボで勝負", "差別化軸必須（業種特化/納期保証/画面共有/返金保証/ヒアリング型）"],
        ["Route 2", "同機能で圧倒的に安い", "A群 ¥10,000 勢と同等を ¥5,000 で提供", "品質/サポートが A群同等以上であることの証明必須"],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
    ]
    for i, r in enumerate(rows, 4):
        for j, val in enumerate(r, 1):
            ws.cell(row=i, column=j, value=val)
    style_header(ws, 5, 1, 4)

    ws["A15"] = "【3フェーズ構造】"
    ws["A15"].font = Font(bold=True, size=11)

    phase_headers = ["Phase", "期間", "目標", "戦術"]
    for i, h in enumerate(phase_headers, 1):
        ws.cell(row=16, column=i, value=h)
    style_header(ws, 16, 1, 4)

    phase_rows = [
        ("Phase 1", "0-3ヶ月", "レビュー20件以上", "Route 1 or Route 2 でA群同価格帯に直接参入。業種特化/納期保証等の差別化軸必須"),
        ("Phase 2", "3-6ヶ月", "A群入り", "Phase 1 実績を武器に A群価格帯で存在感確立"),
        ("Phase 3", "6ヶ月+", "特殊ポジション獲得", "ブランド化・業種特化深化・技術特化深化・空白地帯高単価も検討可"),
    ]
    for i, r in enumerate(phase_rows, 17):
        for j, val in enumerate(r, 1):
            ws.cell(row=i, column=j, value=val)

    ws["A22"] = "【NG 戦略】"
    ws["A22"].font = Font(bold=True, size=11, color="b91c1c")
    ws["A23"] = "❌ 空白地帯で高単価独占 → これは Phase 3 以降の成長後戦略。Phase 1 では採用しない"
    ws["A24"] = "❌ A群完全真似・価格も同じ → 差別化軸なしではレビュー複利の壁を超えられない"
    ws.merge_cells("A23:D23")
    ws.merge_cells("A24:D24")

    ws["A26"] = "【差別化軸 候補】"
    ws["A26"].font = Font(bold=True, size=11)
    diff_axes = [
        "業種特化（医療事務/美容室/保育園/建設業/士業/不動産/宿泊業 等）",
        "納期保証（48時間納品 / 24時間以内返信）",
        "画面共有サポート（Zoom 等で一緒にセットアップ、有料オプション）",
        "返金保証（動作不良時の条件付き返金）",
        "ヒアリング型カスタム開発（購入後に業務をヒアリングしてからカスタマイズ）",
        "「ます抜き」キャッチの差別化（タイトル語感・ココナラ自動ます付与回避）",
    ]
    for i, axis in enumerate(diff_axes, 27):
        ws.cell(row=i, column=1, value=f"・{axis}")
        ws.merge_cells(start_row=i, end_row=i, start_column=1, end_column=4)

    set_widths(ws, [12, 15, 30, 60])

    # ============================================
    # 8. pipeline
    # ============================================
    ws = wb.create_sheet("pipeline")

    ws["A1"] = "案件パイプライン"
    ws["A1"].font = TITLE_FONT
    ws.merge_cells("A1:G1")

    p_headers = ["コードネーム", "案概要", "対象カテゴリ", "想定価格", "状態", "優先度", "備考"]
    for i, h in enumerate(p_headers, 1):
        ws.cell(row=3, column=i, value=h)
    style_header(ws, 3, 1, len(p_headers))

    p_data = [
        ("rest-vba-pack", "飲食店Excelマクロ5点セット", 230, 3000, "着手待ち", "高", "Phase 1 理想。cat230 A群中央値¥3500 帯で機能上"),
        ("rest-dify-dsl-pack", "飲食店Dify DSLテンプレ集", 772, 4000, "着手待ち", "高", "dify-dsl と同価格帯で飲食特化"),
        ("rest-concierge-suite", "飲食特化 AI Answer", 772, 10000, "着手待ち", "高", "cat772 A群中央値¥10k帯、既存AI Answer流用"),
        ("rest-video-pack", "飲食店SNS広告動画量産", 10, None, "保留", "中", "cat10 ABC分析未実施"),
        ("rest-reviewai-pro", "飲食店クチコミAI月額SaaS", 16, None, "保留", "低", "GBP API問題未解決 + cat16 ABC分析未実施"),
    ]
    for i, r in enumerate(p_data, 4):
        for j, val in enumerate(r, 1):
            ws.cell(row=i, column=j, value=val)

    set_widths(ws, [24, 36, 12, 12, 12, 8, 45])

    # ============================================
    # 9. notes
    # ============================================
    ws = wb.create_sheet("notes")

    ws["A1"] = "雑記・決定事項"
    ws["A1"].font = TITLE_FONT
    ws.merge_cells("A1:C1")

    n_headers = ["日付", "項目", "内容"]
    for i, h in enumerate(n_headers, 1):
        ws.cell(row=3, column=i, value=h)
    style_header(ws, 3, 1, 3)

    notes_rows = [
        ("2026-04-14", "マネタイズ情報SSoT新設", "monetization.xlsx に全情報統合。Deta.xlsx 吸収、catalog SSoT化。情報散在問題の根本対策"),
        ("2026-04-14", "コードネームリネーム", "app50→ai-answer-full / dify25→dify-build / dsl5→dify-dsl / 業種特化3件は ai-answer-{hotel/realestate/lawyer}"),
        ("2026-04-14", "業種特化3件価格訂正", "text.md の ¥5,000 は古い情報。実際は ¥50,000（MCP直接確認済）"),
        ("2026-04-14", "ハイブリッド戦略の誤解訂正", "Phase 1 = 空白地帯高単価 は誤り。正しくは Route1/Route2 のいずれか（同価格機能上 or 同機能で安く）"),
        ("2026-04-14", "情報共有仕組み改革", "MEMORY.md 索引から価格記載全削除→catalog 参照へ。毎回マスターが訂正する状況を解消"),
    ]
    for i, r in enumerate(notes_rows, 4):
        for j, val in enumerate(r, 1):
            ws.cell(row=i, column=j, value=val)

    set_widths(ws, [12, 30, 80])

    # ============================================
    # 保存
    # ============================================
    wb.save(OUT_PATH)
    sys.stdout.buffer.write(f"[OK] Saved: {OUT_PATH}\n".encode('utf-8'))

    # 確認ログ
    wb_check = openpyxl.load_workbook(OUT_PATH, data_only=False)
    sys.stdout.buffer.write(f"[OK] Sheets: {wb_check.sheetnames}\n".encode('utf-8'))
    for sheet_name in wb_check.sheetnames:
        ws_check = wb_check[sheet_name]
        sys.stdout.buffer.write(f"     {sheet_name}: {ws_check.max_row} rows × {ws_check.max_column} cols\n".encode('utf-8'))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true",
                    help="既存 monetization.xlsx を上書き再構築する")
    args = ap.parse_args()

    if OUT_PATH.exists() and not args.force:
        sys.stderr.write(
            f"[ERROR] {OUT_PATH} は既に存在します。\n"
            f"通常運用では sync.py を使ってください。\n"
            f"再構築が必要な場合は --force フラグを付けてください。\n"
        )
        sys.exit(2)

    build()


if __name__ == "__main__":
    main()
