import gsap from 'https://esm.sh/gsap@3.7.0'
import ScrollTrigger from 'https://esm.sh/gsap@3.7.0/ScrollTrigger'
import Draggable from 'https://esm.sh/gsap@3.7.0/Draggable'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(Draggable)

const projects = [
  { title: "染料の流れ", desc: "水面に落とした染料がゆらめき広がるような、有機的でなめらかな流体シミュレーション。放置すると自動で色相が巡る演出に切り替わります。", url: "../webgl-dye-flow/index.html" },
  { title: "Three.js Constellations", desc: "Interactive particle constellation simulation with customizable settings (rainbow colors, thickness, dynamic distance, drift speed).", url: "../webgl-constellations-demo/index.html" },
  { title: "WebGL 空間ダイブ", desc: "奥行きのある3D空間へ吸い込まれるように没入する、Three.js のパーティクル空間演出。", url: "../webgl-spatial-dive/index.html" },
  { title: "WebGL 海景シェーダー", desc: "Three.js の水面・空・ポストプロセスを組み合わせ、太陽光が揺らめく海景をリアルタイム描画するシェーダーデモ。", url: "../webgl-shaders-ocean-demo/index.html" },
  { title: "WebGL カード歪み", desc: "カードにマウスを重ねると外枠ごとゼリーのように波打ち、クリックで正円の波紋が広がる、curtains.js による高品位なインタラクティブ歪みエフェクト。", url: "../webgl-card-distortion/index.html" },
  { title: "WebGL カードぐにゃーん（ホバー）", desc: "マウス追従でカードの外枠が滑らかに波打つ、ホバー歪みに特化した curtains.js の最小構成デモ。", url: "../webgl-card-distortion-hover/index.html" },
  { title: "WebGL カード歪み（クリック波紋）", desc: "クリック地点からアスペクト比補正された正円の波紋が広がる、波紋表現に特化した curtains.js デモ。", url: "../webgl-card-distortion-ripple/index.html" },
  { title: "Dennis Snellenberg 再現", desc: "Dennis Snellenbergのポートフォリオに見られる、GSAP/Lenisを用いた高品位なマグネット、プレローダー、カーソル追従画像プレビュー等のインタラクション再現。", url: "../dennis-snellenberg-portfolio/index.html" },
  { title: "ガラスモーフィズム 3D Tilt カード", desc: "backdrop-filterすりガラス、マウス追従スポットライト、Vercel風mask合成ボーダーグロー、背面パララックス透過画像、3D Tilt、スクロールフェード、セクション常駐カスタムカーソルの7技術を統合した高密度インタラクティブカード。", url: "../glassmorphism-tilt-card/index.html" },
  { title: "AI オフィサー LP", desc: "起動ローダーからニューラルネット背景、3Dティルトカード、疑似ターミナルまでを一画面に統合したダークテーマの企業向けAIエージェント・ランディングページ。マウスに吸い付くマグネットボタンと慣性スクロールで没入感を演出します。", url: "../ai-officer-hp/index.html" },
  { title: "可変フォント 3D ドラム", desc: "スクロールに連動して文字列が3Dドラム状に回転。正面を向いた行ほど太く・横広く・濃くなる、可変フォント2軸（太さ・横幅）の連続制御デモ。", url: "../variable-font-drum/index.html" },
  { title: "飛び出すQR", desc: "QRサムネをクリックすると、枠は元の位置に残ったまま中身だけが中央へ飛び出して拡大する。GSAP Flip の data-flip-id 共有エレメントと pointer-events:none ステージでジッターなく滑らかに動く。", url: "../flip-qr-popout/index.html" },
  { title: "ウェーブリボン", desc: "横長の薄い棒を100本積層し、スクロール連動で一本ずつ時間差スライド＋回転。棒の集合がリボン状にうねって流れ、背後の「SCROLL UP」が現れるGSAP ScrollTrigger stagger デモ。", url: "../stagger-boxes/index.html" },
  { title: "ショッピングカート追加ボタン", desc: "ボタンをクリックするとローディング車輪アニメーションを経てカートに入る、MorphSVGPluginを活用したマイクロインタラクション。", url: "../add-to-cart/index.html" },
  { title: "ドラッグ可能な液体シリンダー", desc: "ドラッグ操作とInertiaPluginによる慣性スクロールで液面を上下させる、温度計風のシリンダーUIアニメーション。", url: "../draggable-liquid-tube/index.html" },
  { title: "Anime.js Layout ID Attribute", desc: "同じ data-layout-id を持つ要素をコンテナ間で移動させる Anime.js v4 の createLayout (FLIP) アニメーションデモ。", url: "../animejs-layout-id-attribute/index.html" },
  { title: "Anime.js 動的追加トランジション", desc: "グリッドに要素が追加されると既存要素が滑らかに押し退けられ、新要素が下からふわっと浮き上がる Anime.js v4 createLayout デモ。", url: "../animejs-add-items/index.html" },
  { title: "Anime.js シャッフル整列", desc: "要素の並び替えを自動検知し、元の位置から新しい位置へ心地よく移動させる Anime.js v4 createLayout のシャッフルデモ。", url: "../animejs-shuffle-items/index.html" },
  { title: "ホバー色変化ボタン", desc: "ボタンやナビ項目がホバーで項目ごとに別々のブランド色へ点灯する。nth-child 固定色とインライン CSS 変数の2方式で、色追加が CSS 改変なしに行える軽量な素CSS実装。", url: "../hover-color-buttons/index.html" },
  { title: "隠密マーク（ホバー出現アイコン）", desc: "普段は完全に非表示のアイコンが、カーソルを近づけた時だけ下から浮き上がりブランド色で出現する。黒塗りでは隠しきれない問題を opacity:0 で解決した素CSSの隠密マーク。", url: "../hover-reveal-icon/index.html" },
  { title: "3D CSS 太陽系", desc: "純粋なCSS 3Dトランスフォームだけで太陽系の公転・自転・昼夜の陰影を再現したインタラクティブ作品。2D/3D切替・速度/サイズ/距離スケールをワンクリックで切り替えられます。", url: "../css-solarsystem-demo/index.html" },
  { title: "3Dスクロール水流トンネル潜行", desc: "スクロール速度と連動して視野角が広がり、カメラが微小にブレながら、Simplex Noiseでうねる光の気泡トンネルを滑らかに潜り抜けるインタラクティブな3D演出です。", url: "../threejs-water-tunnel-dive/index.html" }
];

const gradients = [
  "linear-gradient(135deg, #8B5CF6, #3B82F6)",
  "linear-gradient(135deg, #FF6B6B, #FF8E53)",
  "linear-gradient(135deg, #11998E, #38EF7D)",
  "linear-gradient(135deg, #F2994A, #F2C94C)",
  "linear-gradient(135deg, #00B4DB, #0083B0)",
  "linear-gradient(135deg, #667EEA, #764BA2)",
  "linear-gradient(135deg, #FF416C, #FF4B2B)",
  "linear-gradient(135deg, #B2FEFA, #0ED2F7)",
  "linear-gradient(135deg, #1D976C, #93F9B9)",
  "linear-gradient(135deg, #FF0099, #493240)"
];

const boxesContainer = document.querySelector('.boxes');
const controls = document.querySelector('.controls');

projects.forEach((proj, i) => {
  const box = document.createElement('div');
  box.className = 'box';
  box.dataset.url = proj.url;
  
  // Extract ID from URL (e.g. "../webgl-dye-flow/index.html" -> "webgl-dye-flow")
  const idMatch = proj.url.match(/\.\.\/([^\/]+)\/index\.html/);
  const id = idMatch ? idMatch[1] : '';
  
  // Set the screenshot as the background image variable
  box.style.setProperty('--src', `url('./assets/${id}.png')`);

  const overlay = document.createElement('div');
  overlay.className = 'box-overlay';

  const title = document.createElement('h3');
  title.textContent = proj.title;

  const desc = document.createElement('p');
  desc.textContent = proj.desc;

  overlay.appendChild(title);
  overlay.appendChild(desc);
  
  box.appendChild(overlay);
  
  boxesContainer.insertBefore(box, controls);
});

gsap.set('.box', {
  yPercent: -50,
})

const STAGGER = 0.1
const DURATION = 1
const OFFSET = 0
const BOXES = gsap.utils.toArray('.box')

const LOOP = gsap.timeline({
  paused: true,
  repeat: -1,
  ease: 'none',
})

const SHIFTS = [...BOXES, ...BOXES, ...BOXES]

SHIFTS.forEach((BOX, index) => {
  const BOX_TL = gsap
    .timeline()
    .set(BOX, {
      xPercent: 250,
      rotateY: -50,
      opacity: 0,
      scale: 0.5,
    })
    // Opacity && Scale
    .to(
      BOX,
      {
        opacity: 1,
        scale: 1,
        duration: 0.1,
      },
      0
    )
    .to(
      BOX,
      {
        opacity: 0,
        scale: 0.5,
        duration: 0.1,
      },
      0.9
    )
    // Panning
    .fromTo(
      BOX,
      {
        xPercent: 250,
      },
      {
        xPercent: -350,
        duration: 1,
        immediateRender: false,
        ease: 'power1.inOut',
      },
      0
    )
    // Rotations
    .fromTo(
      BOX,
      {
        rotateY: -50,
      },
      {
        rotateY: 50,
        immediateRender: false,
        duration: 1,
        ease: 'power4.inOut',
      },
      0
    )
    // Scale && Z
    .to(
      BOX,
      {
        z: 100,
        scale: 1.25,
        duration: 0.1,
        repeat: 1,
        yoyo: true,
      },
      0.4
    )
    .fromTo(
      BOX,
      {
        zIndex: 1,
      },
      {
        zIndex: BOXES.length,
        repeat: 1,
        yoyo: true,
        ease: 'none',
        duration: 0.5,
        immediateRender: false,
      },
      0
    )
  LOOP.add(BOX_TL, index * STAGGER)
})

const CYCLE_DURATION = STAGGER * BOXES.length
const START_TIME = CYCLE_DURATION + DURATION * 0.5 + OFFSET

const LOOP_HEAD = gsap.fromTo(
  LOOP,
  {
    totalTime: START_TIME,
  },
  {
    totalTime: `+=${CYCLE_DURATION}`,
    duration: 1,
    ease: 'none',
    repeat: -1,
    paused: true,
  }
)

const PLAYHEAD = {
  position: 0,
}

const POSITION_WRAP = gsap.utils.wrap(0, LOOP_HEAD.duration())

const SCRUB = gsap.to(PLAYHEAD, {
  position: 0,
  onUpdate: () => {
    LOOP_HEAD.totalTime(POSITION_WRAP(PLAYHEAD.position))
  },
  paused: true,
  duration: 0.25,
  ease: 'power3',
})

let iteration = 0
const TRIGGER = ScrollTrigger.create({
  start: 0,
  end: '+=2000',
  horizontal: false,
  pin: '.boxes',
  onUpdate: self => {
    const SCROLL = self.scroll()
    if (SCROLL > self.end - 1) {
      // Go forwards in time
      WRAP(1, 1)
    } else if (SCROLL < 1 && self.direction < 0) {
      // Go backwards in time
      WRAP(-1, self.end - 1)
    } else {
      const NEW_POS = (iteration + self.progress) * LOOP_HEAD.duration()
      SCRUB.vars.position = NEW_POS
      SCRUB.invalidate().restart()
    }
  },
})

const WRAP = (iterationDelta, scrollTo) => {
  iteration += iterationDelta
  TRIGGER.scroll(scrollTo)
  TRIGGER.update()
}

const SNAP = gsap.utils.snap(1 / BOXES.length)

const progressToScroll = progress =>
  gsap.utils.clamp(
    1,
    TRIGGER.end - 1,
    gsap.utils.wrap(0, 1, progress) * TRIGGER.end
  )

const scrollToPosition = position => {
  const SNAP_POS = SNAP(position)
  const PROGRESS =
    (SNAP_POS - LOOP_HEAD.duration() * iteration) / LOOP_HEAD.duration()
  const SCROLL = progressToScroll(PROGRESS)
  if (PROGRESS >= 1 || PROGRESS < 0) return WRAP(Math.floor(PROGRESS), SCROLL)
  TRIGGER.scroll(SCROLL)
}

ScrollTrigger.addEventListener('scrollEnd', () =>
  scrollToPosition(SCRUB.vars.position)
)

const NEXT = () => scrollToPosition(SCRUB.vars.position - 1 / BOXES.length)
const PREV = () => scrollToPosition(SCRUB.vars.position + 1 / BOXES.length)

document.addEventListener('keydown', event => {
  if (event.code === 'ArrowLeft' || event.code === 'KeyA') NEXT()
  if (event.code === 'ArrowRight' || event.code === 'KeyD') PREV()
})

document.querySelector('.boxes').addEventListener('click', e => {
  const BOX = e.target.closest('.box')
  if (BOX) {
    let TARGET = BOXES.indexOf(BOX)
    let CURRENT = gsap.utils.wrap(
      0,
      BOXES.length,
      Math.round(BOXES.length * SCRUB.vars.position)
    )
    
    if (TARGET === CURRENT) {
      window.open(BOX.dataset.url, '_blank')
      return
    }

    let BUMP = TARGET - CURRENT
    if (TARGET > CURRENT && TARGET - CURRENT > BOXES.length * 0.5) {
      BUMP = (BOXES.length - BUMP) * -1
    }
    if (CURRENT > TARGET && CURRENT - TARGET > BOXES.length * 0.5) {
      BUMP = BOXES.length + BUMP
    }
    scrollToPosition(SCRUB.vars.position + BUMP * (1 / BOXES.length))
  }
})

window.BOXES = BOXES

document.querySelector('.next').addEventListener('click', NEXT)
document.querySelector('.prev').addEventListener('click', PREV)

gsap.set('.box', { display: 'flex' })

gsap.set('button', {
  z: 200,
})

Draggable.create('.drag-proxy', {
  type: 'x',
  trigger: '.box',
  onPress() {
    this.startOffset = SCRUB.vars.position
  },
  onDrag() {
    SCRUB.vars.position = this.startOffset + (this.startX - this.x) * 0.001
    SCRUB.invalidate().restart() // same thing as we do in the ScrollTrigger's onUpdate
  },
  onDragEnd() {
    scrollToPosition(SCRUB.vars.position)
  },
})
