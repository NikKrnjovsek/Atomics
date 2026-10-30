import { freeElectronPositions } from '../logic/freeElectrons.js'
import { getStructure } from '../logic/structures.js'
import Atom from './Atom.jsx'
import './Molecule.css'

const BOND_GAP = 7
const ELECTRON_RADIUS = 4.5

// Dvojna in trojna vez sta vzporedni črti, razmaknjeni pravokotno na smer vezi.
function BondLines({ from, to, order }) {
  const length = Math.hypot(to.x - from.x, to.y - from.y)
  const nx = -(to.y - from.y) / length
  const ny = (to.x - from.x) / length

  return Array.from({ length: order }, (_, i) => {
    const offset = (i - (order - 1) / 2) * BOND_GAP
    return (
      <line
        key={i}
        x1={from.x + nx * offset}
        y1={from.y + ny * offset}
        x2={to.x + nx * offset}
        y2={to.y + ny * offset}
      />
    )
  })
}

const defaultRenderAtom = (atom) => <Atom symbol={atom.symbol} label={atom.label} size={atom.size} />

// Molekula je izrisana okoli svojega središča (0, 0); atomi imajo odmike iz structures.json.
function Molecule({ substanceId, renderAtom = defaultRenderAtom }) {
  const structure = getStructure(substanceId)
  const { atoms, bonds } = structure

  return (
    <div className="molecule">
      <svg className="molecule__bonds" aria-hidden="true">
        {bonds.map((bond, i) => (
          <BondLines key={i} from={atoms[bond.from]} to={atoms[bond.to]} order={bond.order} />
        ))}
        {freeElectronPositions(structure).map((electron, i) => (
          <circle
            key={`electron-${i}`}
            className="molecule__electron"
            cx={electron.x}
            cy={electron.y}
            r={ELECTRON_RADIUS}
          />
        ))}
      </svg>
      {atoms.map((atom, i) => (
        <div key={i} className="molecule__atom" style={{ left: atom.x, top: atom.y }}>
          {renderAtom(atom, i)}
        </div>
      ))}
    </div>
  )
}

export default Molecule
