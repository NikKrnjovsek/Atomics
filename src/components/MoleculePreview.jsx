import { moleculeExtent } from '../logic/structures.js'
import Molecule from './Molecule.jsx'
import './MoleculePreview.css'

// Predstavitveni okvir, ki molekulo postavi na sredino in jo pomanjša,
// da se prilega kvadratu size × size px le izris.
function MoleculePreview({ substanceId, size = 96 }) {
  const extent = moleculeExtent(substanceId)
  const padding = 10
  const scale = Math.min(1, (size / 2 - padding) / extent)

  return (
    <div className="molecule-preview" style={{ width: size, height: size }}>
      <div className="molecule-preview__inner" style={{ transform: `scale(${scale})` }}>
        <Molecule substanceId={substanceId} />
      </div>
    </div>
  )
}

export default MoleculePreview
