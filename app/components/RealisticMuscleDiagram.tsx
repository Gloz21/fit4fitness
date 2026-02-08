import React from 'react';
import { StyleSheet, View } from 'react-native';
import Body, { ExtendedBodyPart, Slug } from 'react-native-body-highlighter';

// Map your exercise muscle group names to the library's slug format
const muscleNameToSlug: Record<string, Slug> = {
  // Chest - all variations
  'Chest': 'chest',
  'Pectoralis Major': 'chest',
  'pectoralis major': 'chest',
  'Pectoralis Major (Sternal Head)': 'chest',
  'Pectoralis Major (Clavicular Head)': 'chest',
  'Upper Chest': 'chest',
  'Lower Chest': 'chest',
  'Middle Chest': 'chest',
  'Inner Chest': 'chest',
  'Outer Chest': 'chest',
  'Pectoralis Minor': 'chest',
  
  // Back - all variations
  'Back': 'upper-back',
  'Upper Back': 'upper-back',
  'Lower Back': 'lower-back',
  'Latissimus Dorsi': 'upper-back',
  'latissimus dorsi': 'upper-back',
  'Lats': 'upper-back',
  'Lats (isometric)': 'upper-back',
  'Lats (outer)': 'upper-back',
  'Rhomboids': 'upper-back',
  'Teres Major': 'upper-back',
  'Trapezius': 'trapezius',
  'Traps': 'trapezius',
  'Middle Trapezius': 'trapezius',
  'Middle Traps': 'trapezius',
  'Mid Traps': 'trapezius',
  'Upper Trapezius': 'trapezius',
  'Upper Traps': 'trapezius',
  'Lower Traps': 'trapezius',
  'Levator Scapulae': 'trapezius',
  'Erector Spinae': 'lower-back',
  'erector spinae': 'lower-back',
  'Spine': 'lower-back',
  'Thoracic Spine': 'upper-back',
  'Quadratus Lumborum': 'lower-back',
  'quadratus lumborum': 'lower-back',
  
  // Shoulders - all variations
  'Shoulders': 'deltoids',
  'shoulders': 'deltoids',
  'Deltoids': 'deltoids',
  'Anterior Deltoids': 'deltoids',
  'anterior deltoids': 'deltoids',
  'Anterior Deltoid': 'deltoids',
  'Front Delts': 'deltoids',
  'Medial Deltoids': 'deltoids',
  'Lateral Deltoid': 'deltoids',
  'Lateral Delts': 'deltoids',
  'Posterior Deltoids': 'deltoids',
  'Posterior Deltoid': 'deltoids',
  'Posterior Shoulder': 'deltoids',
  'Rear Delts': 'deltoids',
  'Rotator Cuff': 'deltoids',
  'Infraspinatus': 'deltoids',
  'Teres Minor': 'deltoids',
  'Subscapularis': 'deltoids',
  'Supraspinatus': 'deltoids',
  'Serratus Anterior': 'obliques',
  'Scapular Stabilizers': 'upper-back',
  
  // Arms - Biceps (all variations)
  'Biceps': 'biceps',
  'Biceps Brachii': 'biceps',
  'biceps brachii (long head)': 'biceps',
  'biceps brachii (short head)': 'biceps',
  'Brachialis': 'biceps',
  'brachialis': 'biceps',
  'Brachioradialis': 'forearm',
  'brachioradialis': 'forearm',
  
  // Arms - Triceps (all variations)
  'Triceps': 'triceps',
  'Triceps Brachii': 'triceps',
  'triceps (lateral head)': 'triceps',
  'triceps (medial head)': 'triceps',
  'triceps (long head)': 'triceps',
  'Anconeus': 'triceps',
  'anconeus': 'triceps',
  
  // Arms - Forearms (all variations)
  'Forearms': 'forearm',
  'Forearm': 'forearm',
  'Forearm Extensors': 'forearm',
  'forearm extensors': 'forearm',
  'Forearm Flexors': 'forearm',
  'forearm flexors': 'forearm',
  'forearm flexors (grip)': 'forearm',
  'forearm supinators': 'forearm',
  'Grip': 'forearm',
  'Wrist': 'forearm',
  'Wrist Flexors': 'forearm',
  'Wrist Extensors': 'forearm',
  'Flexor Carpi Radialis': 'forearm',
  'flexor carpi radialis': 'forearm',
  'Flexor Carpi Ulnaris': 'forearm',
  'flexor carpi ulnaris': 'forearm',
  'Palmaris Longus': 'forearm',
  'palmaris longus': 'forearm',
  
  // Core - all variations
  'Core': 'abs',
  'core': 'abs',
  'Abs': 'abs',
  'Rectus Abdominis': 'abs',
  'rectus abdominis': 'abs',
  'rectus abdominis (upper)': 'abs',
  'rectus abdominis (lower)': 'abs',
  'rectus abdominis (upper and lower)': 'abs',
  'Transverse Abdominis': 'abs',
  'transverse abdominis': 'abs',
  'Obliques': 'obliques',
  'Internal Obliques': 'obliques',
  'internal obliques': 'obliques',
  'External Obliques': 'obliques',
  'external obliques': 'obliques',
  'Hip Rotators': 'gluteal',
  'Intercostals': 'obliques',
  
  // Legs - Quadriceps (all variations)
  'Quads': 'quadriceps',
  'Quadriceps': 'quadriceps',
  'quadriceps': 'quadriceps',
  'Legs': 'quadriceps',
  'Vastus Lateralis': 'quadriceps',
  'Vastus Medialis': 'quadriceps',
  'Rectus Femoris': 'quadriceps',
  'Outer Thigh': 'quadriceps',
  'IT Band': 'quadriceps',
  
  // Legs - Hamstrings
  'Hamstrings': 'hamstring',
  'hamstrings': 'hamstring',
  'Biceps Femoris': 'hamstring',
  
  // Legs - Glutes (all variations)
  'Glutes': 'gluteal',
  'glutes': 'gluteal',
  'Gluteus Maximus': 'gluteal',
  'Gluteus Medius': 'gluteal',
  'gluteus medius': 'gluteal',
  'Gluteus Minimus': 'gluteal',
  'Piriformis': 'gluteal',
  'Full Body': 'gluteal',
  
  // Legs - Hip (all variations)
  'Hip Flexors': 'quadriceps',
  'hip flexors': 'quadriceps',
  'hip flexors (iliopsoas)': 'quadriceps',
  'Hip Abductors': 'adductors',
  'hip abductors': 'adductors',
  'hip adductors': 'adductors',
  'Adductors': 'adductors',
  'Groin': 'adductors',
  'Hips': 'gluteal',
  
  // Legs - Calves (all variations)
  'Calves': 'calves',
  'calves': 'calves',
  'Gastrocnemius': 'calves',
  'gastrocnemius (reduced)': 'calves',
  'Soleus': 'calves',
  'Achilles': 'calves',
  'Ankles': 'calves',
  
  // Neck
  'Neck': 'neck',
  'Sternocleidomastoid': 'neck',
};

export type MuscleWithVolume = {
  name: string;
  volume: number;
};

export type RealisticMuscleDiagramProps = {
  highlighted?: string[];
  musclesWithVolume?: MuscleWithVolume[];
  width?: number;
  height?: number;
  side?: 'front' | 'back';
};

// Map detailed muscle names to broad categories for display
const broadMuscleCategories: Record<string, string> = {
  // Shoulders
  'Shoulders': 'Shoulders',
  'shoulders': 'Shoulders',
  'Deltoids': 'Shoulders',
  'Anterior Deltoids': 'Shoulders',
  'anterior deltoids': 'Shoulders',
  'Anterior Deltoid': 'Shoulders',
  'Front Delts': 'Shoulders',
  'Medial Deltoids': 'Shoulders',
  'Lateral Deltoid': 'Shoulders',
  'Lateral Delts': 'Shoulders',
  'Posterior Deltoids': 'Shoulders',
  'Posterior Deltoid': 'Shoulders',
  'Posterior Shoulder': 'Shoulders',
  'Rear Delts': 'Shoulders',
  'Rotator Cuff': 'Shoulders',
  'Infraspinatus': 'Shoulders',
  'Teres Minor': 'Shoulders',
  'Subscapularis': 'Shoulders',
  'Supraspinatus': 'Shoulders',
  
  // Chest
  'Chest': 'Chest',
  'Pectoralis Major': 'Chest',
  'pectoralis major': 'Chest',
  'Pectoralis Major (Sternal Head)': 'Chest',
  'Pectoralis Major (Clavicular Head)': 'Upper Chest',
  'Upper Chest': 'Upper Chest',
  'Lower Chest': 'Chest',
  'Middle Chest': 'Chest',
  'Inner Chest': 'Chest',
  'Outer Chest': 'Chest',
  'Pectoralis Minor': 'Chest',
  
  // Triceps
  'Triceps': 'Triceps',
  'Triceps Brachii': 'Triceps',
  'triceps (lateral head)': 'Triceps',
  'triceps (medial head)': 'Triceps',
  'triceps (long head)': 'Triceps',
  'Anconeus': 'Triceps',
  'anconeus': 'Triceps',
  
  // Biceps
  'Biceps': 'Biceps',
  'Biceps Brachii': 'Biceps',
  'biceps brachii (long head)': 'Biceps',
  'biceps brachii (short head)': 'Biceps',
  'Brachialis': 'Biceps',
  'brachialis': 'Biceps',
  
  // Forearms
  'Forearms': 'Forearms',
  'Forearm': 'Forearms',
  'Forearm Extensors': 'Forearms',
  'forearm extensors': 'Forearms',
  'Forearm Flexors': 'Forearms',
  'forearm flexors': 'Forearms',
  'forearm flexors (grip)': 'Forearms',
  'forearm supinators': 'Forearms',
  'Grip': 'Forearms',
  'Wrist': 'Forearms',
  'Wrist Flexors': 'Forearms',
  'Wrist Extensors': 'Forearms',
  'Brachioradialis': 'Forearms',
  'brachioradialis': 'Forearms',
  'Flexor Carpi Radialis': 'Forearms',
  'flexor carpi radialis': 'Forearms',
  'Flexor Carpi Ulnaris': 'Forearms',
  'flexor carpi ulnaris': 'Forearms',
  'Palmaris Longus': 'Forearms',
  'palmaris longus': 'Forearms',
  
  // Back
  'Back': 'Back',
  'Upper Back': 'Back',
  'Lower Back': 'Back',
  'Latissimus Dorsi': 'Back',
  'latissimus dorsi': 'Back',
  'Lats': 'Back',
  'Lats (isometric)': 'Back',
  'Lats (outer)': 'Back',
  'Rhomboids': 'Back',
  'Teres Major': 'Back',
  'Trapezius': 'Back',
  'Traps': 'Back',
  'Middle Trapezius': 'Back',
  'Middle Traps': 'Back',
  'Mid Traps': 'Back',
  'Upper Trapezius': 'Back',
  'Upper Traps': 'Back',
  'Lower Traps': 'Back',
  'Levator Scapulae': 'Back',
  'Erector Spinae': 'Back',
  'erector spinae': 'Back',
  'Spine': 'Back',
  'Thoracic Spine': 'Back',
  'Quadratus Lumborum': 'Back',
  'quadratus lumborum': 'Back',
  'Scapular Stabilizers': 'Back',
  
  // Core
  'Core': 'Core',
  'core': 'Core',
  'Abs': 'Core',
  'Rectus Abdominis': 'Core',
  'rectus abdominis': 'Core',
  'rectus abdominis (upper)': 'Core',
  'rectus abdominis (lower)': 'Core',
  'rectus abdominis (upper and lower)': 'Core',
  'Transverse Abdominis': 'Core',
  'transverse abdominis': 'Core',
  'Obliques': 'Core',
  'Internal Obliques': 'Core',
  'internal obliques': 'Core',
  'External Obliques': 'Core',
  'external obliques': 'Core',
  'Serratus Anterior': 'Core',
  'Intercostals': 'Core',
  
  // Quads
  'Quads': 'Quads',
  'Quadriceps': 'Quads',
  'quadriceps': 'Quads',
  'Legs': 'Quads',
  'Vastus Lateralis': 'Quads',
  'Vastus Medialis': 'Quads',
  'Rectus Femoris': 'Quads',
  'Outer Thigh': 'Quads',
  'IT Band': 'Quads',
  'Hip Flexors': 'Quads',
  'hip flexors': 'Quads',
  'hip flexors (iliopsoas)': 'Quads',
  
  // Hamstrings
  'Hamstrings': 'Hamstrings',
  'hamstrings': 'Hamstrings',
  'Biceps Femoris': 'Hamstrings',
  
  // Glutes
  'Glutes': 'Glutes',
  'glutes': 'Glutes',
  'Gluteus Maximus': 'Glutes',
  'Gluteus Medius': 'Glutes',
  'gluteus medius': 'Glutes',
  'Gluteus Minimus': 'Glutes',
  'Piriformis': 'Glutes',
  'Hips': 'Glutes',
  'Hip Rotators': 'Glutes',
  'Hip Abductors': 'Glutes',
  'hip abductors': 'Glutes',
  'hip adductors': 'Glutes',
  'Adductors': 'Glutes',
  'Groin': 'Glutes',
  'Full Body': 'Glutes',
  
  // Calves
  'Calves': 'Calves',
  'calves': 'Calves',
  'Gastrocnemius': 'Calves',
  'gastrocnemius (reduced)': 'Calves',
  'Soleus': 'Calves',
  'Achilles': 'Calves',
  'Ankles': 'Calves',
  
  // Neck
  'Neck': 'Neck',
  'Sternocleidomastoid': 'Neck',
};

// Consolidate detailed muscle volume data into broad categories
export function consolidateMuscleVolume(muscleVolumeMap: { [muscle: string]: number }): { [muscle: string]: number } {
  const consolidated: { [muscle: string]: number } = {};
  
  for (const [muscle, volume] of Object.entries(muscleVolumeMap)) {
    const broadCategory = broadMuscleCategories[muscle] || muscle;
    consolidated[broadCategory] = (consolidated[broadCategory] || 0) + volume;
  }
  
  return consolidated;
}

export default function RealisticMuscleDiagram({ 
  highlighted = [], 
  musclesWithVolume = [],
  width = 180, 
  height = 280,
  side = 'front'
}: RealisticMuscleDiagramProps) {
  // If musclesWithVolume is provided, use it to calculate intensities
  let bodyData: ExtendedBodyPart[] = [];
  
  if (musclesWithVolume.length > 0) {
    // Find max volume for normalization
    const maxVolume = Math.max(...musclesWithVolume.map(m => m.volume), 1);
    
    // Convert to body data with intensity based on volume
    // Intensity 1 = low volume, 2 = medium, 3 = high
    bodyData = musclesWithVolume
      .map(({ name, volume }) => {
        const slug = muscleNameToSlug[name];
        if (slug) {
          const normalizedVolume = volume / maxVolume;
          let intensity: number;
          if (normalizedVolume >= 0.66) {
            intensity = 3; // High volume - darkest color
          } else if (normalizedVolume >= 0.33) {
            intensity = 2; // Medium volume
          } else {
            intensity = 1; // Low volume - lightest color
          }
          return { slug, intensity } as ExtendedBodyPart;
        }
        return null;
      })
      .filter((item): item is ExtendedBodyPart => item !== null);
  } else {
    // Fallback to simple highlighted array (all intensity 2)
    bodyData = highlighted
      .map(muscle => {
        const slug = muscleNameToSlug[muscle];
        if (slug) {
          return { slug, intensity: 2 } as ExtendedBodyPart;
        }
        return null;
      })
      .filter((item): item is ExtendedBodyPart => item !== null);
  }

  // Remove duplicates, keeping highest intensity for each slug
  const uniqueBodyData = bodyData.reduce((acc, curr) => {
    const existing = acc.find(item => item.slug === curr.slug);
    if (existing) {
      // Keep the higher intensity
      if ((curr.intensity || 0) > (existing.intensity || 0)) {
        existing.intensity = curr.intensity;
      }
    } else {
      acc.push(curr);
    }
    return acc;
  }, [] as ExtendedBodyPart[]);

  return (
    <View style={[styles.container, { width, height, overflow: 'hidden' }]}>
      <Body
        data={uniqueBodyData}
        gender="male"
        side={side}
        scale={Math.min(width / 180, height / 280)}
        colors={['#B2EBF2', '#26C6DA', '#00838F']} // Light cyan to dark teal for intensity 1-3
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

