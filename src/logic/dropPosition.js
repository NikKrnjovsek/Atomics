export function dropPosition(active, over) {
  const dragged = active.rect.current.translated
  const target = over.rect

  return {
    x: dragged.left + dragged.width / 2 - target.left,
    y: dragged.top + dragged.height / 2 - target.top,
  }
}
