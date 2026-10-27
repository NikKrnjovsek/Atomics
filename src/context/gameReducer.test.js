import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createCombiner } from '../logic/combine.js'
import { ActionTypes, createGameReducer, createInitialState } from './gameReducer.js'

const load = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const atoms = load('../data/atoms.json')
const molecules = load('../data/molecules.json')
const { combine } = createCombiner({ atoms, substances: molecules.substances, recipes: molecules.recipes })

function setup() {
  let n = 0
  const reducer = createGameReducer({ combine, atoms, createId: () => `id${++n}` })
  return { reducer, state: createInitialState(atoms) }
}

const add = (substanceId, x = 0, y = 0) => ({ type: ActionTypes.ADD_TO_CANVAS, substanceId, x, y })

test('začetni inventar vsebuje samo odklenjene atome', () => {
  const { state } = setup()
  assert.deepEqual(state.inventory, ['H', 'O', 'C', 'N', 'Cl', 'Na'])
  assert.deepEqual(state.canvas, [])
  assert.deepEqual(state.discoveries, [])
})

test('dodajanje na platno, premikanje in odstranjevanje', () => {
  const { reducer, state: s0 } = setup()
  let s = reducer(s0, add('H', 10, 20))
  s = reducer(s, add('O', 30, 40))
  assert.deepEqual(s.canvas.map((i) => i.substanceId), ['H', 'O'])

  s = reducer(s, { type: ActionTypes.MOVE_ON_CANVAS, id: 'id1', x: 99, y: 98 })
  assert.deepEqual(s.canvas.at(-1), { id: 'id1', substanceId: 'H', x: 99, y: 98 })

  s = reducer(s, { type: ActionTypes.REMOVE_FROM_CANVAS, id: 'id2' })
  assert.deepEqual(s.canvas.map((i) => i.id), ['id1'])
})

test('zaklenjenega atoma ni mogoče dodati na platno', () => {
  const { reducer, state } = setup()
  assert.equal(reducer(state, add('Mg')), state)
})

test('pravilna kombinacija ustvari novo snov in jo doda med odkritja in v inventar', () => {
  const { reducer, state: s0 } = setup()
  let s = reducer(s0, add('H', 0, 0))
  s = reducer(s, add('H', 100, 50))
  s = reducer(s, { type: ActionTypes.COMBINE, sourceId: 'id1', targetId: 'id2', at: 123 })

  assert.deepEqual(s.canvas, [{ id: 'id3', substanceId: 'H2', x: 100, y: 50 }])
  assert.deepEqual(s.discoveries, [{ id: 'H2', discoveredAt: 123 }])
  assert.ok(s.inventory.includes('H2'))
  assert.equal(s.lastResult.type, 'discovery')
  assert.equal(s.lastResult.equation, 'H + H → H₂')
})

test('ponovno odkritje ni novo odkritje', () => {
  const { reducer, state: s0 } = setup()
  let s = s0
  for (const action of [add('H'), add('H'), { type: ActionTypes.COMBINE, sourceId: 'id1', targetId: 'id2' }]) {
    s = reducer(s, action)
  }
  for (const action of [add('H'), add('H'), { type: ActionTypes.COMBINE, sourceId: 'id4', targetId: 'id5' }]) {
    s = reducer(s, action)
  }
  assert.equal(s.discoveries.length, 1)
  assert.equal(s.inventory.filter((id) => id === 'H2').length, 1)
  assert.equal(s.lastResult.type, 'known')
})

test('napačna kombinacija pusti platno in vrne povratno informacijo', () => {
  const { reducer, state: s0 } = setup()
  let s = reducer(reducer(s0, add('H')), add('Na'))
  const before = s.canvas
  s = reducer(s, { type: ActionTypes.COMBINE, sourceId: 'id1', targetId: 'id2' })
  assert.equal(s.canvas, before)
  assert.deepEqual(s.lastResult, { type: 'no-recipe', reactants: ['H', 'Na'] })
})

test('reakcija z dvema produktoma postavi obe snovi na platno', () => {
  const { reducer } = setup()
  const s0 = {
    canvas: [
      { id: 'a', substanceId: 'NaOH', x: 0, y: 0 },
      { id: 'b', substanceId: 'HCl', x: 200, y: 100 },
    ],
    inventory: ['NaOH', 'HCl'],
    discoveries: [{ id: 'NaOH', discoveredAt: 1 }, { id: 'HCl', discoveredAt: 2 }],
    lastResult: null,
  }
  const s = reducer(s0, { type: ActionTypes.COMBINE, sourceId: 'a', targetId: 'b', at: 3 })
  assert.deepEqual(s.canvas.map((i) => i.substanceId), ['NaCl', 'H2O'])
  assert.deepEqual(s.lastResult.newDiscoveries, ['NaCl', 'H2O'])
})

test('Na + H₂O da tudi vodik, ki ni podvojen med odkritji', () => {
  const { reducer } = setup()
  const s0 = {
    canvas: [
      { id: 'a', substanceId: 'Na', x: 0, y: 0 },
      { id: 'b', substanceId: 'H2O', x: 0, y: 0 },
    ],
    inventory: ['Na', 'H2O', 'H2'],
    discoveries: [{ id: 'H2', discoveredAt: 1 }, { id: 'H2O', discoveredAt: 2 }],
    lastResult: null,
  }
  const s = reducer(s0, { type: ActionTypes.COMBINE, sourceId: 'a', targetId: 'b', at: 3 })
  assert.deepEqual(s.lastResult.newDiscoveries, ['NaOH'])
  assert.deepEqual(s.discoveries.map((d) => d.id), ['H2', 'H2O', 'NaOH'])
})

test('odklepanje atoma in ponastavitev', () => {
  const { reducer, state: s0 } = setup()
  let s = reducer(s0, { type: ActionTypes.UNLOCK_ATOM, symbol: 'Mg' })
  assert.ok(s.inventory.includes('Mg'))
  assert.equal(reducer(s, { type: ActionTypes.UNLOCK_ATOM, symbol: 'Mg' }), s)
  assert.deepEqual(reducer(s, { type: ActionTypes.RESET }), createInitialState(atoms))
})
