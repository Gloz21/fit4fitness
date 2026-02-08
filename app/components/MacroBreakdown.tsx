import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

type MacroBreakdownProps = {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
};

export default function MacroBreakdown({ protein, carbs, fat, calories }: MacroBreakdownProps) {
  const [helpVisible, setHelpVisible] = React.useState(false);

  // Calculate calories from macros (protein and carbs = 4 cal/g, fat = 9 cal/g)
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatCals = fat * 9;
  const totalMacroCals = proteinCals + carbsCals + fatCals;

  // Calculate percentages
  const proteinPercent = totalMacroCals > 0 ? (proteinCals / totalMacroCals) * 100 : 0;
  const carbsPercent = totalMacroCals > 0 ? (carbsCals / totalMacroCals) * 100 : 0;
  const fatPercent = totalMacroCals > 0 ? (fatCals / totalMacroCals) * 100 : 0;

  // Pie chart dimensions
  const size = 200;
  const radius = 80;
  const cx = size / 2;
  const cy = size / 2;

  // Colors for macros
  const proteinColor = '#FF6B6B'; // Red
  const carbsColor = '#4ECDC4'; // Cyan
  const fatColor = '#FFE66D'; // Yellow

  // Helper function to create pie slices
  const createArc = (startPercent: number, endPercent: number) => {
    const startAngle = (startPercent / 100) * 360 - 90;
    const endAngle = (endPercent / 100) * 360 - 90;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = endPercent - startPercent > 50 ? 1 : 0;

    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const proteinPath = createArc(0, proteinPercent);
  const carbsPath = createArc(proteinPercent, proteinPercent + carbsPercent);
  const fatPath = createArc(proteinPercent + carbsPercent, 100);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Macro Breakdown</Text>
        <TouchableOpacity 
          style={styles.helpButton} 
          onPress={() => setHelpVisible(true)}
        >
          <Text style={styles.helpButtonText}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pieContainer}>
        <Svg width={size} height={size}>
          {proteinPercent > 0 && <Path d={proteinPath} fill={proteinColor} />}
          {carbsPercent > 0 && <Path d={carbsPath} fill={carbsColor} />}
          {fatPercent > 0 && <Path d={fatPath} fill={fatColor} />}
          <Circle cx={cx} cy={cy} r={50} fill="white" />
          <SvgText x={cx} y={cy - 10} textAnchor="middle" fontSize="24" fontWeight="bold" fill="#333">
            {Math.round((totalMacroCals / calories) * 100) || 0}%
          </SvgText>
          <SvgText
            x={cx}
            y={cy + 15}
            textAnchor="middle"
            fontSize="12"
            fill="#666"
          >
            Macros
          </SvgText>
        </Svg>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: proteinColor }]} />
          <View style={styles.legendText}>
            <Text style={styles.legendLabel}>Protein</Text>
            <Text style={styles.legendValue}>{proteinPercent.toFixed(0)}%</Text>
          </View>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: carbsColor }]} />
          <View style={styles.legendText}>
            <Text style={styles.legendLabel}>Carbs</Text>
            <Text style={styles.legendValue}>{carbsPercent.toFixed(0)}%</Text>
          </View>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: fatColor }]} />
          <View style={styles.legendText}>
            <Text style={styles.legendLabel}>Fat</Text>
            <Text style={styles.legendValue}>{fatPercent.toFixed(0)}%</Text>
          </View>
        </View>
      </View>

      {/* Help Modal */}
      <Modal
        visible={helpVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHelpVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Calorie Breakdown</Text>
            
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>How Macros Convert to Calories</Text>
              <Text style={styles.modalText}>
                Each macronutrient provides a different amount of energy per gram:
              </Text>
            </View>

            <View style={styles.macroRow}>
              <View style={[styles.macroDot, { backgroundColor: '#FF6B6B' }]} />
              <Text style={styles.macroName}>Protein:</Text>
              <Text style={styles.macroValue}>{protein}g × 4 cal/g = {proteinCals} calories</Text>
            </View>
            <View style={styles.percentRow}>
              <Text style={styles.percentText}>{proteinPercent.toFixed(1)}% of your total macro calories</Text>
            </View>

            <View style={styles.macroRow}>
              <View style={[styles.macroDot, { backgroundColor: '#4ECDC4' }]} />
              <Text style={styles.macroName}>Carbs:</Text>
              <Text style={styles.macroValue}>{carbs}g × 4 cal/g = {carbsCals} calories</Text>
            </View>
            <View style={styles.percentRow}>
              <Text style={styles.percentText}>{carbsPercent.toFixed(1)}% of your total macro calories</Text>
            </View>

            <View style={styles.macroRow}>
              <View style={[styles.macroDot, { backgroundColor: '#FFE66D' }]} />
              <Text style={styles.macroName}>Fat:</Text>
              <Text style={styles.macroValue}>{fat}g × 9 cal/g = {fatCals} calories</Text>
            </View>
            <View style={styles.percentRow}>
              <Text style={styles.percentText}>{fatPercent.toFixed(1)}% of your total macro calories</Text>
            </View>

            <View style={styles.totalSection}>
              <Text style={styles.totalText}>Total from Macros: {totalMacroCals} calories</Text>
              <Text style={styles.totalSubtext}>
                This represents {Math.round((totalMacroCals / calories) * 100)}% of your {calories} calorie target
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setHelpVisible(false)}
            >
              <Text style={styles.closeButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  helpButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonText: {
    fontSize: 18,
  },
  pieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    width: '100%',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 3,
  },
  legendText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00B8A9',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00B8A9',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  macroDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  macroName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  macroValue: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  percentRow: {
    marginLeft: 20,
    marginTop: 2,
    marginBottom: 8,
  },
  percentText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  totalSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F0FFFE',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00B8A9',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  totalSubtext: {
    fontSize: 13,
    color: '#555',
  },
  closeButton: {
    backgroundColor: '#00B8A9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
