import { useRef } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useBondDrag } from '../logic/useBondDrag.js'
import Atom from './Atom.jsx'
import Molecule from './Molecule.jsx'
import './Sandbox.css'

export const SANDBOX_ID = 'sandbox'

// Sredina atoma premika celo molekulo (dnd-kit), rob atoma pa začne vleči vez.
function PlacedItem({ id, substanceId, x, y, onBondStart }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id,
    data: { substanceId, canvasId: id, x, y },
  })

  const handleEdgeDown = (event, atom) => {
    // Dogodek s sredine atoma pride sem samo z mehurčkanjem; tistega obdela dnd-kit.
    if (event.target !== event.currentTarget) return
    onBondStart(id, { x: x + atom.x, y: y + atom.y })
  }

  const renderAtom = (atom) => (
    <div
      className="atom-handle"
      data-item-id={id}
      onPointerDown={(event) => handleEdgeDown(event, atom)}
    >
      <Atom symbol={atom.symbol} label={atom.label} />
      <div className="atom-handle__move" {...listeners} />
    </div>
  )

  return (
    <div
      ref={setNodeRef}
      className={`placed-item ${isDragging ? 'placed-item--dragging' : ''}`}
      style={{ left: x, top: y }}
      {...attributes}
    >
      <Molecule substanceId={substanceId} renderAtom={renderAtom} />
    </div>
  )
}

function BondPreview({ from, to }) {
  return (
    <svg className="bond-preview" aria-hidden="true">
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
    </svg>
  )
}

function Sandbox({ items, onBond }) {
  const canvasRef = useRef(null)
  const { setNodeRef, isOver } = useDroppable({ id: SANDBOX_ID })
  const { bond, startBond } = useBondDrag(canvasRef, onBond)

  const setRefs = (node) => {
    setNodeRef(node)
    canvasRef.current = node
  }

  return (
    <section
      ref={setRefs}
      className={`sandbox ${isOver ? 'sandbox--over' : ''}`}
      aria-label="Platno za sestavljanje atomov"
    >
      {items.length === 0 && <p className="sandbox-hint">Sem povleci atome</p>}
      {items.map((item) => (
        <PlacedItem key={item.id} {...item} onBondStart={startBond} />
      ))}
      {bond && <BondPreview from={bond.from} to={bond.to} />}
    </section>
  )
}

export default Sandbox
