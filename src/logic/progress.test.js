import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getProgress, thresholdFor } from './progress.js'
import { STAGES } from '../data/stages.js'

const [stage1, stage2, stage3, stage4] = STAGES.map((s) => s.substances)

test('prag je floor(0.75 * total): 4→3, 6→4, 4→3, 5→3', () => {
  assert.equal(thresholdFor(4), 3)
  assert.equal(thresholdFor(6), 4)
  assert.equal(thresholdFor(5), 3)
})

test('brez odkritij: stopnja 1, 0 %, vsi števci 0', () => {
  const { stage, percent, stages } = getProgress([])
  assert.equal(stage, 1)
  assert.equal(percent, 0)
  assert.deepEqual(stages.map((s) => s.discoveredCount), [0, 0, 0, 0])
})

test('prag 3/4 na stopnji 1 sproži prehod na stopnjo 2 (33 %)', () => {
  const below = getProgress(stage1.slice(0, 2)) // 2/4 – premalo
  assert.equal(below.stage, 1)
  assert.equal(below.percent, 0)

  const at = getProgress(stage1.slice(0, 3)) // 3/4 – prag dosežen
  assert.equal(at.stage, 2)
  assert.equal(at.percent, 33)
})

test('prag 4/6 na stopnji 2 sproži prehod na stopnjo 3 (66 %)', () => {
  const below = getProgress([...stage1, ...stage2.slice(0, 3)]) // 3/6 – premalo
  assert.equal(below.stage, 2)
  assert.equal(below.percent, 33)

  const at = getProgress([...stage1, ...stage2.slice(0, 4)]) // 4/6 – prag dosežen
  assert.equal(at.stage, 3)
  assert.equal(at.percent, 66)
})

test('kumulativnost: polna stopnja 2 brez stopnje 1 NE napreduje', () => {
  const { stage, percent, stages } = getProgress([...stage2])
  assert.equal(stage, 1)
  assert.equal(percent, 0)
  // Snovi se vseeno štejejo k svoji stopnji.
  assert.equal(stages[1].discoveredCount, stage2.length)
})

test('snov iz višje stopnje, odkrita prej, se šteje k svoji stopnji', () => {
  const { stages } = getProgress(['NaCl']) // NaCl je v stopnji 3
  assert.deepEqual(stages[2].discovered, ['NaCl'])
  assert.equal(stages[2].discoveredCount, 1)
})

test('prag 3/4 na stopnji 3 sproži prehod na stopnjo 4 (100 %)', () => {
  const ids = [...stage1.slice(0, 3), ...stage2.slice(0, 4), ...stage3.slice(0, 3)]
  const { stage, percent } = getProgress(ids)
  assert.equal(stage, 4)
  assert.equal(percent, 100)
})

test('stopnja 4 je zadnja: prag 3/5 ne sproži novega prehoda, snovi pa se štejejo', () => {
  const ids = [
    ...stage1.slice(0, 3),
    ...stage2.slice(0, 4),
    ...stage3.slice(0, 3),
    ...stage4.slice(0, 3), // 3/5 odkritih na zadnji stopnji
  ]
  const { stage, percent, stages } = getProgress(ids)
  assert.equal(stage, 4)
  assert.equal(percent, 100)
  assert.equal(stages[3].discoveredCount, 3)
})

test('vse odkrito: stopnja 4, 100 %, vsaka stopnja polna', () => {
  const all = STAGES.flatMap((s) => s.substances)
  const { stage, percent, stages } = getProgress(all)
  assert.equal(stage, 4)
  assert.equal(percent, 100)
  for (const s of stages) {
    assert.equal(s.discoveredCount, s.total)
  }
})
