# RS Car Detailing — automatische offerte-e-mails

De openbare website draait op GitHub Pages en kan **geen geheime mail-API-sleutel veilig opslaan**. Daarom staat de verzendfunctie in deze aparte Cloudflare Worker.

## Voor de eigenaar — eenmalige koppeling

1. Kies het echte e-mailadres waarop jij aanvragen wil ontvangen. Het project bevat bewust nog **geen verzonnen bedrijfsadres**.
2. Maak een account bij [Resend](https://resend.com). Verifieer een verzenddomein (bijvoorbeeld het domein van jouw zaak) door de gevraagde DNS-records te plaatsen. Dit vereist toegang tot DNS en mogelijk verificatie.
3. Maak een Cloudflare-account en Turnstile-widget voor het domein **muwattah.github.io**. Noteer de publieke sitekey en houd de geheime sleutel privé.
4. Deploy de Worker vanuit deze map (Node.js en Wrangler nodig): `npx wrangler deploy`. Bewaar vervolgens deze vier waarden uitsluitend als Cloudflare Worker secrets:

   `npx wrangler secret put RESEND_API_KEY`
   `npx wrangler secret put QUOTE_FROM_EMAIL`
   `npx wrangler secret put QUOTE_ADMIN_EMAIL`
   `npx wrangler secret put TURNSTILE_SECRET_KEY`

   De waarde van `QUOTE_FROM_EMAIL` moet een geverifieerd afzenderadres zijn, bijvoorbeeld `RS Car Detailing <offertes@jouwdomein.be>`. De waarde van `QUOTE_ADMIN_EMAIL` is het persoonlijke zakelijke ontvangstadres.
5. Stel op GitHub in **Repository → Settings → Secrets and variables → Actions → Variables** deze **publieke** variabelen in:

   - `VITE_QUOTE_API_URL` = jouw Worker-URL, bijvoorbeeld `https://rs-detailing-quote-mail.<account>.workers.dev`
   - `VITE_QUOTE_TURNSTILE_SITE_KEY` = de publieke sitekey uit Cloudflare Turnstile

   De GitHub Pages deploy-workflow leest deze variabelen tijdens de build. Na de eerstvolgende deployment stuurt het formulier echte aanvragen.
6. Test met een eigen klantmailadres en controleer de beheerdersmail inclusief de JPEG-bijlage, de JSON-selectie, en de afzonderlijke klantbevestiging. Controleer ongewenste mail. Zet pas daarna publiek verkeer aan.

## Wat de Worker doet

- Beperkt CORS tot `https://muwattah.github.io` en accepteert alleen aanvragen met geldige gegevens en verplichte privacytoestemming.
- Verifieert elk Cloudflare Turnstile-token via de officiële server-side `siteverify` API. Een token is kort geldig en maar eenmaal bruikbaar.
- Stuurt één bericht naar de **vaste** beheerder (naam, mail, telefoon, opgegeven bus, gekozen systemen, montagemogelijkheden, opmerkingen, JPG en JSON).
- Stuurt een tweede bericht naar het e-mailadres dat de klant invult, met bevestiging, onderdelen en dezelfde JPG.
- Gebruikt aparte idempotency-sleutels per ontvanger om dubbele verzending bij een herhaalde aanvraag met dezelfde referentie te beperken.
- Formuleert de bevestiging uitdrukkelijk als **aanvraag, geen definitieve offerte**. De beheerder keurt definitieve offertes later zelf goed.
- Geeft geen succes terug zolang niet beide e-mails door de mailprovider zijn geaccepteerd. Bij een gedeeltelijke fout vertelt de UI duidelijk dat het beheer al bericht kan hebben ontvangen.

## Veiligheid en gebruiksgrenzen

- Geheimen mogen nooit in `VITE_*`, in GitHub-code, in GitHub Pages of in deze documentatie komen.
- De originele afbeeldingsdata wordt alleen tijdens het versturen doorgestuurd. Resend krijgt een JPG als attachment; de JSON-bijlage bevat bewust geen tweede base64-kopie.
- De Worker vereist een JPG (zonder afbeelding wordt er niet gedaan alsof de configuratie volledig is verzonden).
- Cloudflare Turnstile beschermt tegen geautomatiseerde spam maar is geen absolute garantie. Stel extra Cloudflare-rate-limiting in als de site meer aanvragen gaat verwerken.
- Alleen door de provider *geaccepteerde* verzending wordt bevestigd. Daadwerkelijke bezorging/inboxplaatsing kan later nog mislukken: controleer daarvoor de Resend-logs en bounce-meldingen.
- Er wordt nog **geen extern duurzaam aanvraagarchief/CRM** gemaakt. Bewaar belangrijke aanvragen in je zakelijke mailbox of koppel later een privé database voor beheer en logging.
- GitHub Pages blijft openbaar en bij ontbrekende configuratie werkt de vertrouwde lokale voorbereiding nog, expliciet zonder e-mailclaim.
