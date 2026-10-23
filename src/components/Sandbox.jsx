import { useDroppable } from '@dnd-kit/core'
import Atom from './Atom.jsx'
import './Sandbox.css'

export const SANDBOX_ID = 'sandbox'

function Sandbox({ atoms }) {
  const { setNodeRef, isOver } = useDroppable({ id: SANDBOX_ID })

  return (
    <section
      ref={setNodeRef}
      className={`sandbox ${isOver ? 'sandbox--over' : ''}`}
      aria-label="Platno za sestavljanje atomov"
    >
      {atoms.length === 0 && <p className="sandbox-hint">Sem povleci atome</p>}
      {atoms.map((atom) => (
        <Atom
          key={atom.id}
          symbol={atom.symbol}
          className="placed-atom"
          style={{ left: atom.x, top: atom.y }}
        />
      ))}
    </section>
  )
}

export default Sandbox
