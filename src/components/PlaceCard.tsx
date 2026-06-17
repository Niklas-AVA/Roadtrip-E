import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FACILITY_LABELS, Place } from '../types';
import { categoryColors, colors } from '../theme/colors';
import { Card } from './Card';
import { CategoryBadge } from './CategoryBadge';

interface Props {
  place: Place;
  onPress: () => void;
}

export function PlaceCard({ place, onPress }: Props) {
  const color = categoryColors[place.category];
  const activeFacilities = Object.entries(place.facilities)
    .filter(([, value]) => value)
    .map(([key]) => FACILITY_LABELS[key as keyof typeof FACILITY_LABELS]);

  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.card, { borderLeftColor: color }]}>
        <CategoryBadge category={place.category} />
        <Text style={styles.name}>{place.name}</Text>
        {activeFacilities.length > 0 ? (
          <Text style={styles.facilities}>{activeFacilities.join(' · ')}</Text>
        ) : (
          <Text style={styles.noFacilities}>Inga kända fasiliteter</Text>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 6,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 8,
    color: colors.text,
  },
  facilities: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
  },
  noFacilities: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
