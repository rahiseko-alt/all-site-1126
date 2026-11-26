<script setup>
import { ref, onMounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { fallingLetters } from '../../utils/fallingLetters'
import { useEventBus } from '../../utils/eventBus'

gsap.registerPlugin(ScrollTrigger)

const rootEl = ref(null)
const heroEl = ref(null)

onMounted(() => {
  document.fonts.ready.then(() => fallingLetters(heroEl.value.querySelectorAll('h1, h2')))
  setTimeout(() => {
    useEventBus('CANVAS:ENTER').emit('hero')
    window.scrollTo(0, 0)
  }, 1000)

  ScrollTrigger.create({
    trigger: rootEl.value,
    start: 'top 1%',
    end: 'bottom 30%',
    scrub: true,
    immediateRender: true,
    onUpdate: self => {
      useEventBus('CANVAS:PROGRESS').emit('hero', self.progress)
    },
    onEnter: () => {
      useEventBus('CANVAS:ENTER').emit('hero')
    },
    onEnterBack: () => {
      useEventBus('CANVAS:ENTER').emit('hero')
    },
    onLeave: () => {
      useEventBus('CANVAS:LEAVE').emit('hero')
    },
    onLeaveBack: () => {
      useEventBus('CANVAS:LEAVE').emit('hero')
    }
  })

  gsap.to(heroEl.value.querySelectorAll('h1, h2'), {
    opacity: 0,
    scrollTrigger: {
      trigger: rootEl.value,
      start: 'top top',
      end: 'bottom 0%',
      scrub: true
    }
  })
})
</script>

<template>
  <div class="hero h-[175vh] relative">
    <div ref="rootEl" class="fake-div w-full h-screen relative"></div>
    <div class="absolute h-full w-full top-0 left-0">
      <div ref="heroEl" class="sticky top-0 h-screen w-full site-grid items-center">
        <h1 class="col-span-4 l:col-span-3 l:text-right">
          <span class="inline-block bg-black text-white px-8 -mx-8 py-4 rounded-[.3rem]"
            >Romain Avalle</span
          >
        </h1>
        <h2 class="col-span-4 col-start-5 text-right l:text-left l:col-span-3 l:col-start-10">
          <span class="inline-block bg-black text-white px-8 -mx-8 py-4 rounded-[.3rem]"
            >Interactive Developer</span
          >
        </h2>
      </div>
    </div>
  </div>
</template>
