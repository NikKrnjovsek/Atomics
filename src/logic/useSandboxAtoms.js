import { useState } from 'react'

export function createAtom(symbol, x, y) {
  return { id: crypto.randomUUID(), symbol, x, y }
}

export function useSandboxAtoms(initialAtoms = []) {
  const [atoms, setAtoms] = useState(initialAtoms)

  const addAtom = (symbol, x, y) => {
    setAtoms((current) => [...current, createAtom(symbol, x, y)])
  }

  return { atoms, addAtom }
}
