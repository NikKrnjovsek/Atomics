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
import { atoms } from '../logic/gameData.js'

const metalSymbols = new Set(atoms.filter((atom) => atom.group === 'kovina').map((atom) => atom.symbol))

// Reaktanta (ki ju reducer odstrani s platna) se kot duhova zlijeta v cilj,
// produkti pa zrastejo iz te točke.
function describeFusion(lastBond, lastResult, canvas) {
    const [source, target] = lastBond.reactants
    const ghosts = lastBond.reactants.map((item) => ({
        ...item,
        toX: target.x - item.x,
        toY: target.y - item.y,
    }))
    const appearing = new Map(
        lastResult.createdIds.flatMap((id) => {
            const item = canvas.find((candidate) => candidate.id === id)
            return item ? [[id, { fromX: target.x - item.x, fromY: target.y - item.y }]] : []
        }),
    )
    const ionizing = [source, target].some((item) => metalSymbols.has(item.substanceId))
    return { key: lastResult.createdIds.join(), ghosts, appearing, ionizing }
}

function SandboxPage() {
    const {
        canvas,
        inventory,
        discoveredSubstances,
        lastResult,
        allUnlocked,
        addToCanvas,
        moveOnCanvas,
        removeFromCanvas,
        combineOnCanvas,
        getSubstance,
        dismissResult,
        setUnlockAll,
    } = useGame()

    // INFOBOX MAIN
    const discovery =
        lastResult?.type === 'discovery' ? getSubstance(lastResult.products[0]) : null

    // REJECTION INFOBOX
    const rejectedReactants =
        lastResult?.type === 'no-recipe' ? lastResult.reactants.map(getSubstance) : null

    const [dragged, setDragged] = useState(null)
    const [lastBond, setLastBond] = useState(null)
    // INFOBOX DETAIL: snov, izbrana klikom v stranski vrstici (null = zaprto)
    const [detailSubstance, setDetailSubstance] = useState(null)

    const handleBond = (sourceId, targetId, bounds) => {
        const reactants = [sourceId, targetId].map((id) => canvas.find((item) => item.id === id))
        setLastBond({ sourceId, targetId, reactants })
        combineOnCanvas(sourceId, targetId, bounds)
    }

    const outcome =
        lastBond && lastResult?.sourceId === lastBond.sourceId && lastResult.targetId === lastBond.targetId
            ? lastResult
            : null
    const rejection = outcome?.type === 'no-recipe' ? lastBond : null
    const fusion = outcome && outcome.type !== 'no-recipe' ? describeFusion(lastBond, outcome, canvas) : null

    const handleDragStart = ({ active }) => {
        const { substanceId, canvasId } = active.data.current
        setDragged({ substanceId, fromPalette: !canvasId })
        // Premik prestavi element na konec seznama in brskalnik bi animacije nastanka zagnal znova.
        if (canvasId) setLastBond(null)
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
                        allUnlocked={allUnlocked}
                        onToggleUnlockAll={setUnlockAll}
                    />

                    <main className="sandbox-canvas">
                        <Sandbox
                            items={canvas}
                            rejection={rejection}
                            fusion={fusion}
                            onBond={handleBond}
                            onRejectEnd={() => setLastBond(null)}
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