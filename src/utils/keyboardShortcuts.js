/**
 * Keyboard shortcuts for the canvas editor.
 *
 * Ctrl+Z        Undo
 * Ctrl+Shift+Z  Redo
 * Ctrl+Y        Redo (alternate)
 * Ctrl+D        Duplicate selected object
 * Delete/Backspace  Delete selected object
 * Escape        Deselect all
 * Arrow keys    Nudge selected object (1px, +Shift = 10px)
 * Ctrl+A        Select all objects
 * Ctrl+C        Copy
 * Ctrl+V        Paste
 * Ctrl+]        Bring forward
 * Ctrl+[        Send backward
 * Ctrl+Shift+]  Bring to front
 * Ctrl+Shift+[  Send to back
 */
import { fabric } from '../lib/fabric'

let _clipboard = null

export function setupKeyboardShortcuts(fabricCanvas, history) {
  function isTyping(e) {
    const tag = document.activeElement?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
    if (document.activeElement?.isContentEditable) return true
    // Fabric IText in editing mode
    const obj = fabricCanvas.getActiveObject()
    if (obj && (obj.type === 'i-text' || obj.type === 'textbox') && obj.isEditing) return true
    return false
  }

  function handler(e) {
    if (!fabricCanvas) return
    const ctrl = e.ctrlKey || e.metaKey
    const shift = e.shiftKey
    const key = e.key

    // ── Undo / Redo ──────────────────────────────────────────────
    if (ctrl && !shift && key === 'z') {
      e.preventDefault()
      history?.undo()
      window.showToast?.('↩ Reverted', 'info', 1200)
      return
    }
    if ((ctrl && shift && key === 'Z') || (ctrl && key === 'y') || (ctrl && key === 'Y')) {
      e.preventDefault()
      history?.redo()
      window.showToast?.('↪ Redone', 'info', 1200)
      return
    }

    // ── Select all ───────────────────────────────────────────────
    if (ctrl && key === 'a') {
      e.preventDefault()
      fabricCanvas.discardActiveObject()
      const sel = new fabric.ActiveSelection(fabricCanvas.getObjects(), { canvas: fabricCanvas })
      fabricCanvas.setActiveObject(sel)
      fabricCanvas.requestRenderAll()
      return
    }

    // ── Copy ─────────────────────────────────────────────────────
    if (ctrl && key === 'c') {
      const obj = fabricCanvas.getActiveObject()
      if (!obj) return
      obj.clone((cloned) => { _clipboard = cloned })
      return
    }

    // ── Paste ────────────────────────────────────────────────────
    if (ctrl && key === 'v') {
      if (!_clipboard) return
      e.preventDefault()
      _clipboard.clone((cloned) => {
        fabricCanvas.discardActiveObject()
        cloned.set({ left: cloned.left + 20, top: cloned.top + 20, evented: true })
        if (cloned.type === 'activeSelection') {
          cloned.canvas = fabricCanvas
          cloned.forEachObject(obj => fabricCanvas.add(obj))
          cloned.setCoords()
        } else {
          fabricCanvas.add(cloned)
        }
        fabricCanvas.setActiveObject(cloned)
        fabricCanvas.requestRenderAll()
        _clipboard = cloned // allow repeated paste with offset
        _clipboard.set({ left: _clipboard.left + 20, top: _clipboard.top + 20 })
      })
      return
    }

    // ── Duplicate ────────────────────────────────────────────────
    if (ctrl && key === 'd') {
      e.preventDefault()
      const obj = fabricCanvas.getActiveObject()
      if (!obj) return
      obj.clone((cloned) => {
        cloned.set({ left: obj.left + 20, top: obj.top + 20 })
        fabricCanvas.add(cloned)
        fabricCanvas.setActiveObject(cloned)
        fabricCanvas.requestRenderAll()
      })
      return
    }

    // ── Delete ───────────────────────────────────────────────────
    if ((key === 'Delete' || key === 'Backspace') && !isTyping(e)) {
      e.preventDefault()
      const obj = fabricCanvas.getActiveObject()
      if (!obj) return
      if (obj.type === 'activeSelection') {
        obj.forEachObject(o => fabricCanvas.remove(o))
        fabricCanvas.discardActiveObject()
      } else {
        fabricCanvas.remove(obj)
      }
      fabricCanvas.requestRenderAll()
      return
    }

    // ── Escape ───────────────────────────────────────────────────
    if (key === 'Escape') {
      fabricCanvas.discardActiveObject()
      fabricCanvas.requestRenderAll()
      return
    }
    // ── Arrow nudge ──────────────────────────────────────────────
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key) && !isTyping(e)) {
      const obj = fabricCanvas.getActiveObject()
      if (!obj) return
      e.preventDefault()
      const step = shift ? 10 : 1
      if (key === 'ArrowLeft')  obj.set('left', obj.left - step)
      if (key === 'ArrowRight') obj.set('left', obj.left + step)
      if (key === 'ArrowUp')    obj.set('top',  obj.top  - step)
      if (key === 'ArrowDown')  obj.set('top',  obj.top  + step)
      obj.setCoords()
      fabricCanvas.requestRenderAll()
      return
    }

    // ── Layer order ──────────────────────────────────────────────
    if (ctrl && key === ']') {
      e.preventDefault()
      const obj = fabricCanvas.getActiveObject()
      if (!obj) return
      shift ? fabricCanvas.bringToFront(obj) : fabricCanvas.bringForward(obj)
      fabricCanvas.requestRenderAll()
      return
    }
    if (ctrl && key === '[') {
      e.preventDefault()
      const obj = fabricCanvas.getActiveObject()
      if (!obj) return
      shift ? fabricCanvas.sendToBack(obj) : fabricCanvas.sendBackwards(obj)
      fabricCanvas.requestRenderAll()
      return
    }
  }

  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}
