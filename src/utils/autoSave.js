/**
 * Auto-save debouncer — saves canvas JSON to IndexedDB
 * after 2 seconds of inactivity
 */
import { saveProject } from './projectStorage'

let timer = null

export function setupAutoSave(fabricCanvas, getProjectName) {
  if (!fabricCanvas) return

  const save = async () => {
    const json = fabricCanvas.toJSON()
    const name = getProjectName() || 'Untitled Project'
    try {
      await saveProject({ name: `[Auto] ${name}`, canvas: json, savedAt: Date.now(), isAuto: true })
    } catch (_) {}
  }

  const debounced = () => {
    clearTimeout(timer)
    timer = setTimeout(save, 2000)
  }

  fabricCanvas.on('object:added', debounced)
  fabricCanvas.on('object:removed', debounced)
  fabricCanvas.on('object:modified', debounced)

  return () => {
    clearTimeout(timer)
    fabricCanvas.off('object:added', debounced)
    fabricCanvas.off('object:removed', debounced)
    fabricCanvas.off('object:modified', debounced)
  }
}
