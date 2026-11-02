# BSO254

Official shop for Bso — albums, singles, and merch. Black and scarlet, from the trenches to the throne.

## Run it

```bash
npm install
npm run dev
```

Open the site on port 8080.

## Free and public

The code can live in a public GitHub repo at no cost. GitHub Pages only serves plain files, so it cannot run this shop. The free way to open it in a browser is:

1. Keep this repo public on GitHub.
2. Import it on [Vercel](https://vercel.com) (Hobby plan is free) or Netlify.
3. Vercel runs the Node build and gives you a public link.

Checkout still stores orders in the browser. Do not take real money until a payment provider is connected.

## Make it yours

- `src/lib/site.ts` — email, M-Pesa till, YouTube video id, social links
- `src/lib/catalog.ts` — releases, track prices, merch, gallery
- `public/media` — covers, photos, product shots

Checkout stores orders in the browser so you can use the shop before a live payment provider is connected. Do not take real money until that is wired and this note is updated.

Previews are original 24-second beats. Replace them with your masters when the audio files are ready.
