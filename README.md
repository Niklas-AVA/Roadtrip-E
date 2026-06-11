# Roadtrip-E

En mobilapp (Expo / React Native) för att planera roadtrips i Europa.

## Funktioner

- **Resa**: Lägg till delmål (sök på ort/plats) med antal dagar, ändra ordning och antal dagar
- **Karta**: Visar rutten mellan dina delmål (OSRM) på en OpenStreetMap-karta, med markörer för
  campingar, ställplatser, stränder och sevärdheter i närheten
- **Platser**: Lista över campingar, ställplatser, stränder och sevärdheter nära varje delmål,
  hämtat från OpenStreetMap (Overpass API), med kryssruts-filter för fasiliteter
  (el, vatten, toalett, dusch, tömning, wifi, husdjur tillåtna)

## Köra appen

1. Installera beroenden:
   ```
   npm install
   ```
2. Starta dev-servern:
   ```
   npx expo start
   ```
3. Skanna QR-koden med **Expo Go**-appen (iOS/Android) för att köra appen på din telefon.

## Datakällor

- Geokodning: [Nominatim](https://nominatim.openstreetmap.org/)
- Platser (campingar, ställplatser, stränder, sevärdheter): [Overpass API](https://overpass-api.de/)
- Ruttning: [OSRM](https://project-osrm.org/)
- Kartplattor: [OpenStreetMap](https://www.openstreetmap.org/)

Alla dessa tjänster är gratis men har rate limits på de publika servrarna.
