// Podatki igre, pripravljeni za uporabo v aplikaciji.
//   import { combine, explainRejection } from '../logic/gameData.js'
//   combine('H', 'O')            // → { product: { id: 'OH', kind: 'fragment', ... }, products, ... }
//   combine('H2', 'O').products  // → [OH, H] – prvi je glavni produkt, ostali so ostanki
//   explainRejection('N2', 'H2') // → 'Trojna vez v N₂ je zelo močna ...'
import atoms from '../data/atoms.json'
import molecules from '../data/molecules.json'
import { createCombiner } from './combine.js'

export const {
  combine,
  explainRejection,
  getSubstance,
  isFragment,
  countsInProgress,
  allSubstances,
  recipes,
} = createCombiner({
  atoms,
  substances: molecules.substances,
  recipes: molecules.recipes,
  rejections: molecules.rejections,
  rejectionDefaults: molecules.rejectionDefaults,
})

export { atoms }
// Števec napredka (x/19): brez fragmentov in dodatnih snovi, kot je SO₃.
export const TOTAL_SUBSTANCES = allSubstances.filter((s) => countsInProgress(s.id)).length
