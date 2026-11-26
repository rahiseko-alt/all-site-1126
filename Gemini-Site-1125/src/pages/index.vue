<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import cmsData from '../data/cmsData.json'
import HomeHero from '../components/Home/Hero.vue'
import HomeIntroduction from '../components/Home/Introduction.vue'
import HomeWorks from '../components/Home/Works.vue'
import CommonFooter from '../components/Common/Footer.vue'

const CommonScene = defineAsyncComponent(() => import('../components/Common/Scene.vue'))

gsap.registerPlugin(ScrollTrigger)

const cIndex = ref(cmsData.index.cIndex)
const allCWorks = ref(cmsData.index.allCWorks)

const AWARD_MATCHERS = [
  { label: 'Awwwards', match: /^awwwards/i },
  { label: 'FWA', match: /^fwa(?!wwwards)/i },
  { label: 'CssDesignAwards', match: /^css/i },
  { label: 'IDEA', match: /idea/i },
  { label: 'Webbie', match: /^webb/i },
  { label: 'Lovie', match: /^lovie/i },
  { label: 'Fwawwwards', match: /^fwawwwards/i }
]

const recognitions = computed(() => {
  const counts = new Map()
  for (const work of allCWorks.value) {
    for (const { cLabel } of work.cRecognitions || []) {
      const found = AWARD_MATCHERS.find(({ match }) => match.test(cLabel))
      const label = found ? found.label : cLabel.trim().split(/\s+/)[0]
      counts.set(label, (counts.get(label) || 0) + 1)
    }
  }
  return [...counts]
    .map(([cLabel, cNumber]) => ({ cLabel, cNumber }))
    .sort((a, b) => b.cNumber - a.cNumber)
})

const images = computed(() => [
  { slug: 'hero', ...cIndex.value.cHero, isMobile: false },
  { slug: 'hero', ...cIndex.value.cHeroMobile, isMobile: true },
  { slug: 'projects', ...cIndex.value.cProjects, isMobile: false },
  { slug: 'projects', ...cIndex.value.cProjectsMobile, isMobile: true },
  { slug: 'mail', ...cIndex.value.cMail, isMobile: false },
  { slug: 'mail', ...cIndex.value.cMailMobile, isMobile: true }
])

const shouldMountScene = ref(false)

onMounted(() => {
  document.title = 'Romain Avalle - Interactive developper'
  const activate = () => (shouldMountScene.value = true)
  if (window.requestIdleCallback) {
    window.requestIdleCallback(activate, { timeout: 1500 })
  } else {
    setTimeout(activate, 200)
  }
})
</script>

<template>
  <div ref="root" class="index relative w-full">
    <div class="relative bg z-[1]">
      <CommonScene v-if="shouldMountScene" :images="images" class="z-0" />
      <div class="relative">
        <HomeHero />
        <HomeIntroduction :description="cIndex.cDescription" :recognitions="recognitions" />
        <HomeWorks :works="allCWorks" />
      </div>
    </div>
    <CommonFooter />
  </div>
</template>
