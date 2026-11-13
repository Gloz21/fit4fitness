import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Exercise, exerciseCatalog } from '../lib/exercises';
import { getExerciseTags, LIBRARY_GROUPS } from '../lib/exerciseLibrary';

// Old single-category list, kept as "Body Part" so every exercise stays reachable
const BODY_PARTS: Exercise['category'][] = [
  'chest', 'back', 'legs', 'shoulders', 'arms', 'core',
  'cardio', 'athletic', 'agility', 'power', 'rotation', 'flexibility',
];

const ALL = 'all';
const MINE = 'mine';
const BODY = 'Body Part';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Props = {
  customExercises: Exercise[];
  /** Tapping the card */
  onPress: (exercise: Exercise) => void;
  /** Buttons on the right of each card */
  renderActions?: (exercise: Exercise, isCustom: boolean) => React.ReactNode;
};

/**
 * Search + two rows of filters: a training goal (Hypertrophy, Strength, ...) and then a
 * category inside it (Upper Chest, Hinge, ...). Used by the Exercise Library and the
 * workout builder's exercise picker.
 */
export default function ExerciseBrowser({ customExercises, onPress, renderActions }: Props) {
  const [group, setGroup] = useState<string>(ALL);
  const [sub, setSub] = useState<string>(ALL);
  const [search, setSearch] = useState('');

  const customIds = useMemo(() => new Set(customExercises.map((e) => e.id)), [customExercises]);
  const all = useMemo(() => [...customExercises, ...exerciseCatalog], [customExercises]);

  const libraryGroup = LIBRARY_GROUPS.find((g) => g.name === group);
  const subChips: { key: string; label: string }[] = libraryGroup
    ? libraryGroup.categories.map((c) => ({ key: c.key, label: c.name }))
    : group === BODY
      ? BODY_PARTS.map((b) => ({ key: b, label: cap(b) }))
      : [];

  const filtered = useMemo(() => {
    let list: Exercise[];
    if (group === MINE) {
      list = all.filter((ex) => customIds.has(ex.id));
    } else if (libraryGroup) {
      // Keep the order the exercises are listed in each category
      const cats = sub === ALL ? libraryGroup.categories : libraryGroup.categories.filter((c) => c.key === sub);
      const ids = Array.from(new Set(cats.flatMap((c) => c.exerciseIds)));
      const byId = new Map(all.map((ex) => [ex.id, ex]));
      list = ids.map((id) => byId.get(id)).filter((ex): ex is Exercise => !!ex);
    } else if (group === BODY) {
      list = sub === ALL ? all : all.filter((ex) => ex.category === sub);
    } else {
      list = [...all].sort((a, b) => a.name.localeCompare(b.name));
    }

    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (ex) =>
        ex.name.toLowerCase().includes(q) ||
        ex.muscleGroups?.some((m) => m.toLowerCase().includes(q)) ||
        ex.equipment?.some((e) => e.toLowerCase().includes(q)) ||
        getExerciseTags(ex.id).some((t) => t.toLowerCase().includes(q))
    );
  }, [all, customIds, group, sub, libraryGroup, search]);

  const groupChips = [
    { key: ALL, label: 'All' },
    ...(customExercises.length > 0 ? [{ key: MINE, label: '⭐ Mine' }] : []),
    ...LIBRARY_GROUPS.map((g) => ({ key: g.name, label: `${g.emoji} ${g.name}` })),
    { key: BODY, label: '🧍 Body Part' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search name, muscle, equipment or category"
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {groupChips.map((c) => (
            <TouchableOpacity
              key={c.key}
              style={[styles.chip, group === c.key && styles.chipActive]}
              onPress={() => {
                setGroup(c.key);
                setSub(ALL);
              }}
            >
              <Text style={[styles.chipText, group === c.key && styles.chipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {subChips.length > 0 && (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subChips}>
            {[{ key: ALL, label: `All ${group}` }, ...subChips].map((c) => (
              <TouchableOpacity
                key={c.key}
                style={[styles.subChip, sub === c.key && styles.subChipActive]}
                onPress={() => setSub(c.key)}
              >
                <Text style={[styles.subChipText, sub === c.key && styles.subChipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <Text style={styles.count}>
        {filtered.length} {filtered.length === 1 ? 'exercise' : 'exercises'}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(ex) => ex.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        ListEmptyComponent={<Text style={styles.empty}>No exercises match. Try another search or category.</Text>}
        renderItem={({ item: ex }) => {
          const isCustom = customIds.has(ex.id);
          const tags = getExerciseTags(ex.id);
          return (
            <TouchableOpacity style={styles.card} onPress={() => onPress(ex)} activeOpacity={0.7}>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{ex.name}</Text>
                  {isCustom && <Text style={styles.mineBadge}>Mine</Text>}
                </View>
                {tags.length > 0 ? (
                  <View style={styles.tags}>
                    {tags.map((t) => (
                      <Text key={t} style={styles.categoryTag}>
                        {t}
                      </Text>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.meta}>{cap(ex.category)}</Text>
                )}
                {ex.muscleGroups?.length > 0 && (
                  <Text style={styles.muscles} numberOfLines={1}>
                    {ex.muscleGroups.join(' · ')}
                  </Text>
                )}
              </View>
              {renderActions && <View style={styles.actions}>{renderActions(ex, isCustom)}</View>}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: { paddingHorizontal: 20, paddingTop: 14 },
  search: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  chips: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  chipActive: { backgroundColor: '#00B8A9', borderColor: '#00B8A9' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#666' },
  chipTextActive: { color: '#FFF' },
  subChips: { paddingHorizontal: 20, paddingVertical: 6, gap: 6 },
  subChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
  },
  subChipActive: { backgroundColor: '#E0F7F5', borderWidth: 1, borderColor: '#00B8A9' },
  subChipText: { fontSize: 12, fontWeight: '600', color: '#666' },
  subChipTextActive: { color: '#00897B' },
  count: { paddingHorizontal: 20, paddingTop: 6, fontSize: 12, color: '#888', marginBottom: 6 },
  list: { paddingHorizontal: 20, paddingBottom: 40, gap: 10 },
  empty: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  name: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', flexShrink: 1 },
  mineBadge: {
    backgroundColor: '#FFF3E0',
    color: '#E67E22',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  meta: { fontSize: 12, color: '#00B8A9', fontWeight: '600', marginBottom: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 4 },
  categoryTag: {
    backgroundColor: '#E8F5F5',
    color: '#00897B',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: '600',
    overflow: 'hidden',
  },
  muscles: { fontSize: 11, color: '#888' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 10 },
});
