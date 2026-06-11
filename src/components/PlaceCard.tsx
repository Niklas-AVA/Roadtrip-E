import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FACILITY_LABELS, Place } from '../types';
import { categoryColors } from '../theme/colors';
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
    borderLeftWidth: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
    color: '#1F2933',
  },
  facilities: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  noFacilities: {
    marginTop: 4,
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});
