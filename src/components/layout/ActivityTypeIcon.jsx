/**
 * @param { { type: 'tip' | 'sighting' | 'checkin' | 'message' | 'note' } } props
 */
export function ActivityTypeIcon({ type }) {
  const common = 'h-3.5 w-3.5 shrink-0'
  const stroke = 'currentColor'
  const strokeW = 1.75
  const aria = `Last activity: ${type}`

  if (type === 'checkin') {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeW}
        aria-label={aria}
        role="img"
      >
        <path d="M12 20s7-4.5 7-10a7 7 0 0 0-14 0c0 5.5 7 10 7 10Z" />
        <circle cx="12" cy="10" r="2.2" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  if (type === 'message') {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeW}
        aria-label={aria}
        role="img"
      >
        <path d="M4 5h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-5 4v-4.5" />
        <path d="M7 9h4M7 12h6" className="opacity-70" />
      </svg>
    )
  }
  if (type === 'sighting') {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeW}
        aria-label={aria}
        role="img"
      >
        <path d="M1 12s4-6 11-6 11 6 11 6-4 6-11 6S1 12 1 12Z" />
        <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  if (type === 'tip') {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeW}
        aria-label={aria}
        role="img"
      >
        <path d="M12 2a6 6 0 0 0-6 6c0 3 1 3 2 6h8c1-3 2-3 2-6a6 6 0 0 0-6-6Z" />
        <path d="M10 9h.01M10 5h.01" strokeLinecap="round" />
        <path d="M9 13h2M10 20v-3" className="opacity-80" />
      </svg>
    )
  }
  return (
    <svg
      className={common}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeW}
      aria-label={aria}
      role="img"
    >
      <path d="M5 3h9l3 3v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M8 7h4M8 11h5M8 15h2" className="opacity-70" />
    </svg>
  )
}
