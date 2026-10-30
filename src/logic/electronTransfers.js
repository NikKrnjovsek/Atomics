import { CHARGE_VALUES } from './atomSize.js'

const chargeOf = (atom) => CHARGE_VALUES[atom.charge] ?? 0
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

// Vsak anion dobi toliko elektronov, kolikor je njegov naboj, od najbližjega kationa.
export function electronTransfers(atoms) {
  const cations = atoms.filter((atom) => chargeOf(atom) > 0)
  if (cations.length === 0) return []

  return atoms
    .filter((atom) => chargeOf(atom) < 0)
    .flatMap((anion) => {
      const cation = cations.reduce((nearest, candidate) =>
        distance(candidate, anion) < distance(nearest, anion) ? candidate : nearest,
      )
      return Array.from({ length: -chargeOf(anion) }, () => ({
        from: { x: cation.x, y: cation.y },
        to: { x: anion.x, y: anion.y },
      }))
    })
}
