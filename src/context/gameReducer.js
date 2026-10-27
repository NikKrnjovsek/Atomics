// Čisti reducer globalnega stanja igre (brez Reacta), da ga lahko testiramo.
//
// Stanje:
//   canvas       – elementi na platnu: { id, substanceId, x, y }
//                  (substanceId je simbol atoma, npr. 'H', ali ID snovi, npr. 'H2O')
//   inventory    – ID-ji, ki jih učenec lahko vleče na platno (odklenjeni atomi + odkrite snovi)
//   discoveries  – odkrite snovi po vrsti: { id, discoveredAt }
//   lastResult   – izid zadnjega združevanja za infoboks / povratno informacijo (ali null)

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

// Razmik med produkti, kadar reakcija ustvari več snovi naenkrat.
export const PRODUCT_SPACING = 56

export function createInitialState(atoms) {
  return {
    canvas: [],
    inventory: atoms.filter((atom) => atom.unlocked).map((atom) => atom.symbol),
    discoveries: [],
    lastResult: null,
  }
}

const newId = () => crypto.randomUUID()

/**
 * @param {{ combine: Function, atoms: object[], createId?: () => string }} deps
 */
export function createGameReducer({ combine, atoms, createId = newId }) {
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

        const result = combine(source.substanceId, target.substanceId)
        if (!result) {
          return {
            ...state,
            lastResult: { type: 'no-recipe', reactants: [source.substanceId, target.substanceId] },
          }
        }

        const productIds = result.products.map((product) => product.id)
        const startX = target.x - ((productIds.length - 1) * PRODUCT_SPACING) / 2
        const newItems = productIds.map((substanceId, i) => ({
          id: createId(),
          substanceId,
          x: startX + i * PRODUCT_SPACING,
          y: target.y,
        }))

        const known = new Set(state.discoveries.map((d) => d.id))
        const atomSymbols = new Set(atoms.map((atom) => atom.symbol))
        const newDiscoveries = [...new Set(productIds)].filter(
          (id) => !known.has(id) && !atomSymbols.has(id),
        )
        const at = action.at ?? Date.now()

        return {
          ...state,
          canvas: [
            ...state.canvas.filter((item) => item.id !== source.id && item.id !== target.id),
            ...newItems,
          ],
          inventory: [...state.inventory, ...newDiscoveries.filter((id) => !state.inventory.includes(id))],
          discoveries: [...state.discoveries, ...newDiscoveries.map((id) => ({ id, discoveredAt: at }))],
          lastResult: {
            type: newDiscoveries.length > 0 ? 'discovery' : 'known',
            equation: result.equation,
            products: productIds,
            newDiscoveries,
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
