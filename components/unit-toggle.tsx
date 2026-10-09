import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { UnitSystem } from '@/app/lib/units';

const OPTIONS: { value: UnitSystem; label: string; detail: string }[] = [
  { value: 'imperial', label: 'Imperial', detail: 'lbs · ft/in' },
  { value: 'metric', label: 'Metric', detail: 'kg · cm' },
];

export function UnitToggle({ value, onChange }: { value: UnitSystem; onChange: (next: UnitSystem) => void }) {
  return (
    <View style={styles.track}>
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.option, active && styles.optionActive]}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
            <Text style={[styles.detail, active && styles.detailActive]}>{opt.detail}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  optionActive: {
    backgroundColor: '#00B8A9',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
  },
  labelActive: {
    color: '#FFF',
  },
  detail: {
    fontSize: 11,
    color: '#888',
    marginTop: 1,
  },
  detailActive: {
    color: 'rgba(255,255,255,0.85)',
  },
});
