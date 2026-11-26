# Plan: Replicate CDJ-3000X Premium Product Page

## 1. Goal
Replicate the premium AlphaTheta CDJ-3000X product landing page inside `agent-ag/cdj-3000x-clone` using Vite + Vanilla JS + GSAP + Tailwind CSS, with high-quality AI-generated WebP assets.

## 2. Target Directory & Files
All code files should be placed inside `agent-ag/cdj-3000x-clone/`.
- `index.html`
- `style.css`
- `main.js`
- `package.json`
- `vite.config.js`
- `public/assets/images/` (AI-generated WebP images)

## 3. Step-by-Step Execution Plan

### Step 1: Scaffold Vite Project
- Initialize a Vite project inside `agent-ag/cdj-3000x-clone` using `npm init vite@latest ./ -- --template vanilla`.
- Install dependencies: `gsap`, `tailwindcss`, `postcss`, `autoprefixer`.

### Step 2: High-Quality AI Image Generation
Use the `generate_image` tool to generate WebP assets:
- `kv_poster.webp` (CDJ-3000X premium render)
- `history_01.webp` (CDJ-1000)
- `history_02.webp` (CDJ-2000)
- `history_03.webp` (CDJ-3000)
- `history_04.webp` (CDJ-3000X history edition)
- `sound_bg.webp` (Audio circuit board with golden gloss and ESS DAC chip)
- `3d_01.webp` to `3d_08.webp` (8-frame rotation images)

### Step 3: Implement HTML5 & Styling
- Create semantic structure in `index.html`.
- Set up Tailwind/CSS tokens in `style.css` for absolute black background (`#000000`), premium typography (`Manrope` / Mincho), and glassmorphism.

### Step 4: Implement High-Fidelity Animations (main.js)
- Header scrolling transparency and frosted glass effect.
- Staggered entry animations for highlight grid.
- Dynamic clip-path masking for the Hero KV section and video stories.
- Canvas animation engine for the Motion section (3D grid warping, scanner lasers, gravity particle loading).
- 360° interactive view controller linking mouse drag and range slider to frame switching.

### Step 5: Verification & Local Host Smoke Test
- Start the Vite dev server and verify 60FPS fluid transitions.
- Validate responsiveness across SP and Desktop viewports.
