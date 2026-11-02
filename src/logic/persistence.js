// Shranjevanje napredka v localStorage (US8), da se odkritja ohranijo po osvežitvi strani.
// Čiste funkcije brez Reacta: storage podamo kot parameter, zato jih lahko testiramo v Node.js.

export const STORAGE_KEY = 'atomics:game'
export const STORAGE_VERSION = 1

// Shranimo samo trajne dele stanja; lastResult (zadnji izid) je le za trenutni prikaz.
export function serialize(state) {
  return JSON.stringify({
    version: STORAGE_VERSION,
    canvas: state.canvas,
    inventory: state.inventory,
    discoveries: state.discoveries,
    allUnlocked: state.allUnlocked,
  })
}

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value)

/**
 * Iz shranjenega niza naredi veljavno stanje ali vrne null.
 * Neznane snovi (npr. po spremembi molecules.json) preskoči, da igra ne pade.
 *
 * @param {string | null} raw
 * @param {{ initialState: object, exists: (id: string) => boolean, isFragment: (id: string) => boolean }} deps
 */
export function deserialize(raw, { initialState, exists, isFragment }) {
  if (!raw) return null

  let data
  try {
    data = JSON.parse(raw)
  } catch {
    return null
  }
  if (!data || data.version !== STORAGE_VERSION) return null

  const list = (value) => (Array.isArray(value) ? value : [])

  const seen = new Set()
  const discoveries = list(data.discoveries).filter((d) => {
    const ok = d && exists(d.id) && !seen.has(d.id) && isNumber(d.discoveredAt)
    if (ok) seen.add(d.id)
    return ok
  })

  // Začetni atomi so vedno v inventarju; fragmenti nikoli.
  const inventory = [
    ...new Set([
      ...initialState.inventory,
      ...list(data.inventory).filter((id) => typeof id === 'string' && exists(id) && !isFragment(id)),
    ]),
  ]

  const canvas = list(data.canvas).filter(
    (item) =>
      item && typeof item.id === 'string' && exists(item.substanceId) && isNumber(item.x) && isNumber(item.y),
  )

  return {
    ...initialState,
    canvas,
    inventory,
    discoveries,
    allUnlocked: data.allUnlocked === true,
    lastResult: null,
  }
}

// Branje in pisanje sta v try/catch: v zasebnem načinu ali ob polnem pomnilniku localStorage
// lahko vrže napako, igra pa mora delovati tudi brez shranjevanja.
export function loadState(storage, deps) {
  try {
    return deserialize(storage?.getItem(STORAGE_KEY) ?? null, deps)
  } catch {
    return null
  }
}

export function saveState(storage, state) {
  try {
    storage?.setItem(STORAGE_KEY, serialize(state))
    return true
  } catch {
    return false
  }
}

export function clearState(storage) {
  try {
    storage?.removeItem(STORAGE_KEY)
  } catch {
    // ni pomembno – ob naslednjem shranjevanju se stanje prepiše
  }
}
