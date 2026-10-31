import { useRef } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { electronTransfers } from '../logic/electronTransfers.js'
import { getStructure } from '../logic/structures.js'
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

function bodyStyle(nudge, appear) {
  if (nudge) return { '--nudge-x': `${nudge.x}px`, '--nudge-y': `${nudge.y}px` }
  if (appear) return { '--from-x': `${appear.fromX}px`, '--from-y': `${appear.fromY}px` }
  return undefined
}

// Elektron preleti s kovine na nekovino; nato se kation skrči, anion pa zraste.
function ElectronTransfers({ substanceId }) {
  return electronTransfers(getStructure(substanceId).atoms).map(({ from, to }, i) => (
    <span
      key={i}
      className="electron-transfer"
      style={{
        left: from.x,
        top: from.y,
        '--to-x': `${to.x - from.x}px`,
        '--to-y': `${to.y - from.y}px`,
        '--delay': `${i * 120}ms`,
      }}
    />
  ))
}

function PlacedItem({
  id,
  substanceId,
  x,
  y,
  bondSourceAtom,
  nudge,
  appear,
  onBondStart,
  onRejectEnd,
}) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id,
    data: { substanceId, canvasId: id, x, y },
  })

  // Sredina atoma in vezi premikajo molekulo (dnd-kit na telesu), rob atoma pa začne vez,
  // zato dogodka z roba ne pustimo do telesa.
  const handleEdgeDown = (event, atom, index) => {
    if (event.target !== event.currentTarget) return
    event.stopPropagation()
    onBondStart(id, index, { x: x + atom.x, y: y + atom.y })
  }

  const ionizing = appear?.ionizing

  const renderAtom = (atom, index) => {
    const resizes = ionizing && atom.charge
    const className = [
      'atom-handle',
      index === bondSourceAtom && 'atom-handle--source',
      resizes && 'atom-handle--ionizing',
    ]
    return (
      <div
        className={className.filter(Boolean).join(' ')}
        style={{
          '--atom-size': `${atom.size}px`,
          '--from-scale': resizes ? atom.neutralSize / atom.size : 1,
        }}
        onPointerDown={(event) => handleEdgeDown(event, atom, index)}
      >
        <Atom symbol={atom.symbol} label={atom.label} size={atom.size} />
        <div className="atom-handle__move" />
      </div>
    )
  }

  const handleAnimationEnd = (event) => {
    if (event.target === event.currentTarget && event.animationName === 'reject-nudge') onRejectEnd()
  }

  const bodyClass = [
    'placed-item__body',
    nudge && 'placed-item__body--rejected',
    appear && 'placed-item__body--appearing',
  ]

  return (
    <div
      ref={setNodeRef}
      className={`placed-item ${isDragging ? 'placed-item--dragging' : ''}`}
      style={{ left: x, top: y }}
      data-item-id={id}
      {...attributes}
    >
      <div
        className={bodyClass.filter(Boolean).join(' ')}
        style={bodyStyle(nudge, appear)}
        onAnimationEnd={handleAnimationEnd}
        {...listeners}
      >
        <Molecule substanceId={substanceId} renderAtom={renderAtom} />
        {ionizing && <ElectronTransfers substanceId={substanceId} />}
      </div>
    </div>
  )
}

function FusionGhost({ substanceId, x, y, toX, toY }) {
  return (
    <div
      className="fusion-ghost"
      style={{ left: x, top: y, '--to-x': `${toX}px`, '--to-y': `${toY}px` }}
      aria-hidden="true"
    >
      <Molecule substanceId={substanceId} />
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

function Sandbox({ items, rejection, fusion, onBond, onRejectEnd }) {
  const canvasRef = useRef(null)
  const { setNodeRef, isOver } = useDroppable({ id: SANDBOX_ID })
  const { bond, startBond } = useBondDrag(canvasRef, (sourceId, targetId) => {
    const { width, height } = canvasRef.current.getBoundingClientRect()
    onBond(sourceId, targetId, { width, height })
  })

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
      {fusion?.ghosts.map((ghost) => (
        <FusionGhost key={`${fusion.key}-${ghost.id}`} {...ghost} />
      ))}
      {items.map((item) => {
        const appear = fusion?.appearing.get(item.id)
        return (
          <PlacedItem
            key={item.id}
            {...item}
            bondSourceAtom={bond?.sourceId === item.id ? bond.sourceAtom : null}
            nudge={nudgeFor(item)}
            appear={appear && { ...appear, ionizing: fusion.ionizing }}
            onBondStart={startBond}
            onRejectEnd={onRejectEnd}
          />
        )
      })}
      {bond && <BondPreview from={bond.from} to={bond.to} />}
    </section>
  )
}

export default Sandbox
