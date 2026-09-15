# Bedrijfswagen Configurator

Moderne, professionele webapplicatie voor het configureren van bedrijfswageninrichtingen.

## Features (MVP)

- **Voertuigkeuze**: Merk, model en L/H-uitvoering
- **Beroepsadvies**: Aanbevolen inrichting op basis van beroep
- **Interactieve configurator**: Categorieën, producten, pakketten
- **Live prijsberekening**: Incl./excl. BTW, montage, centrale pricing engine
- **2D visualisatie**: Laadruimte met geplaatste producten
- **Offerte-aanvraag**: Volledige configuratie + klantgegevens opgeslagen
- **Admin paneel**: Bekijk leads/offertes, producten en pakketten
- **Fully responsive**: Geoptimaliseerd voor mobiel gebruik

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state + persist)
- Lucide icons

## Starten

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Structuur

- `src/data/demoData.ts` — Demo producten, voertuigen, pakketten
- `src/lib/pricing.ts` — Centrale pricing engine
- `src/store/configuratorStore.ts` — State management
- `src/components/` — UI componenten

## Volgende stappen

- Backend / database voor echte data & admin CRUD
- PDF-generatie van offertes
- 3D visualisatie
- Echte productafbeeldingen
- Gebruikersaccounts
