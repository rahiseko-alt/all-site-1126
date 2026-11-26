"""
ABC分析 xlsx インスタンス生成 — カテゴリ772 AIチャットボット制作

目的: AI Answer / dify25 / dsl5 の所属カテゴリのABC分析
出力: journal/monetization/drafts/abc-cat772-2026-04-14.xlsx

依存: openpyxl, build_template.py(同ディレクトリ)
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_template import build_workbook  # type: ignore

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_JSON = REPO_ROOT / "tmp" / "abc-cat772-data.json"
INSTANCE_PATH = REPO_ROOT / "journal" / "monetization" / "drafts" / "abc-cat772-2026-04-14.xlsx"


def main():
    with open(DATA_JSON, encoding="utf-8") as f:
        payload = json.load(f)

    data_rows = payload["items"]

    # 計算
    valid = [r for r in data_rows if (r.get("reviews") or 0) > 0]
    valid_sorted = sorted(valid, key=lambda r: -(r.get("reviews") or 0))
    total = sum(r.get("reviews") or 0 for r in valid_sorted)

    cum = 0
    a_count = b_count = c_count = 0
    a_prices = []
    for r in valid_sorted:
        cum += r["reviews"]
        pct = cum / total * 100 if total else 0
        if pct <= 80.0:
            a_count += 1
            a_prices.append(r["price"])
        elif pct <= 95.0:
            b_count += 1
        else:
            c_count += 1

    category_info = {
        "category_id": 772,
        "category_name": "AIチャットボット制作",
        "fetched_at": "2026-04-14",
        "fetch_method": "WebFetch x 4 pages (ranking sort, 親カテゴリ)",
        "total_samples": len(data_rows),
        "valid_samples": len(valid),
        "excluded": len(data_rows) - len(valid),
        "total_reviews": total,
        "a_count": a_count,
        "b_count": b_count,
        "c_count": c_count,
    }

    wb = build_workbook(data_rows=data_rows, category_info=category_info)
    INSTANCE_PATH.parent.mkdir(parents=True, exist_ok=True)
    wb.save(INSTANCE_PATH)

    sys.stdout.buffer.write(f"[OK] Instance: {INSTANCE_PATH}\n".encode("utf-8"))
    sys.stdout.buffer.write(
        f"     total={len(data_rows)} valid={len(valid)} total_reviews={total}\n".encode("utf-8")
    )
    sys.stdout.buffer.write(
        f"     A={a_count} B={b_count} C={c_count}\n".encode("utf-8")
    )

    # A群統計
    if a_prices:
        a_prices_sorted = sorted(a_prices)
        n = len(a_prices_sorted)
        median = (
            (a_prices_sorted[n // 2 - 1] + a_prices_sorted[n // 2]) / 2
            if n % 2 == 0
            else a_prices_sorted[n // 2]
        )
        bins = {}
        for p in a_prices:
            bin_key = (p // 5000) * 5000
            bins[bin_key] = bins.get(bin_key, 0) + 1
        top_bin = max(bins.items(), key=lambda x: x[1])
        sys.stdout.buffer.write(
            f"     A群 median=¥{int(median):,} min=¥{min(a_prices):,} max=¥{max(a_prices):,}\n".encode(
                "utf-8"
            )
        )
        sys.stdout.buffer.write(
            f"     A群 mode_bin=¥{top_bin[0]:,}〜¥{top_bin[0]+4999:,} ({top_bin[1]}件)\n".encode(
                "utf-8"
            )
        )
        sys.stdout.buffer.write(
            f"     A群 price_bins={sorted(bins.items())}\n".encode("utf-8")
        )


if __name__ == "__main__":
    main()
