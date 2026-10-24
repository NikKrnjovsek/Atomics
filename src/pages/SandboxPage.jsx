import { useState } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import Atom from '../components/Atom.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Sandbox, { SANDBOX_ID } from '../components/Sandbox.jsx'
import { dropPosition } from '../logic/dropPosition.js'
import { useSandboxAtoms } from '../logic/useSandboxAtoms.js'

function SandboxPage() {
    const { atoms, addAtom, moveAtom } = useSandboxAtoms()
    const [draggedSymbol, setDraggedSymbol] = useState(null)

    const handleDragStart = ({ active }) => {
        setDraggedSymbol(active.data.current.symbol)
    }

    const handleDragEnd = (event) => {
        setDraggedSymbol(null)
        if (event.over?.id !== SANDBOX_ID) return

        const { symbol, atomId } = event.active.data.current
        const { x, y } = dropPosition(event)

        if (atomId) moveAtom(atomId, x, y)
        else addAtom(symbol, x, y)
    }

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setDraggedSymbol(null)}
        >
            <div className="sandbox-layout">
                <Sidebar discovered={[]} />

                <main className="sandbox-canvas">
                    <Sandbox atoms={atoms} />
                </main>
            </div>

            <DragOverlay modifiers={[snapCenterToCursor]} dropAnimation={null}>
                {draggedSymbol && <Atom symbol={draggedSymbol} />}
            </DragOverlay>
        </DndContext>
    )
}

export default SandboxPage
