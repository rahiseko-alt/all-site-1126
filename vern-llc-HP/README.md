# ASCII play — Reproduction

An homage and faithful reproduction of [play.ertdfgcvb.xyz](https://play.ertdfgcvb.xyz) (Andreas Gysin / [ertdfgcvb](https://ertdfgcvb.xyz)), built on top of the official open-source core.

## Credits & Licenses

- **Runner, built-in modules, and all 47 example programs (`/src/run.js`, `/src/core/`, `/src/modules/`, `/src/programs/`, `/tests/`)**:
  [`play.core`](https://github.com/ertdfgcvb/play.core) by **ertdfgcvb** (Andreas Gysin), pinned to commit `b2d30ac618db573c228a4fa287ddedf48e642e79` — licensed under the **Apache License 2.0** (see [`LICENSE`](./LICENSE)).
- **Code editor (`/lib/codemirror/`)**:
  [CodeMirror](https://codemirror.net/5/) **5.55.0** (`codemirror@5.55.0`) — licensed under the **MIT License** (see [`lib/codemirror/LICENSE`](./lib/codemirror/LICENSE)).

## Known Shortages (Spec §15)

1. **Font license (`LL Simple Console`)**:
   The original site uses *LL Simple Console* (Lineto), which is licensed exclusively for `ertdfgcvb.xyz` and its subdomains. No font files from the original site are copied or included in this repository. [`css/simple_console.css`](./css/simple_console.css) provides a provisional `@font-face` mapping `"Simple Console"` to locally installed monospace fonts (`Consolas`, `Menlo`, `DejaVu Sans Mono`, `Courier New`). Obtaining an official *LL Simple* license from Lineto is required for 100% glyph identity.
2. **Server storage backend (`/srv.php`)**:
   The internal implementation of the original server is not public. This repository provides a clean implementation of the public JSON contract (`POST /srv.php` with `{"io":"i","src":"..."}` and `{"io":"o","base":"..."}`) in both PHP ([`srv.php`](./srv.php)) and zero-dependency Node.js ([`tools/serve.mjs`](./tools/serve.mjs) / [`tools/srv-core.mjs`](./tools/srv-core.mjs)).

## Running Locally

### Option A: Node.js (zero dependencies, serves static files + `/srv.php` contract)

```bash
node tools/serve.mjs 8000
```

Then open `http://localhost:8000/`.

### Option B: PHP built-in server

```bash
php -S localhost:8000
```
