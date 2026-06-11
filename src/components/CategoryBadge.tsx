import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlaceCategory } from '../types';
import { categoryColors, categoryIcons, categoryLabels } from '../theme/colors';

export function CategoryBadge({ category }: { category: PlaceCategory }) {
  const color = categoryColors[category];

  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: color }]}>
      <Text style={styles.icon}>{categoryIcons[category]}</Text>
      <Text style={[styles.label, { color }]}>{categoryLabels[category]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1.5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 6,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
