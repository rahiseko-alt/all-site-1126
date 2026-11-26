"""
ベース画像にテキストオーバーレイしてサムネを生成する。

黄金律準拠版 v2 (2026-04-14):
  ✅ 要素数: 2つ（ヘッドライン + 価格バッジ）
  ✅ フォントサイズ: 300px（300pt以上）
  ✅ 安全領域: 上下115.5px 回避
  ✅ Z型視線誘導: ヘッドライン左上 → 価格バッジ右下

1220x1240 ココナラ縦長推奨サイズ。
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
OUT_PATH = REPO_ROOT / "tmp" / "replicate-out" / "thumb-ai-answer-full-v2.png"

CANVAS_W, CANVAS_H = 1220, 1240
SAFE_Y = 116  # 上下 115.5px が切れる → 116 を安全ライン

FONT_BOLD = "C:/Windows/Fonts/YuGothB.ttc"


def draw_gradient_bg(draw, w, h):
    """ダークネイビー縦グラデーション背景"""
    top_col = (12, 22, 58)
    bot_col = (25, 45, 110)
    for y in range(h):
        t = y / h
        r = int(top_col[0] + (bot_col[0] - top_col[0]) * t)
        g = int(top_col[1] + (bot_col[1] - top_col[1]) * t)
        b = int(top_col[2] + (bot_col[2] - top_col[2]) * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))


def main():
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (12, 22, 58, 255))
    draw = ImageDraw.Draw(canvas)
    draw_gradient_bg(draw, CANVAS_W, CANVAS_H)

    # ===== 要素1: ヘッドライン（左上 = Z型第1象限）=====
    # 300px = 300pt相当（黄金律 300pt以上）
    headline_font = ImageFont.truetype(FONT_BOLD, 300)
    lines = ["問合せ", "自動化"]

    line_x = 60                  # 左マージン
    line_y = SAFE_Y + 30         # 上安全領域 + 余裕 = 146px

    for line in lines:
        # 黒影（視認性確保）
        draw.text((line_x + 8, line_y + 8), line, fill=(0, 0, 0, 160), font=headline_font)
        # 本文（白）
        draw.text((line_x, line_y), line, fill=(255, 255, 255, 255), font=headline_font)
        bbox = draw.textbbox((0, 0), line, font=headline_font)
        line_h = bbox[3] - bbox[1]
        line_y += line_h + 28   # 行間28px

    # ===== 要素2: 価格バッジ（右下 = Z型第4象限）=====
    badge_text = "¥50,000"
    badge_font = ImageFont.truetype(FONT_BOLD, 110)
    bbox = draw.textbbox((0, 0), badge_text, font=badge_font)
    badge_w = bbox[2] - bbox[0] + 64
    badge_h = bbox[3] - bbox[1] + 32

    badge_x = CANVAS_W - badge_w - 60          # 右から60px内側
    badge_y = CANVAS_H - SAFE_Y - badge_h - 30  # 下安全領域の30px上

    # 赤背景（角丸なしで簡潔に）
    draw.rectangle(
        [badge_x, badge_y, badge_x + badge_w, badge_y + badge_h],
        fill=(220, 38, 38, 255),
    )
    draw.text(
        (badge_x + 32, badge_y + 16),
        badge_text,
        fill=(255, 255, 255, 255),
        font=badge_font,
    )

    canvas.convert("RGB").save(OUT_PATH, "PNG")
    sys.stdout.buffer.write(f"[SAVED] {OUT_PATH}\n".encode("utf-8"))


if __name__ == "__main__":
    main()
