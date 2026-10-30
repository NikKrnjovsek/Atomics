import structures from '../data/structures.json'
import { atomDiameter, chargeLabel } from './atomSize.js'
import { atoms as atomTypes, getSubstance } from './gameData.js'

const atomTypesBySymbol = new Map(atomTypes.map((atomType) => [atomType.symbol, atomType]))

const withSize = (atom) => ({
  ...atom,
  label: atom.label ?? chargeLabel(atom.symbol, atom.charge),
  size: atomDiameter(atomTypesBySymbol.get(atom.symbol), atom.charge),
})

const sizedStructures = new Map(
  Object.entries(structures).map(([id, { atoms, bonds }]) => [id, { atoms: atoms.map(withSize), bonds }]),
)

// Zgradba snovi za izris: atomi z odmikom od središča in vezi med njimi.
// Atom je sam svoja zgradba; snov brez zapisane zgradbe prikažemo kot en krog s formulo.
export function getStructure(substanceId) {
  if (sizedStructures.has(substanceId)) return sizedStructures.get(substanceId)

  const substance = getSubstance(substanceId)
  const label = substance?.type === 'substance' ? substance.formula : substanceId
  return { atoms: [withSize({ symbol: substanceId, label, x: 0, y: 0 })], bonds: [] }
}
