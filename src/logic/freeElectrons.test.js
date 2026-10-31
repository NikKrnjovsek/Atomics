import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ELECTRON_GAP, freeElectronPositions } from './freeElectrons.js'

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

test('atom brez prostih elektronov nima pik', () => {
  const structure = { atoms: [{ symbol: 'H', x: 0, y: 0 }], bonds: [] }
  assert.deepEqual(freeElectronPositions(structure), [])
})

test('prosti elektron je na nasprotni strani od vezi', () => {
  const structure = {
    atoms: [{ symbol: 'O', x: -40, y: 0, size: 52, freeElectrons: 1 }, { symbol: 'H', x: 40, y: 0 }],
    bonds: [{ from: 0, to: 1, order: 1 }],
  }
  const [electron] = freeElectronPositions(structure)
  assert.ok(Math.abs(electron.x - (-40 - 52 / 2 - ELECTRON_GAP)) < 1e-9)
  assert.ok(Math.abs(electron.y) < 1e-9)
})

test('več prostih elektronov je razporejenih simetrično in stran od vezanih atomov', () => {
  const carbon = { symbol: 'C', x: 0, y: -25, size: 55, freeElectrons: 2 }
  const hydrogens = [{ symbol: 'H', x: -63, y: 24 }, { symbol: 'H', x: 63, y: 24 }]
  const structure = {
    atoms: [carbon, ...hydrogens],
    bonds: [{ from: 0, to: 1, order: 1 }, { from: 0, to: 2, order: 1 }],
  }
  const [left, right] = freeElectronPositions(structure)

  assert.ok(Math.abs(left.x + right.x) < 1e-9)
  assert.ok(Math.abs(left.y - right.y) < 1e-9)
  assert.ok(left.y < carbon.y)
  for (const electron of [left, right]) {
    assert.ok(Math.abs(distance(electron, carbon) - (55 / 2 + ELECTRON_GAP)) < 1e-9)
  }
})
