import { useEffect } from 'react'
import { describeRejection } from '../logic/describeSubstance.js'
import './Infobox.css'

// genericni infoboks ob zavrnjeni kombinaciji
// razlog za posamezno snov ŠE NI IMPLEMENTIRAN!!!
// reactants - polje reaktantov iz getSubstance(); onClose - zapre infoboks
function RejectionInfobox({ reactants, onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const description = describeRejection(reactants)
  if (!description) return null

  return (
    <div className="infobox-overlay" onClick={onClose}>
      <section
        className="infobox infobox--rejection"
        role="dialog"
        aria-modal="true"
        aria-label="Kombinacija ne deluje"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="infobox-head">
          <span className="infobox-eyebrow">Ne gre skupaj</span>
          <button type="button" className="infobox-close" onClick={onClose} aria-label="Zapri">
            ×
          </button>
        </header>

        <p className="infobox-reject-formula">{description.formula}</p>

        <p className="infobox-reject-lead">Ti dve snovi se ne povežeta v novo molekulo.</p>
        <p className="infobox-description">
          V naravi se povežejo le določene kombinacije atomov in molekul. To še ni ena izmed
          njih – izberi drugo snov in poskusi znova.
        </p>

        <button type="button" className="infobox-cta" onClick={onClose}>
          Poskusi znova
        </button>
      </section>
    </div>
  )
}

export default RejectionInfobox
