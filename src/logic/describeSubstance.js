// ciste funkcije, ki iz podatkov snovi (molecules.json) naredijo besedilo za infoboks.
// ni import, zato testiramo z node:test. Vrnejo null, kadar
// podatka ni, da infoboks tako vrstico preprosto izpusti

const BOND_LABEL = { covalent: 'kovalentna', ionic: 'ionska' }
const ORDER_LABEL = { 1: 'enojna', 2: 'dvojna', 3: 'trojna' }
const POLARITY_LABEL = { polar: 'polarna', nonpolar: 'nepolarna' }
const ACID_BASE_LABEL = { acid: 'kislina', base: 'baza' }

// npr. { bond: 'covalent', bondOrder: 1 } → "kovalentna, enojna"; ionska vez nima reda.
export function describeBond(substance) {
  if (!substance?.bond) return null
  const bond = BOND_LABEL[substance.bond] ?? substance.bond
  const order = ORDER_LABEL[substance.bondOrder]
  return order ? `${bond}, ${order}` : bond
}

// polarnost in (ce obstaja) kislost/bazicnost, npr. "polarna" ali "polarna, kislina".
export function describeProperty(substance) {
  const parts = [
    POLARITY_LABEL[substance?.polarity],
    ACID_BASE_LABEL[substance?.acidBase],
  ].filter(Boolean)
  return parts.length ? parts.join(', ') : null
}
