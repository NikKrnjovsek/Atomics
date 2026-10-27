import atomTypes from '../data/atoms.json'
import './Atom.css'

const namesBySymbol = Object.fromEntries(atomTypes.map(({ symbol, name }) => [symbol, name]))

function Atom({ symbol, label = symbol }) {
  return (
    <div
      className="atom"
      style={{ '--atom-color': `var(--atom-${symbol}, var(--atom-unknown))` }}
      title={namesBySymbol[symbol]}
    >
      {label}
    </div>
  )
}

export default Atom
