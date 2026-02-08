import React from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';

// Map muscle names to SVG path ids
const muscleToId: Record<string, string> = {
  'Pectoralis Major (Sternal Head)': 'pec-sternal',
  'Pectoralis Major (Clavicular Head)': 'pec-clavicular',
  'Anterior Deltoid': 'deltoid-anterior',
  'Triceps Brachii': 'triceps',
  'Biceps Brachii': 'biceps',
  'Rectus Abdominis': 'abs',
  'Obliques': 'obliques',
  'Quadriceps': 'quads',
  'Hamstrings': 'hamstrings',
  'Gluteus Maximus': 'glutes',
  'Latissimus Dorsi': 'lats',
  'Trapezius': 'traps',
  'Deltoid (Lateral)': 'deltoid-lateral',
  'Deltoid (Posterior)': 'deltoid-posterior',
  'Forearms': 'forearms',
  'Calves': 'calves',
  // Add more as needed
};

export type MuscleDiagramProps = {
  highlighted: string[]; // List of muscle names to highlight
  width?: number;
  height?: number;
};

export default function MuscleDiagram({ highlighted, width = 180, height = 320 }: MuscleDiagramProps) {
  // Helper to determine fill color
  const getFill = (id: string) =>
    highlighted.some((muscle) => muscleToId[muscle] === id) ? '#00B8A9' : '#E0E0E0';

  return (
    <Svg width={width} height={height} viewBox="0 0 180 320">
      {/* Torso */}
      <G id="torso">
        <Path id="pec-sternal" d="M60,60 Q90,80 120,60 Q110,90 70,90 Z" fill={getFill('pec-sternal')} />
        <Path id="pec-clavicular" d="M60,60 Q90,40 120,60 Q110,70 70,70 Z" fill={getFill('pec-clavicular')} />
        <Path id="abs" d="M80,90 Q90,120 100,90 Q100,140 80,140 Z" fill={getFill('abs')} />
        <Path id="obliques" d="M70,90 Q60,120 80,140 Q80,120 70,90 Z" fill={getFill('obliques')} />
      </G>
      {/* Arms */}
      <G id="arms">
        <Path id="biceps" d="M50,70 Q40,100 60,120 Q60,100 50,70 Z" fill={getFill('biceps')} />
        <Path id="triceps" d="M50,120 Q40,150 60,170 Q60,150 50,120 Z" fill={getFill('triceps')} />
        <Path id="forearms" d="M50,170 Q40,200 60,220 Q60,200 50,170 Z" fill={getFill('forearms')} />
        <Path id="deltoid-anterior" d="M60,60 Q55,50 70,50 Q75,60 60,60 Z" fill={getFill('deltoid-anterior')} />
        <Path id="deltoid-lateral" d="M70,50 Q80,40 90,50 Q80,60 70,50 Z" fill={getFill('deltoid-lateral')} />
        <Path id="deltoid-posterior" d="M90,50 Q100,40 110,50 Q100,60 90,50 Z" fill={getFill('deltoid-posterior')} />
      </G>
      {/* Legs */}
      <G id="legs">
        <Path id="quads" d="M80,140 Q90,200 100,140 Q100,200 80,200 Z" fill={getFill('quads')} />
        <Path id="hamstrings" d="M80,200 Q90,260 100,200 Q100,260 80,260 Z" fill={getFill('hamstrings')} />
        <Path id="calves" d="M80,260 Q90,310 100,260 Q100,310 80,310 Z" fill={getFill('calves')} />
        <Path id="glutes" d="M70,140 Q90,160 110,140 Q100,170 80,170 Z" fill={getFill('glutes')} />
      </G>
      {/* Back */}
      <G id="back">
        <Path id="lats" d="M60,90 Q50,120 70,140 Q90,120 120,140 Q130,120 120,90 Z" fill={getFill('lats')} />
        <Path id="traps" d="M80,40 Q90,20 100,40 Q90,60 80,40 Z" fill={getFill('traps')} />
      </G>
      {/* Head (for context) */}
      <Circle cx="90" cy="30" r="18" fill="#E0E0E0" />
    </Svg>
  );
}
