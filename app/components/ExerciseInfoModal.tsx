import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ModalSafeArea } from '@/components/modal-safe-area';
import { Exercise } from '../lib/exercises';
import RealisticMuscleDiagram from './RealisticMuscleDiagram';

type ExerciseInfoModalProps = {
  visible: boolean;
  exercise: Exercise | null;
  onClose: () => void;
};

const getMuscleEmoji = (muscle: string): string => {
  const lower = muscle.toLowerCase();
  if (lower.includes('chest')) return '🫁';
  if (lower.includes('back') || lower.includes('lat')) return '🔙';
  if (lower.includes('shoulder') || lower.includes('delt')) return '💪';
  if (lower.includes('bicep') || lower.includes('tricep') || lower.includes('arm')) return '💪';
  if (lower.includes('leg') || lower.includes('quad') || lower.includes('hamstring') || lower.includes('calf')) return '🦵';
  if (lower.includes('core') || lower.includes('ab')) return '🔥';
  if (lower.includes('glute')) return '🍑';
  return '💥';
};

const getBodyDiagram = (muscleGroups: string[] = []) => {
  const muscles = Array.isArray(muscleGroups) ? muscleGroups.map((m) => m.toLowerCase()) : [];

  const hasAny = (parts: string[]) => parts.some((p) => muscles.some((m) => m.includes(p)));

  // Region keys we can overlay on the anterior image
  const regions = new Set<string>();
  if (hasAny(['chest', 'pec'])) regions.add('chest');
  if (hasAny(['shoulder', 'delt'])) regions.add('shoulders');
  if (hasAny(['bicep'])) regions.add('biceps');
  if (hasAny(['tricep'])) regions.add('triceps');
  if (hasAny(['forearm'])) regions.add('forearms');
  if (hasAny(['core', 'ab'])) regions.add('abs');
  if (hasAny(['oblique'])) regions.add('obliques');
  if (hasAny(['quad'])) regions.add('quads');
  if (hasAny(['hamstring'])) regions.add('hamstrings');
  if (hasAny(['calf'])) regions.add('calves');
  if (hasAny(['glute'])) regions.add('glutes');
  if (hasAny(['lat'])) regions.add('lats');
  if (hasAny(['trap'])) regions.add('traps');
  if (hasAny(['back'])) regions.add('upper-back');

  // List summary for caption
  const activeMuscles: string[] = [];
  if (regions.has('chest')) activeMuscles.push('Chest');
  if (regions.has('shoulders')) activeMuscles.push('Shoulders');
  if (regions.has('biceps') || regions.has('triceps') || regions.has('forearms')) activeMuscles.push('Arms');
  if (regions.has('lats') || regions.has('traps') || regions.has('upper-back')) activeMuscles.push('Back');
  if (regions.has('abs') || regions.has('obliques')) activeMuscles.push('Core');
  if (regions.has('quads') || regions.has('hamstrings') || regions.has('calves') || regions.has('glutes')) activeMuscles.push('Legs');

  // Overlay ellipses for anatomically accurate muscle highlighting
  const renderOverlayShapes = () => {
    const shapes: React.ReactNode[] = [];
    let key = 0;

    // Ultra-advanced muscle rendering with layered anatomy
    const addMuscleLayer = (
      top: number,
      left: number,
      width: number,
      height: number,
      color: string = '#00B8A9',
      opacity: number = 0.32,
      intensity: number = 1.0 // 0-1 scale for muscle intensity
    ) => {
      const isSecondary = color === '#FF6B6B';
      const adjustedOpacity = opacity * intensity;
      const bgColor = isSecondary 
        ? `rgba(255, 107, 107, ${adjustedOpacity})`
        : `rgba(0, 184, 169, ${adjustedOpacity})`;
      
      const glowOpacity = (0.08 * intensity);
      const glowColor = isSecondary 
        ? `rgba(255, 107, 107, ${glowOpacity})`
        : `rgba(0, 184, 169, ${glowOpacity})`;

      // Outer glow - diffuse light
      shapes.push(
        <View
          key={`glow-${key}`}
          style={{
            position: 'absolute',
            top: top - 3,
            left: left - 3,
            width: width + 6,
            height: height + 6,
            borderRadius: Math.max(width + 6, height + 6) / 2,
            backgroundColor: glowColor,
          }}
        />
      );

      // Inner shadow effect - creates depth
      shapes.push(
        <View
          key={`shadow-${key}`}
          style={{
            position: 'absolute',
            top: top + 1,
            left: left + 1,
            width: width,
            height: height,
            borderRadius: Math.max(width, height) / 2,
            backgroundColor: isSecondary 
              ? `rgba(139, 0, 0, ${0.08 * intensity})`
              : `rgba(0, 100, 100, ${0.08 * intensity})`,
          }}
        />
      );

      // Main muscle highlight
      shapes.push(
        <View
          key={`overlay-${key++}`}
          style={{
            position: 'absolute',
            top,
            left,
            width,
            height,
            borderRadius: Math.max(width, height) / 2,
            backgroundColor: bgColor,
            borderWidth: 1.8,
            borderColor: color,
          }}
        />
      );

      // Highlight accent - top-left light reflection
      shapes.push(
        <View
          key={`highlight-${key++}`}
          style={{
            position: 'absolute',
            top: top + 2,
            left: left + 2,
            width: width * 0.35,
            height: height * 0.35,
            borderRadius: (Math.max(width, height) / 2) * 0.35,
            backgroundColor: color === '#00B8A9' 
              ? `rgba(255, 255, 255, ${0.15 * intensity})`
              : `rgba(255, 255, 255, ${0.1 * intensity})`,
          }}
        />
      );
    };

    // CHEST - segmented pectorals with intensity
    if (regions.has('chest')) {
      addMuscleLayer(72, 50, 42, 28, '#00B8A9', 0.35, 0.95);
      addMuscleLayer(100, 52, 38, 28, '#00B8A9', 0.28, 0.8);
      addMuscleLayer(72, 108, 42, 28, '#00B8A9', 0.35, 0.95);
      addMuscleLayer(100, 110, 38, 28, '#00B8A9', 0.28, 0.8);
    }

    // SHOULDERS - spherical, high intensity
    if (regions.has('shoulders')) {
      addMuscleLayer(55, 12, 46, 42, '#00B8A9', 0.36, 1.0);
      addMuscleLayer(55, 142, 46, 42, '#00B8A9', 0.36, 1.0);
    }

    // BICEPS - curved arm muscles
    if (regions.has('biceps')) {
      addMuscleLayer(82, 12, 32, 28, '#00B8A9', 0.34, 0.95);
      addMuscleLayer(110, 14, 28, 26, '#00B8A9', 0.28, 0.75);
      addMuscleLayer(82, 156, 32, 28, '#00B8A9', 0.34, 0.95);
      addMuscleLayer(110, 158, 28, 26, '#00B8A9', 0.28, 0.75);
    }

    // TRICEPS - secondary color, segmented
    if (regions.has('triceps')) {
      addMuscleLayer(88, 6, 26, 24, '#FF6B6B', 0.28, 0.85);
      addMuscleLayer(112, 8, 22, 22, '#FF6B6B', 0.22, 0.65);
      addMuscleLayer(88, 168, 26, 24, '#FF6B6B', 0.28, 0.85);
      addMuscleLayer(112, 170, 22, 22, '#FF6B6B', 0.22, 0.65);
    }

    // FOREARMS - smaller, defined
    if (regions.has('forearms')) {
      addMuscleLayer(136, 12, 28, 22, '#00B8A9', 0.30, 0.88);
      addMuscleLayer(158, 14, 24, 20, '#00B8A9', 0.25, 0.7);
      addMuscleLayer(136, 160, 28, 22, '#00B8A9', 0.30, 0.88);
      addMuscleLayer(158, 162, 24, 20, '#00B8A9', 0.25, 0.7);
    }

    // ABS - segmented 6-pack effect
    if (regions.has('abs')) {
      addMuscleLayer(120, 72, 40, 18, '#00B8A9', 0.32, 0.9);
      addMuscleLayer(138, 70, 44, 18, '#00B8A9', 0.32, 0.9);
      addMuscleLayer(156, 74, 36, 18, '#00B8A9', 0.28, 0.8);
    }

    // OBLIQUES - diagonal with intensity gradient
    if (regions.has('obliques')) {
      addMuscleLayer(118, 28, 36, 28, '#00B8A9', 0.30, 0.85);
      addMuscleLayer(146, 30, 32, 32, '#00B8A9', 0.25, 0.7);
      addMuscleLayer(118, 136, 36, 28, '#00B8A9', 0.30, 0.85);
      addMuscleLayer(146, 138, 32, 32, '#00B8A9', 0.25, 0.7);
    }

    // LATS - wide back muscles (secondary) - layered depth
    if (regions.has('lats')) {
      addMuscleLayer(85, 14, 38, 32, '#FF6B6B', 0.26, 0.8);
      addMuscleLayer(117, 16, 36, 40, '#FF6B6B', 0.20, 0.65);
      addMuscleLayer(85, 148, 38, 32, '#FF6B6B', 0.26, 0.8);
      addMuscleLayer(117, 148, 36, 40, '#FF6B6B', 0.20, 0.65);
    }

    // TRAPS - upper back (secondary) - high intensity
    if (regions.has('traps') || regions.has('upper-back')) {
      addMuscleLayer(42, 50, 60, 30, '#FF6B6B', 0.28, 0.9);
    }

    // GLUTES - hip area with segmentation
    if (regions.has('glutes')) {
      addMuscleLayer(173, 42, 35, 38, '#00B8A9', 0.33, 0.95);
      addMuscleLayer(173, 123, 35, 38, '#00B8A9', 0.33, 0.95);
    }

    // QUADS - front thigh with layering
    if (regions.has('quads')) {
      addMuscleLayer(200, 50, 36, 30, '#00B8A9', 0.34, 0.95);
      addMuscleLayer(230, 52, 32, 32, '#00B8A9', 0.28, 0.8);
      addMuscleLayer(200, 114, 36, 30, '#00B8A9', 0.34, 0.95);
      addMuscleLayer(230, 116, 32, 32, '#00B8A9', 0.28, 0.8);
    }

    // HAMSTRINGS - back thigh (secondary) - layered
    if (regions.has('hamstrings')) {
      addMuscleLayer(205, 48, 32, 28, '#FF6B6B', 0.26, 0.85);
      addMuscleLayer(233, 50, 28, 30, '#FF6B6B', 0.20, 0.7);
      addMuscleLayer(205, 120, 32, 28, '#FF6B6B', 0.26, 0.85);
      addMuscleLayer(233, 122, 28, 30, '#FF6B6B', 0.20, 0.7);
    }

    // CALVES - lower leg, segmented
    if (regions.has('calves')) {
      addMuscleLayer(260, 54, 24, 18, '#00B8A9', 0.32, 0.9);
      addMuscleLayer(278, 56, 22, 20, '#00B8A9', 0.26, 0.75);
      addMuscleLayer(260, 120, 24, 18, '#00B8A9', 0.32, 0.9);
      addMuscleLayer(278, 122, 22, 20, '#00B8A9', 0.26, 0.75);
    }

    return shapes;
  };

  const renderBodyDiagram = () => {
    return (
      <View style={styles.diagramContent}>
        {/* Head */}
        <View style={[styles.bodyPart, styles.head]} />
        
        {/* Neck */}
        <View style={[styles.bodyPart, styles.neck]} />
        
        {/* Shoulders - wider, tapered */}
        <View style={[styles.bodyPart, styles.shoulderLeft]} />
        <View style={[styles.bodyPart, styles.shoulderRight]} />
        
        {/* Upper Torso (chest) - wider at shoulders, tapers */}
        <View style={[styles.bodyPart, styles.upperTorso]} />
        
        {/* Lower Torso (abs/core) - narrower, tapered */}
        <View style={[styles.bodyPart, styles.lowerTorso]} />
        
        {/* Left Arm - tapered from shoulder to wrist */}
        <View style={[styles.bodyPart, styles.armUpperLeft]} />
        <View style={[styles.bodyPart, styles.armLowerLeft]} />
        {/* Left Hand */}
        <View style={[styles.bodyPart, styles.handLeft]} />
        
        {/* Right Arm - tapered from shoulder to wrist */}
        <View style={[styles.bodyPart, styles.armUpperRight]} />
        <View style={[styles.bodyPart, styles.armLowerRight]} />
        {/* Right Hand */}
        <View style={[styles.bodyPart, styles.handRight]} />
        
        {/* Pelvis */}
        <View style={[styles.bodyPart, styles.pelvis]} />
        
        {/* Left Leg - tapered thigh to calf */}
        <View style={[styles.bodyPart, styles.thighLeft]} />
        <View style={[styles.bodyPart, styles.calfLeft]} />
        {/* Left Foot */}
        <View style={[styles.bodyPart, styles.footLeft]} />
        
        {/* Right Leg - tapered thigh to calf */}
        <View style={[styles.bodyPart, styles.thighRight]} />
        <View style={[styles.bodyPart, styles.calfRight]} />
        {/* Right Foot */}
        <View style={[styles.bodyPart, styles.footRight]} />
        
        {/* Muscle highlights overlay */}
        {renderOverlayShapes()}
      </View>
    );
  };

  return (
    <View style={styles.bodyDiagramContainer}>
      <View style={styles.diagramBox}>
        {renderBodyDiagram()}
      </View>

      {activeMuscles.length > 0 && (
        <View style={styles.activeMusclesOverlay}>
          <Text style={styles.activeMusclesTitle}>Muscles Targeted:</Text>
          <Text style={styles.activeMusclesText}>{activeMuscles.join(' • ')}</Text>
        </View>
      )}
    </View>
  );
};

export default function ExerciseInfoModal({
  visible,
  exercise,
  onClose,
}: ExerciseInfoModalProps) {
  if (!exercise) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent
    >
      <View style={styles.overlay}>
        <ModalSafeArea style={{ flex: 0 }} edges={['bottom']}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              {/* Badges above name, larger and spaced */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12, justifyContent: 'flex-start', alignItems: 'center' }}>
                <View style={[styles.badge, styles[`badge${exercise.difficulty}`], { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18 }] }>
                  <Text style={[styles.badgeText, { fontSize: 15, fontWeight: '700' }] }>
                    {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                  </Text>
                </View>
                <View style={[styles.badge, { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18 }] }>
                  <Text style={[styles.badgeText, { fontSize: 15, fontWeight: '700' }] }>{exercise.category}</Text>
                </View>
              </View>
              <View style={styles.headerTop}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Description</Text>
              <Text style={styles.description}>{exercise.description}</Text>
            </View>

            {/* Muscles Targeted */}
            {Array.isArray(exercise.muscleGroups) && exercise.muscleGroups.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💪 Muscles Targeted</Text>
                
                {/* Body Diagram */}
                <View style={styles.muscleDiagramContainer}>
                  <View style={styles.diagramRow}>
                    <View style={styles.diagramWrapper}>
                      <Text style={styles.diagramLabel}>Front</Text>
                      <RealisticMuscleDiagram 
                        highlighted={exercise.muscleGroups} 
                        side="front"
                        width={100}
                        height={155}
                      />
                    </View>
                    <View style={styles.diagramWrapper}>
                      <Text style={styles.diagramLabel}>Back</Text>
                      <RealisticMuscleDiagram 
                        highlighted={exercise.muscleGroups} 
                        side="back"
                        width={100}
                        height={155}
                      />
                    </View>
                  </View>
                </View>

                {/* Muscle List */}
                <View style={styles.muscleGrid}>
                  {exercise.muscleGroups.map((muscle, index) => (
                    <View key={index} style={styles.muscleCard}>
                      <Text style={styles.muscleName}>{muscle}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
            </View>

            {/* Equipment Needed */}
            {exercise.equipment.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏋️ Equipment Needed</Text>
                <View style={styles.equipmentList}>
                  {exercise.equipment.map((item, index) => (
                    <View key={index} style={styles.equipmentItem}>
                      <Text style={styles.equipmentBullet}>•</Text>
                      <Text style={styles.equipmentText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Instructions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 How to Perform</Text>
              {exercise.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>

            {/* Tips */}
            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
              <Text style={styles.tipsText}>
                • Focus on form over weight{'\n'}
                • Control the movement throughout{'\n'}
                • Breathe steadily - exhale on exertion{'\n'}
                • Start with lighter weight to master technique
              </Text>
            </View>
          </ScrollView>
        </View>
        </ModalSafeArea>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E8E8E8',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseName: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginRight: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '300',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E8F5F5',
  },
  badgebeginner: {
    backgroundColor: '#E8F5E9',
  },
  badgeintermediate: {
    backgroundColor: '#FFF3E0',
  },
  badgeadvanced: {
    backgroundColor: '#FFEBEE',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00B8A9',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    marginTop: 16,
  },
  muscleCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: '#E8F5F5',
  },
  muscleEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  muscleName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00B8A9',
    textAlign: 'center',
  },
  muscleDiagramContainer: {
    backgroundColor: '#F0FFFE',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8F5F5',
  },
  diagramRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  diagramWrapper: {
    alignItems: 'center',
  },
  diagramLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00B8A9',
    marginBottom: 8,
  },
  muscleDiagram: {
    backgroundColor: '#F0FFFE',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00B8A9',
  },
  bodyDiagramContainer: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  diagramBox: {
    width: 180,
    height: 270,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  diagramContent: {
    position: 'relative',
    width: 150,
    height: 240,
  },
  bodyPart: {
    position: 'absolute',
    backgroundColor: '#FFD7BA',
    borderWidth: 0,
  },
  head: {
    width: 38,
    height: 38,
    borderRadius: 19,
    top: 12,
    left: 81,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  neck: {
    width: 14,
    height: 14,
    top: 50,
    left: 93,
    borderRadius: 7,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  shoulderLeft: {
    width: 26,
    height: 20,
    borderRadius: 13,
    top: 61,
    left: 31,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  shoulderRight: {
    width: 26,
    height: 20,
    borderRadius: 13,
    top: 61,
    left: 143,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: -1, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  upperTorso: {
    width: 70,
    height: 48,
    borderRadius: 26,
    top: 79,
    left: 65,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  lowerTorso: {
    width: 54,
    height: 40,
    borderRadius: 18,
    top: 124,
    left: 73,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  armUpperLeft: {
    width: 19,
    height: 38,
    borderRadius: 10,
    top: 69,
    left: 23,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  armUpperRight: {
    width: 19,
    height: 38,
    borderRadius: 10,
    top: 69,
    left: 158,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: -1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  armLowerLeft: {
    width: 17,
    height: 44,
    borderRadius: 9,
    top: 105,
    left: 24,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 1,
  },
  armLowerRight: {
    width: 17,
    height: 44,
    borderRadius: 9,
    top: 105,
    left: 159,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: -1, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 1,
  },
  handLeft: {
    width: 14,
    height: 14,
    borderRadius: 7,
    top: 148,
    left: 25,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
  },
  handRight: {
    width: 14,
    height: 14,
    borderRadius: 7,
    top: 148,
    left: 161,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
  },
  pelvis: {
    width: 60,
    height: 24,
    borderRadius: 12,
    top: 162,
    left: 70,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 2,
    elevation: 2,
  },
  thighLeft: {
    width: 21,
    height: 58,
    borderRadius: 11,
    top: 184,
    left: 77,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  thighRight: {
    width: 21,
    height: 58,
    borderRadius: 11,
    top: 184,
    left: 102,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: -1, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  calfLeft: {
    width: 19,
    height: 50,
    borderRadius: 10,
    top: 240,
    left: 78,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  calfRight: {
    width: 19,
    height: 50,
    borderRadius: 10,
    top: 240,
    left: 103,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: -1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  footLeft: {
    width: 24,
    height: 16,
    borderRadius: 5,
    top: 288,
    left: 76,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
  },
  footRight: {
    width: 24,
    height: 16,
    borderRadius: 5,
    top: 288,
    left: 100,
    backgroundColor: '#FFD7BA',
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
  },
  overlaysSvg: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 2,
  },
  activeMusclesOverlay: {
    marginTop: 8,
    backgroundColor: '#E8F5F5',
    borderColor: '#00B8A9',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeMusclesTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00B8A9',
    marginBottom: 2,
  },
  activeMusclesText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  backIndicator: {
    backgroundColor: '#00B8A9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 8,
  },
  backText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  diagramCaption: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00B8A9',
    textAlign: 'center',
    marginTop: 12,
  },
  equipmentList: {
    gap: 8,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  equipmentBullet: {
    fontSize: 16,
    color: '#00B8A9',
    fontWeight: '700',
  },
  equipmentText: {
    fontSize: 14,
    color: '#4A4A4A',
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00B8A9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
  },
  tipsBox: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#4A4A4A',
    lineHeight: 20,
  },
});
