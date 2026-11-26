<script setup>
import { ref, onMounted } from 'vue'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { splitLines } from '../../utils/splitLines'
import { useEventBus } from '../../utils/eventBus'

const props = defineProps(['description', 'recognitions'])

const rootEl = ref(null)
const textEl = ref(null)

onMounted(() => {
  document.fonts.ready.then(() => {
    splitLines({
      triggerEl: textEl.value,
      linesEl: textEl.value.querySelectorAll('p'),
      duration: 0.4,
      stagger: 0.08,
      start: 'top 80%',
      once: true,
      ariaHidden: true,
      fallingLetters: true
    })

    ScrollTrigger.create({
      trigger: rootEl.value,
      start: 'top 50%',
      end: 'bottom 75%',
      onEnter: () => {
        useEventBus('CANVAS:ENTER_ROMO').emit()
      },
      onEnterBack: () => {
        useEventBus('CANVAS:ENTER_ROMO').emit()
      },
      onLeave: () => {
        useEventBus('CANVAS:LEAVE_ROMO').emit()
      },
      onLeaveBack: () => {
        useEventBus('CANVAS:LEAVE_ROMO').emit()
      }
    })
  })
})
</script>

<template>
  <div ref="rootEl" class="introduction site-grid pb-[25vh] relative">
    <div class="screen-reader-text" v-html="props.description"></div>
    <div
      ref="textEl"
      class="col-span-8 l:col-span-3 l:col-start-6"
      aria-hidden="true"
      v-html="props.description"
    ></div>
    <div class="col-span-8 l:col-span-3 l:col-start-9">
      <ul class="mt-60 l:mt-0 l:sticky top-[40vh]">
        <li v-for="item in props.recognitions" :key="item.cLabel">
          <span
            v-scramble-text="{ scrollTriggerStart: 'top 80%', fallingLetters: true }"
            class="block"
            >{{ item.cLabel }} × {{ item.cNumber }}</span
          >
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.screen-reader-text {
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  position: absolute;
  overflow: hidden;
}
</style>
