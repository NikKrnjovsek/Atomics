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
 * @param {{ atoms: object[], substances: object[], recipes: { reactants: string[], products: string[] }[] }} data
 */
export function createCombiner({ atoms, substances, recipes }) {
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

  const getSubstance = (id) => byId.get(id) ?? null

  /**
   * Preveri, ali kombinacija a + b ustreza receptu.
   * Vrne null, če recepta ni, sicer
   * { product, products, reactants, equation }, kjer je product glavna nova snov,
   * products pa vse nastale snovi (nevtralizacija da npr. NaCl in H₂O).
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
    }
  }

  return {
    combine,
    getSubstance,
    allSubstances: substances.map((s) => byId.get(s.id)),
    recipes,
  }
}
