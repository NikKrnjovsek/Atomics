import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createCombiner } from '../logic/combine.js'
import { ActionTypes, createGameReducer, createInitialState, progressOf } from './gameReducer.js'

const load = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const atoms = load('../data/atoms.json')
const molecules = load('../data/molecules.json')
const { combine, explainRejection, isFragment, countsInProgress } = createCombiner({
  atoms,
  substances: molecules.substances,
  recipes: molecules.recipes,
  rejections: molecules.rejections,
  rejectionDefaults: molecules.rejectionDefaults,
})

function setup() {
  let n = 0
  const reducer = createGameReducer({
    combine,
    atoms,
    isFragment,
    explainRejection,
    createId: () => `id${++n}`,
  })
  return { reducer, state: createInitialState(atoms) }
}

const add = (substanceId, x = 0, y = 0) => ({ type: ActionTypes.ADD_TO_CANVAS, substanceId, x, y })
const bond = (sourceId, targetId, at) => ({ type: ActionTypes.COMBINE, sourceId, targetId, at })
const run = (reducer, state, actions) => actions.reduce(reducer, state)

// Stanje z danimi elementi na platnu (in v inventarju), za teste kasnejših stopenj.
const withCanvas = (items, discoveries = []) => ({
  canvas: items.map(([id, substanceId, x = 0, y = 0]) => ({ id, substanceId, x, y })),
  inventory: items.map(([, substanceId]) => substanceId),
  discoveries: discoveries.map((id, i) => ({ id, discoveredAt: i })),
  lastResult: null,
})

test('začetni inventar vsebuje samo odklenjene atome', () => {
  const { state } = setup()
  assert.deepEqual(state.inventory, ['H', 'O', 'C', 'N', 'Cl', 'Na'])
  assert.deepEqual(state.canvas, [])
  assert.deepEqual(state.discoveries, [])
})

test('dodajanje na platno, premikanje in odstranjevanje', () => {
  const { reducer, state: s0 } = setup()
  let s = run(reducer, s0, [add('H', 10, 20), add('O', 30, 40)])
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
  const s = run(reducer, s0, [add('H', 0, 0), add('H', 100, 50), bond('id1', 'id2', 123)])

  assert.deepEqual(s.canvas, [{ id: 'id3', substanceId: 'H2', x: 100, y: 50 }])
  assert.deepEqual(s.discoveries, [{ id: 'H2', discoveredAt: 123 }])
  assert.ok(s.inventory.includes('H2'))
  assert.equal(s.lastResult.type, 'discovery')
  assert.equal(s.lastResult.equation, 'H + H → H₂')
})

test('lastResult vsebuje ID-je na platnu za animacijo', () => {
  const { reducer, state: s0 } = setup()
  const s = run(reducer, s0, [add('H'), add('H'), bond('id1', 'id2')])
  assert.equal(s.lastResult.sourceId, 'id1')
  assert.equal(s.lastResult.targetId, 'id2')
  assert.deepEqual(s.lastResult.createdIds, ['id3'])
  assert.equal(s.lastResult.recipeType, 'elementary')
})

test('fragment gre med odkritja, ne pa v inventar in ne v napredek', () => {
  const { reducer, state: s0 } = setup()
  const s = run(reducer, s0, [add('H'), add('O'), bond('id1', 'id2')])
  assert.deepEqual(s.canvas.map((i) => i.substanceId), ['OH'])
  assert.deepEqual(s.discoveries.map((d) => d.id), ['OH'])
  assert.ok(!s.inventory.includes('OH'))
  assert.equal(s.lastResult.type, 'discovery')
  assert.equal(progressOf(s.discoveries, countsInProgress), 0)
})

test('voda po korakih: H + O → OH, OH + H → H₂O', () => {
  const { reducer, state: s0 } = setup()
  const s = run(reducer, s0, [add('H'), add('O'), bond('id1', 'id2'), add('H'), bond('id4', 'id3')])
  assert.deepEqual(s.canvas.map((i) => i.substanceId), ['H2O'])
  assert.deepEqual(s.discoveries.map((d) => d.id), ['OH', 'H2O'])
  assert.ok(s.inventory.includes('H2O'))
  assert.equal(progressOf(s.discoveries, countsInProgress), 1)
})

test('ostanek se pojavi na platnu poleg glavnega produkta', () => {
  const { reducer } = setup()
  const s = reducer(withCanvas([['a', 'C', 0, 0], ['b', 'O2', 200, 100]]), bond('a', 'b'))
  assert.deepEqual(
    s.canvas.map(({ substanceId, x, y }) => [substanceId, x, y]),
    [['CO', 200, 100], ['O', 256, 100]],
  )
  assert.deepEqual(s.lastResult.createdIds.length, 2)
  assert.deepEqual(s.lastResult.newDiscoveries, ['CO'])
})

test('postavitev produktov dobi preostale elemente in meje platna', () => {
  let received
  const reducer = createGameReducer({
    combine,
    atoms,
    createId: () => 'new',
    placeProducts: (params) => {
      received = params
      return [{ x: 1, y: 2 }, { x: 3, y: 4 }]
    },
  })
  const state = withCanvas([['a', 'C', 0, 0], ['b', 'O2', 200, 100], ['c', 'N2', 50, 50]])
  const bounds = { width: 800, height: 600 }
  const s = reducer(state, { ...bond('a', 'b'), bounds })

  assert.deepEqual(received.productIds, ['CO', 'O'])
  assert.deepEqual(received.others.map((item) => item.id), ['c'])
  assert.deepEqual(received.bounds, bounds)
  assert.deepEqual(
    s.canvas.slice(1).map(({ substanceId, x, y }) => [substanceId, x, y]),
    [['CO', 1, 2], ['O', 3, 4]],
  )
})

test('ponovno odkritje ni novo odkritje', () => {
  const { reducer, state: s0 } = setup()
  const s = run(reducer, s0, [
    add('H'), add('H'), bond('id1', 'id2'),
    add('H'), add('H'), bond('id4', 'id5'),
  ])
  assert.equal(s.discoveries.length, 1)
  assert.equal(s.inventory.filter((id) => id === 'H2').length, 1)
  assert.equal(s.lastResult.type, 'known')
})

test('napačna kombinacija pusti platno in vrne razlago', () => {
  const { reducer, state: s0 } = setup()
  let s = run(reducer, s0, [add('H'), add('Na')])
  const before = s.canvas
  s = reducer(s, bond('id1', 'id2'))
  assert.equal(s.canvas, before)
  assert.deepEqual(s.lastResult, {
    type: 'no-recipe',
    sourceId: 'id1',
    targetId: 'id2',
    reactants: ['H', 'Na'],
    reason: 'Ti delci ne tvorijo stabilne snovi.',
  })
})

test('zavrnjena kombinacija N₂ + H₂ vrne posebno razlago', () => {
  const { reducer } = setup()
  const s = reducer(withCanvas([['a', 'N2'], ['b', 'H2']]), bond('a', 'b'))
  assert.equal(s.lastResult.type, 'no-recipe')
  assert.match(s.lastResult.reason, /Haber-Bosch/)
})

test('nevtralizacija postavi obe snovi na platno', () => {
  const { reducer } = setup()
  const s = reducer(withCanvas([['a', 'NaOH'], ['b', 'HCl', 200, 100]], ['NaOH', 'HCl']), bond('a', 'b', 3))
  assert.deepEqual(s.canvas.map((i) => i.substanceId), ['NaCl', 'H2O'])
  assert.deepEqual(s.lastResult.newDiscoveries, ['NaCl', 'H2O'])
})

test('Na + H₂O da NaOH in ostanek H, ki ni odkritje', () => {
  const { reducer } = setup()
  const s = reducer(withCanvas([['a', 'Na'], ['b', 'H2O']], ['H2O']), bond('a', 'b', 3))
  assert.deepEqual(s.canvas.map((i) => i.substanceId), ['NaOH', 'H'])
  assert.deepEqual(s.lastResult.newDiscoveries, ['NaOH'])
  assert.deepEqual(s.discoveries.map((d) => d.id), ['H2O', 'NaOH'])
})

test('SO₃ gre v inventar, a ne šteje v napredek', () => {
  const { reducer } = setup()
  const s = reducer(withCanvas([['a', 'SO2'], ['b', 'O']], ['SO2']), bond('a', 'b'))
  assert.ok(s.inventory.includes('SO3'))
  assert.equal(progressOf(s.discoveries, countsInProgress), 1)
})

test('odklepanje atoma in ponastavitev', () => {
  const { reducer, state: s0 } = setup()
  const s = reducer(s0, { type: ActionTypes.UNLOCK_ATOM, symbol: 'Mg' })
  assert.ok(s.inventory.includes('Mg'))
  assert.equal(reducer(s, { type: ActionTypes.UNLOCK_ATOM, symbol: 'Mg' }), s)
  assert.deepEqual(reducer(s, { type: ActionTypes.RESET }), createInitialState(atoms))
})
