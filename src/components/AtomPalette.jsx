import { useDraggable } from '@dnd-kit/core'
import atomTypes from '../data/atoms.json'
import Atom from './Atom.jsx'
import './AtomPalette.css'

function PaletteAtom({ symbol }) {
  const { setNodeRef, listeners, attributes } = useDraggable({
    id: `palette-${symbol}`,
    data: { symbol },
  })

  return (
    <li ref={setNodeRef} className="palette-atom" {...listeners} {...attributes}>
      <Atom symbol={symbol} />
    </li>
  )
}

function AtomPalette() {
  return (
    <aside className="atom-palette" aria-label="Atomi">
      <ul className="palette-list">
        {atomTypes.map(({ symbol }) => (
          <PaletteAtom key={symbol} symbol={symbol} />
        ))}
      </ul>
    </aside>
  )
}

export default AtomPalette
