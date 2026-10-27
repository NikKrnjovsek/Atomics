import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createCombiner, recipeKey } from './combine.js'

const load = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const atoms = load('../data/atoms.json')
const molecules = load('../data/molecules.json')
const data = { atoms, substances: molecules.substances, recipes: molecules.recipes }
const { combine, allSubstances } = createCombiner(data)

test('recipeKey ni odvisen od vrstnega reda', () => {
  assert.equal(recipeKey('H', 'Cl'), recipeKey('Cl', 'H'))
})

test('H + H → H₂', () => {
  const result = combine('H', 'H')
  assert.equal(result.product.id, 'H2')
  assert.equal(result.equation, 'H + H → H₂')
})

test('H₂ + O → H₂O, vrstni red ni pomemben', () => {
  assert.equal(combine('H2', 'O').product.id, 'H2O')
  assert.equal(combine('O', 'H2').product.id, 'H2O')
})

test('combine sprejme tudi objekte (atom, snov, element na platnu)', () => {
  assert.equal(combine({ symbol: 'H' }, { substanceId: 'Cl' }).product.id, 'HCl')
  assert.equal(combine({ id: 'H2' }, 'O').product.name, 'voda')
})

test('neobstoječa kombinacija vrne null', () => {
  assert.equal(combine('H', 'Na'), null)
  assert.equal(combine('H', 'neznano'), null)
  assert.equal(combine(null, 'H'), null)
})

test('nevtralizacija NaOH + HCl da dve snovi', () => {
  const result = combine('NaOH', 'HCl')
  assert.deepEqual(result.products.map((p) => p.id), ['NaCl', 'H2O'])
  assert.equal(result.equation, 'NaOH + HCl → NaCl + H₂O')
})

test('v igri je 19 snovi, po stopnjah 4 / 6 / 4 / 5', () => {
  assert.equal(allSubstances.length, 19)
  const perLevel = [1, 2, 3, 4].map((l) => allSubstances.filter((s) => s.level === l).length)
  assert.deepEqual(perLevel, [4, 6, 4, 5])
})

test('vsaka snov ima vsa polja za infoboks', () => {
  const required = ['id', 'formula', 'name', 'level', 'bond', 'description', 'foundIn', 'uses', 'hint']
  for (const s of allSubstances) {
    for (const field of required) assert.ok(s[field] != null && s[field] !== '', `${s.id}: ${field}`)
    assert.ok(['covalent', 'ionic'].includes(s.bond), `${s.id}: bond`)
  }
})

test('vsako snov je mogoče odkriti iz atomov', () => {
  const reachable = new Set(atoms.map((a) => a.symbol))
  let changed = true
  while (changed) {
    changed = false
    for (const { reactants, products } of molecules.recipes) {
      if (!reactants.every((r) => reachable.has(r))) continue
      for (const p of products) {
        if (!reachable.has(p)) {
          reachable.add(p)
          changed = true
        }
      }
    }
  }
  const missing = allSubstances.filter((s) => !reachable.has(s.id)).map((s) => s.id)
  assert.deepEqual(missing, [])
})

test('vsako snov stopnje N je mogoče odkriti samo z atomi, odklenjenimi do stopnje N', () => {
  for (const level of [1, 2, 3, 4]) {
    const reachable = new Set(atoms.filter((a) => a.unlockLevel <= level).map((a) => a.symbol))
    let changed = true
    while (changed) {
      changed = false
      for (const { reactants, products } of molecules.recipes) {
        if (!reactants.every((r) => reachable.has(r))) continue
        for (const p of products) if (!reachable.has(p) && reachable.add(p)) changed = true
      }
    }
    for (const s of allSubstances.filter((s) => s.level === level)) {
      assert.ok(reachable.has(s.id), `${s.id} ni dosegljiv na stopnji ${level}`)
    }
  }
})

test('neveljavni podatki vržejo napako', () => {
  assert.throws(() => createCombiner({ ...data, recipes: [{ reactants: ['H', 'X'], products: ['H2'] }] }))
  assert.throws(() =>
    createCombiner({ ...data, recipes: [molecules.recipes[0], { reactants: ['H', 'H'], products: ['O2'] }] }),
  )
})
