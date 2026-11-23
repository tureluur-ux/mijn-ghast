# Mijn Ghast

Een persoonlijke Windows-desktopapp met een normale, privé/ghost-modus, lokale instellingen, systeemvakmenu en een neutrale interface.

## Windows-app

De Electron-versie biedt:

- Een **instellingenvenster** voor appnaam, modus, globale combinatie, gedrag en appnamen.
- Een **normaal venster** en apart **Help/informatie**-venster.
- Een **privé/ghost-modus** zonder permanente blokkade.
- Minimaliseren van vensters voor zelf ingestelde Windows-procesnamen.
- Standaarddetectie voor Roblox en Bloxstrap, zonder Roblox- of Bloxstrap-bestanden te wijzigen.
- Optionele Windowsvergrendeling via `rundll32.exe` en de normale Windows-lockactie.
- Systeemvakbediening, reset en duidelijke waarschuwingsinformatie.

De app doet geen procesdoding, keylogging, root/admin-eisen, permanente vergrendeling of Windows-blokkering.

Standaard is de globale combinatie **Ctrl + Shift + G**. De Electron-combinatie wordt in Instellingen als `CommandOrControl+Shift+G` opgeslagen.

```powershell
npm install
npm start
npm run dist
```

## Activatie

- Standaard: **Ctrl + Shift + G**
- Tik **5 keer snel** op het neutrale bureaubladscherm om privé te openen
- Gebruik het systeemvak voor Instellingen, Ghost-modus en afsluiten
- Wijzig de globale combinatie in Instellingen

Verberg het privé-scherm met:

- Het **X**-knopje
- **Escape**

## Starten

Open `index.html` direct via een lokale server:

```powershell
python -m http.server 8080
```

Open daarna <http://localhost:8080>.

## Installeren

1. Open de app in Chrome of Edge.
2. Kies in het browermenu **App installeren** / **Installeren**.
3. De app wordt daarna als eigen venster beschikbaar.

Voor offline gebruik moet de app via HTTPS worden geopend; GitHub Pages ondersteunt dit automatisch.

## Publiceren op GitHub Pages

Deze repository bevat een GitHub Actions workflow die bij elke push naar `main` automatisch publiceert.

## Configuratie en privacy

- Windows-config wordt opgeslagen in `app.getPath('userData')\config.json`.
- Instellingen blijven lokaal; er is geen cloud-, account- of analyticsfunctie.
- Processnamen worden alleen lokaal gebruikt om zichtbare vensters te vinden en te minimaliseren.
- De optie om te vergrendelen gebruikt uitsluitend de normale Windows-vergrendelfunctie en blijft optioneel.
- Het neutrale scherm is geen beveiligingsgrens.

## Portable build

```powershell
npm install
npm run dist
```

De portable Windows-executable staat na een succesvolle build in `dist/`, bijvoorbeeld `Mijn-Ghast-1.1.0-Windows.exe`.

## GitHub Release

Een release kan automatisch worden gemaakt door een semantische versie-tag te pushen. Voeg vóór de eerste release een Windows-releaseworkflow toe die `npm ci`, `npm run dist` en `softprops/action-gh-release` uitvoert. Onder `dist/` wordt de portable executable als Release-artifact geüpload.
