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

// TODO: tu se bo kasneje odprl laboratorijski dnevnik (med drugim detail infoboks snovi).
function JournalButton() {
  return (
    <button
      type="button"
      className="island journal-island"
      aria-label="Laboratorijski dnevnik"
      onClick={() => { }}
    >
      <BookIcon />
    </button>
  )
}

export default JournalButton
