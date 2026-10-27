import { useDraggable, useDroppable } from '@dnd-kit/core'
import Atom from './Atom.jsx'
import './Sandbox.css'

export const SANDBOX_ID = 'sandbox'

function PlacedAtom({ id, substanceId, x, y }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id,
    data: { substanceId, canvasId: id },
  })

  return (
    <div
      ref={setNodeRef}
      className={`placed-atom ${isDragging ? 'placed-atom--dragging' : ''}`}
      style={{ left: x, top: y }}
      {...listeners}
      {...attributes}
    >
      <Atom symbol={substanceId} />
    </div>
  )
}

function Sandbox({ items }) {
  const { setNodeRef, isOver } = useDroppable({ id: SANDBOX_ID })

  return (
    <section
      ref={setNodeRef}
      className={`sandbox ${isOver ? 'sandbox--over' : ''}`}
      aria-label="Platno za sestavljanje atomov"
    >
      {items.length === 0 && <p className="sandbox-hint">Sem povleci atome</p>}
      {items.map((item) => (
        <PlacedAtom key={item.id} {...item} />
      ))}
    </section>
  )
}

export default Sandbox
