import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createCombiner } from './combine.js'
import { createInitialState } from '../context/gameReducer.js'
import {
  STORAGE_KEY,
  clearState,
  deserialize,
  loadState,
  saveState,
  serialize,
} from './persistence.js'

const load = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const atoms = load('../data/atoms.json')
const molecules = load('../data/molecules.json')
const { getSubstance, isFragment } = createCombiner({
  atoms,
  substances: molecules.substances,
  recipes: molecules.recipes,
})

const initialState = createInitialState(atoms)
const deps = { initialState, exists: (id) => getSubstance(id) != null, isFragment }

// Preprost nadomestek za localStorage.
function memoryStorage() {
  const data = new Map()
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  }
}

const played = {
  ...initialState,
  canvas: [{ id: 'a', substanceId: 'H2O', x: 120, y: 80 }],
  inventory: [...initialState.inventory, 'H2', 'H2O'],
  discoveries: [
    { id: 'H2', discoveredAt: 1 },
    { id: 'OH', discoveredAt: 2 },
    { id: 'H2O', discoveredAt: 3 },
  ],
  lastResult: { type: 'discovery', products: ['H2O'] },
  allUnlocked: true,
}

test('shranjeno stanje se po nalaganju ohrani (brez lastResult)', () => {
  const storage = memoryStorage()
  assert.equal(saveState(storage, played), true)
  const restored = loadState(storage, deps)
  assert.deepEqual(restored, { ...played, lastResult: null })
})

test('brez shranjenega stanja ali ob napačni različici vrne null', () => {
  assert.equal(loadState(memoryStorage(), deps), null)
  assert.equal(deserialize(JSON.stringify({ version: 999 }), deps), null)
  assert.equal(deserialize('{ to ni json', deps), null)
})

test('neznane snovi se ob nalaganju preskočijo', () => {
  const raw = JSON.stringify({
    version: 1,
    canvas: [
      { id: 'a', substanceId: 'H2', x: 1, y: 2 },
      { id: 'b', substanceId: 'Unobtainium', x: 1, y: 2 },
      { id: 'c', substanceId: 'O', x: 'x', y: 2 },
    ],
    inventory: ['H2', 'neznano'],
    discoveries: [{ id: 'H2', discoveredAt: 1 }, { id: 'neznano', discoveredAt: 2 }, { id: 'H2', discoveredAt: 3 }],
  })
  const state = deserialize(raw, deps)
  assert.deepEqual(state.canvas.map((i) => i.id), ['a'])
  assert.deepEqual(state.discoveries, [{ id: 'H2', discoveredAt: 1 }])
  assert.ok(state.inventory.includes('H2'))
  assert.ok(!state.inventory.includes('neznano'))
})

test('začetni atomi so vedno v inventarju, fragmenti nikoli', () => {
  const raw = JSON.stringify({ version: 1, inventory: ['OH', 'H2'], discoveries: [], canvas: [] })
  const state = deserialize(raw, deps)
  for (const id of initialState.inventory) assert.ok(state.inventory.includes(id), id)
  assert.ok(!state.inventory.includes('OH'))
  assert.equal(state.allUnlocked, false)
})

test('napaka v localStorage ne podre igre', () => {
  const broken = {
    getItem: () => { throw new Error('SecurityError') },
    setItem: () => { throw new Error('QuotaExceededError') },
    removeItem: () => { throw new Error('SecurityError') },
  }
  assert.equal(loadState(broken, deps), null)
  assert.equal(saveState(broken, played), false)
  assert.doesNotThrow(() => clearState(broken))
  assert.equal(loadState(undefined, deps), null)
})

test('clearState izbriše shranjeno stanje', () => {
  const storage = memoryStorage()
  saveState(storage, played)
  clearState(storage)
  assert.equal(storage.getItem(STORAGE_KEY), null)
})

test('serialize ne shrani lastResult', () => {
  assert.equal(JSON.parse(serialize(played)).lastResult, undefined)
})
