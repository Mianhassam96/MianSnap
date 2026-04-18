/**
 * Undo / Redo history — JSON snapshots, max 30 states.
 * Debounced to avoid stacking rapid changes.
 */

const MAX = 30
let debounceTimer = null

export function createHistory(fabricCanvas) {
  let stack = []
  let future = []
  let paused = false

  function snapshot() {
    if (paused) return
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      try {
        const json = JSON.stringify(fabricCanvas.toJSON())
        if (stack.length && stack[stack.length - 1] === json) return
        stack.push(json)
        if (stack.length > MAX) stack.shift()
        future = []
      } catch (_) {}
    }, 150)
  }

  function undo() {
    if (stack.length < 2) return
    future.push(stack.pop())
    restore(stack[stack.length - 1])
  }

  function redo() {
    if (!future.length) return
    const next = future.pop()
    stack.push(next)
    restore(next)
  }

  function restore(json) {
    paused = true
    try {
      fabricCanvas.loadFromJSON(JSON.parse(json), () => {
        fabricCanvas.renderAll()
        paused = false
      })
    } catch (_) {
      paused = false
    }
  }

  function canUndo() { return stack.length > 1 }
  function canRedo() { return future.length > 0 }

  function clear() {
    stack = []
    future = []
    clearTimeout(debounceTimer)
  }

  // Initial snapshot
  snapshot()

  const events = ['object:added', 'object:removed', 'object:modified']
  events.forEach(e => fabricCanvas.on(e, snapshot))

  function destroy() {
    clearTimeout(debounceTimer)
    events.forEach(e => fabricCanvas.off(e, snapshot))
    stack = []
    future = []
  }

  return { undo, redo, canUndo, canRedo, snapshot, clear, destroy }
}
