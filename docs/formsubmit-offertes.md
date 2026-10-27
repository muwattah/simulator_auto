# E-mails voor offerteaanvragen via FormSubmit

**Ontvangstadres:** zakaria.el.a@hotmail.com. Er is geen eigen domein, DNS-verificatie, API-key of backend-account nodig.

De openbare configurator op GitHub Pages verstuurt via een gewone HTML-formulier-POST met \`multipart/form-data\` naar \`https://formsubmit.co/zakaria.el.a%40hotmail.com\`.

## Wat wordt verstuurd?

- Naar de beheerder: naam, klantmail, telefoon, busomschrijving, alle geselecteerde apparatuur, deurmontages, opmerkingen en het referentienummer.
- Eén bijlage: een echte \`RS-....jpg\` met de gekozen 3D-opstelling, als bestandsveld \`attachment\`. De volledige onderdelenlijst en overige configuratiegegevens staan in het e-mailbericht.
- Naar de klant: FormSubmit's \`_autoresponse\` met ontvangsttekst, referentie en gekozen onderdelen. **FormSubmit garandeert geen bijlage bij die automatische klantmail**; de JPG wordt dus alleen aan het beheerdersbericht gehangen.
- De klant geeft privacytoestemming voordat de POST kan starten. De foto's en het volledige JSON-bestand worden daarnaast lokaal aangeboden in de oorspronkelijke offline-flow.

## Eenmalige Hotmail-activatie (essentieel)

1. Publiceer de code op GitHub Pages.
2. Verstuur een **testaanvraag** via de simulator, met jouw eigen e-mailadres als testklant. FormSubmit toont daarbij mogelijk een reCAPTCHA.
3. Open **zakaria.el.a@hotmail.com**, inclusief Ongewenste e-mail, en **klik op de activatielink van FormSubmit**. Zonder deze bevestiging worden offertes niet doorgestuurd.
4. **Verstuur daarna opnieuw een testaanvraag**. Controleer of je de JPG-bijlage in Hotmail ontvangt en een tekstbevestiging naar het ingevulde klantadres komt.
5. Tot een geslaagde echte verzending/ontvangst is dit niet geverifieerd als werkende productie-mail.

## Waarom een gewoon HTML-formulier?

De [officiële FormSubmit-documentatie](https://formsubmit.co/documentation) zegt dat bijlagen alleen gegarandeerd zijn bij \`multipart/form-data\` en dat \`_autoresponse\` **niet werkt bij AJAX**. Daarom verzendt het formulier met een **navigatie naar FormSubmit**. FormSubmit toont zelf captcha en een ontvangstpagina, waarna de klant met terug kan naar de simulator.

De JPG mag niet groter zijn dan 10 MB. De code controleert dat vooraf; als de afbeelding niet gerenderd kan worden, is er geen verzending met een ontbrekende eindfoto.

## Grenzen

- De eerste activatieaanvraag is niet geschikt om de bijlagebezorging te testen: bevestig het adres en verzend nogmaals.
- We kunnen niet op basis van een succesvolle formuliernavigatie bewijzen dat mail bezorgd werd. De klant moet de bevestiging en de beheerder de bijlagen controleren.
- FormSubmit verwerkt klantgegevens als derde partij. Voor een definitief privacybeleid moet die verwerking worden vermeld.
- HTML-formuliergegevens zijn publiek en kunnen spam opleveren; houd FormSubmit reCAPTCHA ingeschakeld.
- Het gekozen Hotmail-adres is publiek zichtbaar in de formulieractie. FormSubmit kan na activatie een alias aanbieden die dit verhult.
- Wil je **ook een JPG-bijlage in de klantmail**, dan is een andere verzenddienst met aparte servermail nodig. FormSubmit heeft hier geen gedocumenteerde ondersteuning voor.

## Ontwikkelen en testen

De ontwikkelmodus behoudt lokale aanvragen om de bestaande browser-regressietests niet te laten mailen. Productiebouw gebruikt FormSubmit. Testen in CI versturen geen echte e-mails.

## Bedanktpagina op de eigen site

Voor een JPG-bijlage en automatische klantbevestiging blijft een normale, niet-AJAX, multipart-POST nodig. Met het verborgen veld `_next` stuurt FormSubmit na verwerking terug naar `https://muwattah.github.io/simulator_auto/configurator/?offerte=verzonden&referentie=...` (absolute URL). React toont daar een eigen bedankpagina. Dat is een navigatie via FormSubmit en terug, **geen AJAX**. De gerenderde JPEG gaat met de gedocumenteerde bestandsveldnaam `attachment` mee; JSON wordt niet apart bijgevoegd. Bekijk de ontvangen mail om te verifiëren of de bijlage echt is aangekomen. **FormSubmit bewaart bijlagen van vóór activatie niet**: alleen een nieuwe aanvraag na activatie is geschikt als ontvangsttest.
