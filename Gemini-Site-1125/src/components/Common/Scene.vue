<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore } from '../../stores/main'
import { SceneController } from '../../utils/sceneController'

const props = defineProps({
  images: Array,
  game: Boolean
})

const emit = defineEmits(['ready'])

const mainStore = useMainStore()
const { theme, isKonami } = storeToRefs(mainStore)
const { setSceneReady } = mainStore

let sceneInstance = null

watch(theme, val => sceneInstance?.setTheme(val))
watch(isKonami, () => sceneInstance?.setKonami())

onMounted(() => {
  sceneInstance = new SceneController(theme.value, props.images)
  sceneInstance.setGame(props.game)
  emit('ready', sceneInstance)
  setSceneReady(true)
})

onBeforeUnmount(() => {
  setSceneReady(false)
  sceneInstance?.destroy()
  sceneInstance = null
})
</script>

<template>
  <div class="common-scene fixed top-0 left-0 w-full pointer-events-none">
    <canvas id="c"></canvas>
  </div>
</template>
