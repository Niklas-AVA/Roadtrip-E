import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTrip } from '../context/TripContext';
import { fetchPlacesNear } from '../services/overpass';
import { FACILITY_LABELS, FacilityFlags, Place, PlaceCategory } from '../types';
import { Card } from '../components/Card';
import { CategoryBadge } from '../components/CategoryBadge';
import { FacilityCheckbox } from '../components/FacilityCheckbox';
import { PlaceCard } from '../components/PlaceCard';
import { categoryColors, categoryLabels, colors } from '../theme/colors';

const CATEGORIES: PlaceCategory[] = ['camping', 'stellplatz', 'beach', 'attraction'];
const FACILITY_KEYS = Object.keys(FACILITY_LABELS) as (keyof FacilityFlags)[];

export function PlacesScreen() {
  const { trip } = useTrip();
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<PlaceCategory>>(
    new Set(CATEGORIES)
  );
  const [activeFacilities, setActiveFacilities] = useState<Set<keyof FacilityFlags>>(
    new Set()
  );
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  useEffect(() => {
    if (!selectedStopId && trip.stops.length > 0) {
      setSelectedStopId(trip.stops[0].id);
    }
  }, [trip.stops, selectedStopId]);

  const selectedStop = trip.stops.find((s) => s.id === selectedStopId);

  useEffect(() => {
    if (!selectedStop) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPlaces([]);

    fetchPlacesNear(selectedStop.lat, selectedStop.lon)
      .then((found) => {
        if (!cancelled) setPlaces(found);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Något gick fel.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedStop?.id]);

  const toggleCategory = (category: PlaceCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const toggleFacility = (facility: keyof FacilityFlags) => {
    setActiveFacilities((prev) => {
      const next = new Set(prev);
      if (next.has(facility)) next.delete(facility);
      else next.add(facility);
      return next;
    });
  };

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      if (!activeCategories.has(place.category)) return false;
      for (const facility of activeFacilities) {
        if (!place.facilities[facility]) return false;
      }
      return true;
    });
  }, [places, activeCategories, activeFacilities]);

  if (trip.stops.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>
          Lägg till delmål under fliken "Resa" för att se ställplatser,
          campingar, stränder och sevärdheter i närheten.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.stopSelector}
        contentContainerStyle={styles.stopSelectorContent}
      >
        {trip.stops.map((stop) => (
          <Pressable
            key={stop.id}
            style={[
              styles.stopChip,
              stop.id === selectedStopId && styles.stopChipActive,
            ]}
            onPress={() => setSelectedStopId(stop.id)}
          >
            <Text
              style={[
                styles.stopChipText,
                stop.id === selectedStopId && styles.stopChipTextActive,
              ]}
              numberOfLines={1}
            >
              {stop.name.split(',')[0]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.filtersSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((category) => {
            const active = activeCategories.has(category);
            const color = categoryColors[category];
            return (
              <Pressable
                key={category}
                onPress={() => toggleCategory(category)}
                style={[
                  styles.categoryChip,
                  {
                    borderColor: color,
                    backgroundColor: active ? color : `${color}15`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: active ? '#fff' : color },
                  ]}
                >
                  {categoryLabels[category]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.facilityRow}>
          {FACILITY_KEYS.map((key) => (
            <FacilityCheckbox
              key={key}
              label={FACILITY_LABELS[key]}
              checked={activeFacilities.has(key)}
              onToggle={() => toggleFacility(key)}
            />
          ))}
        </View>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Hämtar platser från OpenStreetMap…</Text>
        </View>
      )}

      {!!error && !loading && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={filteredPlaces}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Inga platser matchar dina filter i närheten av detta delmål.
            </Text>
          }
          renderItem={({ item }) => (
            <PlaceCard place={item} onPress={() => setSelectedPlace(item)} />
          )}
        />
      )}

      <Modal
        visible={!!selectedPlace}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedPlace(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPlace && (
              <>
                <CategoryBadge category={selectedPlace.category} />
                <Text style={styles.modalTitle}>{selectedPlace.name}</Text>
                <Text style={styles.modalCoords}>
                  {selectedPlace.lat.toFixed(5)}, {selectedPlace.lon.toFixed(5)}
                </Text>

                <Text style={styles.modalSectionTitle}>Fasiliteter</Text>
                <View style={styles.facilityRow}>
                  {FACILITY_KEYS.map((key) => (
                    <View
                      key={key}
                      style={[
                        styles.facilityPill,
                        selectedPlace.facilities[key]
                          ? styles.facilityPillYes
                          : styles.facilityPillNo,
                      ]}
                    >
                      <Text
                        style={
                          selectedPlace.facilities[key]
                            ? styles.facilityPillTextYes
                            : styles.facilityPillTextNo
                        }
                      >
                        {selectedPlace.facilities[key] ? '✓ ' : '— '}
                        {FACILITY_LABELS[key]}
                      </Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  style={styles.osmButton}
                  onPress={() =>
                    Linking.openURL(
                      `https://www.openstreetmap.org/?mlat=${selectedPlace.lat}&mlon=${selectedPlace.lon}#map=17/${selectedPlace.lat}/${selectedPlace.lon}`
                    )
                  }
                >
                  <Text style={styles.osmButtonText}>Öppna i OpenStreetMap</Text>
                </Pressable>

                <Pressable
                  style={styles.closeButton}
                  onPress={() => setSelectedPlace(null)}
                >
                  <Text style={styles.closeButtonText}>Stäng</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stopSelector: {
    flexGrow: 0,
    paddingTop: 12,
  },
  stopSelectorContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  stopChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 4,
  },
  stopChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stopChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    maxWidth: 140,
  },
  stopChipTextActive: {
    color: '#fff',
  },
  filtersSection: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  categoryRow: {
    gap: 8,
    paddingBottom: 4,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    marginRight: 4,
  },
  categoryChipText: {
    fontWeight: '700',
    fontSize: 13,
  },
  facilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textMuted,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 32,
    marginHorizontal: 32,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 10,
    color: colors.text,
  },
  modalCoords: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  modalSectionTitle: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 8,
    color: colors.text,
  },
  facilityPill: {
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  facilityPillYes: {
    backgroundColor: `${colors.success}22`,
  },
  facilityPillNo: {
    backgroundColor: `${colors.border}`,
  },
  facilityPillTextYes: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 12,
  },
  facilityPillTextNo: {
    color: colors.textMuted,
    fontSize: 12,
  },
  osmButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  osmButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
});
