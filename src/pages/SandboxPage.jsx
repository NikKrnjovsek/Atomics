import { useState } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import Atom from '../components/Atom.jsx'
import Sidebar, { SIDEBAR_ID } from '../components/Sidebar.jsx'
import Sandbox, { SANDBOX_ID } from '../components/Sandbox.jsx'
import { useGame } from '../context/useGame.js'
import { dropPosition } from '../logic/dropPosition.js'

function SandboxPage() {
    const {
        canvas,
        inventory,
        discoveredSubstances,
        addToCanvas,
        moveOnCanvas,
        removeFromCanvas,
    } = useGame()
    const [draggedId, setDraggedId] = useState(null)

    const handleDragStart = ({ active }) => {
        setDraggedId(active.data.current.substanceId)
    }

    const handleDragEnd = (event) => {
        setDraggedId(null)
        const { substanceId, canvasId } = event.active.data.current
        const target = event.over?.id

        if (target === SIDEBAR_ID) {
            if (canvasId) removeFromCanvas(canvasId)
            return
        }
        if (target !== SANDBOX_ID) return

        const { x, y } = dropPosition(event)

        if (canvasId) moveOnCanvas(canvasId, x, y)
        else addToCanvas(substanceId, x, y)
    }

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setDraggedId(null)}
        >
            <div className="sandbox-layout">
                <Sidebar inventory={inventory} discovered={discoveredSubstances} />

                <main className="sandbox-canvas">
                    <Sandbox items={canvas} />
                </main>
            </div>

            <DragOverlay modifiers={[snapCenterToCursor]} dropAnimation={null}>
                {draggedId && <Atom symbol={draggedId} />}
            </DragOverlay>
        </DndContext>
    )
}

export default SandboxPage
