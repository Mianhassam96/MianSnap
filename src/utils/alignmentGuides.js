/**
 * Snap-to-grid + alignment guides for Fabric.js canvas
 * Shows center/edge guide lines when objects are near alignment points
 */

const SNAP_THRESHOLD = 10
const GRID_SIZE = 20

export function setupAlignmentGuides(fabricCanvas) {
  if (!fabricCanvas) return

  let guideLines = []

  function clearGuides() {
    guideLines.forEach((l) => fabricCanvas.remove(l))
    guideLines = []
  }

  function drawGuide(x1, y1, x2, y2) {
    const { fabric } = window
    if (!fabric) return
    const line = new fabric.Line([x1, y1, x2, y2], {
      stroke: 'rgba(124,58,237,0.7)',
      strokeWidth: 1,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      excludeFromExport: true,
      _isGuide: true,
    })
    fabricCanvas.add(line)
    guideLines.push(line)
  }

  fabricCanvas.on('object:moving', (e) => {
    clearGuides()
    const obj = e.target
    const cw = fabricCanvas.width
    const ch = fabricCanvas.height
    const cx = obj.left + (obj.width * obj.scaleX) / 2
    const cy = obj.top + (obj.height * obj.scaleY) / 2

    // Snap to canvas center X
    if (Math.abs(cx - cw / 2) < SNAP_THRESHOLD) {
      obj.set('left', cw / 2 - (obj.width * obj.scaleX) / 2)
      drawGuide(cw / 2, 0, cw / 2, ch)
    }
    // Snap to canvas center Y
    if (Math.abs(cy - ch / 2) < SNAP_THRESHOLD) {
      obj.set('top', ch / 2 - (obj.height * obj.scaleY) / 2)
      drawGuide(0, ch / 2, cw, ch / 2)
    }
    // Snap to canvas edges
    if (Math.abs(obj.left) < SNAP_THRESHOLD) { obj.set('left', 0); drawGuide(0, 0, 0, ch) }
    if (Math.abs(obj.top) < SNAP_THRESHOLD) { obj.set('top', 0); drawGuide(0, 0, cw, 0) }
    if (Math.abs(obj.left + obj.width * obj.scaleX - cw) < SNAP_THRESHOLD) {
      obj.set('left', cw - obj.width * obj.scaleX)
      drawGuide(cw, 0, cw, ch)
    }
  })

  fabricCanvas.on('object:moved', clearGuides)
  fabricCanvas.on('selection:cleared', clearGuides)

  return clearGuides
}

export function setupSnapToGrid(fabricCanvas, enabled = false) {
  if (!fabricCanvas) return
  fabricCanvas.on('object:moving', (e) => {
    if (!enabled) return
    const obj = e.target
    obj.set({
      left: Math.round(obj.left / GRID_SIZE) * GRID_SIZE,
      top: Math.round(obj.top / GRID_SIZE) * GRID_SIZE,
    })
  })
}
