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
}
