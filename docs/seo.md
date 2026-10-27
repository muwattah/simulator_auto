# SEO en pagina-adressen

De bestaande React-site heeft zes openbare pagina's met eigen URL, titel, beschrijving, canonical, Open Graph/Twitter-preview en JSON-LD:

- `/simulator_auto/`
- `/simulator_auto/hoe-het-werkt/`
- `/simulator_auto/realisaties/`
- `/simulator_auto/mogelijkheden/`
- `/simulator_auto/contact/`
- `/simulator_auto/configurator/`

De acht onderdelencategorieën, installatie, overzicht en beheer hebben eveneens eigen URL's. Deze persoonlijke of dunne interactieve schermen zijn `noindex,follow`; configuratorvarianten verwijzen canoniek naar de openbare configuratorpagina. Dit is geen toegangsbeveiliging: beheer blijft de bestaande lokale beheeromgeving.

De build maakt echte directory-indexbestanden met vooraf gerenderde inhoud. Rechtstreeks openen en vernieuwen werkt daardoor op GitHub Pages, zonder hash-router of 404-redirecttruc. Onbekende pagina's leveren de eigen 404-pagina. React neemt daarna de interactieve weergave over; geselecteerde apparatuur blijft in de bestaande store bewaard.

`src/seo/routes.ts` bevat routegegevens en productie-URL. `src/seo/metadata.ts` genereert dezelfde metadata bij build en navigatie. `scripts/prerender.mjs` schrijft HTML, sitemap, robots.txt en .nojekyll. De originele homepage-JPG is ongewijzigd; alleen de aparte 1200×630 deelkaart is toegevoegd.

## Validatie

`npm run build`, `npx tsc --noEmit`, `npm test`, `npm run test:seo` en `node scripts/browser-qa.mjs` slagen lokaal. De SEO-test controleert alle 17 pagina's plus 404, unieke metadata, één h1, zes sitemap-adressen, inhoud zonder JavaScript, directe HTTP-routes, vernieuwen, browsergeschiedenis, mobiele overflow en runtimefouten. CI voert de SEO-test eveneens uit.

## Nog buiten de code

Google Search Console-verificatie en het indienen van `https://muwattah.github.io/simulator_auto/sitemap.xml` vereisen toegang tot de juiste Google-property. Er is geen verificatie of indiening geclaimd en geen analytics-account verzonnen. Windsor.ai kan optioneel gekoppeld worden voor rapportage; dat vervangt geen propertyverificatie of sitemapindiening.

Een robots.txt in een project-submap wordt door Google niet als hostbeleid gebruikt: alleen `/robots.txt` op de hostroot telt. Daarom regelt deze site uitsluiting via HTML-meta-robots; het meegebouwde bestand is bruikbaar bij een toekomstige verhuizing naar een eigen domeinroot. Een bestaand beperkend hostbeleid moet afzonderlijk worden aangepast door de hostbeheerder.

Geen nieuwe 3D-modellen, Thrixel-aanroepen, e-maildiensten of betaalde SEO-tools toegevoegd. Build World/Thrixel blijven zoals eerder geconfigureerd; deze wijziging gebruikt 0 generatiecredits. Zoekresultaten en indexeringstermijn kunnen niet gegarandeerd worden.

Bronnen: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [Google robots.txt](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec), [GitHub Pages 404](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site).
