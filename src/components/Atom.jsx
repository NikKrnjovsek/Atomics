import atomTypes from '../data/atoms.json'
import { DEFAULT_DIAMETER } from '../logic/atomSize.js'
import './Atom.css'

const namesBySymbol = Object.fromEntries(atomTypes.map(({ symbol, name }) => [symbol, name]))

function Atom({ symbol, label = symbol, size = DEFAULT_DIAMETER }) {
  return (
    <div
      className="atom"
      style={{
        '--atom-color': `var(--atom-${symbol}, var(--atom-unknown))`,
        '--atom-size': `${size}px`,
      }}
      title={namesBySymbol[symbol]}
    >
      {label}
    </div>
  )
}

export default Atom
