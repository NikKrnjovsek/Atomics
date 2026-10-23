import { useState } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import Atom from './components/Atom.jsx'
import AtomPalette from './components/AtomPalette.jsx'
import Sandbox, { SANDBOX_ID } from './components/Sandbox.jsx'
import { dropPosition } from './logic/dropPosition.js'
import { useSandboxAtoms } from './logic/useSandboxAtoms.js'
import './App.css'

function App() {
  const { atoms, addAtom } = useSandboxAtoms()
  const [draggedSymbol, setDraggedSymbol] = useState(null)

  const handleDragStart = ({ active }) => {
    setDraggedSymbol(active.data.current.symbol)
  }

  const handleDragEnd = ({ active, over }) => {
    setDraggedSymbol(null)
    if (over?.id !== SANDBOX_ID) return

    const { x, y } = dropPosition(active, over)
    addAtom(active.data.current.symbol, x, y)
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggedSymbol(null)}
    >
      <div className="app">
        <header className="app-header">
          <h1 className="logo">Atomics</h1>
        </header>

        <main className="workspace">
          <AtomPalette />
          <Sandbox atoms={atoms} />
        </main>
      </div>

      <DragOverlay dropAnimation={null}>
        {draggedSymbol && <Atom symbol={draggedSymbol} />}
      </DragOverlay>
    </DndContext>
  )
}

export default App
