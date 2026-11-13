# BSO254

Official shop for Bso — albums, singles, and merch. Black and scarlet, from the trenches to the throne.

## Run it

```bash
npm install
npm run dev
```

Open the site on port 8080.

## M-Pesa

Fans pay the business number in `src/lib/site.ts` (`mpesaBusiness`, currently `0111209244`) with Lipa na M-Pesa → Pochi la Biashara. They paste the code from the M-Pesa text and can send the receipt to that number on WhatsApp. This is not a Safaricom PIN prompt. A till or paybill with Daraja keys would be required for that.

## Free and public

The code can live in a public GitHub repo at no cost. GitHub Pages only serves plain files, so it cannot run this shop. The free way to open it in a browser is:

1. Keep this repo public on GitHub.
2. Import it on [Vercel](https://vercel.com) (Hobby plan is free) or Netlify.
3. Vercel runs the Node build and gives you a public link.

## Studio

`/admin` is the private page for changing music and merch. The studio password is built into the app, so it works on GitHub and on a live host without an extra file. Sign in, upload an MP3 or WAV on each track, then choose **Update the site**. Songs do not play until that browser has paid, and they do not download.

- `src/lib/site.ts` — email, YouTube video id, social links
- `src/lib/catalog.ts` — releases, track prices, merch, gallery
- `public/media` — covers, photos, product shots

Previews are original 24-second beats. Replace them with your masters when the audio files are ready.
