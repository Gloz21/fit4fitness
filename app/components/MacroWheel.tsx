import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type MacroWheelProps = {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
  onUpdate: (newValue: number) => void;
  onReset: () => void;
};

export default function MacroWheel({ label, value, target, unit, color, onUpdate, onReset }: MacroWheelProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

  const percentage = Math.min((value / target) * 100, 100);
  const size = 110;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleSave = () => {
    const newValue = parseInt(inputValue, 10);
    if (!isNaN(newValue) && newValue >= 0) {
      onUpdate(newValue);
      setModalVisible(false);
    }
  };

  const handleOpen = () => {
    setInputValue(value.toString());
    setModalVisible(true);
  };

  return (
    <>
      <TouchableOpacity style={styles.wheelContainer} onPress={handleOpen}>
        <View style={styles.svgContainer}>
          <Svg width={size} height={size}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E8E8E8"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>{value}</Text>
            <Text style={styles.unitText}>{unit}</Text>
          </View>
        </View>
        <Text style={styles.labelText}>{label}</Text>
        <Text style={styles.targetText}>Goal: {target}{unit}</Text>
        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Edit {label}</Text>
            <TextInput
              style={styles.modalInput}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="number-pad"
              placeholder={`Enter ${label.toLowerCase()}`}
              placeholderTextColor="#999"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wheelContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 20,
  },
  svgContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  valueContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  unitText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  targetText: {
    fontSize: 11,
    color: '#999',
  },
  resetButton: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#FFE8E8',
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 11,
    color: '#FF4444',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#00B8A9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  saveButton: {
    backgroundColor: '#00B8A9',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
