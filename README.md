# RS Car Detailing — Configurator

Interactieve 3D-configurator voor mobiele carwash / detailing-installaties van RS Car Detailing.

## Features

- Voertuigcategorie + cabine
- Watertank (210–1000 L) met vlotter
- Hogedruk, compressor, generator, stofzuiging
- Modulair frame + haspels
- Laadruimtebekleding (stof / aluminium)
- Live 3D (Three.js / R3F) met herkenbare procedurale modellen
- Pending prijzen (\"Prijs op aanvraag\")
- Offerteaanvraag met unieke configuratiereferentie
- Centrale gestructureerde quote payload (AI/backend-ready)

## Bedrijf

Officiële gegevens (geverifieerd op https://www.rscardetailing.be/):
- RS Car Detailing
- Borsbeek, België
- Tel / WhatsApp: 0492 07 05 98

## Tech

- React 18 + TypeScript + Vite
- Tailwind CSS
- Zustand
- Three.js + React Three Fiber + Drei

## Starten

```bash
npm install
npm run dev
npm test
npm run build
```

## Mail delivery

**NOT IMPLEMENTED** — GitHub Pages is static. Echte e-mail vereist een veilige server-side API. Geen secrets in de frontend.

## Demo

Productgegevens en prijzen zijn pending / op aanvraag.


## Foto's in de detailingconfigurator

De optie **Foto's** naast 3D en 2D toont nu de bestaande, al geüploade beelden uit
`public/realisations/` en `public/productfotos/hygiemeca/`.
Het getoonde beeld wordt automatisch afgestemd op de huidige configuratiestap:
hogedrukapparatuur, generator, frames of accessoires. De stappen voor frame en extra's
tonen deze afbeeldingen bovendien direct als fotovoorbeelden.

Dit zijn **voorbeelden van echte installaties en accessoires**, geen gegenereerde
afbeeldingen van de klant zijn exacte keuzes. De 3D-viewer blijft hiervoor de enige
live voorstelling. De homepage en de offerte-mailflow zijn niet gewijzigd.
