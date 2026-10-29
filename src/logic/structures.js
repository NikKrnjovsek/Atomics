import structures from '../data/structures.json'
import { getSubstance } from './gameData.js'

// Zgradba snovi za izris: atomi z odmikom od središča in vezi med njimi.
// Atom je sam svoja zgradba; snov brez zapisane zgradbe prikažemo kot en krog s formulo.
export function getStructure(substanceId) {
  if (structures[substanceId]) return structures[substanceId]

  const substance = getSubstance(substanceId)
  const label = substance?.type === 'substance' ? substance.formula : substanceId
  return { atoms: [{ symbol: substanceId, label, x: 0, y: 0 }], bonds: [] }
}
