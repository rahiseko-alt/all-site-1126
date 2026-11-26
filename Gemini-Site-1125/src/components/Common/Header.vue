<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useMainStore } from '../../stores/main'
import { useEventBus } from '../../utils/eventBus'
import { sound } from '../../utils/sound'
import { startPixelTransition } from '../../utils/pixelTransition'

const { switchColor } = useMainStore()
const isSoundEnabled = ref(false)

onMounted(() => {
  isSoundEnabled.value = sound.enabled
})

const toggleSound = () => {
  isSoundEnabled.value = !isSoundEnabled.value
  sound.setEnabled(isSoundEnabled.value)
}

const onColorSwitch = e => {
  const x = e.clientX || window.innerWidth / 2
  const y = e.clientY || window.innerHeight - 40
  useEventBus('CANVAS:RIPPLE').emit({ x, y, power: 2 })
  sound.whoosh()
  startPixelTransition(x, y, async () => {
    switchColor()
    await nextTick()
  })
}
</script>

<template>
  <header
    class="bg-black text-white flex gap-8 items-center fixed bottom-30 p-8 rounded-[.3rem] z-10 left-1/2 -translate-x-1/2 text-12"
  >
    <button
      aria-label="color switcher"
      class="w-6 h-6 bg-current block"
      @click="onColorSwitch"
    ></button>
    <span class="whitespace-nowrap shrink-0">Romain Avalle</span>
    <span class="opacity-50 hidden s:inline-block whitespace-nowrap shrink-0"
      >Interactive Developer</span
    >
    <a
      href="mailto:romain.avalle@gmail.com"
      class="inline-block s:ml-20 whitespace-nowrap shrink-0"
    >
      Let's talk</a
    >
    <button
      :aria-label="isSoundEnabled ? 'Turn sound off' : 'Turn sound on'"
      :aria-pressed="isSoundEnabled"
      :class="[
        'whitespace-nowrap shrink-0 s:ml-12 transition-opacity',
        isSoundEnabled ? 'opacity-100' : 'opacity-50 line-through'
      ]"
      @click="toggleSound"
    >
      ♪
    </button>
  </header>
</template>
