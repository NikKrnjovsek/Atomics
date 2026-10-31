import { test } from 'node:test'
import assert from 'node:assert/strict'
import { placeProducts } from './placeProducts.js'

const extentOf = () => 30
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

test('glavni produkt nastane na mestu cilja', () => {
  const [main] = placeProducts({
    source: { x: 0, y: 200 },
    target: { x: 300, y: 200 },
    productIds: ['H2O'],
    others: [],
    extentOf,
  })
  assert.deepEqual(main, { x: 300, y: 200 })
})

test('ostanek je izvržen naprej v smeri gibanja', () => {
  const [main, remnant] = placeProducts({
    source: { x: 0, y: 200 },
    target: { x: 300, y: 200 },
    productIds: ['OH', 'H'],
    others: [],
    extentOf,
  })
  assert.ok(remnant.x > main.x)
  assert.ok(Math.abs(remnant.y - main.y) < 1e-9)
})

test('ostanek se izogne drugim elementom na platnu', () => {
  const blocker = { substanceId: 'N2', x: 376, y: 200 }
  const [, remnant] = placeProducts({
    source: { x: 0, y: 200 },
    target: { x: 300, y: 200 },
    productIds: ['OH', 'H'],
    others: [blocker],
    extentOf,
  })
  assert.ok(distance(remnant, blocker) >= 30 + 30)
})

test('produkti ostanejo znotraj platna', () => {
  const bounds = { width: 400, height: 300 }
  const positions = placeProducts({
    source: { x: 200, y: 150 },
    target: { x: 395, y: 150 },
    productIds: ['NaCl', 'Cl'],
    others: [],
    bounds,
    extentOf,
  })
  for (const { x, y } of positions) {
    assert.ok(x >= 30 && x <= bounds.width - 30)
    assert.ok(y >= 30 && y <= bounds.height - 30)
  }
})

test('več ostankov se med seboj ne prekriva', () => {
  const [main, ...remnants] = placeProducts({
    source: { x: 0, y: 200 },
    target: { x: 300, y: 200 },
    productIds: ['NaCl', 'H2O', 'H'],
    others: [],
    extentOf,
  })
  assert.ok(distance(remnants[0], remnants[1]) >= 60)
  for (const remnant of remnants) assert.ok(distance(remnant, main) >= 60)
})
