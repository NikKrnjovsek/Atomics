import { useContext } from 'react'
import { GameContext } from './GameContext.js'

// const { canvas, inventory, discoveries, addToCanvas, combineOnCanvas, ... } = useGame()
export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame je treba uporabiti znotraj <GameProvider>.')
  return context
}
