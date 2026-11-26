<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore } from './stores/main'
import cmsData from './data/cmsData.json'
import CommonHeader from './components/Common/Header.vue'
import CommonLoader from './components/Common/Loader.vue'
import DevGrid from './components/DevGrid.vue'

const mainStore = useMainStore()
const { setCommon, setKonami } = mainStore
const { theme, isLoaded } = storeToRefs(mainStore)

setCommon(cmsData.common.cCommon)

const isKonamiLocal = ref(false)
const KONAMI_SEQ = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
]
let konamiIdx = 0

onMounted(() => {
  window.addEventListener('keydown', e => {
    if (e.key === KONAMI_SEQ[konamiIdx]) {
      konamiIdx++
      if (konamiIdx === KONAMI_SEQ.length) {
        isKonamiLocal.value = true
        setKonami(isKonamiLocal.value)
        konamiIdx = 0
      }
    } else {
      konamiIdx = 0
    }
  })
})
</script>

<template>
  <main :class="[theme, isKonamiLocal ? 'konami' : '']">
    <CommonHeader />
    <Transition name="fade">
      <CommonLoader v-if="!isLoaded" />
    </Transition>
    <RouterView />
    <DevGrid />
  </main>
</template>
