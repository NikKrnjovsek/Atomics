#!/usr/bin/env bash
# Postavi tablo "Atomics" na GitHub Projects in vanjo doda product backlog (US1–US14).
#
# Zahteve: GitHub CLI (https://cli.github.com, na Windows: winget install GitHub.cli)
#          in Git Bash. Enkratna prijava z dovoljenjem za Projects:
#            gh auth login
#            gh auth refresh -s project
#
# Zagon (iz korena repozitorija):
#   bash scripts/setup-github-project.sh [lastnik-table]
# Privzeti lastnik table je NikKrnjovsek (lastnik repozitorija). Če tablo ustvariš na svojem
# računu, podaj svoje uporabniško ime; repozitorij bo vseeno povezan s tablo.
set -euo pipefail

OWNER="${1:-NikKrnjovsek}"
REPO="NikKrnjovsek/Atomics"
TITLE="Atomics – Scrum tabla"

echo "› Ustvarjam projekt '$TITLE' (lastnik: $OWNER)"
PROJECT_NUMBER=$(gh project create --owner "$OWNER" --title "$TITLE" --format json --jq '.number')
PROJECT_ID=$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json --jq '.id')
gh project link "$PROJECT_NUMBER" --owner "$OWNER" --repo "$REPO" >/dev/null || true
echo "  projekt #$PROJECT_NUMBER"

echo "› Dodajam polja Story points, Sprint, Nosilec"
gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" --name "Story points" --data-type NUMBER >/dev/null
gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" --name "Sprint" --data-type SINGLE_SELECT \
  --single-select-options "Sprint 1,Sprint 2,Sprint 3" >/dev/null
gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" --name "Nosilec" --data-type SINGLE_SELECT \
  --single-select-options "Nik (A),Andraž (B),Blaž (C),A + B,vsi" >/dev/null

# gh ima vgrajen jq (--jq), zato ločen jq ni potreben.
field_id() {
  gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json \
    --jq ".fields[] | select(.name==\"$1\") | .id"
}
option_id() {
  gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json \
    --jq ".fields[] | select(.name==\"$1\") | .options[] | select(.name==\"$2\") | .id"
}

STATUS_FIELD=$(field_id "Status")
SP_FIELD=$(field_id "Story points")
SPRINT_FIELD=$(field_id "Sprint")
OWNER_FIELD=$(field_id "Nosilec")

echo "› Stolpci table: To Do / In Progress / Review / Done"
gh api graphql -f query='
  mutation($field: ID!) {
    updateProjectV2Field(input: {
      fieldId: $field,
      singleSelectOptions: [
        { name: "To Do",       color: GRAY,   description: "" },
        { name: "In Progress", color: YELLOW, description: "" },
        { name: "Review",      color: BLUE,   description: "Odprt pull request, čaka na pregled" },
        { name: "Done",        color: GREEN,  description: "Združeno v main (Definition of Done)" }
      ]
    }) { projectV2Field { ... on ProjectV2SingleSelectField { name } } }
  }' -f field="$STATUS_FIELD" >/dev/null \
  || echo "  ! Stolpca 'Review' ni bilo mogoče dodati samodejno – dodaj ga ročno v nastavitvah polja Status."

# ID-je možnosti preberemo enkrat, da v zanki ne kličemo API-ja po nepotrebnem.
TODO_OPTION=$(option_id Status "To Do")
[ -n "$TODO_OPTION" ] || TODO_OPTION=$(option_id Status "Todo")
declare -A SPRINT_OPTION OWNER_OPTION
for s in "Sprint 1" "Sprint 2" "Sprint 3"; do SPRINT_OPTION[$s]=$(option_id Sprint "$s"); done
for w in "Nik (A)" "Andraž (B)" "Blaž (C)" "A + B" "vsi"; do OWNER_OPTION[$w]=$(option_id Nosilec "$w"); done

gh label create "user-story" --repo "$REPO" --color 1D76DB --description "Uporabniška zgodba" --force >/dev/null

# id | naslov | SP | nosilec | sprint
STORIES=(
  "US1|Kot učenec želim videti nabor začetnih atomov v stranski vrstici.|2|Blaž (C)|Sprint 1"
  "US2|Kot učenec želim atom povleči iz vrstice na sandbox platno.|5|Nik (A)|Sprint 1"
  "US3|Kot učenec želim atome na platnu premikati in odstranjevati.|3|Nik (A)|Sprint 1"
  "US4|Kot učenec želim združiti atome tako, da jih spustim enega na drugega.|8|A + B|Sprint 2"
  "US5|Kot učenec želim, da se ob pravilni kombinaciji ustvari nova snov.|5|Andraž (B)|Sprint 1"
  "US6|Kot učenec želim ob prvem odkritju videti infoboks (kaj je snov in kje se uporablja).|5|Blaž (C)|Sprint 2"
  "US7|Kot učenec želim, da se odkrita snov doda v inventar za nadaljnjo uporabo.|3|Andraž (B)|Sprint 2"
  "US8|Kot učenec želim, da se moja odkritja ohranijo po osvežitvi strani.|2|Andraž (B)|Sprint 2"
  "US9|Kot učenec želim videti napredek in odklepati nove stopnje.|3|Blaž (C)|Sprint 3"
  "US10|Kot učenec želim povratno informacijo, kadar kombinacija ne obstaja.|2|Nik (A)|Sprint 2"
  "US11|Kot učenec želim namig, če dlje časa ne odkrijem nove snovi.|2|Nik (A)|Sprint 3"
  "US12|Kot razvijalec želim podatke za vseh 19 snovi z opisi iz učbenika.|3|Blaž (C)|Sprint 1"
  "US13|Kot ekipa želimo testirano aplikacijo.|5|vsi|Sprint 3"
  "US14|Kot ekipa želimo dokumentacijo in poročila.|8|vsi|Sprint 3"
)

echo "› Ustvarjam issue-je in jih dodajam na tablo"
for row in "${STORIES[@]}"; do
  IFS='|' read -r ID STORY SP WHO SPRINT <<<"$row"
  BODY=$(printf '%s\n\n**Story points:** %s  \n**Nosilec:** %s  \n**Sprint:** %s\n\n## Kriteriji sprejemljivosti\n- [ ] …\n\n## Definition of Done\n- [ ] Koda združena v main prek pull requesta, ki ga je pregledal drug član\n- [ ] Deluje v brskalniku brez napak\n- [ ] Kemijska vsebina preverjena z učbenikom Kemija 8\n- [ ] Delo opisano v dokumentaciji\n' "$STORY" "$SP" "$WHO" "$SPRINT")
  URL=$(gh issue create --repo "$REPO" --title "$ID: $STORY" --body "$BODY" --label user-story)
  ITEM=$(gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$URL" --format json --jq '.id')

  gh project item-edit --project-id "$PROJECT_ID" --id "$ITEM" --field-id "$SP_FIELD" --number "$SP" >/dev/null
  gh project item-edit --project-id "$PROJECT_ID" --id "$ITEM" --field-id "$SPRINT_FIELD" \
    --single-select-option-id "${SPRINT_OPTION[$SPRINT]}" >/dev/null
  gh project item-edit --project-id "$PROJECT_ID" --id "$ITEM" --field-id "$OWNER_FIELD" \
    --single-select-option-id "${OWNER_OPTION[$WHO]}" >/dev/null
  gh project item-edit --project-id "$PROJECT_ID" --id "$ITEM" --field-id "$STATUS_FIELD" \
    --single-select-option-id "$TODO_OPTION" >/dev/null
  echo "  $ID → $URL"
done

echo
echo "✓ Tabla je pripravljena: https://github.com/users/$OWNER/projects/$PROJECT_NUMBER"
echo "  V pogledu tabele izberi 'Group by: Status' (Board layout) in filter 'Sprint: Sprint 1'."
