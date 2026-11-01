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

// Odkrita snov (npr. H₂O) – ista draggable logika kot atomi, da jo je mogoče vleči na platno.
function SubstanceChip({ substance }) {
  const { setNodeRef, listeners, attributes } = useDraggable({
    id: `palette-${substance.id}`,
    data: { substanceId: substance.id },
  })

  return (
    <button
      type="button"
      ref={setNodeRef}
      className="atom-chip atom-chip--substance"
      title={substance.name}
      aria-label={substance.name}
      {...listeners}
      {...attributes}
    >
      {substance.formula ?? substance.id}
    </button>
  )
}

// Plavajoči otok z atomi na vrhu zaslona.
// inventory – odklenjene snovi; discovered – odkrite snovi (za ločilno črto); allUnlocked – toggle.
function AtomBar({ inventory = [], discovered = [], allUnlocked = false, onToggleUnlockAll }) {
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

      {discovered.length > 0 && (
        <>
          <span className="atom-bar__divider" aria-hidden="true" />
          <div className="atom-bar__row">
            {discovered.map((substance) => (
              <SubstanceChip key={substance.id} substance={substance} />
            ))}
          </div>
        </>
      )}

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
