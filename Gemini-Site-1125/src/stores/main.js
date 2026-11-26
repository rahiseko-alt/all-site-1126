import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    theme: 'white',
    common: {},
    isLoaded: false,
    isKonami: false,
    isSceneReady: false
  }),
  getters: {},
  actions: {
    switchColor() {
      this.theme = this.theme === 'white' ? 'black' : 'white'
    },
    setLoaderDone() {
      this.isLoaded = true
    },
    setCommon(common) {
      this.common = common
    },
    setSceneReady(ready) {
      this.isSceneReady = ready
    },
    setKonami(konami) {
      this.isKonami = konami
    }
  }
})
