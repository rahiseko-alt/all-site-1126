import { getCurrentScope, onScopeDispose } from 'vue'

const events = new Map()

function tryOnScopeDispose(fn) {
  if (getCurrentScope()) {
    onScopeDispose(fn)
    return true
  }
  return false
}

export function useEventBus(key) {
  function on(listener) {
    const listeners = events.get(key) || new Set()
    listeners.add(listener)
    events.set(key, listeners)
    const _off = () => off(listener)
    tryOnScopeDispose(_off)
    return _off
  }

  function once(listener) {
    function _listener(...args) {
      off(_listener)
      listener(...args)
    }
    return on(_listener)
  }

  function off(listener) {
    const listeners = events.get(key)
    if (!listeners) return
    listeners.delete(listener)
    if (!listeners.size) reset()
  }

  function reset() {
    events.delete(key)
  }

  function emit(event, payload) {
    events.get(key)?.forEach(v => v(event, payload))
  }

  return { on, once, off, emit, reset }
}
