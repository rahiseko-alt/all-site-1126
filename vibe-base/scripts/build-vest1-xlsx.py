"""Build vest1 xlsx templates from Markdown sources.

Generates:
  - docs/standards/templates/marketing-tracker.xlsx
  - docs/standards/templates/p4-measurement.xlsx

All cells retain {{placeholder}} text as-is for template use.
"""

from __future__ import annotations

from pathlib import Path

from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.worksheet import Worksheet

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "standards" / "templates"

HEADER_FILL = PatternFill(start_color="FFE5E5E5", end_color="FFE5E5E5", fill_type="solid")
HEADER_FONT = Font(bold=True)
WRAP = Alignment(wrap_text=True, vertical="top")
RIGHT = Alignment(horizontal="right", vertical="top", wrap_text=True)


def style_header_row(ws: Worksheet, row: int, n_cols: int) -> None:
    for c in range(1, n_cols + 1):
        cell = ws.cell(row=row, column=c)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = WRAP


def autosize(ws: Worksheet, min_w: int = 10, max_w: int = 60) -> None:
    for col in ws.columns:
        letter = get_column_letter(col[0].column)
        longest = 0
        for cell in col:
            if cell.value is None:
                continue
            for line in str(cell.value).splitlines():
                # CJK chars count as ~2 wide
                width = sum(2 if ord(ch) > 127 else 1 for ch in line)
                if width > longest:
                    longest = width
        ws.column_dimensions[letter].width = max(min_w, min(max_w, longest + 2))


def write_table(
    ws: Worksheet,
    start_row: int,
    headers: list[str],
    rows: list[list[str]],
    right_align_cols: set[int] | None = None,
) -> int:
    right_align_cols = right_align_cols or set()
    for i, h in enumerate(headers, start=1):
        ws.cell(row=start_row, column=i, value=h)
    style_header_row(ws, start_row, len(headers))
    for r_idx, row in enumerate(rows, start=start_row + 1):
        for c_idx, val in enumerate(row, start=1):
            cell = ws.cell(row=r_idx, column=c_idx, value=val)
            if c_idx in right_align_cols:
                cell.alignment = RIGHT
            else:
                cell.alignment = WRAP
    return start_row + len(rows) + 1  # next free row (with blank gap)


def write_kv_block(ws: Worksheet, start_row: int, title: str, pairs: list[tuple[str, str]]) -> int:
    title_cell = ws.cell(row=start_row, column=1, value=title)
    title_cell.font = Font(bold=True, size=12)
    ws.merge_cells(start_row=start_row, start_column=1, end_row=start_row, end_column=2)
    row = start_row + 1
    # header
    ws.cell(row=row, column=1, value="項目")
    ws.cell(row=row, column=2, value="内容")
    style_header_row(ws, row, 2)
    row += 1
    for k, v in pairs:
        ws.cell(row=row, column=1, value=k).alignment = WRAP
        ws.cell(row=row, column=2, value=v).alignment = WRAP
        row += 1
    return row + 1  # blank gap


# ---------------------------------------------------------------------------
# marketing-tracker.xlsx
# ---------------------------------------------------------------------------


def build_marketing_tracker() -> Path:
    wb = Workbook()

    # Sheet 1: 概要
    ws = wb.active
    ws.title = "概要"

    row = 1
    ws.cell(row=row, column=1, value="集客施策管理表テンプレート").font = Font(bold=True, size=14)
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=2)
    row += 2

    ws.cell(row=row, column=1, value="これは何か").font = Font(bold=True, size=12)
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=2)
    row += 1
    desc = (
        "「どこで集客するか」「何をやったか」「結果はどうだったか」を記録する表。"
        "チャネル選定→施策実行→効果記録までを1ファイルで管理する。やりっぱなし防止。"
    )
    c = ws.cell(row=row, column=1, value=desc)
    c.alignment = WRAP
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=2)
    ws.row_dimensions[row].height = 45
    row += 2

    row = write_kv_block(
        ws,
        row,
        "5W2H",
        [
            ("What", "集客チャネル選定+施策管理+導線設計+KPI目標を記録するテンプレート"),
            (
                "Why",
                "P3で「何をやって何が効いたか」の記録がないと、同じ失敗を繰り返す。次サイクルの判断材料がなくなる",
            ),
            ("Who", "エージェントが設計・記入 → マスターがQAで確認"),
            ("When", "P3#1（チャネル選定）、P3#3-5（施策管理）"),
            (
                "Where",
                "vest1: docs/standards/templates/marketing-tracker.xlsx → 各プロダクトの docs/ にコピー",
            ),
            ("How", "チャネル評価→施策下書き→実行→結果記録→P4で振り返り"),
            ("How much", "チャネル選定30分。施策管理は継続的に記録"),
        ],
    )

    row = write_kv_block(
        ws,
        row,
        "基本情報",
        [
            ("プロダクト名", "{{プロダクト名}}"),
            ("ターゲット", "{{P0#1のターゲット1文定義を転記}}"),
            ("LP URL", "{{https://example.com}}"),
            ("作成日", "{{YYYY-MM-DD}}"),
        ],
    )

    autosize(ws)
    ws.column_dimensions["A"].width = 18
    ws.column_dimensions["B"].width = 70

    # Sheet 2: チャネル選定
    ws2 = wb.create_sheet("チャネル選定")
    ws2.cell(row=1, column=1, value="1. チャネル選定（P3#1）").font = Font(bold=True, size=12)
    ws2.merge_cells(start_row=1, start_column=1, end_row=1, end_column=6)
    headers = ["#", "チャネル", "優先度", "ターゲットとの相性", "コスト", "初期アクション"]
    rows = [
        ["1", "{{チャネル名}}", "{{★★★/★★☆/★☆☆}}", "{{理由}}", "{{無料/¥X}}", "{{具体的な最初の一手}}"],
        ["2", "{{チャネル名}}", "{{★★★/★★☆/★☆☆}}", "{{理由}}", "{{無料/¥X}}", "{{具体的な最初の一手}}"],
        ["3", "{{チャネル名}}", "{{★★★/★★☆/★☆☆}}", "{{理由}}", "{{無料/¥X}}", "{{具体的な最初の一手}}"],
    ]
    write_table(ws2, start_row=3, headers=headers, rows=rows, right_align_cols={1})
    autosize(ws2)

    # Sheet 3: 導線設計
    ws3 = wb.create_sheet("導線設計")
    ws3.cell(row=1, column=1, value="2. 導線設計").font = Font(bold=True, size=12)
    funnel_text = (
        "{{チャネル1}}（{{コンテンツ形式}}）\n"
        "  → {{中継点1}} → {{中継点2}} → LP（UTM: {{utm_campaign値}}）\n"
        "\n"
        "{{チャネル2}}（{{コンテンツ形式}}）\n"
        "  → {{中継点}} → LP（UTM: {{utm_campaign値}}）\n"
        "\n"
        "{{チャネル3}}\n"
        "  → LP直接流入（GA4で{{判定方法}}）"
    )
    cell = ws3.cell(row=3, column=1, value=funnel_text)
    cell.alignment = Alignment(wrap_text=True, vertical="top")
    cell.font = Font(name="Consolas")
    ws3.row_dimensions[3].height = 140
    ws3.column_dimensions["A"].width = 80

    # Sheet 4: 施策管理
    ws4 = wb.create_sheet("施策管理")
    ws4.cell(row=1, column=1, value="3. 施策管理（P3#3-5）").font = Font(bold=True, size=12)
    ws4.merge_cells(start_row=1, start_column=1, end_row=1, end_column=8)
    headers4 = ["#", "施策名", "チャネル", "内容", "URL/UTM", "実行日", "状態", "結果"]
    rows4 = [
        ["A", "{{施策名}}", "{{チャネル}}", "{{内容}}", "{{URL?utm_campaign=xxx}}", "{{MM/DD}}", "{{下書き/公開済/完了}}", "{{クリック数/流入数}}"],
        ["B", "{{施策名}}", "{{チャネル}}", "{{内容}}", "{{URL}}", "{{MM/DD}}", "{{状態}}", "{{結果}}"],
        ["C", "{{施策名}}", "{{チャネル}}", "{{内容}}", "{{URL}}", "{{MM/DD}}", "{{状態}}", "{{結果}}"],
        ["D", "{{施策名}}", "{{チャネル}}", "{{内容}}", "{{URL}}", "{{MM/DD}}", "{{状態}}", "{{結果}}"],
        ["E", "{{施策名}}", "{{チャネル}}", "{{内容}}", "{{URL}}", "{{MM/DD}}", "{{状態}}", "{{結果}}"],
    ]
    write_table(ws4, start_row=3, headers=headers4, rows=rows4, right_align_cols={1})
    autosize(ws4)

    # Sheet 5: KPI
    ws5 = wb.create_sheet("KPI")
    ws5.cell(row=1, column=1, value="4. KPI（P4で計測）").font = Font(bold=True, size=12)
    ws5.merge_cells(start_row=1, start_column=1, end_row=1, end_column=6)
    headers5 = ["指標", "目標（3ヶ月）", "月1実績", "月2実績", "月3実績", "計測方法"]
    rows5 = [
        ["LP流入", "{{X セッション/月}}", "", "", "", "GA4"],
        ["登録/申込数", "{{X人}}", "", "", "", "{{DB/フォーム}}"],
        ["CV率", "{{X%}}", "", "", "", "GA4イベント"],
        ["{{チャネル固有指標}}", "{{目標値}}", "", "", "", "{{計測方法}}"],
    ]
    write_table(ws5, start_row=3, headers=headers5, rows=rows5, right_align_cols={2, 3, 4, 5})
    autosize(ws5)

    # Sheet 6: 追加チャネル
    ws6 = wb.create_sheet("追加チャネル")
    ws6.cell(row=1, column=1, value="5. 追加チャネル検討（P3#6-7）").font = Font(bold=True, size=12)
    ws6.merge_cells(start_row=1, start_column=1, end_row=1, end_column=6)
    headers6 = ["#", "チャネル", "Pros", "Cons", "判断", "理由"]
    rows6 = [
        ["{{4}}", "{{チャネル名}}", "{{利点}}", "{{欠点}}", "{{採用/不採用}}", "{{理由}}"],
        ["{{5}}", "{{チャネル名}}", "{{利点}}", "{{欠点}}", "{{採用/不採用}}", "{{理由}}"],
    ]
    write_table(ws6, start_row=3, headers=headers6, rows=rows6, right_align_cols={1})
    autosize(ws6)

    # Sheet 7: バージョン
    ws7 = wb.create_sheet("バージョン")
    ws7.cell(row=1, column=1, value="バージョン履歴").font = Font(bold=True, size=12)
    write_table(
        ws7,
        start_row=2,
        headers=["Version", "Date", "Note"],
        rows=[
            ["v1.0", "2026-04-02", "旧プロダクト channel-strategy から共有資産化"],
            ["v1.1", "2026-04-14", "Markdown から xlsx へ移行"],
        ],
    )
    autosize(ws7)

    out = OUT_DIR / "marketing-tracker.xlsx"
    wb.save(out)
    return out


# ---------------------------------------------------------------------------
# p4-measurement.xlsx
# ---------------------------------------------------------------------------


def build_p4_measurement() -> Path:
    wb = Workbook()

    # Sheet 1: 概要
    ws = wb.active
    ws.title = "概要"

    row = 1
    ws.cell(row=row, column=1, value="P4計測ダッシュボードテンプレート").font = Font(bold=True, size=14)
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=2)
    row += 2

    ws.cell(row=row, column=1, value="これは何か").font = Font(bold=True, size=12)
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=2)
    row += 1
    desc = (
        "「やったことが効いたかどうか」を数字で確認する表。KPI目標 vs 実績を突き合わせ、"
        "Go/No-Go判定を記録する。P0で立てた仮説が正しかったかの最終検証。感覚ではなく数値で判断する。"
    )
    c = ws.cell(row=row, column=1, value=desc)
    c.alignment = WRAP
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=2)
    ws.row_dimensions[row].height = 60
    row += 2

    row = write_kv_block(
        ws,
        row,
        "5W2H",
        [
            ("What", "KPI目標 vs 実績の突き合わせ+性能劣化検知+Go/No-Go判定を記録するテンプレート"),
            (
                "Why",
                "P0で立てた仮説・数値目標がP4で検証されないと「やった気」で終わる。判定記録がないと撤退/続行の根拠が消える",
            ),
            ("Who", "エージェントが計測・記入 → マスターがGo/No-Go判定"),
            ("When", "P4#1（初回計測）、P4#2（成果確認）、P4#3（改善/リリース検討）"),
            (
                "Where",
                "vest1: docs/standards/templates/p4-measurement.xlsx → 各プロダクトの docs/ にコピー",
            ),
            ("How", "GA4/DB/外部ツールで計測 → 目標と突き合わせ → Go/No-Go判定 → 次アクション決定"),
            ("How much", "計測+記入30分。判定はマスター判断"),
        ],
    )

    row = write_kv_block(
        ws,
        row,
        "基本情報",
        [
            ("プロダクト名", "{{プロダクト名}}"),
            ("計測期間", "{{YYYY-MM-DD}} 〜 {{YYYY-MM-DD}}"),
            ("計測者", "{{エージェント名}}"),
            ("P0で定めたKPI参照先", "{{P0#16のKPI定義場所}}"),
        ],
    )

    ws.column_dimensions["A"].width = 22
    ws.column_dimensions["B"].width = 75

    # Sheet 2: KPIステージ
    ws2 = wb.create_sheet("KPIステージ")
    ws2.cell(row=1, column=1, value="1. KPIステージ別計測（P4#1-2）").font = Font(bold=True, size=12)
    ws2.merge_cells(start_row=1, start_column=1, end_row=1, end_column=6)

    ws2.cell(row=3, column=1, value="ステージ定義（P0から転記）").font = Font(bold=True)
    headers_def = ["Stage", "名称", "KPI指標", "Go基準", "No-Go基準", "計測方法"]
    rows_def = [
        ["{{1}}", "{{需要検証}}", "{{指標名}}", "{{X以上}}", "{{Y未満→アクション}}", "{{GA4/DB/手動}}"],
        ["{{2}}", "{{初期トラクション}}", "{{指標名}}", "{{X以上}}", "{{Y未満→アクション}}", "{{GA4/DB/手動}}"],
        ["{{3}}", "{{収益化}}", "{{指標名}}", "{{¥X以上}}", "{{¥Y未満→アクション}}", "{{Stripe/DB}}"],
    ]
    next_row = write_table(ws2, start_row=4, headers=headers_def, rows=rows_def, right_align_cols={1})

    ws2.cell(row=next_row, column=1, value="実績記録").font = Font(bold=True)
    headers_act = ["Stage", "KPI指標", "目標値", "月1実績", "月2実績", "月3実績", "判定"]
    rows_act = [
        ["{{1}}", "{{指標名}}", "{{目標}}", "{{実績}}", "{{実績}}", "{{実績}}", "{{Go/No-Go/継続}}"],
        ["{{2}}", "{{指標名}}", "{{目標}}", "", "", "", ""],
        ["{{3}}", "{{指標名}}", "{{目標}}", "", "", "", ""],
    ]
    write_table(ws2, start_row=next_row + 1, headers=headers_act, rows=rows_act, right_align_cols={1, 3, 4, 5, 6})
    autosize(ws2)

    # Sheet 3: トラフィック
    ws3 = wb.create_sheet("トラフィック")
    ws3.cell(row=1, column=1, value="2. トラフィック計測（P4#1）").font = Font(bold=True, size=12)
    ws3.merge_cells(start_row=1, start_column=1, end_row=1, end_column=6)
    headers_t = ["指標", "計測方法", "月1", "月2", "月3", "傾向"]
    rows_t = [
        ["PV（全体）", "GA4", "{{X}}", "", "", "{{↑/→/↓}}"],
        ["UU（全体）", "GA4", "{{X}}", "", "", ""],
        ["直帰率", "GA4", "{{X%}}", "", "", ""],
        ["平均セッション時間", "GA4", "{{X分}}", "", "", ""],
        ["LP→登録CV率", "GA4イベント", "{{X%}}", "", "", ""],
    ]
    next_row = write_table(ws3, start_row=3, headers=headers_t, rows=rows_t, right_align_cols={3, 4, 5})

    ws3.cell(row=next_row, column=1, value="流入元内訳").font = Font(bold=True)
    headers_s = ["流入元", "月1", "月2", "月3", "備考"]
    rows_s = [
        ["Organic Search", "{{X}}", "", "", ""],
        ["Direct", "{{X}}", "", "", ""],
        ["Social（{{具体名}}）", "{{X}}", "", "", ""],
        ["Referral（{{具体名}}）", "{{X}}", "", "", ""],
        ["{{UTM: キャンペーン名}}", "{{X}}", "", "", "P3施策との突き合わせ"],
    ]
    next_row = write_table(ws3, start_row=next_row + 1, headers=headers_s, rows=rows_s, right_align_cols={2, 3, 4})

    note = ws3.cell(
        row=next_row,
        column=1,
        value="注: GA4は外部トラフィックのみ集計（direct/localhost/not set/自サイト間遷移は除外）",
    )
    note.font = Font(italic=True)
    ws3.merge_cells(start_row=next_row, start_column=1, end_row=next_row, end_column=5)
    autosize(ws3)

    # Sheet 4: 収益
    ws4 = wb.create_sheet("収益")
    ws4.cell(row=1, column=1, value="3. 収益計測（P4#2）").font = Font(bold=True, size=12)
    ws4.merge_cells(start_row=1, start_column=1, end_row=1, end_column=6)
    headers_r = ["指標", "目標", "月1", "月2", "月3", "累計"]
    rows_r = [
        ["有料ユーザー数", "{{X人}}", "{{X}}", "", "", "{{X}}"],
        ["MRR", "{{¥X}}", "{{¥X}}", "", "", ""],
        ["ARPU", "{{¥X}}", "{{¥X}}", "", "", ""],
        ["チャーン率", "{{X%以下}}", "{{X%}}", "", "", ""],
        ["LTV（推定）", "{{¥X}}", "{{¥X}}", "", "", ""],
        ["コスト（インフラ+API）", "{{¥X/月}}", "{{¥X}}", "", "", ""],
        ["粗利", "{{¥X}}", "{{¥X}}", "", "", ""],
    ]
    write_table(ws4, start_row=3, headers=headers_r, rows=rows_r, right_align_cols={2, 3, 4, 5, 6})
    autosize(ws4)

    # Sheet 5: 性能劣化
    ws5 = wb.create_sheet("性能劣化")
    ws5.cell(row=1, column=1, value="4. 性能劣化検知（P4#3）").font = Font(bold=True, size=12)
    ws5.merge_cells(start_row=1, start_column=1, end_row=1, end_column=5)
    ws5.cell(
        row=2,
        column=1,
        value="P1で計測したベースラインとの比較。基準値は docs/performance-baseline.md から転記",
    ).font = Font(italic=True)
    ws5.merge_cells(start_row=2, start_column=1, end_row=2, end_column=5)

    headers_p = ["指標", "P1基準値", "P4実測値", "変化率", "判定"]
    rows_p = [
        ["{{トップページ LCP}}", "{{X ms}}", "{{X ms}}", "{{X%}}", "{{OK/劣化}}"],
        ["{{主要API 中央値}}", "{{X ms}}", "{{X ms}}", "{{X%}}", "{{OK/劣化}}"],
        ["{{JSバンドルサイズ}}", "{{X KB}}", "{{X KB}}", "{{X%}}", "{{OK/劣化}}"],
        ["{{エラー率}}", "{{X%}}", "{{X%}}", "{{±X%}}", "{{OK/劣化}}"],
    ]
    next_row = write_table(ws5, start_row=4, headers=headers_p, rows=rows_p, right_align_cols={2, 3, 4})

    ws5.cell(
        row=next_row,
        column=1,
        value="劣化判定基準: LCP +20%以上 / API応答 +50%以上 / エラー率 +1%以上 → 要改善",
    ).font = Font(bold=True)
    ws5.merge_cells(start_row=next_row, start_column=1, end_row=next_row, end_column=5)
    autosize(ws5)

    # Sheet 6: Go判定
    ws6 = wb.create_sheet("Go判定")
    ws6.cell(row=1, column=1, value="5. Go/No-Go判定（P4#5）").font = Font(bold=True, size=12)
    ws6.merge_cells(start_row=1, start_column=1, end_row=1, end_column=3)

    headers_g = ["判定項目", "結果", "根拠"]
    rows_g = [
        ["Stage {{X}} KPI達成", "{{Go/No-Go}}", "{{数値根拠}}"],
        ["性能劣化なし", "{{OK/NG}}", "{{劣化箇所と程度}}"],
        ["コスト持続可能性", "{{OK/NG}}", "{{月次コスト vs 収益}}"],
        ["ユーザーフィードバック", "{{正/負/なし}}", "{{件数と要約}}"],
    ]
    next_row = write_table(ws6, start_row=3, headers=headers_g, rows=rows_g)

    ws6.cell(row=next_row, column=1, value="最終判定").font = Font(bold=True)
    final_pairs = [
        ("結論", "{{Go（次Stage移行） / No-Go（改善必要） / 撤退検討}}"),
        ("判定者", "マスター（{{YYYY-MM-DD}}）"),
        ("次アクション", "{{具体的な次の一手}}"),
        ("次回計測予定", "{{YYYY-MM-DD}}"),
    ]
    header_r = next_row + 1
    ws6.cell(row=header_r, column=1, value="項目")
    ws6.cell(row=header_r, column=2, value="内容")
    style_header_row(ws6, header_r, 2)
    for i, (k, v) in enumerate(final_pairs, start=1):
        ws6.cell(row=header_r + i, column=1, value=k).alignment = WRAP
        ws6.cell(row=header_r + i, column=2, value=v).alignment = WRAP
    autosize(ws6)

    # Sheet 7: バージョン
    ws7 = wb.create_sheet("バージョン")
    ws7.cell(row=1, column=1, value="バージョン履歴").font = Font(bold=True, size=12)
    write_table(
        ws7,
        start_row=2,
        headers=["Version", "Date", "Note"],
        rows=[
            ["v1.0", "2026-04-02", "review-analysis CLAUDE.md §KPI + product-cycle.md P4セクションから共有資産化"],
            ["v1.1", "2026-04-14", "Markdown から xlsx へ移行"],
        ],
    )
    autosize(ws7)

    out = OUT_DIR / "p4-measurement.xlsx"
    wb.save(out)
    return out


# ---------------------------------------------------------------------------


def verify(path: Path) -> dict:
    wb = load_workbook(path, data_only=False)
    info = {"path": str(path), "sheets": []}
    for name in wb.sheetnames:
        ws = wb[name]
        info["sheets"].append({"name": name, "max_row": ws.max_row, "max_col": ws.max_column})
    return info


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    p1 = build_marketing_tracker()
    p2 = build_p4_measurement()
    for p in (p1, p2):
        info = verify(p)
        print(f"[OK] {info['path']}")
        for s in info["sheets"]:
            print(f"  - {s['name']}: rows={s['max_row']} cols={s['max_col']}")


if __name__ == "__main__":
    main()
