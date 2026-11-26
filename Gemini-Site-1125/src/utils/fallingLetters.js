import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { sound } from './sound'

gsap.registerPlugin(SplitText)

export function fallingLetters(el) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const split = new SplitText(el, {
    type: 'words,chars',
    charsClass: 'fall-char',
    aria: false
  })
  split.chars.forEach(charEl => {
    charEl.addEventListener('pointerenter', () => fallChar(charEl))
  })
  return split
}

function fallChar(charEl) {
  if (charEl.dataset.falling) return
  charEl.dataset.falling = '1'
  const { top } = charEl.getBoundingClientRect()
  const dropY = window.innerHeight - top + 80
  sound.blip({
    pitch: 0.5 + Math.random() * 0.5,
    volume: 0.03,
    decay: 0.12
  })
  gsap
    .timeline({
      onComplete: () => delete charEl.dataset.falling
    })
    .to(charEl, {
      y: dropY,
      x: gsap.utils.random(-80, 80),
      rotation: gsap.utils.random(-260, 260),
      duration: 0.7 + dropY / 1600,
      ease: 'power2.in'
    })
    .set(charEl, {
      autoAlpha: 0
    })
    .set(
      charEl,
      {
        x: 0,
        y: -24,
        rotation: 0
      },
      `+=${gsap.utils.random(1.2, 2.2)}`
    )
    .to(charEl, {
      y: 0,
      autoAlpha: 1,
      duration: 0.5,
      ease: 'back.out(2.5)'
    })
}
