const SKIP_TYPES = new Set(['control_head', 'control_button', 'control_image', 'control_captcha', 'control_divider'])

/**
 * Jotform submission answers are keyed by question id. Each value may include
 * `name` (field id), `answer` (user value), `text` (label), etc.
 * @param {Record<string, any> | null | undefined} answers
 * @returns {Record<string, string>}
 */
export function flattenJotformAnswers(answers) {
  if (!answers || typeof answers !== 'object') return {}

  const out = /** @type {Record<string, string>} */ ({})

  for (const qid of Object.keys(answers)) {
    const cell = answers[qid]
    if (!cell || typeof cell !== 'object') continue
    if (cell.type && SKIP_TYPES.has(String(cell.type))) continue

    const name = cell.name
    if (typeof name !== 'string' || !name) continue

    const raw = pickJotformCellValue(cell) ?? ''
    out[name] = formatAnswerValue(raw)
  }

  return out
}

/**
 * Prefer `answer` (user input); Jotform often duplicates the label in `text`.
 * @param {Record<string, any>} cell
 * @returns {unknown}
 */
function pickJotformCellValue(cell) {
  if (Object.prototype.hasOwnProperty.call(cell, 'answer') && cell.answer != null) {
    return cell.answer
  }
  if (cell.prettyFormat != null && cell.prettyFormat !== '') return cell.prettyFormat
  if (cell.selected != null && cell.selected !== '') return cell.selected
  return null
}

/**
 * @param {unknown} raw
 * @returns {string}
 */
function formatAnswerValue(raw) {
  if (raw == null) return ''
  if (typeof raw === 'string') return raw
  if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw)
  if (Array.isArray(raw)) return raw.map(formatAnswerValue).filter(Boolean).join(', ')
  if (typeof raw === 'object') {
    if ('lat' in raw && 'lng' in raw) {
      return `${raw.lat},${raw.lng}`
    }
    try {
      return JSON.stringify(raw)
    } catch {
      return String(raw)
    }
  }
  return String(raw)
}
