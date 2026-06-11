import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

export function FacilityCheckbox({ label, checked, onToggle }: Props) {
  return (
    <Pressable
      onPress={onToggle}
      style={[styles.container, checked && styles.containerChecked]}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Text style={styles.check}>✓</Text>}
      </View>
      <Text style={[styles.label, checked && styles.labelChecked]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  containerChecked: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  boxChecked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  check: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  labelChecked: {
    color: colors.primary,
  },
});
