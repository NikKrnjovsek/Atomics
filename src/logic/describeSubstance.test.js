import { test } from 'node:test'
import assert from 'node:assert/strict'
import { describeBond, describeProperty, describeRejection } from './describeSubstance.js'

test('describeBond: kovalentna vez z redom', () => {
  assert.equal(describeBond({ bond: 'covalent', bondOrder: 1 }), 'kovalentna, enojna')
  assert.equal(describeBond({ bond: 'covalent', bondOrder: 2 }), 'kovalentna, dvojna')
  assert.equal(describeBond({ bond: 'covalent', bondOrder: 3 }), 'kovalentna, trojna')
})

test('describeBond: ionska vez nima reda', () => {
  assert.equal(describeBond({ bond: 'ionic', bondOrder: null }), 'ionska')
})

test('describeBond: brez vezi vrne null', () => {
  assert.equal(describeBond({}), null)
  assert.equal(describeBond(null), null)
})

test('describeProperty: polarnost in kislost', () => {
  assert.equal(describeProperty({ polarity: 'polar', acidBase: 'acid' }), 'polarna, kislina')
  assert.equal(describeProperty({ polarity: 'nonpolar', acidBase: null }), 'nepolarna')
  assert.equal(describeProperty({ polarity: null, acidBase: 'base' }), 'baza')
})

test('describeProperty: brez podatkov vrne null', () => {
  assert.equal(describeProperty({ polarity: null, acidBase: null }), null)
  assert.equal(describeProperty(null), null)
})

test('describeRejection: zdruzi formuli in imeni reaktantov', () => {
  const result = describeRejection([
    { formula: 'H₂O', name: 'voda' },
    { formula: 'Na', name: 'natrij' },
  ])
  assert.deepEqual(result, { formula: 'H₂O + Na', names: ['voda', 'natrij'] })
})

test('describeRejection: manjkajoca formula postane ?', () => {
  const result = describeRejection([{ name: 'neznano' }, { formula: 'O' }])
  assert.equal(result.formula, '? + O')
  assert.deepEqual(result.names, ['neznano'])
})

test('describeRejection: brez reaktantov vrne null', () => {
  assert.equal(describeRejection([]), null)
  assert.equal(describeRejection(null), null)
  assert.equal(describeRejection([null, undefined]), null)
})
