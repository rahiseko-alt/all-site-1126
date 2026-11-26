<script>
export default {
  name: 'DevGrid',
  data() {
    return {
      isShown: false
    }
  },
  mounted() {
    window.addEventListener('keydown', e => {
      if (e.altKey && e.code === 'KeyG') {
        this.isShown = !this.isShown
      }
    })
  }
}
</script>

<template>
  <div v-show="isShown" class="dev-grid">
    <ul class="site-grid h-screen">
      <li v-for="n in 12" :key="`li-${n}`"></li>
    </ul>
  </div>
</template>

<style scoped>
.dev-grid {
  pointer-events: none;
  z-index: 1000;
  width: 100%;
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
}
ul {
  opacity: 0.3;
}
li {
  background: red;
  height: 100%;
}
</style>
