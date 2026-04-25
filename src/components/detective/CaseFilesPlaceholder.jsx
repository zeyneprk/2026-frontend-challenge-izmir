/**
 * Shown when no suspect is selected (center + right workspace).
 */
export function CaseFilesPlaceholder() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 border-l border-zinc-800/50 bg-zinc-950/40 px-6 py-12 text-center transition-opacity duration-300 ease-out"
      role="status"
      aria-live="polite"
    >
      <MagnifierIcon className="h-14 w-14 text-amber-500/40" aria-hidden />
      <div>
        <p className="font-serif text-lg font-medium text-zinc-200">
          Select a suspect to view case files
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Choose a name from the suspect list to open the timeline and evidence
          board.
        </p>
      </div>
    </div>
  )
}

function MagnifierIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="10" cy="10" r="6" />
      <path d="M14.5 14.5 21 21" strokeLinecap="round" />
      <path d="M8 10h4" strokeLinecap="round" className="opacity-50" />
    </svg>
  )
}
