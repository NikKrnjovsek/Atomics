import './JournalButton.css'

function BookIcon() {
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
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

// Odpre laboratorijski dnevnik (Journal). Ob novem odkritju se enkrat zatrese
// in dobi rdečo piko (hasUnseen); pika/tresenje sta UI stanje v SandboxPage.
// shakeKey se poveča ob vsakem novem odkritju – prek key sproži animacijo znova.
function JournalButton({ onClick, hasUnseen = false, shakeKey = 0 }) {
  return (
    <button
      type="button"
      className="island journal-island"
      aria-label={hasUnseen ? 'Laboratorijski dnevnik – novo odkritje' : 'Laboratorijski dnevnik'}
      onClick={onClick}
    >
      <span
        key={shakeKey}
        className={`journal-island__icon ${hasUnseen ? 'journal-island__icon--shake' : ''}`}
      >
        <BookIcon />
      </span>
      {hasUnseen && <span className="journal-island__badge" aria-hidden="true" />}
    </button>
  )
}

export default JournalButton
