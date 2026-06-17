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
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.surface,
    minHeight: 48,
  },
  containerChecked: {
    borderColor: colors.secondary,
    backgroundColor: `${colors.secondary}18`,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  boxChecked: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondary,
  },
  check: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  label: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  labelChecked: {
    color: colors.secondary,
  },
});
