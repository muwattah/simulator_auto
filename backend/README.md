# Beveiligde offerteflow — RS Car Detailing

De configurator staat op **GitHub Pages** (alleen statische bestanden). Deze map bevat de **afzonderlijk te deployen Cloudflare Worker** met D1-database en Resend-maildienst. Nergens in de frontend staan e-mail-API-sleutels.

## Verloop

1. Klant stelt de configuratie samen. De webapp rendert een studio-preview in 3D, combineert die met een lijst van alle geselecteerde onderdelen en exporteert het beeld als JPEG. Zonder WebGL wordt een duidelijk aangeduide 2D-visualisatie toegevoegd. Daarna vult de klant de contactgegevens in en geeft toestemming.
2. De Worker bewaart de aanvraag en afbeelding in Cloudflare D1, mailt de **volledige configuratie en bijgevoegde afbeelding** naar `ADMIN_EMAIL` en stuurt de klant een **HTML-ontvangstbevestiging met dezelfde afbeelding en configuratie**. Deze bevestiging is geen definitieve offerte.
3. De beheerdersmail bevat een **14 dagen geldige, persoonlijke goedkeuringslink**. De link alleen opent een formulier; hij verstuurt nog niets.
4. De beheerder bekijkt alle gegevens, vult het **definitieve bedrag exclusief 21% btw** en eventuele voorwaarden in, en klikt op **Goedkeuren en offerte verzenden**.
5. Pas dan verstuurt de mailservice de definitieve offerte met configuratie, de **dezelfde voorbeeldafbeelding**, bedrag, btw en opmerking naar de klant. De goedkeuring wordt eenmalig verwerkt. De Worker kan *acceptatie door de mailprovider* vaststellen, niet aflevering in de inbox garanderen.

## Benodigd

- Cloudflare-account met Workers en D1.
- Resend-account met **geverifieerd afzenderdomein**.
- Eigen e-mailadres voor de beheerder. De code bevat bewust geen verzonnen e-mailadres.
- Een lange, willekeurige `APPROVAL_SECRET` (minimaal 32 tekens).
- Node.js en een terminal met `npx wrangler` (inloggen met `npx wrangler login`).

## Deploy

Voer dit vanuit de repository uit:

```bash
npx wrangler d1 create rs-offertes
```

Neem de `database_id` uit de uitvoer over in `backend/wrangler.toml`, en stel daarin ook `PUBLIC_API_URL` in op de definitieve Worker-URL (bijvoorbeeld `https://rs-offerte.<subdomain>.workers.dev`).

```bash
npx wrangler d1 execute rs-offertes --remote --file=backend/schema.sql
cd backend
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put FROM_EMAIL
npx wrangler secret put APPROVAL_SECRET
npx wrangler deploy
```

Voor `FROM_EMAIL` gebruik je een geldig, door Resend geverifieerd adres, bijvoorbeeld `Offertes <offertes@jouwgeverifieerdedomein.be>`. Dit is enkel een **voorbeeld**, geen bestaand adres.

Zet vervolgens bij GitHub **Settings → Secrets and variables → Actions → Variables** een repositoryvariabele
`VITE_QUOTE_API_URL` met de volledige Worker-URL. Bouw/deploy daarna opnieuw via de GitHub Pages-workflow.

> Belangrijk: `VITE_QUOTE_API_URL` is **publieke** configuratie. Zet geen Resend-sleutel, adminadres of goedkeuringsgeheim in Vite/GitHub Pages. Die horen alleen in de Worker secrets.

## Afbeelding en ontwerpkwaliteit

- De klant ziet vooraf dezelfde configuratie-preview die in de mail wordt gebruikt: een 3D-opname plus onderdelenoverzicht. De e-mail gebruikt Resend **CID inline image attachments**, waardoor de afbeelding in compatibele mailprogramma's direct zichtbaar is en als bestand meegaat.
- De afbeelding is geen fotorealistische productfoto en geen gegarandeerde montagetekening. Componentgeometrie en laadruimteafmetingen zijn voorlopig demonstratiemodellen. Voor exacte merken en afmetingen zijn echte 3D-productbestanden (bijvoorbeeld GLB) en gevalideerde catalogusmaten nodig.
- De browser comprimeert naar JPEG en stuurt maximaal circa 650 kB Base64 mee. Het backend accepteert geen ander bestandstype en beperkt de grootte.
- Sommige mailclients tonen CID-afbeeldingen alleen na expliciet toestaan van afbeeldingen; de tekstuele configuratie staat er daarom ook altijd volledig in.

## Veiligheid en operationeel

- Goedkeuringslinks zijn met HMAC ondertekend, verlopen na 14 dagen en zijn na succesvolle verzending niet opnieuw bruikbaar. Behandel ze als wachtwoordlinks, stuur ze niet door.
- De Worker accepteert frontend-aanvragen alleen vanaf `FRONTEND_ORIGIN`; er zijn ook beperkingen per IP en e-mailadres. Voor een drukbezochte site is extra anti-spambeveiliging (Cloudflare Turnstile) aan te raden.
- Bij problemen met de ontvangstmail of beheerdersmail probeert de Worker dit elk kwartier opnieuw. Aanvragen worden na 90 dagen automatisch uit D1 verwijderd.
- Test vooraf met een echt klant- en beheerdersadres. Zonder bovenstaande instellingen verstuurt de website bewust **geen** e-mails en toont het formulier een duidelijke foutmelding.
- Het oude demo-adminpaneel werkt met lokale browserdata en is **niet** gekoppeld aan D1. De goedkeuring gebeurt via de persoonlijke link in de e-mail.

## Tests

Vanuit de repository:

```bash
npm install
npm test
npm run build
```

De GitHub CI-workflow voert tests en de build uit op pull requests naar `main`.
