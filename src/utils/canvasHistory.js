/**
 * Undo / Redo history for Fabric.js canvas
 * Stores JSON snapshots on every meaningful change.
 * Max 50 states to keep memory reasonable.
 */

const MAX = 50

export function createHistory(fabricCanvas) {
  let stack = []   // past states
  let future = []  // redo states
  let paused = false

  function snapshot() {
    if (paused) return
    const json = JSON.stringify(fabricCanvas.toJSON())
    // Avoid duplicate consecutive states
    if (stack.length && stack[stack.length - 1] === json) return
    stack.push(json)
    if (stack.length > MAX) stack.shift()
    future = [] // clear redo on new action
  }

  function undo() {
    if (stack.length < 2) return // need at least 2: current + one before
    future.push(stack.pop())     // move current to redo
    const prev = stack[stack.length - 1]
    restore(prev)
  }

  function redo() {
    if (!future.length) return
    const next = future.pop()
    stack.push(next)
    restore(next)
  }

  function restore(json) {
    paused = true
    fabricCanvas.loadFromJSON(JSON.parse(json), () => {
      fabricCanvas.renderAll()
      paused = false
    })
  }

  function canUndo() { return stack.length > 1 }
  function canRedo() { return future.length > 0 }

  // Take initial snapshot
  snapshot()

  // Listen to canvas events
  const events = ['object:added', 'object:removed', 'object:modified']
  events.forEach(e => fabricCanvas.on(e, snapshot))

  function destroy() {
    events.forEach(e => fabricCanvas.off(e, snapshot))
  }

  return { undo, redo, canUndo, canRedo, snapshot, destroy }
}
