import { STAGES } from '../data/stages.js'

// Procent napredka je vezan na STOPNJO (ne na posamezne snovi): 0 / 33 / 66 / 100 %.
const STAGE_PERCENT = [0, 33, 66, 100]

// Prag za prehod na naslednjo stopnjo: vsaj 75 % snovi trenutne stopnje (zaokroženo navzdol).
// Npr. 4 → 3, 6 → 4, 5 → 3.
export function thresholdFor(total) {
  return Math.floor(0.75 * total)
}

/**
 * Izračuna napredek IZKLJUČNO iz seznama odkritih ID-jev (brez shranjenega stanja v reducerju).
 * Ker se odkritja le kopičijo, izračunana stopnja nikoli ne pade nazaj.
 *
 * @param {string[]} discoveredIds – ID-ji odkritih snovi (fragmenti in SO₃ se preprosto ne ujemajo)
 * @returns {{
 *   stage: number,                 // trenutna stopnja 1–4
 *   percent: number,               // procent vrstice (0/33/66/100)
 *   stages: Array<{ name, substances, discovered, discoveredCount, total }>
 * }}
 */
export function getProgress(discoveredIds = []) {
  const found = new Set(discoveredIds)

  const stages = STAGES.map((stage) => {
    const discovered = stage.substances.filter((id) => found.has(id))
    return {
      name: stage.name,
      substances: stage.substances,
      discovered,
      discoveredCount: discovered.length,
      total: stage.substances.length,
    }
  })

  // Kumulativni prehodi: na stopnjo k prideš le, če je izpolnjen prag VSEH prejšnjih stopenj.
  // Stopnja 4 je zadnja – za njo ni prehoda.
  let stage = 1
  for (let i = 0; i < stages.length - 1; i++) {
    if (stages[i].discoveredCount >= thresholdFor(stages[i].total)) {
      stage = i + 2
    } else {
      break
    }
  }

  return { stage, percent: STAGE_PERCENT[stage - 1], stages }
}
