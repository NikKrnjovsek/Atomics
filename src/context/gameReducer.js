// Čisti reducer globalnega stanja igre (brez Reacta), da ga lahko testiramo.
//
// Stanje:
//   canvas       – elementi na platnu: { id, substanceId, x, y }
//                  (substanceId je simbol atoma, npr. 'H', ali ID snovi, npr. 'H2O')
//   inventory    – ID-ji, ki jih učenec lahko vleče na platno (odklenjeni atomi + odkrite snovi)
//                  (fragmenti, npr. OH, CH₃, sem ne spadajo – obstajajo samo na platnu)
//   discoveries  – odkrite snovi in fragmenti po vrsti: { id, discoveredAt }
//   lastResult   – izid zadnjega združevanja za infoboks, animacijo in povratno informacijo:
//                  uspeh:   { type: 'discovery' | 'known', sourceId, targetId, createdIds,
//                             products, newDiscoveries, equation, recipeType, note }
//                  neuspeh: { type: 'no-recipe', sourceId, targetId, reactants, reason }
//                  createdIds so ID-ji novih elementov na platnu; prvi je glavni produkt.

export const ActionTypes = {
  ADD_TO_CANVAS: 'ADD_TO_CANVAS',
  MOVE_ON_CANVAS: 'MOVE_ON_CANVAS',
  REMOVE_FROM_CANVAS: 'REMOVE_FROM_CANVAS',
  CLEAR_CANVAS: 'CLEAR_CANVAS',
  COMBINE: 'COMBINE',
  DISMISS_RESULT: 'DISMISS_RESULT',
  UNLOCK_ATOM: 'UNLOCK_ATOM',
  RESET: 'RESET',
}

// Odmik ostankov od glavnega produkta (npr. H pri H₂ + O → OH + H).
export const PRODUCT_SPACING = 56

const placeSideBySide = ({ target, productIds }) =>
  productIds.map((_, i) => ({ x: target.x + i * PRODUCT_SPACING, y: target.y }))

export function createInitialState(atoms) {
  return {
    canvas: [],
    inventory: atoms.filter((atom) => atom.unlocked).map((atom) => atom.symbol),
    discoveries: [],
    lastResult: null,
  }
}

const newId = () => crypto.randomUUID()

// Napredek x/19: šteje samo stabilne snovi (brez fragmentov in dodatnih snovi, kot je SO₃).
export function progressOf(discoveries, countsInProgress) {
  return discoveries.filter((d) => countsInProgress(d.id)).length
}

/**
 * @param {{
 *   combine: Function,
 *   atoms: object[],
 *   isFragment?: (id: string) => boolean,
 *   explainRejection?: (a: string, b: string) => string | null,
 *   placeProducts?: (params: object) => { x: number, y: number }[],
 *   createId?: () => string,
 * }} deps
 */
export function createGameReducer({
  combine,
  atoms,
  isFragment = () => false,
  explainRejection = () => null,
  placeProducts = placeSideBySide,
  createId = newId,
}) {
  return function gameReducer(state, action) {
    switch (action.type) {
      case ActionTypes.ADD_TO_CANVAS: {
        const { substanceId, x, y } = action
        if (!state.inventory.includes(substanceId)) return state
        return { ...state, canvas: [...state.canvas, { id: createId(), substanceId, x, y }] }
      }

      // Premaknjeni element prestavimo na konec seznama, da se izriše na vrhu.
      case ActionTypes.MOVE_ON_CANVAS: {
        const moved = state.canvas.find((item) => item.id === action.id)
        if (!moved) return state
        const others = state.canvas.filter((item) => item.id !== action.id)
        return { ...state, canvas: [...others, { ...moved, x: action.x, y: action.y }] }
      }

      case ActionTypes.REMOVE_FROM_CANVAS:
        return { ...state, canvas: state.canvas.filter((item) => item.id !== action.id) }

      case ActionTypes.CLEAR_CANVAS:
        return { ...state, canvas: [] }

      // Element sourceId je spuščen na element targetId.
      case ActionTypes.COMBINE: {
        const source = state.canvas.find((item) => item.id === action.sourceId)
        const target = state.canvas.find((item) => item.id === action.targetId)
        if (!source || !target || source.id === target.id) return state

        const reactants = [source.substanceId, target.substanceId]
        const result = combine(...reactants)
        if (!result) {
          return {
            ...state,
            lastResult: {
              type: 'no-recipe',
              sourceId: source.id,
              targetId: target.id,
              reactants,
              reason: explainRejection(...reactants),
            },
          }
        }

        // Glavni produkt nastane na mestu cilja, ostanki ob njem.
        const productIds = result.products.map((product) => product.id)
        const remaining = state.canvas.filter((item) => item.id !== source.id && item.id !== target.id)
        const positions = placeProducts({
          source,
          target,
          productIds,
          others: remaining,
          bounds: action.bounds,
        })
        const newItems = productIds.map((substanceId, i) => ({
          id: createId(),
          substanceId,
          ...positions[i],
        }))

        const known = new Set(state.discoveries.map((d) => d.id))
        const atomSymbols = new Set(atoms.map((atom) => atom.symbol))
        const newDiscoveries = [...new Set(productIds)].filter(
          (id) => !known.has(id) && !atomSymbols.has(id),
        )
        // Fragmenti so nestabilni, zato ne gredo v inventar (ne moreš jih vleči iz vrstice).
        const newInventory = newDiscoveries.filter(
          (id) => !isFragment(id) && !state.inventory.includes(id),
        )
        const at = action.at ?? Date.now()

        return {
          ...state,
          canvas: [...remaining, ...newItems],
          inventory: [...state.inventory, ...newInventory],
          discoveries: [...state.discoveries, ...newDiscoveries.map((id) => ({ id, discoveredAt: at }))],
          lastResult: {
            type: newDiscoveries.length > 0 ? 'discovery' : 'known',
            sourceId: source.id,
            targetId: target.id,
            createdIds: newItems.map((item) => item.id),
            products: productIds,
            newDiscoveries,
            equation: result.equation,
            recipeType: result.type ?? null,
            note: result.note ?? null,
          },
        }
      }

      case ActionTypes.DISMISS_RESULT:
        return { ...state, lastResult: null }

      case ActionTypes.UNLOCK_ATOM: {
        const exists = atoms.some((atom) => atom.symbol === action.symbol)
        if (!exists || state.inventory.includes(action.symbol)) return state
        return { ...state, inventory: [...state.inventory, action.symbol] }
      }

      case ActionTypes.RESET:
        return createInitialState(atoms)

      default:
        return state
    }
  }
}
