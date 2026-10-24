import atomTypes from '../data/atoms.json'
import './Atom.css'

const namesBySymbol = Object.fromEntries(atomTypes.map(({ symbol, name }) => [symbol, name]))

function Atom({ symbol }) {
  return (
    <div
      className="atom"
      style={{ '--atom-color': `var(--atom-${symbol})` }}
      title={namesBySymbol[symbol]}
    >
      {symbol}
    </div>
  )
}

export default Atom
