/**
 * Stable slight rotation (degrees) from an id string for post-it variety.
 * @param {string} id
 * @returns {number} roughly in [-3.5, 3.5]
 */
export function rotationFromId(id) {
  let h = 0
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) % 9973
  }
  return ((h % 71) / 10 - 3.5)
}

/**
 * @param {string} id
 * @returns {string} tailwind bg gradient class pair index
 */
export function postitColorIndex(id) {
  let h = 0
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 17 + id.charCodeAt(i)) % 10007
  }
  return h % 5
}

const POSTIT_PALETTES = [
  'from-amber-200 via-yellow-100 to-amber-100',
  'from-emerald-200/95 via-teal-50 to-emerald-100',
  'from-sky-200/90 via-sky-50 to-cyan-100',
  'from-violet-200/90 via-fuchsia-50 to-violet-100',
  'from-rose-200/90 via-orange-50 to-amber-50',
]

/**
 * @param {string} id
 * @returns {string}
 */
export function postitPaletteClass(id) {
  return POSTIT_PALETTES[postitColorIndex(id)]
}
