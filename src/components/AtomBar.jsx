import { useDraggable } from '@dnd-kit/core'
import atomTypes from '../data/atoms.json'
import './AtomBar.css'

// Vrstni red atomov v otoku (po wireframu). Lastnosti še vedno iz atoms.json
const ATOM_ORDER = ['H', 'O', 'N', 'Cl', 'C', 'Na', 'S', 'Mg', 'Ca']
const orderedAtoms = [
  ...ATOM_ORDER.map((symbol) => atomTypes.find((atom) => atom.symbol === symbol)).filter(Boolean),
  ...atomTypes.filter((atom) => !ATOM_ORDER.includes(atom.symbol)),
]

// draggable atom – ENAKA draggable logika kot prej v Sidebarju (id palette-<simbol>, data.substanceId).
function AtomChip({ symbol, name, group }) {
  const { setNodeRef, listeners, attributes } = useDraggable({
    id: `palette-${symbol}`,
    data: { substanceId: symbol },
  })

  return (
    <button
      type="button"
      ref={setNodeRef}
      className={`atom-chip atom-chip--${group}`}
      title={name}
      aria-label={name}
      {...listeners}
      {...attributes}
    >
      {symbol}
    </button>
  )
}

// Zaklenjen atom: siv, dotted, ni vlečljiv.
function LockedChip({ symbol, name }) {
  return (
    <div className="atom-chip atom-chip--locked" aria-label={`${name} – zaklenjeno`}>
      {symbol}
    </div>
  )
}

// Island z atomi na vrhu zaslona – prikazuje SAMO atome.
// Odkrite snovi so zdaj v laboratorijskem dnevniku (JournalButton), ne več tukaj.
// inventory – odklenjeni atomi; allUnlocked – Toggle"odkleni vse".
function AtomBar({ inventory = [], allUnlocked = false, onToggleUnlockAll }) {
  return (
    <div className="island atom-bar">
      <div className="atom-bar__row">
        {orderedAtoms.map((atom) =>
          allUnlocked || inventory.includes(atom.symbol) ? (
            <AtomChip key={atom.symbol} {...atom} />
          ) : (
            <LockedChip key={atom.symbol} {...atom} />
          ),
        )}
      </div>

      {/* Toggle "odkleni vse atome" – ohranjen, ker odklepanje po stopnjah še ni implementirano. */}
      <span className="atom-bar__divider" aria-hidden="true" />
      <label className="atom-bar__toggle" title="Odkleni vse atome">
        <input
          type="checkbox"
          checked={allUnlocked}
          onChange={(event) => onToggleUnlockAll?.(event.target.checked)}
          aria-label="Odkleni vse atome"
        />
        <span className="atom-bar__toggle-track" aria-hidden="true" />
      </label>
    </div>
  )
}

export default AtomBar
