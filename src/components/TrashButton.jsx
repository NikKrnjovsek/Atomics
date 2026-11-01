import { useDroppable } from '@dnd-kit/core'
import './TrashButton.css'

// nov cilj za brisanje (prej je to vlogo imel Sidebar prek SIDEBAR_ID).
export const TRASH_ID = 'trash'

function TrashIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

// Floating island delete gumb
// (prek obstoječega removeFromCanvas v SandboxPage). Med vlečenjem elementa s platna se poudari.
function TrashButton() {
  const { setNodeRef, isOver, active } = useDroppable({ id: TRASH_ID })
  const armed = isOver && Boolean(active?.data.current?.canvasId)

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`island trash-island ${armed ? 'trash-island--armed' : ''}`}
      aria-label="Koš – povleci element sem za brisanje"
    >
      <TrashIcon />
    </button>
  )
}

export default TrashButton
