# 3D-installatiedemo — 26 oktober 2026

Werkbranch: `feat/professional-3d-demo`. Geen wijziging aan de homepage, geen deployment en geen merge naar main.

## Bekijken

```sh
npm ci
npm run dev
```

Open `/simulator_auto/`, start de configurator en kies **Laad de 3D-demo**.
De demo bevat een grote bestelwagen, 400 L watertank, metalen montageframe,
hogedrukreiniger, generator en twee haspels. Alle bestaande configuratiestappen blijven beschikbaar.
Gebruik de camerastanden, zoomknoppen, muis/touch, carrosseriemodus, dakschakelaar en achterdeuren.

## Modellen en credits

Build World is geïnstalleerd en Thrixel CLI/MCP is met een echte accountcontrole getest.
De assets staan in Thrixel-project `RS Detailing configurator demo` (`e42b9fb6-82a6-4000-a7a5-f433bd0666f5`).
Beginsaldo 250; na generatie 137; verbruik **113 cubes**. Er is niets gekocht.

| Asset | Thrixel submission | Bewerking |
| --- | --- | --- |
| Generieke bestelwagen | `a2e0640e-7820-4371-8c1d-76ec4a4fd51f` | Architect, Plus; 92.560 driehoeken |
| Blauwe haspel | `7997e00a-63de-49e2-8247-3911bcc3e64f` | Sculptor, 1024 px texturen |
| Blauwe generator | `36c4313e-241a-41b8-9d08-df9642a5588a` | Sculptor, 1024 px texturen |
| Hogedrukreiniger | `dc1e745b-60e7-4063-b116-0253919a28a8` | Sculptor, 1024 px texturen |

De realisatiefoto's (6) en accessoirefoto's (21) in het project zijn visueel geïnspecteerd.
Hun blauwe apparatuur, slanghaspels, metalen frames en montagewijze dienen als visuele
referentie. De nieuwe apparatuur is een benadering, geen scan van exacte catalogusproducten.
Er zijn geen fabrikantlogo's, fabrikant-CAD, WEATHER GUARD-assets of -code overgenomen.
Voor nieuwe merkgebonden assets blijven afzonderlijke gebruiksrechten vereist.

Tank en frame zijn parametrisch gemodelleerd: afgerond polyethyleen met ribben, dop,
spanbanden en aansluiting, plus stalen kokerprofielen, montagevoeten en bouten.
De haspelmesh wordt hergebruikt; een stroomhaspel is in deze demo visueel hetzelfde
basismodel. Niet alle catalogusvarianten hebben al een uniek gedetailleerd model.

Thrixels gratis groepering (`29662cac-5c7c-4dbe-821a-0359ac713140`) liet binnenste
deurpanelen achter in de vaste carrosserie. Die uitvoer is **niet geleverd**.
`scripts/optimize-van.mjs` groepeert de originele GLB lokaal per materiaal en bewaart
de volledige deur-subtrees. Geen nieuwe generatie of creditverbruik. De oorspronkelijke
92.560 driehoeken en WebP-texturen blijven behouden; 218 losse meshes worden 6 assemblages.

## Maten en pascontrole

De selectie Sprinter / standaardlengte / hoog dak / enkele cabine gebruikt een envelop
van 3375 × 1787 × 2009 mm. Bron: [Mercedes-Benz UK technische gegevens](https://www.mercedes-benz.co.uk/vans/models/sprinter/panel-van/overview.html)
en de Mercedes-Benz Sprinter-brochure van maart 2025. Deze bronwaarden horen bij een
specifieke standaard RWD-uitvoering. Het model zelf blijft een generieke AI-benadering.
Andere merken, lengtes, dakhoogtes en dubbele cabines gebruiken nog indicatieve afmetingen.
De labels claimen daarom geen fabrikant-CAD of gecertificeerde montagepassing.

De controle bewaart productmaten en signaleert buitenmaten, apparatuur-overlap,
geschatte wielkasten, categoriebeperkingen en ontbrekende compressor bij een luchthaspel.
Een zoekroutine kiest vrije vloerposities. Stalen frames worden niet meer verkleind om
ze passend te laten lijken. De frame-envelop is een open dragende constructie en is
daarom uitgezonderd van de massieve-box overlaptest; montagebeugels en boutverbindingen
zijn nog niet technisch gevalideerd.

Het resterende laadvermogen kan worden ingevuld. Watergewicht wordt berekend als
circa 1 kg per liter. Als water alleen het opgegeven laadvermogen overschrijdt,
wordt dit gemeld. Onbekende leeggewichten blijven expliciet onbekend: er wordt
geen betrouwbaar totaalgewicht, aslast of gewichtsverdeling verzonnen.
De geometrische uitkomst `fits` is geen montage- of voertuiggoedkeuring.

## Afbeelding en offerte

Het formulier bewaart een JPEG uit de daadwerkelijk getoonde WebGL-scène, gekoppeld
aan de volledige configuratiesleutel. Bij een andere selectie wordt geen oude
afbeelding hergebruikt. Bij het verlaten van het mobiele 3D-tabblad blijft de passende
afbeelding tijdelijk in het geheugen beschikbaar. Bij laadfouten of ontbrekende WebGL
wordt geen fictieve afbeelding gemaakt.

De volledige aanvraag is als JSON downloadbaar, met `previewImageDataUrl`, voertuigmodel,
lengte- en dakvariant, waarschuwingen en `reviewStatus: awaiting-admin-review`.
Het lokale adminrecord en de aanvraag gebruiken dezelfde configuratiereferentie.
Grote afbeeldingen staan niet in localStorage. De JPEG is ook afzonderlijk downloadbaar.
Dit is een hoogwaardige weergave van de gekozen demo, geen fotorealistische productfoto.

**E-mailverzending blijft uitgeschakeld.** Zie [offerte-integratie.md](offerte-integratie.md)
voor het onderzoek naar de al bestaande backend op de andere branch.

## Testen en grenzen

```sh
npm test
npm run build
# Start eerst de ontwikkelserver op 5278:
npm run dev -- --host 127.0.0.1 --port 5278
node scripts/browser-qa.mjs
```

Browser-QA gebruikt Edge op Windows en Playwright Chromium op andere platforms.
Voor Chromium moet de Playwright-browser geïnstalleerd zijn. `QA_URL` en `QA_DEVICE`
kunnen server en desktop/mobile selectie bepalen. De suite controleert runtimefouten,
één renderer, overflow, DPR-cap, zoom/reset, echte mouse/touch-rotatie, deuren,
verwijderen van apparatuur en het formulier inclusief afbeelding en referenties.
Screenshots worden ook visueel nagekeken; geautomatiseerde bediening alleen ontdekte
het probleem met achtergebleven deurpanelen niet.

De renderer gebruikt studioverlichting en reflecties zonder externe HDRI-download,
schaduwen, DPR maximaal 1,5 en rendering op verzoek. Er is geen continue renderlus
als de configuratie stilstaat. Mobiel wordt geen tweede verborgen canvas aangemaakt.

Op deze Windows-sandbox blokkeert de native esbuild toegang tot bovenliggende mappen.
De build is daarom lokaal met dezelfde esbuild-versie via WebAssembly uitgevoerd;
die tijdelijke node_modules-aanpassing is niet gecommit. De TypeScript-controle
met ongebruikte variabelen toegestaan slaagt; de volledige bestaande controle bevat
twee ongebruikte icon-imports in HomePage.tsx, die volgens opdracht ongemoeid blijft.
De bestaande CSS-importvolgorde en de grote lazy 3D-bundel geven buildwaarschuwingen.

Getest op een echte desktop-GPU met een geëmuleerde telefoonviewport, niet op fysieke
telefoonhardware. Een gegarandeerde mobiele 30/60 FPS wordt niet geclaimd. Verdere
afwerking: exacte unieke productmodellen, gevalideerde voertuigvarianten, totale massa
en aslasten, bevestigingsdetails en integratie/acceptatietest van de offertebackend.

### Gemeten controle van deze demonstratie

Desktop- en mobiele browser-QA: geslaagd zonder JavaScript-runtimefouten.
Mobiele viewport: 390 × 844, gerapporteerde DPR 3, renderbuffer beperkt tot 1,5.
Hardware: Intel Iris Xe, Edge/ANGLE D3D11; de mobiele meting is emulatie op deze GPU.
Bij drie runs van elk 120 frames met continue camerarotatie en warme shaders:

| Profiel | p50 ms (3 runs) | p95 ms | p99 ms | Frames boven 50 ms |
| --- | --- | --- | --- | --- |
| Desktop | 30,9 / 33,5 / 29,0 | 39,7 / 39,7 / 36,1 | 42,1 / 44,9 / 53,7 | 0 / 0 / 2 |
| Telefoonviewport | 20,4 / 17,7 / 17,8 | 31,0 / 30,2 / 28,1 | 35,6 / 38,5 / 32,2 | 0 / 0 / 0 |

186 draw calls bij draaiende camera, tegenover 552 vóór groepering; ca. 66% minder.
Dit zijn renderpass-tellingen inclusief schaduwpasses, geen unieke objectaantallen.
De shaderprogrammatelling bleef tijdens de drie runs 30. De build draaide tijdens
onderdelen van deze meting mee; het zijn gemeten ontwikkelomgevingsresultaten, geen
gegarandeerde prestaties op klantapparaten. `scripts/profile.mjs` reproduceert de meting.
