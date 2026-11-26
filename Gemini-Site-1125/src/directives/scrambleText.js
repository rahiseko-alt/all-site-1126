import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { fallingLetters } from '../utils/fallingLetters'

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin)

export const scrambleTextDirective = {
  mounted(el, binding) {
    const text = el.textContent
    const delay = binding.value?.delay || 0
    const rightToLeft = binding.value?.rightToLeft || false
    const scrollTriggerStart = binding.value?.scrollTriggerStart || false
    const withFalling = binding.value?.fallingLetters || false

    el.style.position = 'relative'
    el.innerHTML = ''

    const ghost = document.createElement('div')
    ghost.style.opacity = 0
    ghost.innerText = text

    const target = document.createElement('div')
    target.style.position = 'absolute'
    target.style.top = 0
    target.style.left = 0
    target.style.width = '100%'
    target.style.height = '100%'
    target.style.opacity = 1
    target.style.whiteSpace = 'nowrap'

    el.appendChild(ghost)
    el.appendChild(target)

    const st = scrollTriggerStart
      ? {
          trigger: el,
          start: scrollTriggerStart,
          once: true
        }
      : false

    gsap.to(target, {
      duration: 1,
      delay,
      scrollTrigger: st,
      ease: 'power2.in',
      scrambleText: {
        text,
        chars: '.,:;i1tL0@▒▓▓▓██',
        speed: 1.5,
        delimiter: ' ',
        rightToLeft,
        tweenLength: true
      },
      onComplete: withFalling ? () => fallingLetters(target) : undefined
    })
  },
  beforeUnmount() {}
}
