export function dropPosition(event) {
  const { activatorEvent, delta, over } = event

  return {
    x: activatorEvent.clientX + delta.x - over.rect.left,
    y: activatorEvent.clientY + delta.y - over.rect.top,
  }
}
