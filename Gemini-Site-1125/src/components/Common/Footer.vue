<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMainStore } from '../../stores/main'
import { useEventBus } from '../../utils/eventBus'
import { sound } from '../../utils/sound'
import { splitLines } from '../../utils/splitLines'

gsap.registerPlugin(ScrollTrigger)

const { common } = storeToRefs(useMainStore())

const textEl = ref(null)
const innerEl = ref(null)
const rootEl = ref(null)
const outerEl = ref(null)
const canvasEl = ref(null)
const copiedId = ref(null)

const onSocialClick = (e, item) => {
  if (!item.cUrl.startsWith('mailto:')) return
  const email = item.cUrl.replace('mailto:', '').split('?')[0]
  navigator.clipboard?.writeText(email).catch(() => {})
  useEventBus('CANVAS:RIPPLE').emit({
    x: e.clientX,
    y: e.clientY,
    power: 3
  })
  sound.chime()
  copiedId.value = item.id
  setTimeout(() => (copiedId.value = null), 1600)
}

onMounted(() => {
  if (!textEl.value) return
  document.fonts.ready.then(() => {
    splitLines({
      triggerEl: rootEl.value,
      linesEl: rootEl.value.querySelectorAll('p,.socials li'),
      duration: 0.7,
      stagger: 0.12,
      start: 'top 20%',
      once: true,
      fallingLetters: true
    })
  })
  gsap.set(innerEl.value, { y: '50%' })
  gsap.set(outerEl.value, { y: '-100%' })
  gsap.set(canvasEl.value, { y: '-50%' })
  gsap.to([innerEl.value, outerEl.value, canvasEl.value], {
    y: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: rootEl.value,
      start: 'top bottom',
      end: 'top top',
      scrub: true
    }
  })
  ScrollTrigger.create({
    trigger: rootEl.value,
    start: 'top 100%',
    onUpdate: self => {
      useEventBus('CANVAS:PROGRESS').emit('mail', self.progress)
    },
    onEnter: () => {
      useEventBus('CANVAS:ENTER').emit('mail')
    },
    onEnterBack: () => {
      useEventBus('CANVAS:ENTER').emit('mail')
    },
    onLeave: () => {
      useEventBus('CANVAS:LEAVE').emit('mail')
    },
    onLeaveBack: () => {
      useEventBus('CANVAS:LEAVE').emit('mail')
    }
  })
})
</script>

<template>
  <footer ref="rootEl" class="h-screen relative w-full overflow-hidden z-1">
    <div ref="outerEl" class="outer relative overflow-hidden w-full h-full p-20">
      <div ref="innerEl" class="inner h-full w-full">
        <canvas
          ref="canvasEl"
          class="footer-canvas absolute top-0 left-0 w-screen h-full invert"
        ></canvas>
        <div class="flex justify-between flex-col h-full w-full relative">
          <div class="site-grid-inner pt-20">
            <div
              ref="textEl"
              class="col-span-8 l:col-span-3 pl-20 pr-60"
              v-html="common.cFooterText"
            ></div>
            <ul class="socials col-span-8 mt-40 pl-20 l:pl-0 l:mt-0 l:col-span-3 l:col-start-9">
              <li v-for="item in common.cSocials" :key="item.id">
                <a
                  :href="item.cUrl"
                  rel="noopener"
                  target="_blank"
                  @click="e => onSocialClick(e, item)"
                  >{{ copiedId === item.id ? 'Copied ✓' : item.cLabel }}</a
                >
              </li>
            </ul>
          </div>
          <div class="site-grid-inner w-full items-end text-12 justify-between pb-20">
            <span class="hidden l:block col-span-1 opacity-50 pl-20">Fonts</span>
            <div class="col-span-2 pl-20 l:pl-0 l:col-span-1 l:col-start-2">
              <ul class="block">
                <li class="blockl:hidden opacity-50">Fonts</li>
                <li>Andale Mono</li>
                <li>Remus</li>
                <li>Saboneta</li>
              </ul>
            </div>
            <span class="hidden l:block col-span-1 col-start-11 opacity-50 text-right">design</span>
            <a
              href="https://bastienallard.com"
              target="_blank"
              rel="noopener"
              class="text-right l:text-left pr-20 block col-span-2 l:col-span-1 col-start-7 l:col-start-12"
            >
              <span class="block l:hidden opacity-50">design</span> Bastien Allard
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
