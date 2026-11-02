import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getProgress, TOTAL_COUNTED } from './progress.js'
import { STAGES } from '../data/stages.js'

const [stage1, stage2, stage3, stage4] = STAGES.map((s) => s.substances)
const approx = (a, b) => assert.ok(Math.abs(a - b) < 0.001, `${a} ≈ ${b}`)

test('skupno število štetih snovi je 19', () => {
  assert.equal(TOTAL_COUNTED, 19)
})

test('procent = odkrite / 19 * 100 pri 0, 1, 7 in 19 odkritih', () => {
  const all = STAGES.flatMap((s) => s.substances)
  approx(getProgress([]).percent, 0)
  approx(getProgress(all.slice(0, 1)).percent, (1 / 19) * 100)
  approx(getProgress(all.slice(0, 7)).percent, (7 / 19) * 100)
  approx(getProgress(all).percent, 100)
})

test('brez odkritij: stopnja 1, 0 %, vsi števci 0', () => {
  const { stage, percent, discoveredCount, stages } = getProgress([])
  assert.equal(stage, 1)
  approx(percent, 0)
  assert.equal(discoveredCount, 0)
  assert.deepEqual(stages.map((s) => s.discoveredCount), [0, 0, 0, 0])
})

test('stopnja 1: 3/4 še NI prehod, 4/4 JE', () => {
  const three = getProgress(stage1.slice(0, 3)) // 3/4
  assert.equal(three.stage, 1)

  const four = getProgress(stage1) // 4/4
  assert.equal(four.stage, 2)
})

test('stopnja 2: 5/6 še NI prehod, 6/6 JE', () => {
  const five = getProgress([...stage1, ...stage2.slice(0, 5)]) // 5/6
  assert.equal(five.stage, 2)

  const six = getProgress([...stage1, ...stage2]) // 6/6
  assert.equal(six.stage, 3)
})

test('stopnja 3: 4/4 preklopi na stopnjo 4', () => {
  const ids = [...stage1, ...stage2, ...stage3]
  assert.equal(getProgress(ids).stage, 4)
})

test('kumulativnost: polna stopnja 2 brez stopnje 1 NE napreduje', () => {
  const { stage, stages } = getProgress([...stage2])
  assert.equal(stage, 1)
  assert.equal(stages[1].discoveredCount, stage2.length) // snovi se vseeno štejejo k svoji stopnji
})

test('snov iz višje stopnje, odkrita prej, se šteje k svoji stopnji', () => {
  const { stages } = getProgress(['NaCl']) // NaCl je v stopnji 3
  assert.deepEqual(stages[2].discovered, ['NaCl'])
})

test('stopnja 4 je zadnja: ostaja 4, dokler ni vse odkrito', () => {
  const partial = [...stage1, ...stage2, ...stage3, ...stage4.slice(0, 3)]
  assert.equal(getProgress(partial).stage, 4)
})

test('vse odkrito: stopnja 4, 100 %, vsaka stopnja polna', () => {
  const all = STAGES.flatMap((s) => s.substances)
  const { stage, percent, stages } = getProgress(all)
  assert.equal(stage, 4)
  approx(percent, 100)
  for (const s of stages) {
    assert.equal(s.discoveredCount, s.total)
  }
})

test('stopnje nosijo podatke o odklepanju atomov', () => {
  const { stages } = getProgress([])
  assert.deepEqual(stages.map((s) => s.unlocks), [
    ['H', 'O', 'N', 'Cl'],
    ['C'],
    ['Na', 'Mg', 'Ca'],
    ['S'],
  ])
})
