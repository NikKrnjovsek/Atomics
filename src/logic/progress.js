import { STAGES } from '../data/stages.js'

// Skupno število štetih snovi (19). SO₃ in fragmenti niso v nobeni stopnji, zato se ne štejejo.
export const TOTAL_COUNTED = STAGES.reduce((sum, stage) => sum + stage.substances.length, 0)

/**
 * Izračuna napredek IZKLJUČNO iz seznama odkritih ID-jev (brez shranjenega stanja v reducerju).
 * Ker se odkritja le kopičijo, izračunana stopnja nikoli ne pade nazaj.
 *
 * Vrstica se polni enakomerno: vsaka odkrita snov izmed 19 prispeva enak delež (100/19 ≈ 5,3 %).
 * Na naslednjo stopnjo se preklopi šele, ko so odkrite VSE snovi trenutne stopnje (kumulativno).
 *
 * @param {string[]} discoveredIds – ID-ji odkritih snovi (fragmenti in SO₃ se preprosto ne ujemajo)
 * @returns {{
 *   stage: number,                 // trenutna stopnja 1–4
 *   percent: number,               // procent vrstice = odkrite / 19 * 100 (zvezno)
 *   discoveredCount: number,       // skupaj odkritih štetih snovi
 *   total: number,                 // 19
 *   stages: Array<{ name, substances, unlocks, discovered, discoveredCount, total }>
 * }}
 */
export function getProgress(discoveredIds = []) {
  const found = new Set(discoveredIds)

  const stages = STAGES.map((stage) => {
    const discovered = stage.substances.filter((id) => found.has(id))
    return {
      name: stage.name,
      substances: stage.substances,
      unlocks: stage.unlocks,
      discovered,
      discoveredCount: discovered.length,
      total: stage.substances.length,
    }
  })

  // Kumulativni prehodi: na stopnjo k prideš le, če so VSE snovi vseh prejšnjih stopenj odkrite.
  // Stopnja 4 je zadnja – za njo ni prehoda.
  let stage = 1
  for (let i = 0; i < stages.length - 1; i++) {
    if (stages[i].discoveredCount === stages[i].total) {
      stage = i + 2
    } else {
      break
    }
  }

  const discoveredCount = stages.reduce((sum, s) => sum + s.discoveredCount, 0)
  const percent = (discoveredCount / TOTAL_COUNTED) * 100

  return { stage, percent, discoveredCount, total: TOTAL_COUNTED, stages }
}
