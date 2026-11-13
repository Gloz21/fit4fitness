import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ModalSafeArea } from '@/components/modal-safe-area';
import { Exercise } from '../lib/exercises';
import { exerciseStore, useExerciseStore } from '../lib/exerciseStore';
import CustomExerciseModal from './CustomExerciseModal';
import ExerciseBrowser from './ExerciseBrowser';
import ExerciseInfoModal from './ExerciseInfoModal';

type Props = {
  visible: boolean;
  onClose: () => void;
};

/** Browse every exercise on its own: search, filter by goal and category, read how to do it, add your own. */
export default function ExerciseLibraryModal({ visible, onClose }: Props) {
  const { customExercises } = useExerciseStore();
  const [infoExercise, setInfoExercise] = useState<Exercise | null>(null);
  const [creating, setCreating] = useState(false);

  const confirmDelete = (ex: Exercise) => {
    Alert.alert('Delete exercise?', `"${ex.name}" will be removed from your exercises. Workouts that already use it keep it.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => exerciseStore.deleteExercise(ex.id) },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ModalSafeArea style={{ flex: 1, backgroundColor: '#FFF' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Exercise Library</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => setCreating(true)}>
            <Text style={styles.createButtonText}>+ Create</Text>
          </TouchableOpacity>
        </View>

        <ExerciseBrowser
          customExercises={customExercises}
          onPress={setInfoExercise}
          renderActions={(ex, isCustom) =>
            isCustom ? (
              <TouchableOpacity onPress={() => confirmDelete(ex)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={{ fontSize: 16 }}>🗑️</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.chevron}>›</Text>
            )
          }
        />

        {/* Rendered inside this modal so they stack on top of it on iOS */}
        <ExerciseInfoModal visible={!!infoExercise} exercise={infoExercise} onClose={() => setInfoExercise(null)} />
        <CustomExerciseModal
          visible={creating}
          onClose={() => setCreating(false)}
          onSave={(ex) => {
            exerciseStore.saveExercise(ex);
            setCreating(false);
          }}
        />
      </ModalSafeArea>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  close: { fontSize: 22, color: '#666', width: 60 },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  createButton: {
    backgroundColor: '#00B8A9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  createButtonText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  chevron: { fontSize: 22, color: '#BBB' },
});
