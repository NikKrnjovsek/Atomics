import { useState } from 'react'
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import Molecule from '../components/Molecule.jsx'
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
        combineOnCanvas,
    } = useGame()
    const [dragged, setDragged] = useState(null)

    const handleDragStart = ({ active }) => {
        const { substanceId, canvasId } = active.data.current
        setDragged({ substanceId, fromPalette: !canvasId })
    }

    const handleDragEnd = (event) => {
        setDragged(null)
        const { substanceId, canvasId, x, y } = event.active.data.current
        const target = event.over?.id

        if (target === SIDEBAR_ID) {
            if (canvasId) removeFromCanvas(canvasId)
            return
        }
        if (target !== SANDBOX_ID) return

        if (canvasId) {
            moveOnCanvas(canvasId, x + event.delta.x, y + event.delta.y)
        } else {
            const drop = dropPosition(event)
            addToCanvas(substanceId, drop.x, drop.y)
        }
    }

    // Iz palete atom sledi kazalcu; molekula s platna pa ohrani odmik od točke prijema.
    const overlayModifiers = dragged?.fromPalette ? [snapCenterToCursor] : []

    return (
        <DndContext
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setDragged(null)}
        >
            <div className="sandbox-layout">
                <Sidebar inventory={inventory} discovered={discoveredSubstances} />

                <main className="sandbox-canvas">
                    <Sandbox items={canvas} onBond={combineOnCanvas} />
                </main>
            </div>

            <DragOverlay modifiers={overlayModifiers} dropAnimation={null}>
                {dragged && (
                    <div className="drag-preview">
                        <Molecule substanceId={dragged.substanceId} />
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    )
}

export default SandboxPage
