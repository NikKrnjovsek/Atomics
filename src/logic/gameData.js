// Podatki igre, pripravljeni za uporabo v aplikaciji.
//   import { combine, getSubstance } from '../logic/gameData.js'
//   combine('H2', 'O')  // → { product: { id: 'H2O', ... }, products, reactants, equation }
import atoms from '../data/atoms.json'
import molecules from '../data/molecules.json'
import { createCombiner } from './combine.js'

export const { combine, getSubstance, allSubstances, recipes } = createCombiner({
  atoms,
  substances: molecules.substances,
  recipes: molecules.recipes,
})

export { atoms }
export const TOTAL_SUBSTANCES = allSubstances.length
