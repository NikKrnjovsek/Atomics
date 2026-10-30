// Logika združevanja snovi. Datoteka ne uvaža JSON-a neposredno, zato jo lahko
// testiramo v Node.js brez Vite. Za uporabo v aplikaciji glej gameData.js.

// Ključ recepta ne sme biti odvisen od vrstnega reda: H + Cl in Cl + H sta ista kombinacija.
export function recipeKey(a, b) {
  return [a, b].sort().join('+')
}

// Iz ID-ja, atoma ({ symbol }), snovi ({ id }) ali elementa na platnu ({ substanceId })
// naredi ID snovi, da lahko combine kličemo s tistim, kar je pri roki.
export function toSubstanceId(value) {
  if (typeof value === 'string') return value
  return value?.substanceId ?? value?.id ?? value?.symbol ?? null
}

// Zapis reakcije za prikaz, npr. "H₂ + O → H₂O". Brez koeficientov, ker jih igra ne uči.
export function formatEquation(reactants, products) {
  const side = (items) => items.map((item) => item.formula).join(' + ')
  return `${side(reactants)} → ${side(products)}`
}

/**
 * Sestavi funkcijo combine nad podanimi podatki.
 *
 * @param {{
 *   atoms: object[],
 *   substances: object[],
 *   recipes: { reactants: string[], products: string[], type?: string, note?: string }[],
 *   rejections?: { reactants: string[], reason: string }[],
 *   rejectionDefaults?: { metals?: string, default?: string },
 * }} data
 */
export function createCombiner({
  atoms,
  substances,
  recipes,
  rejections = [],
  rejectionDefaults = {},
}) {
  const byId = new Map()
  for (const atom of atoms) {
    byId.set(atom.symbol, { ...atom, id: atom.symbol, formula: atom.symbol, type: 'atom' })
  }
  for (const substance of substances) {
    if (byId.has(substance.id)) throw new Error(`Podvojen ID snovi: ${substance.id}`)
    byId.set(substance.id, { ...substance, type: 'substance' })
  }

  const recipesByKey = new Map()
  for (const recipe of recipes) {
    if (recipe.reactants.length !== 2) {
      throw new Error(`Recept mora imeti točno dva reaktanta: ${recipe.reactants.join(' + ')}`)
    }
    for (const id of [...recipe.reactants, ...recipe.products]) {
      if (!byId.has(id)) throw new Error(`Recept uporablja neznano snov: ${id}`)
    }
    const key = recipeKey(...recipe.reactants)
    if (recipesByKey.has(key)) throw new Error(`Podvojen recept: ${key}`)
    recipesByKey.set(key, recipe)
  }

  const rejectionsByKey = new Map()
  for (const { reactants, reason } of rejections) {
    for (const id of reactants) {
      if (!byId.has(id)) throw new Error(`Zavrnitev uporablja neznano snov: ${id}`)
    }
    const key = recipeKey(...reactants)
    if (recipesByKey.has(key)) throw new Error(`Zavrnjena kombinacija je tudi recept: ${key}`)
    rejectionsByKey.set(key, reason)
  }

  const getSubstance = (id) => byId.get(id) ?? null
  const isFragment = (id) => getSubstance(id)?.kind === 'fragment'
  // Fragmenti in dodatne snovi (countsInProgress: false, npr. SO₃) ne štejejo v napredek x/19.
  const countsInProgress = (id) => {
    const substance = getSubstance(id)
    return substance?.type === 'substance' && !isFragment(id) && substance.countsInProgress !== false
  }

  /**
   * Preveri, ali kombinacija a + b ustreza receptu.
   * Vrne null, če recepta ni, sicer
   * { product, products, reactants, equation, type, note }, kjer je product glavna nova
   * snov, ostali products pa ostanki (npr. H₂ + O → OH + H). Vsak recept ohranja atome.
   * type je 'elementary' (dejanski trk delcev) ali 'net' (šolska reakcija).
   */
  function combine(a, b) {
    const idA = toSubstanceId(a)
    const idB = toSubstanceId(b)
    if (!idA || !idB) return null

    const recipe = recipesByKey.get(recipeKey(idA, idB))
    if (!recipe) return null

    const reactants = [getSubstance(idA), getSubstance(idB)]
    const products = recipe.products.map(getSubstance)

    return {
      product: products[0],
      products,
      reactants,
      equation: formatEquation(reactants, products),
      type: recipe.type ?? null,
      note: recipe.note ?? null,
    }
  }

  /**
   * Razlaga, zakaj se a in b ne združita (za povratno informacijo, US10).
   * Vrne null, če recept obstaja; sicer posebno razlago za ta par,
   * razlago za dve kovini ali splošno besedilo.
   */
  function explainRejection(a, b) {
    const idA = toSubstanceId(a)
    const idB = toSubstanceId(b)
    const key = recipeKey(idA, idB)
    if (recipesByKey.has(key)) return null
    if (rejectionsByKey.has(key)) return rejectionsByKey.get(key)

    const isMetal = (id) => getSubstance(id)?.group === 'kovina'
    if (isMetal(idA) && isMetal(idB) && rejectionDefaults.metals) return rejectionDefaults.metals

    return rejectionDefaults.default ?? 'Ti delci ne tvorijo stabilne snovi.'
  }

  const allSubstances = substances.map((s) => byId.get(s.id))

  return {
    combine,
    explainRejection,
    getSubstance,
    isFragment,
    countsInProgress,
    allSubstances,
    recipes,
  }
}
