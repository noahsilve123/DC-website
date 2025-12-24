# Destination College

## Budget Tool setup (College Scorecard)

The Budget Tool calls the College Scorecard API via `https://api.data.gov/ed/collegescorecard/v1/schools`.

### Local development

1. Copy `.env.local.example` to `.env.local`
2. Set your api.data.gov key:

   `COLLEGE_SCORECARD_API_KEY=YOUR_KEY_HERE`

3. Restart the dev server (`npm run dev`).

### Deployment

Set the environment variable `COLLEGE_SCORECARD_API_KEY` in your hosting provider (Vercel/Netlify/etc.) and redeploy.

> Security note: never commit real API keys to git.
