import { useRef } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useBondDrag } from '../logic/useBondDrag.js'
import Atom from './Atom.jsx'
import Molecule from './Molecule.jsx'
import './Sandbox.css'

export const SANDBOX_ID = 'sandbox'

const NUDGE_DISTANCE = 16

// Smer, v katero se element ob neuspeli vezi sune proti drugemu, preden se odbije nazaj.
function nudgeToward(item, other) {
  const dx = other.x - item.x
  const dy = other.y - item.y
  const length = Math.hypot(dx, dy) || 1
  return { x: (dx / length) * NUDGE_DISTANCE, y: (dy / length) * NUDGE_DISTANCE }
}

// Sredina atoma premika celo molekulo (dnd-kit), rob atoma pa začne vleči vez.
function PlacedItem({ id, substanceId, x, y, bondSourceAtom, nudge, onBondStart, onRejectEnd }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id,
    data: { substanceId, canvasId: id, x, y },
  })

  const handleEdgeDown = (event, atom, index) => {
    // Dogodek s sredine atoma pride sem samo z mehurčkanjem; tistega obdela dnd-kit.
    if (event.target !== event.currentTarget) return
    onBondStart(id, index, { x: x + atom.x, y: y + atom.y })
  }

  const renderAtom = (atom, index) => (
    <div
      className={`atom-handle ${index === bondSourceAtom ? 'atom-handle--source' : ''}`}
      style={{ '--atom-size': `${atom.size}px` }}
      data-item-id={id}
      onPointerDown={(event) => handleEdgeDown(event, atom, index)}
    >
      <Atom symbol={atom.symbol} label={atom.label} size={atom.size} />
      <div className="atom-handle__move" {...listeners} />
    </div>
  )

  const handleAnimationEnd = (event) => {
    if (event.target === event.currentTarget) onRejectEnd()
  }

  return (
    <div
      ref={setNodeRef}
      className={`placed-item ${isDragging ? 'placed-item--dragging' : ''}`}
      style={{ left: x, top: y }}
      {...attributes}
    >
      <div
        className={`placed-item__body ${nudge ? 'placed-item__body--rejected' : ''}`}
        style={nudge && { '--nudge-x': `${nudge.x}px`, '--nudge-y': `${nudge.y}px` }}
        onAnimationEnd={handleAnimationEnd}
      >
        <Molecule substanceId={substanceId} renderAtom={renderAtom} />
      </div>
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

function Sandbox({ items, rejection, onBond, onRejectEnd }) {
  const canvasRef = useRef(null)
  const { setNodeRef, isOver } = useDroppable({ id: SANDBOX_ID })
  const { bond, startBond } = useBondDrag(canvasRef, onBond)

  const setRefs = (node) => {
    setNodeRef(node)
    canvasRef.current = node
  }

  const nudgeFor = (item) => {
    if (!rejection) return null
    const { sourceId, targetId } = rejection
    const otherId = { [sourceId]: targetId, [targetId]: sourceId }[item.id]
    const other = items.find((candidate) => candidate.id === otherId)
    return other ? nudgeToward(item, other) : null
  }

  const className = ['sandbox', isOver && 'sandbox--over', bond && 'sandbox--bonding']
    .filter(Boolean)
    .join(' ')

  return (
    <section ref={setRefs} className={className} aria-label="Platno za sestavljanje atomov">
      {items.length === 0 && <p className="sandbox-hint">Sem povleci atome</p>}
      {items.map((item) => (
        <PlacedItem
          key={item.id}
          {...item}
          bondSourceAtom={bond?.sourceId === item.id ? bond.sourceAtom : null}
          nudge={nudgeFor(item)}
          onBondStart={startBond}
          onRejectEnd={onRejectEnd}
        />
      ))}
      {bond && <BondPreview from={bond.from} to={bond.to} />}
    </section>
  )
}

export default Sandbox
