import { useMemo, useReducer } from 'react'
import {
  atoms,
  combine,
  countsInProgress,
  explainRejection,
  getSubstance,
  isFragment,
  TOTAL_SUBSTANCES,
} from '../logic/gameData.js'
import { placeProducts } from '../logic/placeProducts.js'
import { moleculeExtent } from '../logic/structures.js'
import { GameContext } from './GameContext.js'
import { ActionTypes, createGameReducer, createInitialState, progressOf } from './gameReducer.js'

const gameReducer = createGameReducer({
  combine,
  atoms,
  isFragment,
  explainRejection,
  placeProducts: (params) => placeProducts({ ...params, extentOf: moleculeExtent }),
})

// Globalno stanje igre: atomi na platnu, inventar in odkritja.
// Shranjevanje v localStorage (US8) dodamo v sprintu 2; stanje je že serializabilno.
function GameProvider({ children, initialState }) {
  const [state, dispatch] = useReducer(gameReducer, initialState ?? createInitialState(atoms))

  const value = useMemo(() => {
    const actions = {
      addToCanvas: (substanceId, x, y) =>
        dispatch({ type: ActionTypes.ADD_TO_CANVAS, substanceId, x, y }),
      moveOnCanvas: (id, x, y) => dispatch({ type: ActionTypes.MOVE_ON_CANVAS, id, x, y }),
      removeFromCanvas: (id) => dispatch({ type: ActionTypes.REMOVE_FROM_CANVAS, id }),
      clearCanvas: () => dispatch({ type: ActionTypes.CLEAR_CANVAS }),
      combineOnCanvas: (sourceId, targetId, bounds) =>
        dispatch({ type: ActionTypes.COMBINE, sourceId, targetId, bounds, at: Date.now() }),
      dismissResult: () => dispatch({ type: ActionTypes.DISMISS_RESULT }),
      unlockAtom: (symbol) => dispatch({ type: ActionTypes.UNLOCK_ATOM, symbol }),
      setUnlockAll: (value) => dispatch({ type: ActionTypes.SET_UNLOCK_ALL, value }),
      reset: () => dispatch({ type: ActionTypes.RESET }),
    }

    return {
      ...state,
      ...actions,
      // Odkrite stabilne snovi s polnimi podatki (id, formula, name ...) za <Sidebar discovered={...} />
      discoveredSubstances: state.discoveries
        .filter((d) => !isFragment(d.id))
        .map((d) => getSubstance(d.id)),
      // Odkriti fragmenti (OH, CH₃ ...) za mini infoboks
      discoveredFragments: state.discoveries
        .filter((d) => isFragment(d.id))
        .map((d) => getSubstance(d.id)),
      progress: {
        discovered: progressOf(state.discoveries, countsInProgress),
        total: TOTAL_SUBSTANCES,
      },
      isUnlocked: (id) => state.inventory.includes(id),
      getSubstance,
      isFragment,
      explainRejection,
    }
  }, [state])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export default GameProvider
