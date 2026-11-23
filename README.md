# Mijn Ghast

Een persoonlijke PWA met een geheime activatiecombinatie en een neutrale bureaubladweergave.

## Windows-app

De Electron-versie kan:

- Roblox/Roblox Player en Bloxstrap vensters minimaliseren
- Het eigen venster verbergen
- Windows vergrendelen via `rundll32.exe`
- Als systeemvakicoon blijven draaien

Standaard is de Windowscombinatie **Ctrl + Shift + G**.

```powershell
npm install
npm start
npm run build
```

## Activatie

- Standaard: **Ctrl + Shift + G**
- Veeg op een touchapparaat of telefoon omhoog om het privé-scherm te openen
- Tik **5 keer snel** op het neutrale bureaubladscherm
- De combinatie kan in de app worden gewijzigd via **Wijzig**

Verberg het privé-scherm met:

- Het **X**-knopje
- **Escape**
- Een veeg naar rechts op het privé-scherm

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

## Privacy

- De app gebruikt geen analytics of externe diensten.
- De gekozen combinatie wordt alleen lokaal in `localStorage` opgeslagen.
- Het neutrale scherm is geen beveiliging. Gebruik geen privédata op gedeelde apparaten.
