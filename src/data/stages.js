// Stopnje igre. ID-ji se ujemajo z `id` snovi v data/molecules.json (prek gameData).
// Skupaj 19 snovi. SO₃ in fragmenti (OH, CH, CH2, CH3, NH, NH2) se NE štejejo v nobeno stopnjo.
export const STAGES = [
  { name: 'Molekule elementov', substances: ['H2', 'O2', 'N2', 'Cl2'] },
  { name: 'Preproste spojine', substances: ['H2O', 'HCl', 'CH4', 'NH3', 'CO', 'CO2'] },
  { name: 'Ionske spojine', substances: ['NaCl', 'MgO', 'CaO', 'MgCl2'] },
  { name: 'Kisline in baze', substances: ['H2O2', 'SO2', 'H2SO4', 'NaOH', 'Ca(OH)2'] },
]
