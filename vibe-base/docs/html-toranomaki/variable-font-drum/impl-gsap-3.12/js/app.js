/* Variable Font Drum — スクロール連動の 3D 文字ドラム
 *
 * 仕組み:
 *   1. .line(h1) を numLines 枚に増やし、X軸まわりに stepAngle ずつ回して
 *      半径 drumRadius の円筒（ドラム）側面に配置する。
 *   2. ScrollTrigger でドラム全体を rotateX += 1080（3回転）させる。
 *   3. 各行の「正面度」conversion = |cos(角)/2 + 0.5| を可変フォントの
 *      太さ(font-weight)・横幅(font-stretch)・透明度(opacity)に反映する。
 */

gsap.registerPlugin(ScrollTrigger);

const $ = (sel) => document.querySelector(sel);

const stage = $(".stage");
const tubeInner = $(".tube__inner");
// clone 後に増える要素を都度拾うため、live な HTMLCollection を保持する
const lines = document.getElementsByClassName("line");

const numLines = 10;                                  // ドラムを構成する行数
const fontSizeFactor = gsap.getProperty(":root", "--fontSize"); // = 4 (vw係数)
const stepAngle = 360 / numLines;                     // 行間の回転角 = 36°

let drumRadius = 0;                                   // 円筒の半径(px)
let drumOrigin = "50% 50% 0px";                       // 各行の回転中心(円筒軸)

// 正多角形の外接半径から円筒の半径を求める。
// 行高(px) = ビューポート幅 / 100 * fontSizeFactor (= Nvw 相当)。
function measureDrum() {
  const fontSizePx = (window.innerWidth / 100) * fontSizeFactor;
  drumRadius = (fontSizePx / 2) / Math.sin((180 / numLines) * (Math.PI / 180));
  drumOrigin = `50% 50% -${drumRadius}px`;
}

// 最初の .line を numLines-1 枚 clone し、line--1〜line--N を付与する。
function buildLines() {
  for (let i = 0; i < numLines - 1; i++) {
    const clone = lines[0].cloneNode(true);
    clone.classList.add(`line--${i + 2}`);
    tubeInner.appendChild(clone);
  }
  lines[0].classList.add("line--1");
}

// 各行を円筒側面へ配置する（i番目を -stepAngle*i だけ回し、軸から drumRadius 離す）。
function layoutLines() {
  gsap.set(".line", {
    rotationX: (index) => -stepAngle * index,
    z: drumRadius,
    transformOrigin: drumOrigin,
  });
}

// 各行の現在の回転角から可変フォントの2軸と透明度を毎フレーム更新する。
function applyVariableFont(targets) {
  targets.forEach((target) => {
    const setCss = gsap.quickSetter(target, "css");
    const degrees = gsap.getProperty(target, "rotateX");
    const radians = degrees * (Math.PI / 180);
    // 正面(0°/360°)で1・真裏(180°)で0・側面(90°)で0.5 になる半波
    const conversion = Math.abs(Math.cos(radians) / 2 + 0.5);

    setCss({
      opacity: conversion + 0.1,
      fontWeight: 200 + 700 * conversion,
      fontStretch: `${100 + 700 * conversion}%`,
    });
  });
}

// スクロール量にドラムの回転と遠近の寄りを 1:1 で結びつける。
function bindScroll() {
  gsap.to(".line", {
    scrollTrigger: {
      trigger: ".stage",
      start: "top top",
      scrub: 1,
    },
    rotateX: "+=1080", // 3回転
    onUpdate() {
      applyVariableFont(this.targets());
    },
  });

  gsap.to(".tube", {
    scrollTrigger: {
      trigger: ".stage",
      start: "top top",
      scrub: 1,
    },
    perspective: "1vw", // 100vw → 1vw に寄せ、序盤で遠近を強調
    ease: "expo.out",
  });
}

function init() {
  buildLines();
  measureDrum();

  window.addEventListener("resize", () => {
    measureDrum();
    layoutLines();
  });

  layoutLines();
  applyVariableFont(gsap.utils.toArray(".line"));
  bindScroll();

  // 登場演出: stage を 2秒待ってから 2秒かけてフェードイン
  gsap.to(stage, { autoAlpha: 1, duration: 2, delay: 2 });
}

window.addEventListener("load", () => {
  init();

  // 入力テキストを全行へ反映（空入力時は半角スペースで高さを維持）
  const textInput = document.getElementById("text-input");
  if (textInput) {
    textInput.addEventListener("input", (e) => {
      const text = e.target.value || " ";
      document.querySelectorAll(".line").forEach((el) => {
        el.innerText = text;
      });
    });
  }
});
