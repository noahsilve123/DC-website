// Smoke test for the College Scorecard integration.
// Uses COLLEGE_SCORECARD_API_KEY from the environment (do not hard-code keys).

const key = process.env.COLLEGE_SCORECARD_API_KEY
if (!key) {
  console.error('Missing COLLEGE_SCORECARD_API_KEY. Set it in .env.local (local) or Vercel env vars (deploy).')
  process.exit(2)
}

async function fetchJson(url) {
  const res = await fetch(url)
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { _raw: text }
  }
  return { res, json }
}

async function main() {
  const school = process.argv.slice(2).join(' ').trim() || 'Rutgers University'

  // 1) Direct upstream check
  const upstream = new URL('https://api.data.gov/ed/collegescorecard/v1/schools')
  upstream.searchParams.set('api_key', key)
  upstream.searchParams.set('per_page', '1')
  upstream.searchParams.set('fields', 'school.name,school.state')
  upstream.searchParams.set('school.search', school)

  const u = await fetchJson(upstream.toString())
  console.log(`Upstream status: ${u.res.status}`)
  if (!u.res.ok) {
    console.log(u.json)
    process.exit(1)
  }
  const count = Array.isArray(u.json?.results) ? u.json.results.length : 0
  console.log(`Upstream results: ${count}`)

  // 2) Internal API checks (requires dev server)
  const base = process.env.SMOKE_BASE_URL || 'http://localhost:3000'

  const suggest = new URL('/api/college-suggest', base)
  suggest.searchParams.set('query', school.slice(0, 8))
  const s = await fetchJson(suggest.toString())
  console.log(`Suggest status: ${s.res.status}`)
  if (!s.res.ok) {
    console.log(s.json)
    process.exit(1)
  }

  const cost = new URL('/api/college-cost', base)
  cost.searchParams.set('schoolName', school)
  cost.searchParams.set('years', '4')
  cost.searchParams.set('inflationRate', '3')
  const c = await fetchJson(cost.toString())
  console.log(`Cost status: ${c.res.status}`)
  if (!c.res.ok) {
    console.log(c.json)
    process.exit(1)
  }

  console.log('✅ Scorecard smoke test passed')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
