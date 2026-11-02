import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { describeBond, describeProperty } from '../logic/describeSubstance.js'
import { previewScale } from '../logic/structures.js'
import FeaturedContent from './FeaturedContent.jsx'
import { SparkIcon } from './Infobox.jsx'
import Molecule from './Molecule.jsx'
import MoleculePreview from './MoleculePreview.jsx'
import './FeaturedInfobox.css'

// Počakamo, da se animacija nastanka na platnu konča.
const OPEN_DELAY = 600
const FLIGHT_DURATION = 850
const SLOT_SIZE = 150

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Molekula s platna odleti v levi zgornji kot infoboksa in tam "pristane".
function useFlight({ ready, landed, originId, substanceId, slotRef, flyerRef, onLanded }) {
  useLayoutEffect(() => {
    if (!ready || landed) return
    const origin = document.querySelector(`[data-item-id="${originId}"]`)
    if (!origin || prefersReducedMotion()) {
      onLanded()
      return
    }

    const from = origin.getBoundingClientRect()
    const to = slotRef.current.getBoundingClientRect()
    const toX = to.left + to.width / 2
    const toY = to.top + to.height / 2
    const flight = flyerRef.current.animate(
      [
        { transform: `translate(${from.left}px, ${from.top}px) scale(1)` },
        {
          transform: `translate(${(from.left + toX) / 2}px, ${Math.min(from.top, toY) - 60}px) scale(1.25)`,
          offset: 0.45,
        },
        { transform: `translate(${toX}px, ${toY}px) scale(${previewScale(substanceId, SLOT_SIZE)})` },
      ],
      { duration: FLIGHT_DURATION, easing: 'cubic-bezier(0.45, 0, 0.25, 1)', fill: 'forwards' },
    )
    flight.onfinish = onLanded
    return () => flight.cancel()
  }, [ready, landed, originId, substanceId, slotRef, flyerRef, onLanded])
}

// Velik opisni infoboks za ključne snovi (featured.json) ob prvem odkritju.
// featured – vsebina iz getFeatured(); originId – ID glavnega produkta na platnu, od koder odleti molekula.
function FeaturedInfobox({ substance, featured, originId, onClose }) {
  const [ready, setReady] = useState(false)
  const [landed, setLanded] = useState(false)
  const slotRef = useRef(null)
  const flyerRef = useRef(null)
  const closeRef = useRef(null)
  const markLanded = useCallback(() => setLanded(true), [])

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), OPEN_DELAY)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!ready) return
    closeRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ready, onClose])

  useFlight({ ready, landed, originId, substanceId: substance.id, slotRef, flyerRef, onLanded: markLanded })

  if (!ready) return null

  const chips = [describeBond(substance) && `${describeBond(substance)} vez`, describeProperty(substance)]

  return (
    <div className="featured-overlay" onClick={onClose}>
      <section
        className="featured"
        role="dialog"
        aria-modal="true"
        aria-labelledby="featured-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="featured__head">
          <div ref={slotRef} className={`featured__slot ${landed ? 'featured__slot--landed' : ''}`}>
            <MoleculePreview substanceId={substance.id} size={SLOT_SIZE} />
          </div>

          <div className="featured__title">
            <span className="featured__eyebrow">
              <SparkIcon />
              Ključno odkritje
            </span>
            <h2 id="featured-title" className="featured__name-row">
              <span className="featured__formula">{substance.formula}</span>
              <span className="featured__name">{substance.name}</span>
            </h2>
            <p className="featured__tagline">{featured.tagline}</p>
            <ul className="featured__chips">
              {chips.filter(Boolean).map((chip) => (
                <li key={chip}>{chip}</li>
              ))}
            </ul>
          </div>

          <button
            ref={closeRef}
            type="button"
            className="featured__close"
            onClick={onClose}
            aria-label="Zapri"
          >
            ×
          </button>
        </header>

        <div className="featured__body">
          <FeaturedContent featured={featured} />
        </div>

        <footer className="featured__foot">
          <button type="button" className="featured__continue" onClick={onClose}>
            Nadaljuj z raziskovanjem
          </button>
        </footer>
      </section>

      {!landed && (
        <div ref={flyerRef} className="featured-flyer" aria-hidden="true">
          <Molecule substanceId={substance.id} />
        </div>
      )}
    </div>
  )
}

export default FeaturedInfobox
