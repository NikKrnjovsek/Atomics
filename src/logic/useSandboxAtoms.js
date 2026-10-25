import { useState } from 'react'

export function createAtom(symbol, x, y) {
  return { id: crypto.randomUUID(), symbol, x, y }
}

export function useSandboxAtoms(initialAtoms = []) {
  const [atoms, setAtoms] = useState(initialAtoms)

  const addAtom = (symbol, x, y) => {
    setAtoms((current) => [...current, createAtom(symbol, x, y)])
  }

  // Zadnji atom v seznamu se izriše na vrhu, zato premaknjenega prestavimo na konec.
  const moveAtom = (id, x, y) => {
    setAtoms((current) => {
      const moved = current.find((atom) => atom.id === id)
      const others = current.filter((atom) => atom.id !== id)
      return [...others, { ...moved, x, y }]
    })
  }

  const removeAtom = (id) => {
    setAtoms((current) => current.filter((atom) => atom.id !== id))
  }

  return { atoms, addAtom, moveAtom, removeAtom }
}
