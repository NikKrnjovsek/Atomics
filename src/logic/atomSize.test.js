import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { atomDiameter } from './atomSize.js'

const atomTypes = JSON.parse(readFileSync(new URL('../data/atoms.json', import.meta.url), 'utf8'))
const byRadius = (a, b) => a.radius - b.radius

test('kovine se kot kationi skrčijo, nekovine se kot anioni povečajo', () => {
  for (const atomType of atomTypes.filter((a) => a.ionRadius)) {
    const isMetal = atomType.group === 'kovina'
    const atom = atomDiameter(atomType)
    const ion = atomDiameter(atomType, isMetal ? '+' : '-')
    assert.ok(isMetal ? ion < atom : ion > atom, atomType.symbol)
  }
})

test('večji polmer pomeni večji krog na platnu', () => {
  const diameters = [...atomTypes].sort(byRadius).map((atomType) => atomDiameter(atomType))
  assert.deepEqual(diameters, [...diameters].sort((a, b) => a - b))
})
