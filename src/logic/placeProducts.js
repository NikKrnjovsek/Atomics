const GAP = 16
const EDGE_PADDING = 8
const TURN = Math.PI / 6
const DIRECTION_STEPS = [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6].map((step) => step * TURN)

function clampToBounds(point, extent, bounds) {
  if (!bounds) return point
  const clamp = (value, size) =>
    Math.min(Math.max(value, extent + EDGE_PADDING), size - extent - EDGE_PADDING)
  return { x: clamp(point.x, bounds.width), y: clamp(point.y, bounds.height) }
}

const overlaps = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) < a.extent + b.extent + GAP

/**
 * Glavni produkt ostane na mestu cilja, ostanke pa izvrže naprej v smeri gibanja
 * (od vira proti cilju). Če je tam že kaj drugega, poskusi sosednje smeri.
 *
 * @param {{
 *   source: { x: number, y: number },
 *   target: { x: number, y: number },
 *   productIds: string[],
 *   others: { substanceId: string, x: number, y: number }[],
 *   bounds?: { width: number, height: number },
 *   extentOf: (substanceId: string) => number,
 * }} params
 */
export function placeProducts({ source, target, productIds, others, bounds, extentOf }) {
  const [mainId, ...remnantIds] = productIds
  const mainExtent = extentOf(mainId)
  const main = { ...clampToBounds(target, mainExtent, bounds), extent: mainExtent }

  const obstacles = others.map((item) => ({ x: item.x, y: item.y, extent: extentOf(item.substanceId) }))
  const placed = [main]
  const forward = Math.atan2(target.y - source.y, target.x - source.x)

  for (const id of remnantIds) {
    const extent = extentOf(id)
    const distance = main.extent + extent + GAP
    const candidates = DIRECTION_STEPS.map((step) => ({
      ...clampToBounds(
        {
          x: main.x + Math.cos(forward + step) * distance,
          y: main.y + Math.sin(forward + step) * distance,
        },
        extent,
        bounds,
      ),
      extent,
    }))
    const free = candidates.find((candidate) =>
      [...placed, ...obstacles].every((other) => !overlaps(candidate, other)),
    )
    placed.push(free ?? candidates[0])
  }

  return placed.map(({ x, y }) => ({ x, y }))
}
