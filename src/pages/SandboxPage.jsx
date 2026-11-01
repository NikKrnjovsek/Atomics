import { useState } from 'react'
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import Molecule from '../components/Molecule.jsx'
import Infobox from '../components/Infobox.jsx'
import RejectionInfobox from '../components/RejectionInfobox.jsx'
import AtomBar from '../components/AtomBar.jsx'
import TrashButton, { TRASH_ID } from '../components/TrashButton.jsx'
import JournalButton from '../components/JournalButton.jsx'
import Journal from '../components/Journal.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import Sandbox, { SANDBOX_ID } from '../components/Sandbox.jsx'
import { useGame } from '../context/useGame.js'
import { dropPosition } from '../logic/dropPosition.js'
import { atoms } from '../logic/gameData.js'
import './SandboxPage.css'

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
        discoveries,
        lastResult,
        allUnlocked,
        addToCanvas,
        moveOnCanvas,
        removeFromCanvas,
        combineOnCanvas,
        getSubstance,
        isFragment,
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

    // LABORATORIJSKI DNEVNIK – samo UI stanje (ne v reducerju):
    // *journalOpen        – ali je dnevnik odprt
    // *hasUnseenDiscovery – rdeča pika na gumbu
    // *newIds             – snovi, označene "novo", dokler jih ne izberemo
    // *journalShake       – poveča ob vsakem odkritju, da gumb znova zatrese
    const [journalOpen, setJournalOpen] = useState(false)
    const [hasUnseenDiscovery, setHasUnseenDiscovery] = useState(false)
    const [newIds, setNewIds] = useState([])
    const [journalShake, setJournalShake] = useState(0)
    const [seenResult, setSeenResult] = useState(null)

    // Ob vsakem novem izidu preverimo, ali je odkritje nove snovi (brez fragmentov – ti niso
    // v dnevniku). Če je, vklopi piko, zatrese gumb in doda oznako "novo".
    // Prilagajanje stanja med izrisom (ne v efektu)
    if (lastResult !== seenResult) {
        setSeenResult(lastResult)
        if (lastResult?.type === 'discovery') {
            const fresh = (lastResult.newDiscoveries ?? []).filter((id) => !isFragment(id))
            if (fresh.length > 0) {
                setHasUnseenDiscovery(true)
                setNewIds((prev) => [...new Set([...prev, ...fresh])])
                setJournalShake((count) => count + 1)
            }
        }
    }

    const openJournal = () => {
        setJournalOpen(true)
        setHasUnseenDiscovery(false)
    }
    const markSeen = (id) => setNewIds((prev) => prev.filter((seen) => seen !== id))

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

        if (target === TRASH_ID) {
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
                <div className="sandbox-page">
                    {/* Platno čez cel zaslon */}
                    <Sandbox
                        items={canvas}
                        rejection={rejection}
                        fusion={fusion}
                        onBond={handleBond}
                        onRejectEnd={() => setLastBond(null)}
                    />

                    {/* Floating islands nad platnom */}
                    <AtomBar
                        inventory={inventory}
                        allUnlocked={allUnlocked}
                        onToggleUnlockAll={setUnlockAll}
                    />
                    <TrashButton isDragging={dragged !== null} />
                    <ProgressBar />
                    <JournalButton
                        onClick={openJournal}
                        hasUnseen={hasUnseenDiscovery}
                        shakeKey={journalShake}
                    />
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

            {journalOpen && (
                <Journal
                    substances={discoveredSubstances}
                    discoveries={discoveries}
                    newIds={newIds}
                    onClose={() => setJournalOpen(false)}
                    onSeen={markSeen}
                />
            )}
        </>
    )
}

export default SandboxPage
