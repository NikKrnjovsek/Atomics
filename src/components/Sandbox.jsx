import Atom from './Atom.jsx'
import './Sandbox.css'

function Sandbox({ atoms }) {
  return (
    <section className="sandbox" aria-label="Platno za sestavljanje atomov">
      {atoms.length === 0 && <p className="sandbox-hint">Sem povleci atome</p>}
      {atoms.map((atom) => (
        <Atom key={atom.id} symbol={atom.symbol} x={atom.x} y={atom.y} />
      ))}
    </section>
  )
}

export default Sandbox
