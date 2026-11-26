"""
monetization.xlsx 日次売上同期スクリプト

入力: tmp/coconala-data-YYYY-MM-DD.json（Playwright MCP で取得した Chart.js データ）
出力: monetization.xlsx の sales-daily シートに upsert

- 合計行 SUBTOTAL 式なし（long format のためピボットで算出）
- 旧コードネーム（app50/dify25/dsl5/...）→新コードネーム（ai-answer-full/dify-build/...）自動変換
- (date, code) キーで upsert（既存行は更新、新規行は追記）
- 0/null 値は既存データを温存
- 合計シート（legacy '0'）は sales-daily に入れない（pivot で算出する想定）

使い方:
    python scripts/monetization/sync.py --json tmp/coconala-data-YYYY-MM-DD.json
    python scripts/monetization/sync.py --json tmp/coconala-data-YYYY-MM-DD.json --dry-run

依存: openpyxl
"""
import argparse
import json
import sys
from datetime import datetime, date, timedelta
from pathlib import Path
import openpyxl


REPO_ROOT = Path(__file__).resolve().parent.parent.parent
MONETIZATION_PATH = REPO_ROOT / "monetization.xlsx"

# 旧コードネーム（Deta.xlsx シート名 and MCP JSON キー）→ 新コードネーム
LEGACY_TO_CODE = {
    "0": None,  # 全合計は sales-daily には入れない
    "app50": "ai-answer-full",
    "dify25": "dify-build",
    "dsl5": "dify-dsl",
    "宿泊app50": "ai-answer-hotel",
    "不動産app50": "ai-answer-realestate",
    "士業app50": "ai-answer-lawyer",
    # 新コードネームで JSON が来た場合はそのまま通す
    "ai-answer-full": "ai-answer-full",
    "dify-build": "dify-build",
    "dify-dsl": "dify-dsl",
    "ai-answer-hotel": "ai-answer-hotel",
    "ai-answer-realestate": "ai-answer-realestate",
    "ai-answer-lawyer": "ai-answer-lawyer",
    "total": None,
}


def parse_label_to_date(label: str, year: int) -> date | None:
    """'4/1' -> date(year, 4, 1)。パース失敗は None。"""
    try:
        m, d = label.split("/")
        return date(year, int(m), int(d))
    except Exception:
        return None


def load_existing_index(ws) -> dict:
    """(date, code) -> row_number の辞書を構築。ヘッダ3行目の前提。"""
    index = {}
    for row in range(4, ws.max_row + 1):
        dt = ws.cell(row=row, column=1).value
        code = ws.cell(row=row, column=3).value
        if not dt or not code:
            continue
        if isinstance(dt, datetime):
            dt = dt.date()
        elif not isinstance(dt, date):
            continue
        index[(dt, code)] = row
    return index


def get_dow(d: date) -> str:
    """日本語曜日"""
    return "月火水木金土日"[d.weekday()]


def sync(json_path: Path, xlsx_path: Path, dry_run: bool = False) -> dict:
    with open(json_path, encoding="utf-8") as f:
        data = json.load(f)

    labels = data["labels"]
    fetched_at = data.get("fetched_at", "")
    year = int(fetched_at[:4]) if fetched_at and len(fetched_at) >= 4 else date.today().year

    wb = openpyxl.load_workbook(xlsx_path, data_only=False)
    if "sales-daily" not in wb.sheetnames:
        raise RuntimeError("sales-daily シートが見つかりません")
    ws = wb["sales-daily"]

    index = load_existing_index(ws)
    changes = []
    next_row = ws.max_row + 1

    for svc in data["services"]:
        legacy = svc.get("sheet", "")
        code = LEGACY_TO_CODE.get(legacy, legacy)
        if code is None:
            continue  # total はスキップ

        views_arr = svc.get("views", [])
        browses_arr = svc.get("browses", [])
        sales_arr = svc.get("sales", [])

        for i, lab in enumerate(labels):
            dt = parse_label_to_date(lab, year)
            if dt is None:
                continue
            v = views_arr[i] if i < len(views_arr) else 0
            b = browses_arr[i] if i < len(browses_arr) else 0
            s = sales_arr[i] if i < len(sales_arr) else 0

            # 0/null 行は新規追加しない（既存があれば更新のみ）
            row_key = (dt, code)
            if row_key in index:
                row_num = index[row_key]
                cur_v = ws.cell(row=row_num, column=4).value
                cur_b = ws.cell(row=row_num, column=5).value
                cur_s = ws.cell(row=row_num, column=6).value
                cur_v_n = 0 if cur_v in (None, 0) else cur_v
                cur_b_n = 0 if cur_b in (None, 0) else cur_b
                cur_s_n = 0 if cur_s in (None, 0) else cur_s

                updated = False
                if cur_v_n != v:
                    changes.append(f"{dt} {code} views: {cur_v} -> {v}")
                    if not dry_run:
                        ws.cell(row=row_num, column=4).value = v if v > 0 else None
                    updated = True
                if cur_b_n != b:
                    changes.append(f"{dt} {code} browses: {cur_b} -> {b}")
                    if not dry_run:
                        ws.cell(row=row_num, column=5).value = b if b > 0 else None
                    updated = True
                if cur_s_n != s:
                    changes.append(f"{dt} {code} sales: {cur_s} -> {s}")
                    if not dry_run:
                        ws.cell(row=row_num, column=6).value = s if s > 0 else None
                    updated = True
            else:
                # 新規行: 値が全部0なら追加しない
                if v == 0 and b == 0 and s == 0:
                    continue
                changes.append(f"{dt} {code} NEW: views={v} browses={b} sales={s}")
                if not dry_run:
                    ws.cell(row=next_row, column=1).value = dt
                    ws.cell(row=next_row, column=2).value = get_dow(dt)
                    ws.cell(row=next_row, column=3).value = code
                    ws.cell(row=next_row, column=4).value = v if v > 0 else None
                    ws.cell(row=next_row, column=5).value = b if b > 0 else None
                    ws.cell(row=next_row, column=6).value = s if s > 0 else None
                    index[row_key] = next_row
                    next_row += 1

    if not dry_run:
        wb.save(xlsx_path)

    return {"changes": changes, "total_changes": len(changes)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", required=True, help="入力 JSON パス")
    ap.add_argument("--xlsx", default=str(MONETIZATION_PATH), help="更新対象 xlsx")
    ap.add_argument("--dry-run", action="store_true", help="差分のみ表示")
    args = ap.parse_args()

    result = sync(Path(args.json), Path(args.xlsx), dry_run=args.dry_run)

    mode = "[DRY-RUN]" if args.dry_run else "[APPLIED]"
    sys.stdout.buffer.write(f"{mode} 変更件数: {result['total_changes']}\n".encode("utf-8"))
    for ch in result["changes"][:50]:
        sys.stdout.buffer.write(f"  {ch}\n".encode("utf-8"))
    if result["total_changes"] > 50:
        sys.stdout.buffer.write(f"  ...他 {result['total_changes']-50} 件\n".encode("utf-8"))


if __name__ == "__main__":
    main()
