import { useEffect, useState } from 'react'
import { useGame } from '../context/useGame.js'
import { getProgress } from '../logic/progress.js'
import { HINTS } from '../data/hints.js'
import './ProgressBar.css'

// Menjava namiga vsakih 20 s. Za hitrejše testiranje lahko začasno znižaš (npr. 3000) in nato vrneš.
const HINT_INTERVAL_MS = 20000
const CONGRATS = 'Odkril si vse snovi! Bravo, kemik!'

function BulbIcon() {
  return (
    <svg
      className="progress__hint-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-4 10.5c.5.5 1 1.2 1 2.5h6c0-1.3.5-2 1-2.5A6 6 0 0 0 12 3z" />
    </svg>
  )
}

// Izbere naključen namig neodkrite snovi trenutne stopnje; isti namig se ne ponovi takoj.
// Če je stopnja v celoti odkrita (možno le v stopnji 4), vrne čestitko.
function pickHint(stage, found, prev) {
  const pool = stage.substances
    .filter((id) => !found.has(id))
    .flatMap((id) => HINTS[id] ?? [])
  if (pool.length === 0) return CONGRATS

  const options = pool.length > 1 ? pool.filter((h) => h !== prev) : pool
  const choices = options.length > 0 ? options : pool
  return choices[Math.floor(Math.random() * choices.length)]
}

function ProgressBar() {
  const { discoveries, getSubstance } = useGame()
  const discoveredIds = discoveries.map((d) => d.id)
  const discoveredKey = discoveredIds.join(',')
  const found = new Set(discoveredIds)

  const { stage, percent, stages } = getProgress(discoveredIds)
  const current = stages[stage - 1]
  const grandTotal = stages.reduce((sum, s) => sum + s.total, 0)
  const totalDiscovered = stages.reduce((sum, s) => sum + s.discoveredCount, 0)

  // Namig: besedilo + ključ (sprememba ključa sproži ponoven fade ob menjavi).
  // Trenutno prikazani namig (h.text) je hkrati "prejšnji" – tako se isti ne ponovi dvakrat zapored.
  const [hint, setHint] = useState({ text: '', key: 0 })
  const [hintDeps, setHintDeps] = useState(null)

  // Nov namig TAKOJ ob prehodu stopnje ali novem odkritju (prilagoditev stanja med izrisom, ne v efektu).
  const depsKey = `${stage}|${discoveredKey}`
  if (hintDeps !== depsKey) {
    setHintDeps(depsKey)
    setHint((h) => ({ text: pickHint(current, found, h.text), key: h.key + 1 }))
  }

  // Periodična menjava vsakih 20 s; timer se počisti ob unmountu in resetira ob spremembi stanja.
  useEffect(() => {
    const timer = setInterval(() => {
      setHint((h) => ({ text: pickHint(current, found, h.text), key: h.key + 1 }))
    }, HINT_INTERVAL_MS)
    return () => clearInterval(timer)
    // current/found sta vezana na depsKey – ob njegovi spremembi se efekt osveži.
  }, [depsKey]) // eslint-disable-line

  return (
    <section className="island progress-island" aria-label="Potek po stopnjah">
      <p className="progress__hint" aria-live="polite">
        <BulbIcon />
        <span className="progress__hint-text" key={hint.key}>
          {hint.text}
        </span>
      </p>

      <div className="progress__head">
        <span className="progress__title">
          Stopnja {stage} · {current.name}
        </span>
        <span className="progress__count">
          {totalDiscovered} / {grandTotal}
        </span>
      </div>

      <div
        className="progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="progress__fill" style={{ width: `${percent}%` }} />
      </div>

      <div className="progress__stages">
        {stages.map((s, i) => {
          const status = i < stage - 1 ? 'done' : i === stage - 1 ? 'current' : 'todo'
          return (
            <div className={`progress__stage progress__stage--${status}`} key={s.name}>
              <span className="progress__stage-name">
                {i + 1} {s.name}
              </span>
              <span className="progress__stage-count">
                {s.discoveredCount} / {s.total}
              </span>
            </div>
          )
        })}
      </div>

      <ul className="progress__chips" aria-label={`Snovi stopnje ${stage}`}>
        {current.substances.map((id) => {
          const isFound = found.has(id)
          return (
            <li
              key={id}
              className={`progress__chip progress__chip--${isFound ? 'found' : 'todo'}`}
            >
              {isFound ? getSubstance(id).formula : '?'}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default ProgressBar
