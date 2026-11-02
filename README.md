# Tīras Mājas — Cloudflare Pages

Mājaslapa ir statiska (HTML/CSS/JS). Dizains tiek saglabāts, bet `npm run build` izveido atsevišķu HTML failu katrai lapai, lai saturs būtu pieejams arī bez JavaScript.

## Cloudflare Pages iestatījumi

- Framework preset: **None**
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: repozitorija sakne

## Demo režīms

Pēc noklusējuma katrai lapai ir `noindex, nofollow`, un `robots.txt` aizliedz indeksēšanu. Šo režīmu saglabāt līdz klienta apstiprinājumam, formas pieslēgšanai un gala pārbaudei.

## Publiskā SEO aktivizēšana (vēlāk)

Tikai pēc sagatavošanas Cloudflare Pages vides mainīgie:

- `SITE_URL=https://apstiprinatais-domens.lv` (bez noslēdzošās slīpsvītras)
- `PUBLIC_SITE_READY=true`

Tad būvējums izveidos `sitemap.xml`, `robots.txt` ar atļautu indeksēšanu, katras lapas canonical adresi un indeksējamu HTML.

**Svarīgi:** pirms aktivizēšanas jānoņem demo marķējums un teksts, jānodrošina reāla pieteikumu saņemšana un jāpārbauda kontakti, juridiskie dati un atsauksmes. Build karodziņš šos darbus automātiski nepabeidz.

## Lapu adreses

- `/`
- `/pakalpojumi/`
- `/pakalpojumi/<slug>/` (8 pakalpojumi)
- `/par-mums/`, `/musu-darbi/`, `/kontakti/`, `/privatums/`

Pēc izvietošanas pārbaudīt tiešu atvēršanu, mobilās navigācijas saites un kontaktformas demo stāvokli.
