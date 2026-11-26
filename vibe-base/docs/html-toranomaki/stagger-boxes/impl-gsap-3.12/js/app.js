// Stagger Boxes — ウェーブリボン（CodePen wvMgXxN の再現）
// 横棒を積層し、スクロール連動で一本ずつ時間差スライド＋回転させる。

gsap.registerPlugin(ScrollTrigger);

const BAR_COUNT = 100;

// 棒を生成（静的 HTML に 100 個並べる代わりに JS で構築）
const ribbon = document.getElementById("ribbon");
const frag = document.createDocumentFragment();
for (let i = 0; i < BAR_COUNT; i++) {
  const bar = document.createElement("div");
  bar.className = "box";
  frag.appendChild(bar);
}
ribbon.appendChild(frag);

// pinned + scrub タイムライン。スクロール量にアニメーションを写像する。
gsap
  .timeline({
    scrollTrigger: {
      trigger: ".trigger",
      start: "top top",
      end: "+=70%",
      pin: true,
      scrub: 0.5,
    },
  })
  // 1) 全棒を右へ 100% スライド（amount:1 で先頭→末尾に時間差）
  .to(".box", {
    xPercent: 100,
    duration: 1,
    ease: "power1.inOut",
    force3D: true,
    stagger: { amount: 1 },
  })
  // 2) 同時に 0° → 45° へ傾ける（リボンのうねり）
  .to(
    ".box",
    {
      rotation: 45,
      duration: 1,
      ease: "power1.out",
      stagger: { amount: 1 },
    },
    0
  )
  // 3) 後半で 45° → 0° へ戻し、波が通り過ぎた印象を作る
  .to(
    ".box",
    {
      rotation: 0,
      duration: 1,
      ease: "power1.in",
      stagger: { amount: 1 },
    },
    1
  );
