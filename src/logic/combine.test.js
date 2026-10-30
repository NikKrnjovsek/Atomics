import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createCombiner, recipeKey } from './combine.js'

const load = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const atoms = load('../data/atoms.json')
const molecules = load('../data/molecules.json')
const data = {
  atoms,
  substances: molecules.substances,
  recipes: molecules.recipes,
  rejections: molecules.rejections,
  rejectionDefaults: molecules.rejectionDefaults,
}
const { combine, explainRejection, allSubstances, isFragment, countsInProgress } =
  createCombiner(data)
const ids = (result) => result.products.map((p) => p.id)

// "Ca(OH)₂" → { Ca: 1, O: 2, H: 2 }
function countAtoms(formula) {
  const ascii = formula
    .replace(/[₀-₉]/g, (d) => d.charCodeAt(0) - 0x2080)
    .replace(/\(([^)]+)\)(\d+)/g, (_, group, n) => group.repeat(Number(n)))
  const counts = {}
  for (const [, symbol, n] of ascii.matchAll(/([A-Z][a-z]?)(\d*)/g)) {
    counts[symbol] = (counts[symbol] ?? 0) + Number(n || 1)
  }
  return counts
}

const formulaOf = (id) =>
  atoms.find((a) => a.symbol === id)?.symbol ?? molecules.substances.find((s) => s.id === id).formula

function sumAtoms(substanceIds) {
  const total = {}
  for (const id of substanceIds) {
    for (const [symbol, n] of Object.entries(countAtoms(formulaOf(id)))) {
      total[symbol] = (total[symbol] ?? 0) + n
    }
  }
  return Object.fromEntries(Object.entries(total).sort())
}

// Vse, kar je dosegljivo iz danih atomov z recepti.
function reachableFrom(startIds) {
  const reachable = new Set(startIds)
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
  return reachable
}

test('countAtoms pravilno prešteje atome, tudi z oklepaji', () => {
  assert.deepEqual(countAtoms('Ca(OH)₂'), { Ca: 1, O: 2, H: 2 })
  assert.deepEqual(countAtoms('H₂SO₄'), { H: 2, S: 1, O: 4 })
})

test('vsak recept ohranja atome (zakon o ohranitvi mase)', () => {
  for (const { reactants, products } of molecules.recipes) {
    assert.deepEqual(
      sumAtoms(products),
      sumAtoms(reactants),
      `${reactants.join(' + ')} → ${products.join(' + ')}`,
    )
  }
})

test('v igri je 46 receptov z veljavnim tipom', () => {
  assert.equal(molecules.recipes.length, 46)
  for (const r of molecules.recipes) assert.ok(['elementary', 'net'].includes(r.type), r.reactants.join('+'))
})

test('recipeKey ni odvisen od vrstnega reda', () => {
  assert.equal(recipeKey('H', 'Cl'), recipeKey('Cl', 'H'))
})

test('H + H → H₂', () => {
  const result = combine('H', 'H')
  assert.equal(result.product.id, 'H2')
  assert.equal(result.equation, 'H + H → H₂')
  assert.equal(result.type, 'elementary')
})

test('voda nastane po korakih prek OH', () => {
  assert.equal(combine('H', 'O').product.id, 'OH')
  assert.equal(combine('OH', 'H').product.id, 'H2O')
  assert.deepEqual(ids(combine('O', 'H2')), ['OH', 'H'])
  assert.deepEqual(ids(combine('H2', 'OH')), ['H2O', 'H'])
})

test('metan in amoniak se gradita z dodajanjem vodika', () => {
  let current = 'C'
  for (const next of ['CH', 'CH2', 'CH3', 'CH4']) {
    current = combine(current, 'H').product.id
    assert.equal(current, next)
  }
  current = 'N'
  for (const next of ['NH', 'NH2', 'NH3']) {
    current = combine(current, 'H').product.id
    assert.equal(current, next)
  }
})

test('ostanki: C + O₂ → CO + O, Mg + O₂ → MgO + O, H₂ + Cl₂ → HCl + HCl', () => {
  assert.deepEqual(ids(combine('C', 'O2')), ['CO', 'O'])
  assert.deepEqual(ids(combine('Mg', 'O2')), ['MgO', 'O'])
  assert.deepEqual(ids(combine('H2', 'Cl2')), ['HCl', 'HCl'])
  assert.equal(combine('Mg', 'O2').type, 'net')
})

test('kisli dež: SO₂ + O → SO₃, SO₃ + H₂O → H₂SO₄', () => {
  assert.equal(combine('SO2', 'O').product.id, 'SO3')
  assert.equal(combine('SO3', 'H2O').product.id, 'H2SO4')
  assert.equal(combine('SO2', 'H2O2').product.id, 'H2SO4')
})

test('combine sprejme tudi objekte (atom, snov, element na platnu)', () => {
  assert.equal(combine({ symbol: 'H' }, { substanceId: 'Cl' }).product.id, 'HCl')
  assert.equal(combine({ id: 'OH' }, 'H').product.name, 'voda')
})

test('neobstoječa ali odstranjena kombinacija vrne null', () => {
  assert.equal(combine('H', 'Na'), null)
  assert.equal(combine('C', 'H2'), null)
  assert.equal(combine('N2', 'H2'), null)
  assert.equal(combine('H', 'neznano'), null)
  assert.equal(combine(null, 'H'), null)
})

test('nevtralizacija NaOH + HCl da dve snovi', () => {
  const result = combine('NaOH', 'HCl')
  assert.deepEqual(ids(result), ['NaCl', 'H2O'])
  assert.equal(result.equation, 'NaOH + HCl → NaCl + H₂O')
})

test('explainRejection: posebna razlaga, kovine, splošno besedilo', () => {
  assert.match(explainRejection('H2', 'N2'), /Haber-Bosch/)
  assert.match(explainRejection('C', 'H2'), /4 vodike/)
  assert.match(explainRejection('Na', 'Na'), /kovinsko mrežo/)
  assert.match(explainRejection('Mg', 'Ca'), /kovinsko mrežo/)
  assert.equal(explainRejection('OH', 'Na'), 'Ti delci ne tvorijo stabilne snovi.')
  assert.equal(explainRejection('H', 'H'), null)
})

test('zavrnjene kombinacije niso hkrati recepti', () => {
  for (const { reactants } of molecules.rejections) assert.equal(combine(...reactants), null)
})

test('19 snovi šteje v napredek, po stopnjah 4 / 6 / 4 / 5', () => {
  const counted = allSubstances.filter((s) => countsInProgress(s.id))
  assert.equal(counted.length, 19)
  const perLevel = [1, 2, 3, 4].map((l) => counted.filter((s) => s.level === l).length)
  assert.deepEqual(perLevel, [4, 6, 4, 5])
  assert.equal(countsInProgress('SO3'), false)
  assert.equal(countsInProgress('OH'), false)
})

test('6 fragmentov s številom prostih elektronov', () => {
  const fragments = allSubstances.filter((s) => isFragment(s.id))
  assert.deepEqual(
    fragments.map((f) => [f.id, f.freeElectrons]),
    [['OH', 1], ['CH', 3], ['CH2', 2], ['CH3', 1], ['NH', 2], ['NH2', 1]],
  )
})

test('vsaka snov ima vsa polja za infoboks (fragmenti za mini infoboks)', () => {
  const required = ['id', 'formula', 'name', 'level', 'bond', 'description', 'foundIn']
  for (const s of allSubstances) {
    const fields = isFragment(s.id) ? [...required, 'freeElectrons'] : [...required, 'uses', 'hint']
    for (const field of fields) assert.ok(s[field] != null && s[field] !== '', `${s.id}: ${field}`)
    assert.ok(['covalent', 'ionic'].includes(s.bond), `${s.id}: bond`)
  }
})

test('vsako snov in fragment je mogoče odkriti iz atomov', () => {
  const reachable = reachableFrom(atoms.map((a) => a.symbol))
  const missing = allSubstances.filter((s) => !reachable.has(s.id)).map((s) => s.id)
  assert.deepEqual(missing, [])
})

test('vsako snov stopnje N je mogoče odkriti z atomi, odklenjenimi do stopnje N', () => {
  for (const level of [1, 2, 3, 4]) {
    const reachable = reachableFrom(atoms.filter((a) => a.unlockLevel <= level).map((a) => a.symbol))
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
  assert.throws(() =>
    createCombiner({ ...data, rejections: [{ reactants: ['H', 'H'], reason: 'x' }] }),
  )
})
