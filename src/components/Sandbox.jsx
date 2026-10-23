import { useDraggable, useDroppable } from '@dnd-kit/core'
import Atom from './Atom.jsx'
import './Sandbox.css'

export const SANDBOX_ID = 'sandbox'

function PlacedAtom({ id, symbol, x, y }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id,
    data: { symbol, atomId: id },
  })

  return (
    <div
      ref={setNodeRef}
      className={`placed-atom ${isDragging ? 'placed-atom--dragging' : ''}`}
      style={{ left: x, top: y }}
      {...listeners}
      {...attributes}
    >
      <Atom symbol={symbol} />
    </div>
  )
}

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
        <PlacedAtom key={atom.id} {...atom} />
      ))}
    </section>
  )
}

export default Sandbox
