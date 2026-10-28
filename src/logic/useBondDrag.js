import { useEffect, useState } from 'react'

// Elementi na platnu, na katere lahko spustimo vez, nosijo atribut data-item-id.
function itemIdAt(clientX, clientY) {
  return document.elementFromPoint(clientX, clientY)?.closest('[data-item-id]')?.dataset.itemId
}

// Vlečenje vezi od atoma do drugega elementa na platnu. Koordinate so relativne na platno.
export function useBondDrag(canvasRef, onBond) {
  const [bond, setBond] = useState(null)
  const sourceId = bond?.sourceId

  const startBond = (sourceId, sourceAtom, from) =>
    setBond({ sourceId, sourceAtom, from, to: from })

  useEffect(() => {
    if (!sourceId) return

    const handleMove = (event) => {
      const rect = canvasRef.current.getBoundingClientRect()
      const to = { x: event.clientX - rect.left, y: event.clientY - rect.top }
      setBond((current) => ({ ...current, to }))
    }

    const handleUp = (event) => {
      const targetId = itemIdAt(event.clientX, event.clientY)
      if (targetId && targetId !== sourceId) onBond(sourceId, targetId)
      setBond(null)
    }

    const handleCancel = () => setBond(null)

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleCancel)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleCancel)
    }
  }, [sourceId, canvasRef, onBond])

  return { bond, startBond }
}
