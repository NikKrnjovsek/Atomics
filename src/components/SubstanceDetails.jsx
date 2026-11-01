import { describeBond, describeProperty } from '../logic/describeSubstance.js'
import { formatEquation } from '../logic/combine.js'
import { getSubstance, recipes } from '../logic/gameData.js'
import MoleculePreview from './MoleculePreview.jsx'
import './SubstanceDetails.css'

const RECIPE_TYPE_LABEL = {
  elementary: 'elementarna (dejanski trk delcev)',
  net: 'neto (poenostavljena šolska reakcija)',
}

// Prvi recept, ki ustvari to snov kot glavni produkt (sicer katerikoli, ki jo vsebuje).
// Samo branje podatkov – logike združevanja ne spreminja.
function recipeFor(id) {
  return recipes.find((recipe) => recipe.products[0] === id)
    ?? recipes.find((recipe) => recipe.products.includes(id))
    ?? null
}

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="substance-details__row">
      <span className="substance-details__label">{label}</span>
      <span className="substance-details__value">{value}</span>
    </div>
  )
}

// informacije o izbrani snovi (kot glavni infoboks ob odkritju) + dodatki, če obstajajo.
// substance – objekt iz getSubstance(); discoveredAt – čas odkritja (ms) ali null.
function SubstanceDetails({ substance, discoveredAt }) {
  if (!substance) {
    return <p className="substance-details__empty">Izberi snov na levi.</p>
  }

  const recipe = recipeFor(substance.id)
  const equation = recipe
    ? formatEquation(recipe.reactants.map(getSubstance), recipe.products.map(getSubstance))
    : null
  const madeFrom = recipe ? recipe.reactants.map((id) => getSubstance(id)?.formula ?? id).join(' + ') : null

  return (
    <div className="substance-details">
      <header className="substance-details__head">
        <MoleculePreview substanceId={substance.id} size={120} />
        <div className="substance-details__title">
          <span className="substance-details__formula">{substance.formula}</span>
          <span className="substance-details__name">{substance.name}</span>
        </div>
      </header>

      {equation && <p className="substance-details__equation">{equation}</p>}

      <div className="substance-details__rows">
        <Row label="Vrsta vezi" value={describeBond(substance)} />
        <Row label="Lastnosti" value={describeProperty(substance)} />
        <Row label="Nastane iz" value={madeFrom} />
        <Row label="Vrsta reakcije" value={recipe && RECIPE_TYPE_LABEL[recipe.type]} />
        <Row label="Kje najdemo" value={substance.foundIn} />
        <Row label="Uporaba" value={substance.uses} />
        <Row label="Opomba" value={recipe?.note} />
        <Row
          label="Odkrito"
          value={discoveredAt ? new Date(discoveredAt).toLocaleString('sl-SI') : null}
        />
      </div>

      {substance.description && (
        <p className="substance-details__description">{substance.description}</p>
      )}
    </div>
  )
}

export default SubstanceDetails
