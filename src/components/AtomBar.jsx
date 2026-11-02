import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import atomTypes from '../data/atoms.json'
import './AtomBar.css'

// Vrstni red atomov v otoku – po stopnjah odklepanja (zadnji je S, ki se odklene na stopnji 4).
const ATOM_ORDER = ['H', 'O', 'N', 'Cl', 'C', 'Na', 'Mg', 'Ca', 'S']
const orderedAtoms = [
  ...ATOM_ORDER.map((symbol) => atomTypes.find((atom) => atom.symbol === symbol)).filter(Boolean),
  ...atomTypes.filter((atom) => !ATOM_ORDER.includes(atom.symbol)),
]

// draggable atom – ENAKA draggable logika kot prej v Sidebarju (id palette-<simbol>, data.substanceId).
// isNew – pravkar odklenjen atom kratko poskoči/zasveti, da ga učenec opazi.
function AtomChip({ symbol, name, group, isNew }) {
  const { setNodeRef, listeners, attributes } = useDraggable({
    id: `palette-${symbol}`,
    data: { substanceId: symbol },
  })

  return (
    <button
      type="button"
      ref={setNodeRef}
      className={`atom-chip atom-chip--${group}${isNew ? ' atom-chip--new' : ''}`}
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
// inventory – odklenjeni atomi (odklepajo se po stopnjah); allUnlocked – Toggle "odkleni vse".
function AtomBar({ inventory = [], allUnlocked = false, onToggleUnlockAll }) {
  // Zaznamo pravkar odklenjene atome (primerjava s prejšnjim inventarjem med izrisom, ne v efektu),
  // da jih kratko poudarimo. inventory dobi novo referenco le ob dejanski spremembi.
  const [prevInventory, setPrevInventory] = useState(inventory)
  const [justUnlocked, setJustUnlocked] = useState([])
  if (inventory !== prevInventory) {
    const added = inventory.filter((symbol) => !prevInventory.includes(symbol))
    setPrevInventory(inventory)
    if (added.length > 0) setJustUnlocked(added)
  }

  return (
    <div className="island atom-bar">
      <div className="atom-bar__row">
        {orderedAtoms.map((atom) =>
          allUnlocked || inventory.includes(atom.symbol) ? (
            <AtomChip key={atom.symbol} {...atom} isNew={justUnlocked.includes(atom.symbol)} />
          ) : (
            <LockedChip key={atom.symbol} {...atom} />
          ),
        )}
      </div>

      {/* Toggle "odkleni vse atome" – ročni bližnjica za odklepanje vseh atomov (npr. za testiranje). */}
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
