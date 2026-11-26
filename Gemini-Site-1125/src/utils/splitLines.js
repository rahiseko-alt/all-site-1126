import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { fallingLetters } from './fallingLetters'

gsap.registerPlugin(ScrollTrigger, SplitText)

export function splitLines({
  triggerEl,
  linesEl,
  titleEl,
  duration = 0.7,
  stagger = 0.12,
  start = 'top 80%',
  once = true,
  fallingLetters: withFalling = false
}) {
  if (!linesEl || !triggerEl) return
  const split = new SplitText(linesEl, {
    type: 'lines',
    linesClass: 'split-line',
    aria: 'hidden'
  })
  if (titleEl) {
    split.lines.unshift(titleEl)
  }
  split.lines.forEach(line => {
    if (!line.parentNode.classList.contains('line-mask')) {
      const mask = document.createElement('div')
      mask.className = 'line-mask'
      mask.style.overflow = 'hidden'
      line.parentNode.insertBefore(mask, line)
      mask.appendChild(line)
    }
  })
  if (withFalling) {
    fallingLetters(split.lines)
  }
  gsap.set(split.lines, {
    yPercent: 100,
    opacity: 0
  })
  gsap.to(split.lines, {
    yPercent: 0,
    opacity: 1,
    duration,
    stagger,
    ease: 'power2.out',
    onComplete: withFalling
      ? () => split.lines.forEach(line => (line.parentNode.style.overflow = 'visible'))
      : undefined,
    scrollTrigger: {
      trigger: triggerEl,
      start,
      once
    }
  })
}
