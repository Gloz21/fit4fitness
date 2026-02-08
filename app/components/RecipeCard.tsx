import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Recipe } from '../lib/recipes';

type RecipeCardProps = {
  recipe: Recipe;
  isSaved: boolean;
  onSave: (recipe: Recipe) => void;
  onUnsave: (recipeId: string) => void;
  onLogMeal?: (recipe: Recipe) => void;
};

export default function RecipeCard({ recipe, isSaved, onSave, onUnsave, onLogMeal }: RecipeCardProps) {
  const [detailsVisible, setDetailsVisible] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={() => setDetailsVisible(true)}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitle}>
            <Text style={styles.recipeName}>{recipe.name}</Text>
            {recipe.isCustom && <Text style={styles.customBadge}>Custom</Text>}
          </View>
          <TouchableOpacity
            style={[styles.saveButton, isSaved && styles.saveButtonActive]}
            onPress={() => (isSaved ? onUnsave(recipe.id) : onSave(recipe))}
          >
            <Text style={styles.saveButtonText}>{isSaved ? '✓' : '♡'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.description}>{recipe.description}</Text>

        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{recipe.calories}</Text>
            <Text style={styles.macroLabel}>cal</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{recipe.protein}g</Text>
            <Text style={styles.macroLabel}>protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{recipe.carbs}g</Text>
            <Text style={styles.macroLabel}>carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{recipe.fat}g</Text>
            <Text style={styles.macroLabel}>fat</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>⏱️ {recipe.prepTime} prep</Text>
          <Text style={styles.meta}>🔥 {recipe.cookTime} cook</Text>
          <Text style={styles.meta}>👥 {recipe.servings} servings</Text>
        </View>

        <Text style={styles.viewDetailsText}>View Details →</Text>
      </TouchableOpacity>

      <Modal
        visible={detailsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
        <ScrollView style={styles.detailsModal} contentContainerStyle={styles.detailsContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setDetailsVisible(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.detailsTitle}>{recipe.name}</Text>
          {recipe.isCustom && <Text style={styles.customBadge}>Custom Recipe</Text>}

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Nutrition Per Serving</Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.calories}</Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.protein}g</Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.carbs}g</Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.fat}g</Text>
                <Text style={styles.nutritionLabel}>Fat</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ingredient, idx) => (
              <Text key={idx} style={styles.ingredient}>
                • {ingredient}
              </Text>
            ))}
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.instructions.map((instruction, idx) => (
              <Text key={idx} style={styles.instruction}>
                {idx + 1}. {instruction}
              </Text>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.saveLargeButton, isSaved && styles.saveLargeButtonActive, styles.halfButton]}
              onPress={() => {
                isSaved ? onUnsave(recipe.id) : onSave(recipe);
                setDetailsVisible(false);
              }}
            >
              <Text style={styles.saveLargeButtonText}>
                {isSaved ? '✓ Saved' : '♡ Save Recipe'}
              </Text>
            </TouchableOpacity>
            {onLogMeal && (
              <TouchableOpacity
                style={[styles.logMealButton, styles.halfButton]}
                onPress={() => {
                  onLogMeal(recipe);
                  setDetailsVisible(false);
                }}
              >
                <Text style={styles.logMealButtonText}>📊 Log as Meal</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    gap: 6,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  customBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
    backgroundColor: '#00B8A9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DDD',
  },
  saveButtonActive: {
    backgroundColor: '#00B8A9',
    borderColor: '#00B8A9',
  },
  saveButtonText: {
    fontSize: 18,
    color: '#666',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00B8A9',
  },
  macroLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: '#888',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#00B8A9',
    fontWeight: '600',
    textAlign: 'center',
  },
  detailsModal: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  detailsContent: {
    padding: 20,
    paddingTop: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00B8A9',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  ingredient: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
    lineHeight: 18,
  },
  instruction: {
    fontSize: 13,
    color: '#555',
    marginBottom: 10,
    lineHeight: 19,
  },
  saveLargeButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#00B8A9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveLargeButtonActive: {
    backgroundColor: '#00B8A9',
  },
  saveLargeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00B8A9',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfButton: {
    flex: 1,
    marginBottom: 0,
  },
  logMealButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logMealButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
