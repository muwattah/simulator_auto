# Onderzoek bestaande offerteflow

## Wat bestaat al

Op `main` is de offertefunctie lokaal: browseropslag en handmatig contact, zonder mailservice.
De bestaande branch [`feature/offerte-mail-goedkeuring`](https://github.com/muwattah/simulator_auto/tree/feature/offerte-mail-goedkeuring)
bevat al een Cloudflare Worker, D1-schema, Resend-koppeling, mailpresentatie en tests:

- `backend/src/index.mjs`: aanvragen bewaren, klantontvangstbevestiging en beheerdersmelding,
  HMAC-goedkeuringslinks, prijsinvoer en definitieve offerte pas na bevestiging.
- `backend/src/mailPresentation.mjs`: HTML-mail en CID-afbeeldingsbijlage.
- `src/lib/previewImage.ts` en `ConfigurationPreview.tsx`: 3D-preview met onderdelenlegenda
  en een als zodanig aangeduide 2D-fallback.
- `backend/test/`: tests voor aanvraag, goedkeuring, dubbele verwerking en mailpresentatie.

Deze code is onderzocht, niet geactiveerd of als volledig productiegeschikt aangemerkt.
De branch bevat ook wijzigingen/verwijderingen van productfoto's en verschilt van main.
Een volledige merge daarvan zou de opdracht om bestaande foto's te behouden schaden.
Integratie moet daarom gericht gebeuren, zonder de verwijderingen over te nemen.

## Aanbevolen aansluiting

De nieuwe demo gebruikt al `previewImageDataUrl`, zoals de bestaande backend verwacht.
Bij integratie moeten de lengte-/dakvelden (`lengthVariant`, `roofVariant`) worden
afgestemd op de backendvelden `wheelbase`/`roofHeight`. De backend maakt een eigen
referentie; die moet zowel in het getoonde resultaat als in het lokale adminrecord
worden teruggeschreven. De vastgelegde configuratie en afbeelding vormen een immutable
snapshot, niet een latere render van veranderlijke productgegevens.

De server verwacht een JPEG-data-URL van maximaal 750.000 tekens en een aanvraag
van maximaal 850.000 tekens. De nieuwe download legt nog geen mailspecifieke
compressielimiet op: verkleinen en beeldkwaliteit moeten vóór koppeling worden getest.
Gebruik geen mailto-link als vervanging voor echte bezorging en stuur geen afgeleide
AI-afbeelding die onderdelen kan verzinnen of weglaten.

## Nog nodig vóór activering

1. Cloudflare Workers/D1-account en database; geverifieerd afzenderdomein bij Resend.
2. Door de eigenaar gekozen beheerder- en afzenderadres, API-key en approval secret
   uitsluitend op de server. Geen secrets in Vite of GitHub Pages.
3. Gerichte integratie en tests met een gesimuleerde mailprovider, daarna een door
   de eigenaar goedgekeurde test naar echte klant- en beheerdermailboxen.
4. Controleren dat een GET naar een goedkeuringslink niets verstuurt, verlopen links
   falen en een dubbele POST niet tweemaal verzendt. Ook provider-timeouts, vertraagde
   antwoorden, herhaalpogingen en opnieuw insturen na een fout testen.
5. De bestaande statustransitie naar `sending` heeft extra herstelonderzoek nodig:
   een procesonderbreking tussen provideracceptatie en database-update mag een
   offerte niet blijvend laten hangen of dubbel laten verzenden.
6. Formuliermisbruik, body-size-beperking tijdens streamlezen, bewaartermijn,
   toegangscontrole en productie-observatie controleren. CORS alleen is geen
   bescherming tegen niet-browserclients.
7. De backend hardcodet 21% btw. Bevestig bij ingebruikname het toepasselijke beleid;
   de demo berekent of verzendt geen definitief offertebedrag.

De gewenste flow is daarmee haalbaar op basis van bestaande code: aanvraag en
afbeelding opslaan → klantontvangstbevestiging en beheerdersmelding → beoordeling
met definitieve prijs → offerte na expliciete goedkeuring. Deze demo activeert
geen van deze externe verzendingen en deployt geen backend.
