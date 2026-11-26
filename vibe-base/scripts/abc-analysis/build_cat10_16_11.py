"""
ABC分析 xlsx インスタンス生成 — cat10 / cat16 / cat11 (Session 170)

build_template.build_workbook() をラップし、動的ビン幅（5,000円 or 10,000円）に対応。
cat10 は価格帯が広い（¥1,000-¥60,000+）ため、ビン幅を自動判定する。
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_template import build_workbook  # type: ignore

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
DRAFTS = REPO_ROOT / "journal" / "monetization" / "drafts"

TARGETS = [
    {
        "cat_id": 10,
        "cat_name": "動画編集・映像制作",
        "data_json": REPO_ROOT / "tmp" / "abc-cat10-data.json",
        "instance": DRAFTS / "abc-cat10-2026-04-14.xlsx",
    },
    {
        "cat_id": 16,
        "cat_name": "集客・マーケティング相談",
        "data_json": REPO_ROOT / "tmp" / "abc-cat16-data.json",
        "instance": DRAFTS / "abc-cat16-2026-04-14.xlsx",
    },
    {
        "cat_id": 11,
        "cat_name": "IT相談・システム開発",
        "data_json": REPO_ROOT / "tmp" / "abc-cat11-data.json",
        "instance": DRAFTS / "abc-cat11-2026-04-14.xlsx",
    },
]


def compute_stats(data_rows):
    valid = [r for r in data_rows if (r.get("reviews") or 0) > 0]
    valid_sorted = sorted(valid, key=lambda r: -(r.get("reviews") or 0))
    total = sum(r.get("reviews") or 0 for r in valid_sorted)

    cum = 0
    a_count = b_count = c_count = 0
    a_group = []
    for r in valid_sorted:
        cum += r["reviews"]
        pct = cum / total * 100 if total else 0
        if pct <= 80.0:
            a_count += 1
            a_group.append(r)
        elif pct <= 95.0:
            b_count += 1
        else:
            c_count += 1

    a_prices = [r["price"] for r in a_group]

    median_price = None
    price_bins_5k = {}
    price_bins_10k = {}
    top_bin_5k = None
    top_bin_10k = None
    if a_prices:
        s = sorted(a_prices)
        n = len(s)
        median_price = (s[n // 2 - 1] + s[n // 2]) / 2 if n % 2 == 0 else s[n // 2]
        for p in a_prices:
            b5 = (p // 5000) * 5000
            b10 = (p // 10000) * 10000
            price_bins_5k[b5] = price_bins_5k.get(b5, 0) + 1
            price_bins_10k[b10] = price_bins_10k.get(b10, 0) + 1
        top_bin_5k = max(price_bins_5k.items(), key=lambda x: x[1])
        top_bin_10k = max(price_bins_10k.items(), key=lambda x: x[1])

    a_reviews = sum(r.get("reviews") or 0 for r in a_group)

    return {
        "valid": len(valid),
        "total_reviews": total,
        "a_count": a_count,
        "b_count": b_count,
        "c_count": c_count,
        "a_reviews": a_reviews,
        "a_share_pct": (a_reviews / total * 100) if total else 0,
        "a_prices": a_prices,
        "a_median": median_price,
        "a_min": min(a_prices) if a_prices else 0,
        "a_max": max(a_prices) if a_prices else 0,
        "bins_5k": sorted(price_bins_5k.items()),
        "bins_10k": sorted(price_bins_10k.items()),
        "top_bin_5k": top_bin_5k,
        "top_bin_10k": top_bin_10k,
    }


def decide_bin_width(stats):
    """価格幅が広ければ10k刻み。狭ければ5k刻み。"""
    prices = stats["a_prices"]
    if not prices:
        return 5000
    span = max(prices) - min(prices)
    # 30k以上の幅があれば10k刻みの方が分布が見やすい
    return 10000 if span >= 30000 else 5000


def build_one(target):
    with open(target["data_json"], encoding="utf-8") as f:
        payload = json.load(f)
    data_rows = payload["items"]

    stats = compute_stats(data_rows)
    bin_w = decide_bin_width(stats)
    top_bin = stats["top_bin_10k"] if bin_w == 10000 else stats["top_bin_5k"]

    category_info = {
        "category_id": target["cat_id"],
        "category_name": target["cat_name"],
        "fetched_at": "2026-04-14",
        "fetch_method": "WebFetch x 4 pages (ranking sort)",
        "total_samples": len(data_rows),
        "valid_samples": stats["valid"],
        "excluded": len(data_rows) - stats["valid"],
        "total_reviews": stats["total_reviews"],
        "a_count": stats["a_count"],
        "b_count": stats["b_count"],
        "c_count": stats["c_count"],
    }

    wb = build_workbook(data_rows=data_rows, category_info=category_info)
    target["instance"].parent.mkdir(parents=True, exist_ok=True)
    wb.save(target["instance"])

    sys.stdout.buffer.write(
        f"[OK] cat{target['cat_id']} -> {target['instance'].name}\n".encode("utf-8")
    )
    sys.stdout.buffer.write(
        f"     valid={stats['valid']} total_reviews={stats['total_reviews']}\n".encode("utf-8")
    )
    sys.stdout.buffer.write(
        f"     A={stats['a_count']} B={stats['b_count']} C={stats['c_count']} "
        f"A_share={stats['a_share_pct']:.1f}%\n".encode("utf-8")
    )
    if stats["a_prices"]:
        sys.stdout.buffer.write(
            f"     A median=¥{int(stats['a_median']):,} min=¥{stats['a_min']:,} max=¥{stats['a_max']:,}\n".encode("utf-8")
        )
        sys.stdout.buffer.write(
            f"     bin_width=¥{bin_w:,} top_bin=¥{top_bin[0]:,}〜¥{top_bin[0]+bin_w-1:,} ({top_bin[1]}件)\n".encode("utf-8")
        )
        sys.stdout.buffer.write(
            f"     bins_5k={stats['bins_5k']}\n".encode("utf-8")
        )
        sys.stdout.buffer.write(
            f"     bins_10k={stats['bins_10k']}\n".encode("utf-8")
        )
    return stats, bin_w, top_bin


def main():
    results = {}
    for t in TARGETS:
        stats, bin_w, top_bin = build_one(t)
        results[t["cat_id"]] = {"stats": stats, "bin_w": bin_w, "top_bin": top_bin, "cat_name": t["cat_name"]}
    return results


if __name__ == "__main__":
    main()
