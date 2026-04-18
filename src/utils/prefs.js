/**
 * Lightweight preference memory using localStorage.
 * Remembers: last font, last template, last export format/quality.
 */

const KEY = 'miansnap_prefs'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}

function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...load(), ...data })) } catch {}
}

export const prefs = {
  getLastFont:    ()      => load().lastFont    || null,
  setLastFont:    (font)  => save({ lastFont: font }),

  getLastTemplate: ()         => load().lastTemplate || null,
  setLastTemplate: (template) => save({ lastTemplate: template }),

  getExportQuality: ()  => load().exportQuality || '720p',
  setExportQuality: (q) => save({ exportQuality: q }),

  getExportFormat: ()  => load().exportFormat || 'jpg',
  setExportFormat: (f) => save({ exportFormat: f }),

  getLastBgPreset: ()       => load().lastBgPreset || null,
  setLastBgPreset: (preset) => save({ lastBgPreset: preset }),

  // Brand font settings — persist across sessions
  getBrandFont:      ()     => load().brandFont      || 'Impact',
  setBrandFont:      (f)    => save({ brandFont: f }),
  getBrandFontSize:  ()     => load().brandFontSize  || 64,
  setBrandFontSize:  (s)    => save({ brandFontSize: s }),
  getBrandColor:     ()     => load().brandColor     || '#ffffff',
  setBrandColor:     (c)    => save({ brandColor: c }),
  getBrandStroke:    ()     => load().brandStroke    || '#000000',
  setBrandStroke:    (c)    => save({ brandStroke: c }),
  getBrandStrokeW:   ()     => load().brandStrokeW   || 2,
  setBrandStrokeW:   (w)    => save({ brandStrokeW: w }),
}
