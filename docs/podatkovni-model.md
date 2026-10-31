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
Štirje deli: `substances` (snovi in fragmenti), `recipes`, `rejections` in `rejectionDefaults`.

**Snov** (`substances[]`):

| polje | pomen |
|---|---|
| `id` | ASCII ID, npr. `"H2O"`, `"Ca(OH)2"` |
| `formula` | zapis za prikaz z indeksi, npr. `"H₂O"` |
| `name` | slovensko ime |
| `level` | stopnja 1–4 |
| `kind` | `element` (molekula elementa), `compound` (spojina) ali `fragment` (vmesni delec) |
| `bond` | `covalent` ali `ionic` |
| `bondOrder` | 1 / 2 / 3 za enojno, dvojno, trojno kovalentno vez; `null` pri ionskih in mešanih |
| `polarity` | `polar` / `nonpolar`; `null` pri ionskih spojinah in fragmentih |
| `acidBase` | `acid` / `base` / `null` |
| `description`, `foundIn`, `uses` | besedilo za infoboks (fragmenti nimajo `uses`) |
| `hint` | namig (US11), samo pri stabilnih snoveh |
| `freeElectrons` | samo pri fragmentih: koliko prostih elektronov ima delec |
| `countsInProgress` | `false`, če snov ne šteje v napredek x/19 (SO₃) |

V igri je 19 snovi, ki štejejo v napredek (stopnje 4 / 6 / 4 / 5), dodatna snov SO₃
in 6 fragmentov: OH, CH, CH₂, CH₃, NH, NH₂.

**Fragmenti** so realni, a nestabilni delci s prostimi elektroni (zato »hočejo« še eno vez).
Z njimi snovi gradimo po korakih: C → CH → CH₂ → CH₃ → CH₄, N → NH → NH₂ → NH₃, O → OH → H₂O.
Ne štejejo v napredek in ne gredo v inventar (obstajajo samo na platnu), so pa med odkritji
(za mini infoboks).

**Recept** (`recipes[]`, 46 receptov):
```json
{ "reactants": ["C", "O2"], "products": ["CO", "O"], "type": "elementary", "note": "Nepopolno gorenje ogljika." }
```
- Vedno točno dva reaktanta; vrstni red ni pomemben; vsak par ima en sam izid.
- **Vsak recept ohranja atome** (zakon o ohranitvi mase). Prvi produkt je glavni, ostali so
  ostanki, ki se pojavijo na platnu poleg njega (npr. H₂ + O → OH + H).
- `type`: `elementary` – dejanski trk dveh delcev (gorenje, ozračje);
  `net` – šolska reakcija, prikazana kot »polovica« (npr. Mg + O₂ → MgO + O iz 2 Mg + O₂ → 2 MgO).
- `note` (neobvezno): kratka razlaga reakcije.
- Brez koeficientov, ker igra ne uči urejanja enačb.

**Zavrnitve** (`rejections[]`): pari, ki jih bodo učenci verjetno poskusili, a se ne zgodijo,
z razlago (US10), npr. `{ "reactants": ["N2", "H2"], "reason": "Trojna vez v N₂ je zelo močna ..." }`.
`rejectionDefaults.metals` je razlaga za dve kovini, `rejectionDefaults.default` pa splošno besedilo.

## `combine(a, b)` in `explainRejection(a, b)` – `src/logic/combine.js`, `src/logic/gameData.js`
```js
import { combine, explainRejection } from '../logic/gameData.js'
combine('H2', 'O')
// → { product: { id: 'OH', kind: 'fragment', ... }, products: [OH, H], reactants: [...],
//     equation: 'H₂ + O → OH + H', type: 'elementary', note: 'Ključni korak gorenja vodika.' }
combine('C', 'H2')             // → null (recepta ni)
explainRejection('C', 'H2')    // → 'Ogljik potrebuje 4 vodike. Gradi postopoma: najprej C + H.'
explainRejection('Na', 'Na')   // → 'Kovine ne tvorijo molekul, ampak kovinsko mrežo.'
explainRejection('H', 'H')     // → null (recept obstaja)
```
`combine` sprejme ID-je ali objekte (`{ symbol }`, `{ id }`, `{ substanceId }`). Ob nalaganju se
preverijo podatki: neznana snov, podvojen recept, recept brez točno dveh reaktantov ali zavrnitev,
ki je hkrati recept, vržejo napako. `gameData.js` izvaža še `isFragment(id)`, `countsInProgress(id)`
in `TOTAL_SUBSTANCES` (19).

## Globalno stanje – `src/context/`
`<GameProvider>` (v `main.jsx`) hrani stanje z `useReducer`; v komponentah ga dobimo z `useGame()`.

| stanje | pomen |
|---|---|
| `canvas` | elementi na platnu `{ id, substanceId, x, y }` |
| `inventory` | ID-ji, ki jih lahko vlečemo (odklenjeni atomi + odkrite stabilne snovi, brez fragmentov) |
| `discoveries` | odkrite snovi in fragmenti po vrsti `{ id, discoveredAt }` |
| `lastResult` | izid zadnjega združevanja (glej spodaj) |

`lastResult` pri uspehu:
`{ type: 'discovery' | 'known', sourceId, targetId, createdIds, products, newDiscoveries, equation, recipeType, note }`
– `createdIds` so ID-ji novih elementov na platnu (prvi je glavni produkt), za animacijo.
Glavni produkt nastane na mestu cilja, ostanki 56 px desno od njega.

`lastResult` pri neuspehu: `{ type: 'no-recipe', sourceId, targetId, reactants, reason }`.

Akcije: `addToCanvas(substanceId, x, y)`, `moveOnCanvas(id, x, y)`, `removeFromCanvas(id)`,
`clearCanvas()`, `combineOnCanvas(sourceId, targetId)`, `dismissResult()`, `unlockAtom(symbol)`, `reset()`.
Izpeljano: `discoveredSubstances` (brez fragmentov), `discoveredFragments`, `progress`
(`{ discovered, total }`, brez fragmentov in SO₃), `isUnlocked(id)`, `getSubstance(id)`,
`isFragment(id)`, `explainRejection(a, b)`.

Reducer (`gameReducer.js`) je čista funkcija brez Reacta, zato je testiran v `gameReducer.test.js`.

## Testi
`npm test` (vgrajeni test runner Node.js, brez dodatnih paketov). Testi med drugim preverijo,
da vsak recept ohranja atome in da je vsaka snov dosegljiva z atomi, odklenjenimi do njene stopnje.
