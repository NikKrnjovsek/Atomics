// Namigi za učenca 8. razreda OŠ – po 3 na snov (vsakdanje življenje / lastnost / sestava).
// Kratki (do ~90 znakov), en stavek, NE izdajo formule. Usklajeno s Kemijo 8
// (i-učbenik: https://eucbeniki.sio.si/kemija8/index.html).
// Ključi se ujemajo z ID-ji snovi v data/molecules.json.
export const HINTS = {
  // --- Stopnja 1: molekule elementov ---
  H2: [
    'Najlažji plin v vesolju; z njim polnijo rakete.',
    'Gorljiv plin brez barve in vonja, lažji od zraka.',
    'Nastane iz dveh enakih, najmanjših atomov.',
  ],
  O2: [
    'Vdihavamo ga iz zraka; brez njega ni življenja.',
    'Plin brez barve, ki je potreben za gorenje.',
    'Združi dva enaka atoma, ki ju rastline sproščajo.',
  ],
  N2: [
    'Največji del zraka, ki ga vdihavamo, je prav ta plin.',
    'Zelo nereaktiven plin; z njim polnijo vrečke čipsa.',
    'Dva enaka atoma veže zelo močna trojna vez.',
  ],
  Cl2: [
    'Z njim razkužujejo vodo v bazenih.',
    'Rumenozelen strupen plin z ostrim vonjem.',
    'Nastane iz dveh enakih atomov halogena.',
  ],

  // --- Stopnja 2: preproste spojine ---
  H2O: [
    'Piješ jo vsak dan; prekriva večino površja Zemlje.',
    'Tekočina brez barve, vonja in okusa.',
    'Gradi jo počasi iz vodika in kisika (najprej delec OH).',
  ],
  HCl: [
    'Raztopljen tvori kislino v tvojem želodcu.',
    'V vodi da močno klorovodikovo kislino.',
    'Poveži vodik s plinom, s katerim razkužujejo bazene.',
  ],
  CH4: [
    'Glavni del zemeljskega plina za kuhanje in ogrevanje.',
    'Gorljiv plin brez barve; nastaja tudi v želodcu krav.',
    'Ogljik potrebuje štiri vodike; dodajaj jih po enega.',
  ],
  NH3: [
    'Po njem dišijo gnojila in nekatera čistila za okna.',
    'Plin z ostrim, dražečim vonjem.',
    'Dušik poveži s tremi vodiki, korak za korakom.',
  ],
  CO: [
    'Strupen plin iz izpuha; doma varujejo detektorji.',
    'Plin brez barve in vonja, zato je zelo nevaren.',
    'Poveži ogljik z enim samim atomom kisika.',
  ],
  CO2: [
    'Mehurčki v gazirani pijači so prav ta plin.',
    'Plin, ki ga izdihavamo in z njim gasimo ogenj.',
    'Ogljikovemu oksidu dodaj še en atom kisika.',
  ],

  // --- Stopnja 3: ionske spojine ---
  NaCl: [
    'Z njo soliš hrano; pri nas jo pridobivajo v solinah.',
    'Bela trdna sol, ki se dobro topi v vodi.',
    'Poveži kovino natrij z nekovino klorom.',
  ],
  MgO: [
    'Nastane, ko magnezij zagori z bleščečim belim plamenom.',
    'Bela trdna snov, odporna na zelo visoke temperature.',
    'Poveži kovino magnezij s kisikom.',
  ],
  CaO: [
    'Žgano apno; pridobijo ga z žganjem apnenca.',
    'Bela trdna snov, ki z vodo burno reagira.',
    'Poveži kovino kalcij s kisikom.',
  ],
  MgCl2: [
    'Z njim pozimi posipajo ceste proti poledici.',
    'Trdna sol, raztopljena tudi v morski vodi.',
    'Magnezij odda 2 elektrona, zato potrebuje molekulo klora.',
  ],

  // --- Stopnja 4: kisline in baze ---
  H2O2: [
    'S 3-odstotno raztopino razkužujemo rane in belimo lase.',
    'Tekočina, ki počasi razpade na vodo in kisik.',
    'Združi dva enaka delca OH.',
  ],
  SO2: [
    'Konzervans v vinu in suhem sadju (oznaka E220).',
    'Brezbarven plin z ostrim vonjem; povzroča kisli dež.',
    'Poveži žveplo z molekulo kisika.',
  ],
  H2SO4: [
    'Jedka kislina iz avtomobilskih akumulatorjev.',
    'Močna kislina; pri redčenju jo vlivamo v vodo.',
    'Žveplov dioksid poveži z vodikovim peroksidom.',
  ],
  NaOH: [
    'Jedka snov v čistilih za zamašene odtoke.',
    'Močna baza, ki jo uporabljajo pri izdelavi mila.',
    'Natrij burno reagira z vodo, ki si jo že odkril.',
  ],
  'Ca(OH)2': [
    'Gašeno apno za malto in beljenje sten.',
    'Z njegovo raztopino (apnico) dokazujemo ogljikov dioksid.',
    'Žgano apno (kalcijev oksid) pogasi z vodo.',
  ],
}
