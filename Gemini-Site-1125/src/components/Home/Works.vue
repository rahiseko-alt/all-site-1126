<script setup>
import { ref, onMounted } from 'vue'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEventBus } from '../../utils/eventBus'
import HomeWork from './Work.vue'

const props = defineProps({
  works: Array
})

const rootEl = ref(null)

onMounted(() => {
  ScrollTrigger.create({
    trigger: rootEl.value,
    start: 'top 75%',
    end: 'top 0%',
    onUpdate: self => {
      useEventBus('CANVAS:PROGRESS').emit('projects', self.progress)
    },
    onEnter: () => {
      useEventBus('CANVAS:ENTER').emit('projects')
    },
    onEnterBack: () => {
      useEventBus('CANVAS:ENTER').emit('projects')
    },
    onLeave: () => {
      useEventBus('CANVAS:LEAVE').emit('projects')
    },
    onLeaveBack: () => {
      useEventBus('CANVAS:LEAVE').emit('projects')
    }
  })
})
</script>

<template>
  <section ref="rootEl" class="py-[50vh]">
    <ul class="px-20">
      <HomeWork
        v-for="(work, index) in props.works"
        :key="work.id"
        :data="work"
        :position="index + 1"
      />
    </ul>
  </section>
</template>
