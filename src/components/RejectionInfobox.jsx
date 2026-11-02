import { useEffect } from 'react'
import { describeRejection } from '../logic/describeSubstance.js'
import './Infobox.css'

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  )
}

// Infoboks ob zavrnjeni kombinaciji – isti otok kot uspeh, z rdečimi poudarki.
// reactants – snovi, ki ju je učenec poskušal združiti (prikaz "H₂ + O₂");
// reason – razlaga za ta par iz molecules.json (explainRejection), npr. zakaj N₂ + H₂ ne reagira;
// onClose – zapre infoboks.
const FALLBACK_REASON = 'Poskusi z drugo kombinacijo atomov.'

function RejectionInfobox({ reactants, reason, onClose }) {
  const attempt = describeRejection(reactants)

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="infobox-anchor">
      <section
        className="infobox infobox--rejection"
        role="status"
        aria-live="polite"
        aria-label="Kombinacija ne deluje"
      >
        <header className="infobox-head">
          <span className="infobox-eyebrow">
            <AlertIcon />
            Ne gre skupaj
          </span>
          <button type="button" className="infobox-close" onClick={onClose} aria-label="Zapri">
            ×
          </button>
        </header>

        <p className="infobox-reject-title">Te snovi se ne povežeta</p>
        {attempt && (
          <p className="infobox-reject-formula" aria-label={attempt.names.join(' in ')}>
            {attempt.formula}
          </p>
        )}
        <p className="infobox-reject-text">{reason || FALLBACK_REASON}</p>
      </section>
    </div>
  )
}

export default RejectionInfobox
