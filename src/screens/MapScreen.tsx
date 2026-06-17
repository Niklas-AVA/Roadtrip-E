import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OsmMapView } from '../components/OsmMapView';
import { useTrip } from '../context/TripContext';
import { fetchPlacesNear } from '../services/overpass';
import { fetchRoute, RouteResult } from '../services/routing';
import { Place } from '../types';
import { colors, gradients } from '../theme/colors';

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

  return (
    <View style={styles.container}>
      <OsmMapView
        stops={trip.stops}
        places={places}
        routeCoordinates={route?.coordinates ?? null}
      />

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
        <LinearGradient colors={gradients.bgOcean} style={styles.overlay}>
          <Text style={styles.overlayEmoji}>🗺️</Text>
          <Text style={styles.overlayText}>
            Lägg till delmål under fliken "Resa" för att se kartan med rutt och
            platser! 🌈
          </Text>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
