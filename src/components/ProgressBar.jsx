import './ProgressBar.css'

// Stopnje (imena v arrayu, da se markup ne ponavlja). `note` se izpiše za piko ob imenu.
const STAGES = [
  { name: 'Dvoatomne molekule' },
  { name: 'Snovi iz kuhinje' },
  { name: 'Plini', note: '🔓 S' },
  { name: 'Trdne snovi', note: '🔓 Mg, Ca' },
]

// ZAENKRAT CIST BREZ LOGIKE: vrednosti so statične(prikaz)
function ProgressBar({
  currentStage = 2,
  stageProgress = [1, 0.4, 0, 0],
  discovered = 6,
  total = 16,
}) {
  const currentName = STAGES[currentStage - 1]?.name ?? ''

  return (
    <section className="island progress-island" aria-label="Potek po stopnjah">
      <div className="progress__head">
        <span className="progress__title">
          Stopnja {currentStage} · {currentName}
        </span>
        <span className="progress__count">
          {discovered} / {total}
        </span>
      </div>

      <div className="progress__row">
        {STAGES.map((stage, i) => {
          const status = i < currentStage - 1 ? 'done' : i === currentStage - 1 ? 'current' : 'todo'
          const fill = Math.round((stageProgress[i] ?? 0) * 100)
          return (
            <div className="progress__col" key={stage.name}>
              <div className="progress__bar">
                <div className={`progress__fill progress__fill--${status}`} style={{ width: `${fill}%` }} />
              </div>
              <span className="progress__label">
                <strong>
                  {i + 1} {stage.name}
                </strong>
                {stage.note ? ` · ${stage.note}` : ''}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default ProgressBar
