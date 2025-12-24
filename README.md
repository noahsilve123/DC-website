# Destination College

## Budget Tool setup (College Scorecard)

The Budget Tool calls the College Scorecard API via `https://api.data.gov/ed/collegescorecard/v1/schools`.

### Local development

1. Copy `.env.local.example` to `.env.local`
2. Set your api.data.gov key:

   `COLLEGE_SCORECARD_API_KEY=YOUR_KEY_HERE`

3. Restart the dev server (`npm run dev`).

### Smoke test (recommended)

With the dev server running, you can verify your key + endpoints without exposing the key in git:

- `npm run scorecard:smoke`

Optional:
- `SMOKE_BASE_URL=https://your-deployed-site.vercel.app npm run scorecard:smoke`

### Deployment

Set the environment variable `COLLEGE_SCORECARD_API_KEY` in your hosting provider (Vercel/Netlify/etc.) and redeploy.

> Security note: never commit real API keys to git.
