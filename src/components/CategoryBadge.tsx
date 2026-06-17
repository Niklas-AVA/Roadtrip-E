import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlaceCategory } from '../types';
import { categoryColors, categoryIcons, categoryLabels } from '../theme/colors';

export function CategoryBadge({ category }: { category: PlaceCategory }) {
  const color = categoryColors[category];

  return (
    <View style={[styles.badge, { backgroundColor: `${color}26`, borderColor: color }]}>
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
    borderWidth: 2,
    paddingVertical: 5,
    paddingHorizontal: 12,
    gap: 6,
  },
  icon: {
    fontSize: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
  },
});
