import { test } from 'node:test'
import assert from 'node:assert/strict'
import { electronTransfers } from './electronTransfers.js'

const sodium = { symbol: 'Na', charge: '+', x: -38, y: 0 }
const chloride = { symbol: 'Cl', charge: '-', x: 38, y: 0 }

test('kovalentna molekula nima prenosa elektronov', () => {
  assert.deepEqual(electronTransfers([{ symbol: 'H', x: 0, y: 0 }, { symbol: 'Cl', x: 80, y: 0 }]), [])
})

test('pri NaCl en elektron preide z natrija na klor', () => {
  assert.deepEqual(electronTransfers([sodium, chloride]), [
    { from: { x: -38, y: 0 }, to: { x: 38, y: 0 } },
  ])
})

test('magnezij odda dva elektrona, vsakemu kloru enega', () => {
  const magnesium = { symbol: 'Mg', charge: '2+', x: 0, y: 0 }
  const transfers = electronTransfers([
    magnesium,
    { symbol: 'Cl', charge: '-', x: -72, y: 0 },
    { symbol: 'Cl', charge: '-', x: 72, y: 0 },
  ])
  assert.deepEqual(transfers.map((t) => t.to.x), [-72, 72])
  assert.ok(transfers.every((t) => t.from.x === 0))
})

test('kisik kot O²⁻ sprejme dva elektrona', () => {
  const transfers = electronTransfers([
    { symbol: 'Mg', charge: '2+', x: -33, y: 0 },
    { symbol: 'O', charge: '2-', x: 33, y: 0 },
  ])
  assert.equal(transfers.length, 2)
})
