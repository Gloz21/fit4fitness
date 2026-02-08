import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Exercise } from '../lib/exercises';

type CustomExerciseModalProps = {
  visible: boolean;
  onSave: (exercise: Exercise) => void;
  onClose: () => void;
};

const CATEGORIES: Exercise['category'][] = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'arms',
  'core',
  'cardio',
  'flexibility', // stretching/flexibility
  'power',
  'agility',
  'rotation',
  'athletic',
];
const DIFFICULTIES: Exercise['difficulty'][] = ['beginner', 'intermediate', 'advanced'];

export default function CustomExerciseModal({
  visible,
  onSave,
  onClose,
}: CustomExerciseModalProps) {
  const [exerciseName, setExerciseName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Exercise['category']>('chest');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Exercise['difficulty']>('beginner');
  const [instructions, setInstructions] = useState<string[]>(['', '', '']);
  const [muscleGroups, setMuscleGroups] = useState<string[]>(['']);
  const [equipment, setEquipment] = useState<string[]>(['']);

  const handleSaveExercise = () => {
    if (!exerciseName.trim() || !description.trim()) {
      alert('Please enter exercise name and description');
      return;
    }

    const filteredInstructions = instructions.filter((inst) => inst.trim().length > 0);
    const filteredMuscles = muscleGroups.filter((muscle) => muscle.trim().length > 0);
    const filteredEquipment = equipment.filter((eq) => eq.trim().length > 0);

    if (filteredMuscles.length === 0) {
      alert('Please add at least one muscle group');
      return;
    }

    if (filteredInstructions.length === 0) {
      alert('Please add at least one instruction');
      return;
    }

    const exercise: Exercise = {
      id: `custom-${Date.now()}`,
      name: exerciseName.trim(),
      description: description.trim(),
      category: selectedCategory,
      difficulty: selectedDifficulty,
      instructions: filteredInstructions,
      muscleGroups: filteredMuscles,
      equipment: filteredEquipment,
    };

    onSave(exercise);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setExerciseName('');
    setDescription('');
    setSelectedCategory('chest');
    setSelectedDifficulty('beginner');
    setInstructions(['', '', '']);
    setMuscleGroups(['']);
    setEquipment(['']);
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const updateMuscleGroup = (index: number, value: string) => {
    const updated = [...muscleGroups];
    updated[index] = value;
    setMuscleGroups(updated);
  };

  const addMuscleGroup = () => {
    setMuscleGroups([...muscleGroups, '']);
  };

  const removeMuscleGroup = (index: number) => {
    setMuscleGroups(muscleGroups.filter((_, i) => i !== index));
  };

  const updateEquipment = (index: number, value: string) => {
    const updated = [...equipment];
    updated[index] = value;
    setEquipment(updated);
  };

  const addEquipment = () => {
    setEquipment([...equipment, '']);
  };

  const removeEquipment = (index: number) => {
    setEquipment(equipment.filter((_, i) => i !== index));
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Exercise</Text>
          <View style={{ width: 30 }} />
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Text style={styles.label}>Exercise Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Dumbbell Flyes"
            value={exerciseName}
            onChangeText={setExerciseName}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Briefly describe the exercise"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#999"
            multiline
          />

          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === cat && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Difficulty *</Text>
          <View style={styles.difficultyRow}>
            {DIFFICULTIES.map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.difficultyButton,
                  selectedDifficulty === diff && styles.difficultyButtonActive,
                ]}
                onPress={() => setSelectedDifficulty(diff)}
              >
                <Text
                  style={[
                    styles.difficultyButtonText,
                    selectedDifficulty === diff && styles.difficultyButtonTextActive,
                  ]}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Instructions *</Text>
            <TouchableOpacity style={styles.addButton} onPress={addInstruction}>
              <Text style={styles.addButtonText}>+ Add Step</Text>
            </TouchableOpacity>
          </View>

          {instructions.map((instruction, idx) => (
            <View key={idx} style={styles.listItemContainer}>
              <Text style={styles.stepNumber}>{idx + 1}.</Text>
              <TextInput
                style={styles.listInput}
                placeholder={`Step ${idx + 1}`}
                value={instruction}
                onChangeText={(text) => updateInstruction(idx, text)}
                placeholderTextColor="#999"
              />
              {instructions.length > 1 && (
                <TouchableOpacity onPress={() => removeInstruction(idx)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Muscle Groups */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Muscle Groups *</Text>
            <TouchableOpacity style={styles.addButton} onPress={addMuscleGroup}>
              <Text style={styles.addButtonText}>+ Add Muscle</Text>
            </TouchableOpacity>
          </View>

          {muscleGroups.map((muscle, idx) => (
            <View key={idx} style={styles.listItemContainer}>
              <TextInput
                style={styles.listInput}
                placeholder="e.g., Chest, Triceps"
                value={muscle}
                onChangeText={(text) => updateMuscleGroup(idx, text)}
                placeholderTextColor="#999"
              />
              {muscleGroups.length > 1 && (
                <TouchableOpacity onPress={() => removeMuscleGroup(idx)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Equipment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Equipment (Optional)</Text>
            <TouchableOpacity style={styles.addButton} onPress={addEquipment}>
              <Text style={styles.addButtonText}>+ Add Equipment</Text>
            </TouchableOpacity>
          </View>

          {equipment.map((eq, idx) => (
            <View key={idx} style={styles.listItemContainer}>
              <TextInput
                style={styles.listInput}
                placeholder="e.g., Dumbbells, Barbell"
                value={eq}
                onChangeText={(text) => updateEquipment(idx, text)}
                placeholderTextColor="#999"
              />
              {equipment.length > 1 && (
                <TouchableOpacity onPress={() => removeEquipment(idx)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveExercise}>
          <Text style={styles.saveButtonText}>💾 Save Exercise</Text>
        </TouchableOpacity>
      </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  closeButton: {
    fontSize: 28,
    color: '#666',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  categoryButtonActive: {
    backgroundColor: '#00B8A9',
    borderColor: '#00B8A9',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#FFF',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: '#00B8A9',
    borderColor: '#00B8A9',
  },
  difficultyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  difficultyButtonTextActive: {
    color: '#FFF',
  },
  addButton: {
    backgroundColor: '#00B8A9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    minWidth: 20,
  },
  listInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  removeButton: {
    fontSize: 20,
    color: '#F44336',
    fontWeight: '400',
    minWidth: 24,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#00B8A9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
