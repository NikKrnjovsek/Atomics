import { useNavigate } from 'react-router-dom'
import './Intro.css'

// Lebdeči okrasni krogci. Pozicije v % od roba, da se prilagajajo širini.
// variant: 'outline' | 'dashed' | 'gray' | 'dot'; symbol je neobvezen.
const circles = [
  // Leva stran
  { size: 128, top: '20%', left: '8%', variant: 'outline', symbol: 'O' },
  { size: 56, top: '12%', left: '18%', variant: 'outline' },
  { size: 80, top: '40%', left: '14%', variant: 'gray', symbol: 'Na' },
  { size: 16, top: '26%', left: '22%', variant: 'dot' },
  { size: 48, top: '53%', left: '5%', variant: 'outline' },
  { size: 160, top: '72%', left: '9%', variant: 'dashed', small: true },
  { size: 60, top: '79%', left: '22%', variant: 'outline', symbol: 'H' },
  // Desna stran
  { size: 100, top: '16%', right: '12%', variant: 'outline', symbol: 'C' },
  { size: 44, top: '29%', right: '21%', variant: 'outline', small: true },
  { size: 160, top: '41%', right: '7%', variant: 'dashed' },
  { size: 60, top: '60%', right: '19%', variant: 'dashed', symbol: 'Cl', small: true },
  { size: 16, top: '45%', right: '24%', variant: 'dot', small: true },
  { size: 100, top: '71%', right: '5%', variant: 'outline', symbol: 'N' },
  { size: 45, top: '82%', right: '16%', variant: 'gray', small: true },
]

function Intro() {
  const navigate = useNavigate()

  return (
    <div className="intro">
      <div className="intro-circles" aria-hidden="true">
        {circles.map((c, i) => {
          const className = [
            'intro-circle',
            `intro-circle--${c.variant}`,
            c.small ? 'intro-circle--small' : '',
          ]
            .filter(Boolean)
            .join(' ')

          const style = {
            width: c.size,
            height: c.size,
            top: c.top,
            left: c.left,
            right: c.right,
            animationDelay: `${(i % 7) * 0.6}s`,
            animationDuration: `${5 + (i % 4)}s`,
          }

          return (
            <span key={i} className={className} style={style}>
              {c.symbol}
            </span>
          )
        })}
      </div>

      <main className="intro-content">
        <p className="intro-overline">Učna igra za 8. razred</p>
        <h1 className="intro-title">Kemija – uvod v molekule in elemente</h1>
        <p className="intro-group">
          <span className="intro-group-line" aria-hidden="true" />
          Atomics
          <span className="intro-group-line" aria-hidden="true" />
        </p>
        <button
          type="button"
          className="intro-button"
          onClick={() => navigate('/sandbox')}
        >
          Sandbox <span aria-hidden="true">→</span>
        </button>
      </main>
    </div>
  )
}

export default Intro
