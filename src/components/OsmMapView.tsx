import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Place, TripStop } from '../types';
import { categoryColors, categoryIcons, colors } from '../theme/colors';

interface Props {
  stops: TripStop[];
  places: Place[];
  routeCoordinates: { latitude: number; longitude: number }[] | null;
}

// Embedding untrusted place/stop names (sourced from OSM/Nominatim) inside an
// inline <script> tag, so neutralize "<" to stop "</script>" break-out.
function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function OsmMapView({ stops, places, routeCoordinates }: Props) {
  const html = useMemo(() => {
    const stopsData = stops.map((stop, index) => ({
      lat: stop.lat,
      lon: stop.lon,
      name: stop.name.split(',')[0],
      days: stop.days,
      order: index + 1,
    }));

    const placesData = places.map((place) => ({
      lat: place.lat,
      lon: place.lon,
      name: place.name,
      color: categoryColors[place.category],
      icon: categoryIcons[place.category],
    }));

    const routeData = (routeCoordinates ?? []).map((c) => [c.latitude, c.longitude]);

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; }
  .stop-pin {
    width: 30px; height: 30px; border-radius: 15px;
    background: ${colors.primary}; color: #fff; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; border: 3px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.4);
  }
  .place-pin {
    width: 28px; height: 28px; border-radius: 14px;
    background: #fff; display: flex; align-items: center; justify-content: center;
    font-size: 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.4);
  }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  function popupFor(titleText, subtitleText) {
    var container = document.createElement('div');
    var strong = document.createElement('strong');
    strong.textContent = titleText;
    container.appendChild(strong);
    if (subtitleText) {
      container.appendChild(document.createElement('br'));
      container.appendChild(document.createTextNode(subtitleText));
    }
    return container;
  }

  var map = L.map('map', { zoomControl: true }).setView([48.5, 9.5], 5);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  var stops = ${jsonForScript(stopsData)};
  var places = ${jsonForScript(placesData)};
  var route = ${jsonForScript(routeData)};
  var bounds = [];

  stops.forEach(function (stop) {
    var icon = L.divIcon({
      className: '',
      html: '<div class="stop-pin">' + stop.order + '</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
    var marker = L.marker([stop.lat, stop.lon], { icon: icon }).addTo(map);
    marker.bindPopup(popupFor(stop.order + '. ' + stop.name, stop.days + (stop.days === 1 ? ' dag' : ' dagar')));
    bounds.push([stop.lat, stop.lon]);
  });

  places.forEach(function (place) {
    var icon = L.divIcon({
      className: '',
      html: '<div class="place-pin" style="border:2px solid ' + place.color + '">' + place.icon + '</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    var marker = L.marker([place.lat, place.lon], { icon: icon }).addTo(map);
    marker.bindPopup(popupFor(place.name));
  });

  if (route.length > 0) {
    L.polyline(route, { color: '${colors.primary}', weight: 5 }).addTo(map);
    bounds = bounds.concat(route);
  }

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [40, 40] });
  }
</script>
</body>
</html>`;
  }, [stops, places, routeCoordinates]);

  return (
    <View style={styles.container}>
      <WebView
        style={styles.webview}
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
