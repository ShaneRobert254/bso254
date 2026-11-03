# BSO254

Official shop for Bso — albums, singles, and merch. Black and scarlet, from the trenches to the throne.

## Run it

```bash
npm install
npm run dev
```

Open the site on port 8080.

## M-Pesa

Checkout sends a Safaricom STK prompt. The album unlocks only after the PIN is confirmed. Nothing is charged until these keys are set on the host (Vercel → Settings → Environment Variables). Do not put them in the repo.

- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE` — paybill, or the till if `MPESA_TYPE=till`
- `MPESA_PASSKEY`
- `MPESA_ENV` — `sandbox` or `live`
- `MPESA_TYPE` — `paybill` (default) or `till`
- `MPESA_CALLBACK_URL` — optional public `https://…/api/mpesa/callback`

## Free and public

The code can live in a public GitHub repo at no cost. GitHub Pages only serves plain files, so it cannot run this shop. The free way to open it in a browser is:

1. Keep this repo public on GitHub.
2. Import it on [Vercel](https://vercel.com) (Hobby plan is free) or Netlify.
3. Vercel runs the Node build and gives you a public link. Add the M-Pesa keys there.

## Make it yours

- `src/lib/site.ts` — email, YouTube video id, social links
- `src/lib/catalog.ts` — releases, track prices, merch, gallery
- `public/media` — covers, photos, product shots

Previews are original 24-second beats. Replace them with your masters when the audio files are ready.
