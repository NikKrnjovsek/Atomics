import { useEffect, useState } from 'react'
import { describeBond, describeProperty } from '../logic/describeSubstance.js'
import './Infobox.css'

const VARIANT_LABEL = {
  discovery: 'Nova molekula',
  known: 'Že odkrita snov',
  detail: 'Snov',
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

//predstavitvena komponenta: pozna samo podane podatke snovi, ne stanja igre.
// substance – objekt iz getSubstance(); variant – 'discovery' | 'known' | 'detail'.
function Infobox({ substance, variant = 'discovery', equation, onClose }) {
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!substance) return null

  return (
    <div className="infobox-overlay" onClick={onClose}>
      <section
        className="infobox"
        role="dialog"
        aria-modal="true"
        aria-label={`${VARIANT_LABEL[variant]}: ${substance.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="infobox-head">
          <span className="infobox-eyebrow">{VARIANT_LABEL[variant]}</span>
          <button type="button" className="infobox-close" onClick={onClose} aria-label="Zapri">
            ×
          </button>
        </header>

        <div className="infobox-title">
          <span className="infobox-formula">{substance.formula}</span>
          <span className="infobox-name">{substance.name}</span>
        </div>

        {equation && <p className="infobox-equation">{equation}</p>}

        <div className="infobox-rows">
          <InfoRow label="Vrsta vezi" value={describeBond(substance)} />
          <InfoRow label="Molekula" value={describeProperty(substance)} />
          <InfoRow label="Kje najdemo" value={substance.foundIn} />
          <InfoRow label="Uporaba" value={substance.uses} />
        </div>

        {substance.description && (
          <div className="infobox-more">
            <button
              type="button"
              className="infobox-more__toggle"
              aria-expanded={showMore}
              onClick={() => setShowMore((open) => !open)}
            >
              {showMore ? 'Manj' : 'Več o molekuli'}
              <span aria-hidden="true">{showMore ? ' ▲' : ' ▼'}</span>
            </button>
            {showMore && <p className="infobox-description">{substance.description}</p>}
          </div>
        )}

        <button type="button" className="infobox-cta" onClick={onClose}>
          {variant === 'detail' ? 'Zapri' : 'Super, naprej'}
        </button>
      </section>
    </div>
  )
}

export default Infobox
