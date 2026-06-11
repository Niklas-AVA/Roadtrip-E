import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTrip } from '../context/TripContext';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import { geocodePlace, GeocodeResult } from '../services/geocoding';
import { fetchLegs, RouteLeg } from '../services/routing';

function formatDistance(meters: number): string {
  return `${(meters / 1000).toFixed(0)} km`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours === 0) return `${minutes} min`;
  return `${hours} h ${minutes} min`;
}

export function TripScreen() {
  const { trip, addStop, removeStop, updateStopDays, moveStop } = useTrip();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [legs, setLegs] = useState<RouteLeg[]>([]);
  const [legsLoading, setLegsLoading] = useState(false);

  const totalDays = trip.stops.reduce((sum, stop) => sum + stop.days, 0);
  const totalDistanceMeters = legs.reduce((sum, leg) => sum + leg.distanceMeters, 0);

  useEffect(() => {
    let cancelled = false;
    if (trip.stops.length < 2) {
      setLegs([]);
      return;
    }

    setLegsLoading(true);
    fetchLegs(trip.stops)
      .then((result) => {
        if (!cancelled) setLegs(result);
      })
      .catch(() => {
        if (!cancelled) setLegs([]);
      })
      .finally(() => {
        if (!cancelled) setLegsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [trip.stops]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const found = await geocodePlace(query);
      setResults(found);
      if (found.length === 0) setError('Inga platser hittades.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Något gick fel.');
    } finally {
      setSearching(false);
    }
  };

  const handlePick = (result: GeocodeResult) => {
    addStop({ name: result.name, lat: result.lat, lon: result.lon, days: 1 });
    setResults([]);
    setQuery('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{trip.name}</Text>
        <Text style={styles.subtitle}>
          {trip.stops.length} delmål · {totalDays} {totalDays === 1 ? 'dag' : 'dagar'}{' '}
          totalt
          {legs.length > 0 && ` · ${formatDistance(totalDistanceMeters)} totalt`}
          {legsLoading && ' · beräknar sträcka…'}
        </Text>
      </View>

      <Card style={styles.searchCard}>
        <TextInput
          style={styles.input}
          placeholder="Sök stad eller plats, t.ex. Toscana"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Pressable style={styles.searchButton} onPress={handleSearch}>
          {searching ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Sök</Text>
          )}
        </Pressable>

        {error && <Text style={styles.error}>{error}</Text>}

        {results.map((result, index) => (
          <Pressable
            key={`${result.lat}-${result.lon}-${index}`}
            style={styles.resultRow}
            onPress={() => handlePick(result)}
          >
            <Text style={styles.resultText} numberOfLines={2}>
              ➕ {result.name}
            </Text>
          </Pressable>
        ))}
      </Card>

      <FlatList
        data={trip.stops}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Inga delmål än. Sök efter en plats ovan för att börja planera din
            roadtrip!
          </Text>
        }
        renderItem={({ item, index }) => (
          <>
            {index > 0 && legs[index - 1] && (
              <View style={styles.legRow}>
                <View style={styles.legLine} />
                <Text style={styles.legText}>
                  🚗 {formatDistance(legs[index - 1].distanceMeters)} ·{' '}
                  {formatDuration(legs[index - 1].durationSeconds)}
                </Text>
                <View style={styles.legLine} />
              </View>
            )}
            <Card style={styles.stopCard}>
            <View style={styles.stopRow}>
              <View style={styles.stopOrder}>
                <Text style={styles.stopOrderText}>{index + 1}</Text>
              </View>
              <View style={styles.stopInfo}>
                <Text style={styles.stopName} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.daysRow}>
                  <Pressable
                    style={styles.dayButton}
                    onPress={() =>
                      updateStopDays(item.id, Math.max(1, item.days - 1))
                    }
                  >
                    <Text style={styles.dayButtonText}>−</Text>
                  </Pressable>
                  <Text style={styles.daysText}>
                    {item.days} {item.days === 1 ? 'dag' : 'dagar'}
                  </Text>
                  <Pressable
                    style={styles.dayButton}
                    onPress={() => updateStopDays(item.id, item.days + 1)}
                  >
                    <Text style={styles.dayButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => moveStop(item.id, 'up')}>
                  <Text style={styles.actionIcon}>⬆️</Text>
                </Pressable>
                <Pressable onPress={() => moveStop(item.id, 'down')}>
                  <Text style={styles.actionIcon}>⬇️</Text>
                </Pressable>
                <Pressable onPress={() => removeStop(item.id)}>
                  <Text style={styles.actionIcon}>🗑️</Text>
                </Pressable>
              </View>
            </View>
            </Card>
          </>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  searchCard: {
    paddingBottom: 10,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    marginBottom: 8,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  error: {
    color: colors.danger,
    marginTop: 8,
    fontSize: 13,
  },
  resultRow: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
  },
  resultText: {
    color: colors.text,
    fontSize: 14,
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
  stopCard: {},
  legRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 28,
    marginVertical: 2,
  },
  legLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  legText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginHorizontal: 8,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopOrder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stopOrderText: {
    color: '#fff',
    fontWeight: '800',
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  dayButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  daysText: {
    marginHorizontal: 10,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  actions: {
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  actionIcon: {
    fontSize: 16,
  },
});
