// Polmeri v atoms.json so v pikometrih. Velikost na platnu jim sledi le približno,
// da je tudi vodik dovolj velik za vlečenje, kalcij pa ne prevelik.
const BASE_DIAMETER = 34
const PX_PER_PM = 0.28
export const DEFAULT_DIAMETER = 56

const CHARGE_LABELS = { '+': '⁺', '2+': '²⁺', '-': '⁻', '2-': '²⁻' }

export function atomDiameter(atomType, charge) {
  const radius = charge ? atomType?.ionRadius : atomType?.radius
  return radius ? Math.round(BASE_DIAMETER + radius * PX_PER_PM) : DEFAULT_DIAMETER
}

export function chargeLabel(symbol, charge) {
  return charge ? symbol + CHARGE_LABELS[charge] : symbol
}
