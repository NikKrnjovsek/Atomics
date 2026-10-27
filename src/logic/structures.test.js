import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const load = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const structures = load('../data/structures.json')
const molecules = load('../data/molecules.json')
const atomSymbols = new Set(load('../data/atoms.json').map((atom) => atom.symbol))

const countSymbols = (symbols) =>
  symbols.reduce((counts, symbol) => ({ ...counts, [symbol]: (counts[symbol] ?? 0) + 1 }), {})

// "H₂O" → { H: 2, O: 1 }; dovolj za formule brez oklepajev.
function parseFormula(formula) {
  const ascii = formula.replace(/[₀-₉]/g, (digit) => digit.charCodeAt(0) - 0x2080)
  const counts = {}
  for (const [, symbol, count] of ascii.matchAll(/([A-Z][a-z]?)(\d*)/g)) {
    counts[symbol] = (counts[symbol] ?? 0) + Number(count || 1)
  }
  return counts
}

for (const [id, { atoms, bonds }] of Object.entries(structures)) {
  test(`zgradba ${id} ustreza formuli in ima veljavne vezi`, () => {
    const substance = molecules.substances.find((s) => s.id === id)
    assert.ok(substance, `snov ${id} ne obstaja`)
    assert.ok(atoms.every((atom) => atomSymbols.has(atom.symbol)))
    assert.deepEqual(countSymbols(atoms.map((atom) => atom.symbol)), parseFormula(substance.formula))

    for (const { from, to, order } of bonds) {
      assert.ok(atoms[from] && atoms[to] && from !== to)
      assert.ok([1, 2, 3].includes(order))
    }
  })
}
