# Podatkovni model in logika igre

## `src/data/atoms.json`
Seznam atomov v stranski vrstici.

| polje | pomen |
|---|---|
| `symbol` | kemijski simbol, hkrati ID atoma (`"H"`, `"Cl"`) |
| `name` | slovensko ime |
| `group` | `nekovina` / `kovina` / `halogen` (barva v vrstici) |
| `unlocked` | ali je atom na voljo na začetku |
| `unlockLevel` | stopnja, na kateri se atom odklene (Mg, Ca: 3; S: 4) |

## `src/data/molecules.json`
Dva seznama: `substances` (19 snovi) in `recipes` (recepti).

**Snov** (`substances[]`):

| polje | pomen |
|---|---|
| `id` | ASCII ID, npr. `"H2O"`, `"Ca(OH)2"` |
| `formula` | zapis za prikaz z indeksi, npr. `"H₂O"` |
| `name` | slovensko ime |
| `level` | stopnja 1–4 (4 / 6 / 4 / 5 snovi) |
| `kind` | `element` (molekula elementa) ali `compound` (spojina) |
| `bond` | `covalent` ali `ionic` |
| `bondOrder` | 1 / 2 / 3 za enojno, dvojno, trojno kovalentno vez; `null` pri ionskih in mešanih |
| `polarity` | `polar` / `nonpolar`; `null` pri ionskih spojinah |
| `acidBase` | `acid` / `base` / `null` |
| `description`, `foundIn`, `uses` | besedilo za infoboks |
| `hint` | namig (US11) |

**Recept** (`recipes[]`): `{ "reactants": ["H2", "O"], "products": ["H2O"] }`

- Vedno točno dva reaktanta (snovi gradimo postopoma iz parov). Vrstni red ni pomemben.
- Reaktant je lahko atom ali že odkrita snov.
- Produktov je lahko več (nevtralizacija NaOH + HCl → NaCl + H₂O, Na + H₂O → NaOH + H₂).
- Ista snov ima lahko več receptov (HCl iz H + Cl ali H₂ + Cl₂).
- Brez koeficientov, ker igra ne uči urejanja enačb.

## `combine(a, b)` – `src/logic/combine.js`, `src/logic/gameData.js`
```js
import { combine } from '../logic/gameData.js'
combine('H2', 'O')
// → { product: { id: 'H2O', formula: 'H₂O', name: 'voda', ... },
//     products: [ ... ], reactants: [ ... ], equation: 'H₂ + O → H₂O' }
combine('H', 'Na') // → null (recept ne obstaja)
```
Sprejme ID-je ali objekte (`{ symbol }`, `{ id }`, `{ substanceId }`). Ob nalaganju preveri podatke:
neznana snov v receptu, podvojen recept ali recept z več kot dvema reaktantoma vrže napako.

## Globalno stanje – `src/context/`
`<GameProvider>` (v `main.jsx`) hrani stanje z `useReducer`; v komponentah ga dobimo z `useGame()`.

| stanje | pomen |
|---|---|
| `canvas` | elementi na platnu `{ id, substanceId, x, y }` |
| `inventory` | ID-ji, ki jih lahko vlečemo (odklenjeni atomi + odkrite snovi) |
| `discoveries` | odkrite snovi po vrsti `{ id, discoveredAt }` |
| `lastResult` | izid zadnjega združevanja: `discovery` / `known` / `no-recipe` (za infoboks in US10) |

Akcije: `addToCanvas(substanceId, x, y)`, `moveOnCanvas(id, x, y)`, `removeFromCanvas(id)`,
`clearCanvas()`, `combineOnCanvas(sourceId, targetId)`, `dismissResult()`, `unlockAtom(symbol)`, `reset()`.
Izpeljano: `discoveredSubstances`, `progress` (`{ discovered, total }`), `isUnlocked(id)`, `getSubstance(id)`.

Reducer (`gameReducer.js`) je čista funkcija brez Reacta, zato je testiran v `gameReducer.test.js`.

## Testi
`npm test` (vgrajeni test runner Node.js, brez dodatnih paketov).
