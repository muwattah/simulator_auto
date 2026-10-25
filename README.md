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

## Mail delivery / goedkeuring

De code voor de beveiligde offerte-mailflow staat in [backend/README.md](backend/README.md).
Nieuwe aanvragen kunnen een klantbevestiging met alle configuratiegegevens mailen en de
beheerder een reviewlink sturen. Alleen na expliciete goedkeuring (met prijs en voorwaarden)
wordt de definitieve offerte aan de klant aangeboden.

**LET OP:** GitHub Pages kan zelf geen e-mails versturen. De Cloudflare Worker,
D1-database, Resend-afzender en GitHub Actions-variabele `VITE_QUOTE_API_URL` moeten
eerst worden ingericht. Zolang deze ontbreken, toont het offerteformulier een
duidelijke foutmelding en beweert het niet dat een mail werd verzonden. Geen secrets
in de frontend.

## Demo

Productgegevens en prijzen zijn pending / op aanvraag.
