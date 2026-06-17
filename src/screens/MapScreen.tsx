import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { useTrip } from '../context/TripContext';
import { fetchPlacesNear } from '../services/overpass';
import { fetchRoute, RouteResult } from '../services/routing';
import { Place } from '../types';
import { categoryColors, categoryIcons, colors } from '../theme/colors';

const EUROPE_REGION = {
  latitude: 48.5,
  longitude: 9.5,
  latitudeDelta: 20,
  longitudeDelta: 20,
};

export function MapScreen() {
  const { trip } = useTrip();
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (trip.stops.length >= 2) {
      fetchRoute(trip.stops)
        .then((result) => {
          if (!cancelled) setRoute(result);
        })
        .catch(() => {
          if (!cancelled) setRoute(null);
        });
    } else {
      setRoute(null);
    }
    return () => {
      cancelled = true;
    };
  }, [trip.stops]);

  useEffect(() => {
    let cancelled = false;
    if (trip.stops.length === 0) {
      setPlaces([]);
      return;
    }

    setLoading(true);
    Promise.all(trip.stops.map((stop) => fetchPlacesNear(stop.lat, stop.lon, 8000)))
      .then((results) => {
        if (cancelled) return;
        const merged = new Map<string, Place>();
        results.flat().forEach((place) => merged.set(place.id, place));
        setPlaces(Array.from(merged.values()));
      })
      .catch(() => {
        if (!cancelled) setPlaces([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [trip.stops]);

  const initialRegion = useMemo(() => {
    if (trip.stops.length === 0) return EUROPE_REGION;
    const first = trip.stops[0];
    return {
      latitude: first.lat,
      longitude: first.lon,
      latitudeDelta: 4,
      longitudeDelta: 4,
    };
  }, [trip.stops]);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {trip.stops.map((stop, index) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.lat, longitude: stop.lon }}
            title={`${index + 1}. ${stop.name.split(',')[0]}`}
            description={`${stop.days} ${stop.days === 1 ? 'dag' : 'dagar'}`}
            pinColor={colors.primary}
          />
        ))}

        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lon }}
            title={place.name}
            pinColor={categoryColors[place.category]}
          >
            <View
              style={[
                styles.poiMarker,
                { borderColor: categoryColors[place.category] },
              ]}
            >
              <Text style={styles.poiIcon}>{categoryIcons[place.category]}</Text>
            </View>
          </Marker>
        ))}

        {route && (
          <Polyline
            coordinates={route.coordinates}
            strokeColor={colors.primary}
            strokeWidth={5}
          />
        )}
      </MapView>

      {loading && (
        <View style={styles.loadingBadge}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Hämtar platser…</Text>
        </View>
      )}

      {route && (
        <View style={styles.routeInfo}>
          <Text style={styles.routeInfoText}>
            🚗 {(route.distanceMeters / 1000).toFixed(0)} km · ⏱{' '}
            {Math.round(route.durationSeconds / 3600)} h
          </Text>
        </View>
      )}

      {trip.stops.length === 0 && (
        <View style={styles.overlay}>
          <Text style={styles.overlayEmoji}>🗺️</Text>
          <Text style={styles.overlayText}>
            Lägg till delmål under fliken "Resa" för att se kartan med rutt och
            platser! 🌈
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  poiMarker: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 3,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poiIcon: {
    fontSize: 17,
  },
  loadingBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    shadowColor: colors.secondary,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  loadingText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  routeInfo: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: colors.secondary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  routeInfoText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,246,233,0.92)',
    paddingHorizontal: 32,
  },
  overlayEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  overlayText: {
    textAlign: 'center',
    color: colors.text,
    lineHeight: 22,
    fontSize: 15,
    fontWeight: '600',
  },
});
