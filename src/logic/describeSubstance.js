// ciste funkcije, ki iz podatkov snovi (molecules.json) naredijo besedilo za infoboks.
// ni import, zato testira z node:test. Vrnejo null, ko ni podatka, da infoboks to vrsto izpusti

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

// REJECTION INFOBOX iz reaktantov (objektov snovi) naredi besedilo za infoboks zavrnitve.
// genericno - ne pozna razlogov za posamezen par, le izpise formuli obeh snovi.
// vrne null ce ni nobenega reaktanta
export function describeRejection(reactants) {
  const list = (Array.isArray(reactants) ? reactants : []).filter(Boolean)
  if (!list.length) return null
  return {
    formula: list.map((substance) => substance.formula ?? '?').join(' + '),
    names: list.map((substance) => substance.name).filter(Boolean),
  }
}
