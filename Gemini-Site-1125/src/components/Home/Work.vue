<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEventBus } from '../../utils/eventBus'

const props = defineProps({
  data: Object,
  position: Number
})

const hover = ref(null)
const hoverInner = ref(null)
const rootEl = ref(null)
const isInScreen = ref(false)
const isHover = ref(false)

const formattedPos = computed(() => (props.position < 10 ? `0${props.position}` : props.position))

const marqueeHtml = computed(() => {
  const sp = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
  let str =
    props.data.cRecognitions.length === 0
      ? `${formattedPos.value}${sp}${props.data.cTitle}↗${sp}`
      : ''
  for (let i = 0; i < props.data.cRecognitions.length; i++) {
    str += `${sp}${formattedPos.value}${sp}${props.data.cTitle}↗`
    str += `${sp}${props.data.cRecognitions[i].cLabel}`
  }
  while (str.length < 2000) {
    str += str
  }
  return str
})

const agencyLabel = computed(
  () => `${props.data.cAgency.cTitle}${props.data.cWith ? ` w/ ${props.data.cWith}` : ''}`
)

const onMouseenter = e => {
  useEventBus('WORK:ENTER').emit(props.data.cTitle)
  isHover.value = true
  const dir = e.layerY > 10 ? 'bottom' : 'top'
  gsap.fromTo(
    hover.value,
    { y: dir === 'top' ? '-101%' : '101%' },
    { y: '0', duration: 0.5, ease: 'power2.out', overwrite: 'all' }
  )
  gsap.fromTo(
    hoverInner.value,
    { y: dir === 'top' ? '100%' : '-100%', scaleY: 0 },
    { y: '0%', scaleY: 1, duration: 0.5, ease: 'power2.out', overwrite: 'all' }
  )
}

const onMouseleave = e => {
  const dir = e.layerY > 10 ? 'top' : 'bottom'
  gsap.to(hover.value, {
    y: dir === 'top' ? '101%' : '-101%',
    duration: 0.5,
    ease: 'power2.out',
    overwrite: 'all',
    onComplete: () => (isHover.value = false)
  })
  gsap.to(hoverInner.value, {
    y: dir === 'top' ? '-100%' : '100%',
    scaleY: 0,
    duration: 0.5,
    ease: 'power2.out',
    overwrite: 'all'
  })
}

const onEnterScreen = () => {
  isInScreen.value = true
}

onMounted(() => {
  ScrollTrigger.create({
    trigger: rootEl.value,
    start: 'top 95%',
    once: true,
    onEnter: onEnterScreen
  })
  nextTick().then(() => {
    if (hover.value) {
      gsap.set(hover.value, { y: '-101%' })
    }
  })
})
</script>

<template>
  <li
    ref="rootEl"
    :class="['home-work block relative', { isInScreen, isHover }]"
  >
    <a
      :href="props.data.cUrl"
      target="_blank"
      rel="noopener"
      class="relative pt-5 block h-40 l:h-50 -mx-20"
      @mouseenter="onMouseenter"
      @mouseleave="onMouseleave"
    >
      <span class="site-grid text-small items-start">
        <span
          v-scramble-text="{ scrollTriggerStart: 'top 95%' }"
          class="hidden l:col-span-2 l:block text-large"
          >{{ formattedPos }}</span
        >
        <span
          v-scramble-text="{ scrollTriggerStart: 'top 95%' }"
          class="l:col-span-3 l:col-start-3 block text-large"
          >{{ props.data.cTitle }}</span
        >
        <span class="hidden col-span-5 col-start-7 l:flex justify-between items-start">
          <span
            v-scramble-text="{ scrollTriggerStart: 'top 95%' }"
            class="flex-1"
            v-html="agencyLabel"
          ></span>
          <span
            v-scramble-text="{ scrollTriggerStart: 'top 95%' }"
            class="hidden l:flex flex-1"
            >{{ props.data.cPosition }}</span
          >
          <span
            v-scramble-text="{ scrollTriggerStart: 'top 95%' }"
            class="hidden l:flex flex-1"
            >{{
              props.data.cRecognitions.length
                ? `${props.data.cRecognitions.length} Awards`
                : ''
            }}</span
          >
        </span>
        <span
          v-scramble-text="{ scrollTriggerStart: 'top 95%' }"
          class="hidden l:col-span-1 l:col-start-12 l:flex text-right"
          >{{ new Date(props.data.cDate).getFullYear() }}</span
        >
      </span>
      <span
        class="hover pointer-events-none text-large absolute left-0 w-full top-0 h-40 l:h-50 overflow-hidden"
      >
        <span
          ref="hover"
          class="text-white bg-black overflow-hidden h-full leading-[4rem] l:leading-[5rem] block"
        >
          <span ref="hoverInner" class="block">
            <span class="block" v-html="marqueeHtml"></span>
          </span>
        </span>
      </span>
    </a>
  </li>
</template>

<style scoped>
.home-work:before {
  content: "";
  transform-origin: 0;
  background: #000;
  width: 100%;
  height: 1px;
  transition: transform 0.7s ease-out 0.11s;
  position: absolute;
  top: 0;
  transform: scaleX(0);
}
:global(main.black) .home-work:before {
  background: #fff;
}
.home-work.isInScreen:before {
  transform: scaleX(1);
}
.hover span span span {
  white-space: nowrap;
}
.home-work.isHover .hover span span span {
  animation: 60s linear infinite infinite-scroll;
}
@keyframes infinite-scroll {
  0% {
    transform: translate(0);
  }
  to {
    transform: translate(-200%);
  }
}
</style>
