<script setup>
import { ref, shallowRef, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import gsap from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { useMainStore } from '../stores/main'
import cmsData from '../data/cmsData.json'
import ErrorBrickBreaker from '../components/Error/BrickBreaker.vue'

const CommonScene = defineAsyncComponent(() => import('../components/Common/Scene.vue'))

gsap.registerPlugin(ScrambleTextPlugin)

const props = defineProps({
  error: Object
})

const router = useRouter()
const { theme } = storeToRefs(useMainStore())

const statusCode = computed(() => props.error?.statusCode || 404)
const is404 = computed(() => statusCode.value === 404)

const sceneRef = shallowRef(null)
const backEl = ref(null)
const backLabelEl = ref(null)

const images = computed(() => {
  const idx = cmsData.index?.cIndex
  return idx?.cHero
    ? [
        { slug: 'hero', ...idx.cHero, isMobile: false },
        { slug: 'hero', ...(idx.cHeroMobile ?? idx.cHero), isMobile: true }
      ]
    : []
})

const goHome = () => {
  router.push('/')
}

onMounted(async () => {
  document.title = is404.value ? 'Page not found - Romain Avalle' : 'Error - Romain Avalle'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(backEl.value, { clipPath: 'none' })
    return
  }
  await document.fonts.ready
  if (!backLabelEl.value) return
  const text = backLabelEl.value.textContent
  gsap.set(backLabelEl.value, { width: backLabelEl.value.offsetWidth })
  gsap
    .timeline({ delay: 1 })
    .to(backEl.value, {
      clipPath: 'inset(0 0% 0 0 round .3rem)',
      duration: 0.7,
      ease: 'power3.inOut'
    })
    .to(
      backLabelEl.value,
      {
        duration: 0.8,
        ease: 'none',
        scrambleText: {
          text,
          chars: '░▒▓█',
          speed: 1.5,
          revealDelay: 0.2
        }
      },
      0.1
    )
})
</script>

<template>
  <div class="bg relative w-full h-screen overflow-hidden select-none touch-none">
    <CommonScene
      v-if="images.length"
      :images="images"
      game
      @ready="s => (sceneRef = s)"
    />
    <ErrorBrickBreaker :scene="sceneRef" :theme="theme" />
    <div class="site-grid relative pt-20">
      <div class="col-span-8 l:col-span-3">
        <p class="text-12 opacity-50">Error {{ statusCode }}</p>
        <h1 v-scramble-text="{ fallingLetters: true }">
          {{ is404 ? 'Page not found' : 'Something broke' }}
        </h1>
        <a
          ref="backEl"
          href="/"
          class="back flex w-fit items-center gap-6 mt-16 -mx-8 whitespace-nowrap bg-black text-white px-8 py-4 rounded-[.3rem]"
          @click.prevent="goHome"
        >
          <span class="arrow">←</span>
          <span ref="backLabelEl" class="overflow-hidden">Back home</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(main.black) .back {
  color: #000;
  background: #fff;
}
.back {
  clip-path: inset(0 100% 0 0 round 0.3rem);
}
.back .arrow {
  transition: transform 0.3s;
}
.back:hover .arrow {
  transform: translate(-0.4rem);
}
</style>
