export const ELECTRON_DISTANCE = 36
const ELECTRON_SPREAD = (70 * Math.PI) / 180

function bondedNeighbours({ atoms, bonds }, index) {
  return bonds
    .filter((bond) => bond.from === index || bond.to === index)
    .map((bond) => atoms[bond.from === index ? bond.to : bond.from])
}

// Smer, ki kaže od vseh vezi atoma stran; pri simetrični razporeditvi vezi (ali brez njih) navzdol.
function directionAwayFromBonds(atom, neighbours) {
  const away = neighbours.reduce(
    (sum, other) => {
      const length = Math.hypot(other.x - atom.x, other.y - atom.y)
      return {
        x: sum.x - (other.x - atom.x) / length,
        y: sum.y - (other.y - atom.y) / length,
      }
    },
    { x: 0, y: 0 },
  )
  return Math.hypot(away.x, away.y) < 0.01 ? Math.PI / 2 : Math.atan2(away.y, away.x)
}

export function freeElectronPositions(structure) {
  return structure.atoms.flatMap((atom, index) => {
    const count = atom.freeElectrons ?? 0
    if (count === 0) return []

    const direction = directionAwayFromBonds(atom, bondedNeighbours(structure, index))

    return Array.from({ length: count }, (_, i) => {
      const angle = direction + (i - (count - 1) / 2) * ELECTRON_SPREAD
      return {
        x: atom.x + Math.cos(angle) * ELECTRON_DISTANCE,
        y: atom.y + Math.sin(angle) * ELECTRON_DISTANCE,
      }
    })
  })
}
