import { useEffect } from 'react'
import { describeBond } from '../logic/describeSubstance.js'
import './Infobox.css'

const VARIANT_LABEL = {
  discovery: 'Novo odkritje!',
  known: 'Že odkrita snov',
  detail: 'Snov',
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3.5l1.7 4.8 4.8 1.7-4.8 1.7L12 16.5l-1.7-4.8L5.5 10l4.8-1.7z" />
    </svg>
  )
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="infobox-row">
      <span className="infobox-row__label">{label}</span>
      <span className="infobox-row__value">{value}</span>
    </div>
  )
}

// Float island (desna sredina) ob uspešni novi združitvi. NI modalno okno, platno ostane uporabno.
// Prikazuje samo osnovne podatke; vse ostalo (enačba, polarnost ...) je v laboratorijskem dnevniku.
// substance – objekt iz getSubstance(); variant – 'discovery' | 'known' | 'detail'.
function Infobox({ substance, variant = 'discovery', onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!substance) return null

  return (
    <div className="infobox-anchor">
      <section
        className={`infobox infobox--${variant}`}
        role="status"
        aria-live="polite"
        aria-label={`${VARIANT_LABEL[variant]} ${substance.name}`}
      >
        <header className="infobox-head">
          <span className="infobox-eyebrow">
            <SparkIcon />
            {VARIANT_LABEL[variant]}
          </span>
          <button type="button" className="infobox-close" onClick={onClose} aria-label="Zapri">
            ×
          </button>
        </header>

        <div className="infobox-title">
          <span className="infobox-formula">{substance.formula}</span>
          <span className="infobox-name">{substance.name}</span>
        </div>

        <div className="infobox-rows">
          <InfoRow label="Vrsta vezi" value={describeBond(substance)} />
          <InfoRow label="Kje najdemo" value={substance.foundIn} />
          <InfoRow label="Uporaba" value={substance.uses} />
        </div>
      </section>
    </div>
  )
}

export default Infobox
