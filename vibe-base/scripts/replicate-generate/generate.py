"""
Replicate 経由で画像生成する CLI。

使い方:
    python scripts/replicate-generate/generate.py \
        --prompt "a minimal blue cafe cup icon, white background" \
        --model flux-schnell \
        --out tmp/replicate-out/test.png

承認モデル (NotebookLM ノート ClaudeCode-BestPractice の #1 §2 に従う):
    flux-schnell        $0.003/image  (¥0.5)  - 試作・確認用 (テキストのみ)
    flux-1.1-pro        $0.04/image   (¥6.3)  - 本番納品 (テキストのみ)
    flux-1.1-pro-ultra  $0.06/image   (¥9.5)  - 高解像度本番 (テキストのみ・最大4MP)
    flux-2-pro          $0.030/0.045/image (¥4.7/¥7.1) - 最新世代 (テキスト or テキスト+画像入力)

依存: replicate, requests (python -m pip install replicate requests)
環境変数: REPLICATE_API_TOKEN (必須、.env から読む)

## 運用ルール

本スクリプトは生成エンジンのみ。発火条件・モデル選択・枚数・保存先は
`create-image` スキル（.claude/skills/create-image/SKILL.md）に従うこと。
スキルを経由せずに本スクリプトを直接呼ばないこと。
"""
import argparse
import os
import sys
from pathlib import Path

# .env から環境変数を読み込む
def load_env(env_path: Path) -> None:
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())


REPO_ROOT = Path(__file__).resolve().parent.parent.parent
load_env(REPO_ROOT / ".env")

import replicate
import requests

MODELS = {
    "flux-schnell": "black-forest-labs/flux-schnell",
    "flux-1.1-pro": "black-forest-labs/flux-1.1-pro",
    "flux-1.1-pro-ultra": "black-forest-labs/flux-1.1-pro-ultra",
    "flux-2-pro": "black-forest-labs/flux-2-pro",
    # Retro Diffusion: ドット絵特化。flux と入力体系が異なる
    # (num_images/width/height/style/remove_bg。aspect_ratio・num_outputs 不可)
    "rd-fast": "retro-diffusion/rd-fast",   # 試作・反復用 (安価)
    "rd-plus": "retro-diffusion/rd-plus",   # 本番品質のドット絵
}

RETRO_PREFIX = "rd-"
RETRO_STYLES = [
    "default", "retro", "watercolor", "textured", "cartoon", "ui_element",
    "item_sheet", "character_turnaround", "environment", "isometric",
    "isometric_asset", "topdown_map", "topdown_asset", "classic",
    "topdown_item", "low_res", "mc_item", "mc_texture", "skill_icon",
]

# flux-2-pro 編集モードで参照画像を受けるパラメータ名
INPUT_IMAGE_PARAMS = [
    "input_image", "input_image_2", "input_image_3", "input_image_4",
    "input_image_5", "input_image_6", "input_image_7", "input_image_8",
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt", required=True, help="画像プロンプト (英語推奨)")
    ap.add_argument("--model", default="flux-schnell", choices=list(MODELS.keys()), help="使用モデル")
    ap.add_argument("--out", default=None, help="出力ファイルパス (省略時 tmp/replicate-out/{model}-{ts}.png)")
    ap.add_argument("--aspect-ratio", default="1:1", help="アスペクト比 (1:1 / 16:9 / 9:16 等)")
    ap.add_argument("--width", type=int, default=None, help="幅 (省略時はaspect_ratioに従う)")
    ap.add_argument("--height", type=int, default=None, help="高さ")
    ap.add_argument("--num-outputs", type=int, default=1, help="生成枚数 (1枚厳守。複数はマスター明示時のみ)")
    ap.add_argument("--raw", action="store_true", help="Raw mode 有効 (flux-1.1-pro-ultra 専用。candid/unedited aesthetic)")
    # Retro Diffusion (rd-*) 専用
    ap.add_argument("--style", default="default", choices=RETRO_STYLES, help="Retro Diffusion style (rd-* 専用)")
    ap.add_argument("--remove-bg", action="store_true", help="背景透過 (rd-* 専用)")
    ap.add_argument("--seed", type=int, default=None, help="seed (rd-* 専用・再現用)")
    # flux-2-pro 編集モード用 (image 1..8)
    for i, _ in enumerate(INPUT_IMAGE_PARAMS):
        flag = "--input-image" if i == 0 else f"--input-image-{i+1}"
        ap.add_argument(flag, default=None, help=f"参照画像{i+1} (flux-2-pro 編集モード専用)")
    args = ap.parse_args()

    if not os.environ.get("REPLICATE_API_TOKEN"):
        print("[ERROR] REPLICATE_API_TOKEN が設定されていません (.env を確認)", file=sys.stderr)
        sys.exit(2)

    # 参照画像の引数を集約
    ref_images = [
        getattr(args, "input_image"),
        getattr(args, "input_image_2"),
        getattr(args, "input_image_3"),
        getattr(args, "input_image_4"),
        getattr(args, "input_image_5"),
        getattr(args, "input_image_6"),
        getattr(args, "input_image_7"),
        getattr(args, "input_image_8"),
    ]
    has_ref = any(p is not None for p in ref_images)

    if has_ref and args.model != "flux-2-pro":
        print(f"[ERROR] --input-image* は flux-2-pro でのみ使用可 (指定モデル={args.model})", file=sys.stderr)
        sys.exit(2)

    model_id = MODELS[args.model]
    is_retro = args.model.startswith(RETRO_PREFIX)

    if is_retro:
        inputs = {"prompt": args.prompt, "num_images": args.num_outputs, "style": args.style}
        inputs["width"] = args.width or 256
        inputs["height"] = args.height or 256
        if args.remove_bg:
            inputs["remove_bg"] = True
        if args.seed is not None:
            inputs["seed"] = args.seed
    else:
        inputs = {"prompt": args.prompt, "num_outputs": args.num_outputs}
        if args.raw:
            if args.model != "flux-1.1-pro-ultra":
                print("[WARN] --raw は flux-1.1-pro-ultra 専用です。他モデルでは無視されます。", file=sys.stderr)
            else:
                inputs["raw"] = True
        if args.width and args.height:
            inputs["width"] = args.width
            inputs["height"] = args.height
        else:
            inputs["aspect_ratio"] = args.aspect_ratio

    # 参照画像を inputs に追加 (flux-2-pro のみ)
    opened_files = []
    if has_ref:
        for param_name, path in zip(INPUT_IMAGE_PARAMS, ref_images):
            if path:
                fp = open(path, "rb")
                opened_files.append(fp)
                inputs[param_name] = fp

    sys.stdout.buffer.write(f"[GEN] model={args.model} prompt={args.prompt[:80]}\n".encode("utf-8"))

    try:
        output = replicate.run(model_id, input=inputs)
    finally:
        for fp in opened_files:
            fp.close()

    # output は FileOutput オブジェクトまたは URL 文字列のリスト
    urls = []
    if isinstance(output, list):
        for item in output:
            urls.append(str(item) if hasattr(item, "__str__") else item)
    else:
        urls.append(str(output))

    # 出力先決定
    if args.out:
        out_base = Path(args.out)
    else:
        from datetime import datetime
        ts = datetime.now().strftime("%Y%m%d-%H%M%S")
        out_base = REPO_ROOT / "tmp" / "replicate-out" / f"{args.model}-{ts}.png"

    out_base.parent.mkdir(parents=True, exist_ok=True)

    saved = []
    for i, url in enumerate(urls):
        if len(urls) == 1:
            dest = out_base
        else:
            dest = out_base.with_stem(f"{out_base.stem}-{i}")
        r = requests.get(url, timeout=60)
        r.raise_for_status()
        dest.write_bytes(r.content)
        saved.append(dest)
        sys.stdout.buffer.write(f"[SAVED] {dest}\n".encode("utf-8"))

    print(f"[DONE] {len(saved)} image(s) saved")
    # 最初の画像を自動で開く
    if saved and sys.platform == "win32":
        os.startfile(str(saved[0]))


if __name__ == "__main__":
    main()
