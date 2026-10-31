import { useDraggable, useDroppable } from '@dnd-kit/core'
import atomTypes from '../data/atoms.json'
import Atom from './Atom.jsx'
import './Sidebar.css'

export const SIDEBAR_ID = 'sidebar'

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)

function LockIcon() {
  return (
    <svg
      className="atom-tile__lock"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

function AtomTile({ symbol, name, group }) {
  const { setNodeRef, listeners, attributes } = useDraggable({
    id: `palette-${symbol}`,
    data: { substanceId: symbol },
  })

  return (
    <button
      type="button"
      ref={setNodeRef}
      className={`atom-tile atom-tile--${group}`}
      {...listeners}
      {...attributes}
    >
      {/* Enak barvni krog kot na platnu*/}
      <Atom symbol={symbol} />
      <span className="atom-tile__name">{name}</span>
    </button>
  )
}

function LockedTile({ symbol, name }) {
  return (
    <div
      className="atom-tile atom-tile--locked"
      aria-label={`${capitalize(name)} – zaklenjeno`}
    >
      <LockIcon />
      {/* Zaklenjen atom: sivi krog brez barve elementa */}
      <div className="atom atom--locked">{symbol}</div>
    </div>
  )
}

function Sidebar({ inventory = [], discovered = [], onSelect, allUnlocked = false, onToggleUnlockAll }) {
  const { setNodeRef, isOver, active } = useDroppable({ id: SIDEBAR_ID })

  const isRemoving = isOver && Boolean(active?.data.current?.canvasId)

  return (
    <aside
      ref={setNodeRef}
      className={`sidebar ${isRemoving ? 'sidebar--remove' : ''}`}
    >
      <div className="sidebar-logo">
        <span className="sidebar-logo__name">Atomics</span>
      </div>

      <section className="sidebar-section">
        <div className="sidebar-section__head">
          <h2 className="sidebar-heading">Atomi</h2>
          {/* Toggle odkleni vse atome */}
          <label className="sidebar-toggle" title="Odkleni vse atome">
            <input
              type="checkbox"
              checked={allUnlocked}
              onChange={(event) => onToggleUnlockAll?.(event.target.checked)}
              aria-label="Odkleni vse atome"
            />
            <span className="sidebar-toggle__track" aria-hidden="true" />
          </label>
        </div>
        <div className="atom-grid">
          {atomTypes.map((atom) =>
            allUnlocked || inventory.includes(atom.symbol) ? (
              <AtomTile key={atom.symbol} {...atom} />
            ) : (
              <LockedTile key={atom.symbol} {...atom} />
            ),
          )}
        </div>

        <ul className="legend">
          <li>
            <span className="legend__swatch legend__swatch--nekovina" /> nekovina
          </li>
          <li>
            <span className="legend__swatch legend__swatch--kovina" /> kovina
          </li>
          <li>
            <span className="legend__swatch legend__swatch--halogen" /> halogen
          </li>
        </ul>
      </section>

      <section className="sidebar-section">
        <div className="sidebar-section__head">
          <h2 className="sidebar-heading">Odkrite snovi</h2>
          <span className="sidebar-count">{discovered.length}</span>
        </div>

        {discovered.length === 0 ? (
          <p className="discovered-empty">Še nisi odkril nobene snovi</p>
        ) : (
          <ul className="discovered-list">
            {discovered.map((item, i) => (
              <li key={item.id ?? item.formula ?? i}>
                <button
                  type="button"
                  className="discovered-pill"
                  onClick={() => onSelect?.(item)}
                  aria-label={`${item.name ?? item.formula ?? item} – podrobnosti`}
                >
                  {item.formula ?? item.label ?? item}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="sidebar-hint-box">
        {isRemoving
          ? 'Spusti atom, da ga odstraniš s platna.'
          : 'Povleci atom na platno. Spusti enega na drugega, da ju združiš.'}
      </p>
    </aside>
  )
}

export default Sidebar