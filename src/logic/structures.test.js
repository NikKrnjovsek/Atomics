import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { atomDiameter } from './atomSize.js'

const load = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const structures = load('../data/structures.json')
const molecules = load('../data/molecules.json')
const atomTypes = new Map(load('../data/atoms.json').map((atom) => [atom.symbol, atom]))

const CHARGES = { '+': 1, '2+': 2, '-': -1, '2-': -2 }
const MIN_GAP = 1

const countSymbols = (symbols) =>
  symbols.reduce((counts, symbol) => ({ ...counts, [symbol]: (counts[symbol] ?? 0) + 1 }), {})

// "Ca(OH)₂" → { Ca: 1, O: 2, H: 2 }
function parseFormula(formula) {
  const ascii = formula
    .replace(/[₀-₉]/g, (digit) => digit.charCodeAt(0) - 0x2080)
    .replace(/\(([^)]+)\)(\d+)/g, (_, group, count) => group.repeat(Number(count)))
  const counts = {}
  for (const [, symbol, count] of ascii.matchAll(/([A-Z][a-z]?)(\d*)/g)) {
    counts[symbol] = (counts[symbol] ?? 0) + Number(count || 1)
  }
  return counts
}

const radiusOf = (atom) => atomDiameter(atomTypes.get(atom.symbol), atom.charge) / 2

for (const [id, { atoms, bonds }] of Object.entries(structures)) {
  test(`zgradba ${id} ustreza formuli in ima veljavne vezi`, () => {
    const substance = molecules.substances.find((s) => s.id === id)
    assert.ok(substance, `snov ${id} ne obstaja`)
    assert.ok(atoms.every((atom) => atomTypes.has(atom.symbol)))
    assert.deepEqual(countSymbols(atoms.map((atom) => atom.symbol)), parseFormula(substance.formula))

    for (const { from, to, order } of bonds) {
      assert.ok(atoms[from] && atoms[to] && from !== to)
      assert.ok([1, 2, 3].includes(order))
    }

    const freeElectrons = atoms.reduce((sum, atom) => sum + (atom.freeElectrons ?? 0), 0)
    assert.equal(freeElectrons, substance.freeElectrons ?? 0)
  })

  test(`atomi v ${id} se ne prekrivajo`, () => {
    atoms.forEach((a, i) =>
      atoms.slice(i + 1).forEach((b) => {
        const distance = Math.hypot(a.x - b.x, a.y - b.y)
        assert.ok(distance >= radiusOf(a) + radiusOf(b) + MIN_GAP, `${a.symbol} in ${b.symbol}`)
      }),
    )
  })
}

test('vsaka snov in vmesni delec ima zgradbo', () => {
  const missing = molecules.substances.map((s) => s.id).filter((id) => !structures[id])
  assert.deepEqual(missing, [])
})

test('ionske spojine so nevtralne, kovalentne pa brez nabojev', () => {
  for (const substance of molecules.substances) {
    const charges = structures[substance.id].atoms.map((atom) => CHARGES[atom.charge] ?? 0)
    if (substance.bond === 'ionic') {
      assert.equal(charges.reduce((sum, charge) => sum + charge, 0), 0, substance.id)
    } else {
      assert.ok(charges.every((charge) => charge === 0), substance.id)
    }
  }
})
