export type Recipe = {
  id: string;
  name: string;
  description: string;
  servings: number;
  prepTime: string;
  cookTime: string;
  ingredients: string[];
  instructions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isCustom?: boolean;
  goal?: 'weight-loss' | 'muscle-gain' | 'maintain' | 'general';
};

export const defaultRecipes: Recipe[] = [
  // Weight Loss Recipes (Low cal, high protein)
  {
    id: 'greek-yogurt-bowl',
    name: 'Protein Greek Yogurt Bowl',
    description: 'High protein breakfast with berries and granola',
    servings: 1,
    prepTime: '5 min',
    cookTime: '0 min',
    ingredients: [
      '200g Greek yogurt (plain)',
      '½ cup mixed berries',
      '¼ cup granola',
      '1 tbsp honey',
      '1 tbsp almonds',
      'Pinch of cinnamon',
    ],
    instructions: [
      'Place Greek yogurt in bowl',
      'Top with fresh berries',
      'Add granola for crunch',
      'Drizzle with honey',
      'Sprinkle almonds and cinnamon',
    ],
    calories: 290,
    protein: 20,
    carbs: 35,
    fat: 8,
    goal: 'weight-loss',
  },
  {
    id: 'veggie-stir-fry',
    name: 'Tofu Vegetable Stir-Fry',
    description: 'Low-calorie, plant-based meal loaded with vegetables',
    servings: 2,
    prepTime: '15 min',
    cookTime: '15 min',
    ingredients: [
      '300g firm tofu, cubed',
      '2 cups broccoli florets',
      '1 bell pepper',
      '1 cup snap peas',
      '3 cloves garlic',
      '2 tbsp soy sauce',
      '1 tbsp sesame oil',
      'Ginger, green onions',
    ],
    instructions: [
      'Press tofu to remove excess water',
      'Heat sesame oil in wok or large pan',
      'Add garlic and ginger, cook 1 minute',
      'Add vegetables and stir-fry 8-10 minutes',
      'Add tofu and soy sauce, cook 3-4 minutes more',
      'Garnish with green onions',
    ],
    calories: 240,
    protein: 18,
    carbs: 20,
    fat: 10,
    goal: 'weight-loss',
  },
  {
    id: 'grilled-chicken-salad',
    name: 'Grilled Chicken Caesar Salad',
    description: 'Lean protein with crisp romaine and light dressing',
    servings: 1,
    prepTime: '10 min',
    cookTime: '12 min',
    ingredients: [
      '150g chicken breast',
      '3 cups romaine lettuce',
      '2 tbsp light Caesar dressing',
      '1 tbsp parmesan cheese',
      'Cherry tomatoes',
      'Lemon wedge',
    ],
    instructions: [
      'Season and grill chicken breast until cooked through',
      'Chop romaine lettuce',
      'Slice grilled chicken',
      'Toss lettuce with light Caesar dressing',
      'Top with chicken, parmesan, and tomatoes',
    ],
    calories: 320,
    protein: 38,
    carbs: 12,
    fat: 14,
    goal: 'weight-loss',
  },
  {
    id: 'egg-white-veggie-scramble',
    name: 'Egg White & Veggie Scramble',
    description: 'Low-calorie, high-protein breakfast with colorful vegetables',
    servings: 1,
    prepTime: '5 min',
    cookTime: '8 min',
    ingredients: [
      '4 egg whites (or 1 cup liquid egg whites)',
      '1 cup spinach',
      '½ cup mushrooms, sliced',
      '¼ cup bell peppers, diced',
      '¼ cup onions, diced',
      'Cooking spray',
      'Salt, pepper, herbs',
    ],
    instructions: [
      'Spray pan with cooking spray and heat',
      'Sauté vegetables until softened',
      'Add egg whites and scramble',
      'Season with salt, pepper, and herbs',
      'Cook until eggs are set',
    ],
    calories: 150,
    protein: 24,
    carbs: 10,
    fat: 1,
    goal: 'weight-loss',
  },
  {
    id: 'baked-cod-asparagus',
    name: 'Lemon Herb Baked Cod',
    description: 'Lean white fish with roasted asparagus',
    servings: 1,
    prepTime: '8 min',
    cookTime: '18 min',
    ingredients: [
      '180g cod fillet',
      '200g asparagus',
      '1 lemon',
      '2 cloves garlic, minced',
      'Fresh herbs (dill, parsley)',
      'Olive oil spray',
      'Salt, pepper',
    ],
    instructions: [
      'Preheat oven to 400°F',
      'Place cod and asparagus on baking sheet',
      'Spray with olive oil, season with garlic and herbs',
      'Squeeze lemon juice over cod',
      'Bake 15-18 minutes until fish flakes easily',
    ],
    calories: 220,
    protein: 36,
    carbs: 8,
    fat: 4,
    goal: 'weight-loss',
  },

  // Muscle Gain Recipes (High cal, high protein, good carbs)
  {
    id: 'grilled-chicken-rice',
    name: 'Grilled Chicken & Brown Rice',
    description: 'Lean protein with whole grains and roasted vegetables',
    servings: 2,
    prepTime: '15 min',
    cookTime: '30 min',
    ingredients: [
      '2 chicken breasts (200g each)',
      '1 cup brown rice',
      '2 cups mixed vegetables (broccoli, carrots)',
      'Olive oil, garlic, salt, pepper',
    ],
    instructions: [
      'Cook brown rice according to package directions',
      'Season and grill chicken breasts for 6-7 minutes per side',
      'Roast vegetables at 400°F for 20 minutes',
      'Combine all components on plate',
    ],
    calories: 520,
    protein: 52,
    carbs: 45,
    fat: 12,
    goal: 'muscle-gain',
  },
  {
    id: 'salmon-sweet-potato',
    name: 'Baked Salmon with Sweet Potato',
    description: 'Rich in omega-3s and complex carbs for muscle growth',
    servings: 2,
    prepTime: '10 min',
    cookTime: '25 min',
    ingredients: [
      '2 salmon fillets (150g each)',
      '2 medium sweet potatoes',
      '2 cups asparagus',
      'Lemon, garlic, olive oil',
      'Paprika, thyme, salt, pepper',
    ],
    instructions: [
      'Preheat oven to 400°F',
      'Season salmon with lemon and herbs',
      'Cut sweet potatoes into wedges',
      'Arrange salmon and vegetables on baking sheet',
      'Bake for 20-25 minutes until salmon flakes easily',
    ],
    calories: 480,
    protein: 38,
    carbs: 42,
    fat: 18,
    goal: 'muscle-gain',
  },
  {
    id: 'steak-quinoa-bowl',
    name: 'Steak & Quinoa Power Bowl',
    description: 'High-protein beef with complete protein quinoa',
    servings: 2,
    prepTime: '15 min',
    cookTime: '20 min',
    ingredients: [
      '300g sirloin steak',
      '1 cup quinoa',
      '1 avocado, sliced',
      '1 cup black beans',
      '1 cup corn',
      'Cilantro, lime, olive oil',
      'Spices: cumin, paprika',
    ],
    instructions: [
      'Cook quinoa according to package',
      'Season and grill steak to desired doneness',
      'Let steak rest, then slice',
      'Assemble bowl with quinoa, beans, corn',
      'Top with sliced steak and avocado',
      'Drizzle with lime and olive oil',
    ],
    calories: 650,
    protein: 48,
    carbs: 58,
    fat: 24,
    goal: 'muscle-gain',
  },
  {
    id: 'protein-pasta-meatballs',
    name: 'Turkey Meatballs & Whole Wheat Pasta',
    description: 'Lean ground turkey with complex carbs for energy',
    servings: 3,
    prepTime: '20 min',
    cookTime: '25 min',
    ingredients: [
      '500g ground turkey',
      '300g whole wheat pasta',
      '2 cups marinara sauce',
      '1 egg',
      '¼ cup breadcrumbs',
      'Parmesan cheese',
      'Italian herbs, garlic',
    ],
    instructions: [
      'Mix ground turkey with egg, breadcrumbs, and herbs',
      'Form into meatballs',
      'Bake meatballs at 400°F for 20 minutes',
      'Cook pasta according to package',
      'Heat marinara sauce',
      'Combine pasta, meatballs, and sauce',
      'Top with parmesan',
    ],
    calories: 580,
    protein: 45,
    carbs: 62,
    fat: 14,
    goal: 'muscle-gain',
  },
  {
    id: 'chicken-burrito-bowl',
    name: 'Chicken Burrito Bowl',
    description: 'Mexican-inspired high-calorie muscle building meal',
    servings: 2,
    prepTime: '15 min',
    cookTime: '20 min',
    ingredients: [
      '300g chicken breast, diced',
      '1 cup brown rice',
      '1 cup black beans',
      '½ cup corn',
      '½ cup shredded cheese',
      '¼ cup sour cream',
      'Salsa, lettuce, avocado',
      'Taco seasoning',
    ],
    instructions: [
      'Cook brown rice',
      'Season chicken with taco seasoning and cook',
      'Heat black beans',
      'Assemble bowls with rice as base',
      'Add chicken, beans, corn, cheese',
      'Top with sour cream, salsa, avocado',
    ],
    calories: 620,
    protein: 46,
    carbs: 65,
    fat: 18,
    goal: 'muscle-gain',
  },

  // Maintain/General Recipes (Balanced)
  {
    id: 'quinoa-salad',
    name: 'Mediterranean Quinoa Salad',
    description: 'Plant-based protein with fresh vegetables and olive oil dressing',
    servings: 3,
    prepTime: '20 min',
    cookTime: '15 min',
    ingredients: [
      '1 cup quinoa',
      '1 cucumber, diced',
      '1 bell pepper, diced',
      '1 cup cherry tomatoes',
      '½ red onion',
      'Feta cheese, olive oil, lemon juice',
      'Salt, pepper, fresh herbs',
    ],
    instructions: [
      'Cook quinoa and let cool',
      'Chop all vegetables',
      'Mix quinoa with vegetables',
      'Dress with olive oil, lemon juice, and herbs',
      'Top with feta cheese',
    ],
    calories: 380,
    protein: 14,
    carbs: 48,
    fat: 15,
    goal: 'maintain',
  },
];

export function getRecipesForGoal(goal?: string): Recipe[] {
  if (!goal) return defaultRecipes.filter(r => r.goal === 'weight-loss').slice(0, 5);
  
  const goalLower = goal.toLowerCase();
  let targetGoal: 'weight-loss' | 'muscle-gain' | 'maintain' | 'general' = 'weight-loss';
  
  // Body recomposition: filter by protein:calorie ratio (at least 1:10)
  if (goalLower.includes('recomposition')) {
    const recompRecipes = defaultRecipes.filter(recipe => recipe.protein >= recipe.calories / 10);
    return recompRecipes.length > 0 ? recompRecipes.slice(0, 5) : defaultRecipes.filter(r => r.goal === 'weight-loss').slice(0, 5);
  }
  
  // Match the exact goal keys from onboarding
  if (goal === 'weight-loss' || goalLower.includes('lose') || goalLower.includes('fat')) {
    targetGoal = 'weight-loss';
  } else if (goal === 'muscle-gain' || goalLower.includes('gain') || goalLower.includes('muscle') || goalLower.includes('bulk')) {
    targetGoal = 'muscle-gain';
  } else if (goalLower.includes('maintain')) {
    targetGoal = 'maintain';
  } else if (goalLower.includes('performance')) {
    // Athletic performance - show muscle gain recipes for high energy
    targetGoal = 'muscle-gain';
  }
  
  const filteredRecipes = defaultRecipes.filter(recipe => recipe.goal === targetGoal);
  
  // If we don't have enough recipes, return all matching ones
  if (filteredRecipes.length === 0) {
    return defaultRecipes.slice(0, 5);
  }
  
  return filteredRecipes.slice(0, 5);
}
