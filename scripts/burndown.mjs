// Nariše burndown diagram za vsak sprint iz docs/burndown/sprints.json.
// Zagon: npm run burndown            (do današnjega dne)
//        npm run burndown -- 2026-10-23   (stanje na izbrani dan)
// Rezultat: docs/burndown/<sprint>.svg – sliko vstaviš v tedensko poročilo.
import { readFileSync, writeFileSync } from 'node:fs'

const dir = new URL('../docs/burndown/', import.meta.url)
const { sprints } = JSON.parse(readFileSync(new URL('sprints.json', dir), 'utf8'))
const today = process.argv[2] ?? new Date().toISOString().slice(0, 10)

const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
const label = (iso) => `${Number(iso.slice(8, 10))}. ${Number(iso.slice(5, 7))}.`

export function burndown(sprint, asOf = today) {
  const days = []
  for (let d = sprint.start; d <= sprint.end; d = addDays(d, 1)) days.push(d)

  const total = sprint.items.reduce((sum, item) => sum + item.points, 0)
  const remainingAt = (day) =>
    sprint.items.filter((item) => !item.done || item.done > day).reduce((s, i) => s + i.points, 0)

  // Točka 0 = začetek sprinta (vse zaveze), nato stanje ob koncu vsakega dne.
  const actual = [total, ...days.filter((d) => d <= asOf).map(remainingAt)]
  const ideal = [total, ...days.map((_, i) => +(total * (1 - (i + 1) / days.length)).toFixed(2))]
  return { days, total, actual, ideal }
}

function svg(sprint, { days, total, actual, ideal }) {
  const W = 640, H = 360, L = 56, R = 36, T = 64, B = 56
  const n = days.length
  const x = (i) => L + (i * (W - L - R)) / n
  const y = (v) => T + (H - T - B) * (1 - v / Math.max(total, 1))
  const path = (vals) => vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')

  const step = total <= 10 ? 1 : total <= 25 ? 2 : 5
  const yTicks = []
  for (let v = 0; v <= total; v += step) yTicks.push(v)
  const xLabels = ['začetek', ...days.map(label)]

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="system-ui, sans-serif" font-size="12">
  <rect width="${W}" height="${H}" fill="#fff"/>
  <text x="${L}" y="26" font-size="16" font-weight="600" fill="#1f2328">Burndown – ${sprint.name} (${label(sprint.start)} – ${label(sprint.end)})</text>
  ${yTicks.map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#eaeef2"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" fill="#59636e">${v}</text>`).join('\n  ')}
  ${xLabels.map((t, i) => `<text x="${x(i)}" y="${H - B + 20}" text-anchor="middle" fill="#59636e">${t}</text>`).join('\n  ')}
  <text x="16" y="${T + (H - T - B) / 2}" transform="rotate(-90 16 ${T + (H - T - B) / 2})" text-anchor="middle" fill="#59636e">preostali story pointi</text>
  <path d="${path(ideal)}" fill="none" stroke="#8c959f" stroke-width="2" stroke-dasharray="6 5"/>
  <path d="${path(actual)}" fill="none" stroke="#0969da" stroke-width="3"/>
  ${actual.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="#0969da"/><text x="${x(i)}" y="${y(v) - 9}" text-anchor="middle" fill="#0969da" font-weight="600">${v}</text>`).join('\n  ')}
  <g transform="translate(${W - R - 210}, ${H - 18})">
    <line x1="0" x2="22" y1="-4" y2="-4" stroke="#8c959f" stroke-width="2" stroke-dasharray="6 5"/><text x="28" y="0" fill="#59636e">idealno</text>
    <line x1="90" x2="112" y1="-4" y2="-4" stroke="#0969da" stroke-width="3"/><text x="118" y="0" fill="#59636e">dejansko</text>
  </g>
</svg>
`
}

for (const sprint of sprints) {
  if (sprint.start > today) continue
  const data = burndown(sprint)
  const file = `${sprint.name.toLowerCase().replace(/\s+/g, '-')}.svg`
  writeFileSync(new URL(file, dir), svg(sprint, data))
  console.log(`${sprint.name}: ${data.actual.join(' → ')} SP (od ${data.total})  → docs/burndown/${file}`)
}
