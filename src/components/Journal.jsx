import { useEffect, useRef, useState } from 'react'
import MoleculePreview from './MoleculePreview.jsx'
import SubstanceDetails from './SubstanceDetails.jsx'
import './Journal.css'

// Laboratorijski dnevnik: celozaslonski overlay v obliki odprte knjige.
// substances – odkrite snovi (brez fragmentov); discoveries – [{ id, discoveredAt }] za čas odkritja;
// newIds – ID-ji, označeni "novo", dokler jih uporabnik ne izbere; onSeen(id) odstrani oznako.
// onReset – izbriše ves napredek (gumb "Začni znova" s potrditvijo v dveh korakih).
function Journal({ substances = [], discoveries = [], newIds = [], onClose, onSeen, onReset }) {
  const [selectedId, setSelectedId] = useState(null)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const closeRef = useRef(null)

  const discoveredAtById = new Map(discoveries.map((d) => [d.id, d.discoveredAt]))
  const selected = substances.find((substance) => substance.id === selectedId) ?? null

  // Esc zapre; ob odprtju fokus v dnevnik, ob zaprtju nazaj na sprožilni gumb (JournalButton).
  useEffect(() => {
    const trigger = document.activeElement
    closeRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (trigger instanceof HTMLElement) trigger.focus()
    }
  }, [onClose])

  const handleSelect = (id) => {
    setSelectedId(id)
    onSeen?.(id)
  }

  return (
    <div className="journal-overlay" onClick={onClose}>
      <section
        className="journal"
        role="dialog"
        aria-modal="true"
        aria-label="Laboratorijski dnevnik"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className="journal__close"
          onClick={onClose}
          aria-label="Zapri dnevnik"
        >
          ×
        </button>

        <div className="journal__page journal__page--left">
          <h2 className="journal__heading">Odkrite snovi</h2>
          {substances.length === 0 ? (
            <p className="journal__empty">
              Še nisi odkril nobene snovi – poskusi združiti atome na platnu.
            </p>
          ) : (
            <ul className="journal__grid">
              {substances.map((substance) => (
                <li key={substance.id}>
                  <button
                    type="button"
                    className={`journal__card ${selectedId === substance.id ? 'journal__card--selected' : ''}`}
                    aria-pressed={selectedId === substance.id}
                    onClick={() => handleSelect(substance.id)}
                  >
                    {newIds.includes(substance.id) && (
                      <span className="journal__new-tag">novo</span>
                    )}
                    <MoleculePreview substanceId={substance.id} size={84} />
                    <span className="journal__card-name">{substance.name}</span>
                    <span className="journal__card-formula">{substance.formula}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {onReset && (
            <div className="journal__reset">
              {confirmingReset ? (
                <>
                  <span className="journal__reset-question">Res izbrišem ves napredek?</span>
                  <button type="button" className="journal__reset-button journal__reset-button--danger" onClick={onReset}>
                    Da, začni znova
                  </button>
                  <button type="button" className="journal__reset-button" onClick={() => setConfirmingReset(false)}>
                    Prekliči
                  </button>
                </>
              ) : (
                <button type="button" className="journal__reset-button" onClick={() => setConfirmingReset(true)}>
                  Začni znova
                </button>
              )}
            </div>
          )}
        </div>

        <div className="journal__spine" aria-hidden="true" />

        <div className="journal__page journal__page--right">
          <SubstanceDetails
            substance={selected}
            discoveredAt={selected ? discoveredAtById.get(selected.id) : null}
          />
        </div>
      </section>
    </div>
  )
}

export default Journal
