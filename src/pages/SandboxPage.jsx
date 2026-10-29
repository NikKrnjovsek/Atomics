import { useState } from 'react'
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import Molecule from '../components/Molecule.jsx'
import Infobox from '../components/Infobox.jsx'
import RejectionInfobox from '../components/RejectionInfobox.jsx'
import Sidebar, { SIDEBAR_ID } from '../components/Sidebar.jsx'
import Sandbox, { SANDBOX_ID } from '../components/Sandbox.jsx'
import { useGame } from '../context/useGame.js'
import { dropPosition } from '../logic/dropPosition.js'
import { combine } from '../logic/gameData.js'

function SandboxPage() {
    const {
        canvas,
        inventory,
        discoveredSubstances,
        addToCanvas,
        moveOnCanvas,
        removeFromCanvas,
        combineOnCanvas,
        lastResult,
        getSubstance,
        dismissResult,
    } = useGame()

    // INFOBOX MAIN
    const discovery =
        lastResult?.type === 'discovery' ? getSubstance(lastResult.products[0]) : null

    // REJECTION INFOBOX
    const rejectedReactants =
        lastResult?.type === 'no-recipe' ? lastResult.reactants.map(getSubstance) : null
    const [dragged, setDragged] = useState(null)
    const [rejection, setRejection] = useState(null)
    // INFOBOX DETAIL: snov, izbrana klikom v stranski vrstici (null = zaprto)
    const [detailSubstance, setDetailSubstance] = useState(null)

    // Reducer pri neuspehu ne poda elementov -> tu animacija sprozena
    const handleBond = (sourceId, targetId) => {
        const [source, target] = [sourceId, targetId].map((id) =>
            canvas.find((item) => item.id === id),
        )
        if (!combine(source.substanceId, target.substanceId)) {
            setRejection({ sourceId, targetId })
        }
        combineOnCanvas(sourceId, targetId)
    }

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

    // z palete atom sledi kazalcu; molekula s platna pa ohrani odmik od točke prijema
    const overlayModifiers = dragged?.fromPalette ? [snapCenterToCursor] : []

    return (
        <>
            <DndContext
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setDragged(null)}
            >
                <div className="sandbox-layout">
                    <Sidebar
                        inventory={inventory}
                        discovered={discoveredSubstances}
                        onSelect={setDetailSubstance}
                    />

                    <main className="sandbox-canvas">
                        <Sandbox
                            items={canvas}
                            rejection={rejection}
                            onBond={handleBond}
                            onRejectEnd={() => setRejection(null)}
                        />
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

            {discovery && (
                <Infobox
                    substance={discovery}
                    variant="discovery"
                    equation={lastResult.equation}
                    onClose={dismissResult}
                />
            )}

            {rejectedReactants && (
                <RejectionInfobox reactants={rejectedReactants} onClose={dismissResult} />
            )}

            {detailSubstance && (
                <Infobox
                    substance={detailSubstance}
                    variant="detail"
                    onClose={() => setDetailSubstance(null)}
                />
            )}
        </>
    )
}

export default SandboxPage
