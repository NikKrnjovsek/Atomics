import atomTypes from '../data/atoms.json'
import './Atom.css'

const namesBySymbol = Object.fromEntries(atomTypes.map(({ symbol, name }) => [symbol, name]))

function Atom({ symbol, x, y }) {
  const style = {
    left: x,
    top: y,
    '--atom-color': `var(--atom-${symbol})`,
  }

  return (
    <div className="atom" style={style} title={namesBySymbol[symbol]}>
      {symbol}
    </div>
  )
}

export default Atom
