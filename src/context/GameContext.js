import { createContext } from 'react'

// Sam objekt konteksta je v svoji datoteki, da GameProvider.jsx izvaža le komponento
// (pravilo react/only-export-components).
export const GameContext = createContext(null)
