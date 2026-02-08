// Comprehensive food database with nutritional information
export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

export const foodDatabase: FoodItem[] = [
  // Fruits
  { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, serving: '1 medium (118g)' },
  { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, serving: '1 medium (182g)' },
  { name: 'Orange', calories: 62, protein: 1.2, carbs: 15, fat: 0.2, serving: '1 medium (131g)' },
  { name: 'Strawberries', calories: 49, protein: 1, carbs: 12, fat: 0.5, serving: '1 cup (152g)' },
  { name: 'Blueberries', calories: 84, protein: 1.1, carbs: 21, fat: 0.5, serving: '1 cup (148g)' },
  { name: 'Grapes', calories: 104, protein: 1.1, carbs: 27, fat: 0.2, serving: '1 cup (151g)' },
  { name: 'Watermelon', calories: 46, protein: 0.9, carbs: 12, fat: 0.2, serving: '1 cup (152g)' },
  { name: 'Pineapple', calories: 82, protein: 0.9, carbs: 22, fat: 0.2, serving: '1 cup (165g)' },
  { name: 'Mango', calories: 99, protein: 1.4, carbs: 25, fat: 0.6, serving: '1 cup (165g)' },
  { name: 'Peach', calories: 59, protein: 1.4, carbs: 14, fat: 0.4, serving: '1 medium (150g)' },

  // Vegetables
  { name: 'Broccoli', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, serving: '1 cup (156g)' },
  { name: 'Carrots', calories: 52, protein: 1.2, carbs: 12, fat: 0.3, serving: '1 cup (128g)' },
  { name: 'Spinach', calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, serving: '1 cup (30g)' },
  { name: 'Tomato', calories: 22, protein: 1.1, carbs: 4.8, fat: 0.2, serving: '1 medium (123g)' },
  { name: 'Cucumber', calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, serving: '1 cup (104g)' },
  { name: 'Bell Pepper', calories: 37, protein: 1.5, carbs: 9, fat: 0.4, serving: '1 medium (119g)' },
  { name: 'Sweet Potato', calories: 112, protein: 2.1, carbs: 26, fat: 0.1, serving: '1 medium (130g)' },
  { name: 'Lettuce', calories: 5, protein: 0.5, carbs: 1, fat: 0.1, serving: '1 cup (47g)' },

  // Proteins
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '100g (cooked)' },
  { name: 'Ground Beef', calories: 250, protein: 26, carbs: 0, fat: 15, serving: '100g (cooked)' },
  { name: 'Salmon', calories: 206, protein: 22, carbs: 0, fat: 13, serving: '100g (cooked)' },
  { name: 'Tuna', calories: 144, protein: 30, carbs: 0, fat: 1, serving: '100g (canned)' },
  { name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fat: 11, serving: '2 large eggs' },
  { name: 'Turkey Breast', calories: 135, protein: 30, carbs: 0, fat: 0.7, serving: '100g (cooked)' },
  { name: 'Pork Chop', calories: 231, protein: 26, carbs: 0, fat: 14, serving: '100g (cooked)' },
  { name: 'Shrimp', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, serving: '100g (cooked)' },
  { name: 'Tofu', calories: 144, protein: 17, carbs: 3, fat: 9, serving: '1 cup (252g)' },
  { name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0, serving: '170g (non-fat)' },

  // Grains & Carbs
  { name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 1.8, serving: '1 cup (195g cooked)' },
  { name: 'White Rice', calories: 205, protein: 4.2, carbs: 45, fat: 0.4, serving: '1 cup (186g cooked)' },
  { name: 'Quinoa', calories: 222, protein: 8.1, carbs: 39, fat: 3.6, serving: '1 cup (185g cooked)' },
  { name: 'Oatmeal', calories: 154, protein: 6, carbs: 27, fat: 3, serving: '1 cup (234g cooked)' },
  { name: 'Whole Wheat Bread', calories: 80, protein: 4, carbs: 14, fat: 1, serving: '1 slice (28g)' },
  { name: 'White Bread', calories: 75, protein: 2.3, carbs: 14, fat: 1, serving: '1 slice (25g)' },
  { name: 'Pasta', calories: 220, protein: 8, carbs: 43, fat: 1.3, serving: '1 cup (140g cooked)' },
  { name: 'Bagel', calories: 277, protein: 11, carbs: 55, fat: 1.5, serving: '1 bagel (105g)' },

  // Nuts & Seeds
  { name: 'Almonds', calories: 164, protein: 6, carbs: 6, fat: 14, serving: '1 oz (28g)' },
  { name: 'Peanuts', calories: 161, protein: 7, carbs: 5, fat: 14, serving: '1 oz (28g)' },
  { name: 'Walnuts', calories: 185, protein: 4.3, carbs: 3.9, fat: 18, serving: '1 oz (28g)' },
  { name: 'Cashews', calories: 157, protein: 5, carbs: 9, fat: 12, serving: '1 oz (28g)' },
  { name: 'Peanut Butter', calories: 188, protein: 8, carbs: 7, fat: 16, serving: '2 tbsp (32g)' },
  { name: 'Almond Butter', calories: 196, protein: 7, carbs: 6, fat: 18, serving: '2 tbsp (32g)' },

  // Dairy
  { name: 'Milk (Whole)', calories: 149, protein: 8, carbs: 12, fat: 8, serving: '1 cup (244g)' },
  { name: 'Milk (2%)', calories: 122, protein: 8, carbs: 12, fat: 5, serving: '1 cup (244g)' },
  { name: 'Milk (Skim)', calories: 83, protein: 8, carbs: 12, fat: 0.2, serving: '1 cup (244g)' },
  { name: 'Cheddar Cheese', calories: 114, protein: 7, carbs: 0.4, fat: 9, serving: '1 oz (28g)' },
  { name: 'Mozzarella', calories: 85, protein: 6, carbs: 1, fat: 6, serving: '1 oz (28g)' },
  { name: 'Cottage Cheese', calories: 163, protein: 28, carbs: 6, fat: 2.3, serving: '1 cup (226g)' },
  { name: 'Yogurt', calories: 154, protein: 13, carbs: 17, fat: 4, serving: '1 cup (245g)' },

  // Fast Food - McDonald's
  { name: 'Big Mac', calories: 563, protein: 26, carbs: 46, fat: 33, serving: '1 burger' },
  { name: 'Quarter Pounder', calories: 520, protein: 30, carbs: 41, fat: 26, serving: '1 burger' },
  { name: 'McChicken', calories: 400, protein: 14, carbs: 39, fat: 21, serving: '1 sandwich' },
  { name: 'Chicken McNuggets', calories: 170, protein: 9, carbs: 10, fat: 10, serving: '4 pieces' },
  { name: 'Medium Fries', calories: 333, protein: 4, carbs: 42, fat: 16, serving: '1 medium' },
  { name: 'Large Fries', calories: 490, protein: 6, carbs: 61, fat: 23, serving: '1 large' },

  // Fast Food - Chipotle
  { name: 'Chipotle Burrito Bowl (Chicken)', calories: 630, protein: 48, carbs: 68, fat: 16, serving: '1 bowl' },
  { name: 'Chipotle Burrito (Steak)', calories: 945, protein: 51, carbs: 110, fat: 32, serving: '1 burrito' },
  { name: 'Chipotle Chicken Burrito', calories: 875, protein: 53, carbs: 107, fat: 26, serving: '1 burrito' },
  { name: 'Chipotle Chips & Guac', calories: 770, protein: 7, carbs: 73, fat: 51, serving: '1 serving' },

  // Fast Food - Subway
  { name: 'Subway 6" Turkey Breast', calories: 280, protein: 18, carbs: 46, fat: 3.5, serving: '6 inch sub' },
  { name: 'Subway 6" Italian BMT', calories: 410, protein: 19, carbs: 46, fat: 16, serving: '6 inch sub' },
  { name: 'Subway 6" Chicken Teriyaki', calories: 370, protein: 25, carbs: 59, fat: 5, serving: '6 inch sub' },
  { name: 'Subway Footlong Turkey', calories: 560, protein: 36, carbs: 92, fat: 7, serving: 'footlong' },

  // Fast Food - Taco Bell
  { name: 'Crunchy Taco', calories: 170, protein: 8, carbs: 13, fat: 10, serving: '1 taco' },
  { name: 'Bean Burrito', calories: 380, protein: 14, carbs: 57, fat: 10, serving: '1 burrito' },
  { name: 'Chicken Quesadilla', calories: 510, protein: 27, carbs: 39, fat: 26, serving: '1 quesadilla' },
  { name: 'Nachos BellGrande', calories: 730, protein: 18, carbs: 77, fat: 38, serving: '1 order' },

  // Fast Food - Chick-fil-A
  { name: 'Chick-fil-A Sandwich', calories: 440, protein: 28, carbs: 41, fat: 19, serving: '1 sandwich' },
  { name: 'Chick-fil-A Nuggets', calories: 250, protein: 27, carbs: 11, fat: 11, serving: '8 count' },
  { name: 'Chick-fil-A Waffle Fries', calories: 360, protein: 4, carbs: 43, fat: 19, serving: '1 medium' },

  // Fast Food - Starbucks
  { name: 'Starbucks Latte (Grande)', calories: 190, protein: 13, carbs: 19, fat: 7, serving: '16 fl oz' },
  { name: 'Starbucks Cappuccino (Grande)', calories: 140, protein: 10, carbs: 14, fat: 5, serving: '16 fl oz' },
  { name: 'Starbucks Caramel Frappuccino', calories: 370, protein: 5, carbs: 54, fat: 15, serving: '16 fl oz' },
  { name: 'Starbucks Egg & Cheese Sandwich', calories: 350, protein: 16, carbs: 33, fat: 16, serving: '1 sandwich' },

  // Snacks
  { name: 'Potato Chips', calories: 152, protein: 2, carbs: 15, fat: 10, serving: '1 oz (28g)' },
  { name: 'Pretzels', calories: 108, protein: 3, carbs: 23, fat: 1, serving: '1 oz (28g)' },
  { name: 'Popcorn', calories: 31, protein: 1, carbs: 6, fat: 0.4, serving: '1 cup air-popped' },
  { name: 'Granola Bar', calories: 140, protein: 3, carbs: 19, fat: 6, serving: '1 bar (35g)' },
  { name: 'Protein Bar', calories: 200, protein: 20, carbs: 22, fat: 7, serving: '1 bar (60g)' },
  { name: 'Dark Chocolate', calories: 170, protein: 2, carbs: 13, fat: 12, serving: '1 oz (28g)' },

  // Beverages
  { name: 'Orange Juice', calories: 112, protein: 1.7, carbs: 26, fat: 0.5, serving: '1 cup (248g)' },
  { name: 'Apple Juice', calories: 114, protein: 0.2, carbs: 28, fat: 0.3, serving: '1 cup (248g)' },
  { name: 'Coke', calories: 140, protein: 0, carbs: 39, fat: 0, serving: '12 fl oz (355ml)' },
  { name: 'Gatorade', calories: 80, protein: 0, carbs: 21, fat: 0, serving: '12 fl oz (355ml)' },
  { name: 'Protein Shake', calories: 170, protein: 30, carbs: 5, fat: 3, serving: '11 fl oz' },
  { name: 'Coffee (Black)', calories: 2, protein: 0.3, carbs: 0, fat: 0, serving: '1 cup (240ml)' },
  { name: 'Green Tea', calories: 2, protein: 0.5, carbs: 0, fat: 0, serving: '1 cup (240ml)' },
  { name: 'Almond Milk', calories: 30, protein: 1, carbs: 1, fat: 2.5, serving: '1 cup (240ml)' },
  { name: 'Oat Milk', calories: 120, protein: 3, carbs: 16, fat: 5, serving: '1 cup (240ml)' },
  { name: 'Coconut Water', calories: 46, protein: 1.7, carbs: 9, fat: 0.5, serving: '1 cup (240ml)' },

  // More Fruits
  { name: 'Avocado', calories: 234, protein: 2.9, carbs: 12, fat: 21, serving: '1 medium (150g)' },
  { name: 'Kiwi', calories: 42, protein: 0.8, carbs: 10, fat: 0.4, serving: '1 medium (69g)' },
  { name: 'Pear', calories: 102, protein: 0.6, carbs: 27, fat: 0.2, serving: '1 medium (178g)' },
  { name: 'Cherries', calories: 87, protein: 1.5, carbs: 22, fat: 0.3, serving: '1 cup (138g)' },
  { name: 'Raspberries', calories: 64, protein: 1.5, carbs: 15, fat: 0.8, serving: '1 cup (123g)' },
  { name: 'Blackberries', calories: 62, protein: 2, carbs: 14, fat: 0.7, serving: '1 cup (144g)' },
  { name: 'Cantaloupe', calories: 54, protein: 1.3, carbs: 13, fat: 0.3, serving: '1 cup (160g)' },
  { name: 'Honeydew', calories: 64, protein: 1, carbs: 16, fat: 0.3, serving: '1 cup (170g)' },
  { name: 'Papaya', calories: 62, protein: 0.7, carbs: 16, fat: 0.4, serving: '1 cup (145g)' },
  { name: 'Plum', calories: 30, protein: 0.5, carbs: 8, fat: 0.2, serving: '1 medium (66g)' },
  { name: 'Apricot', calories: 17, protein: 0.5, carbs: 4, fat: 0.1, serving: '1 medium (35g)' },
  { name: 'Grapefruit', calories: 52, protein: 1, carbs: 13, fat: 0.2, serving: '1/2 medium (123g)' },
  { name: 'Lemon', calories: 17, protein: 0.6, carbs: 5, fat: 0.2, serving: '1 medium (58g)' },
  { name: 'Lime', calories: 20, protein: 0.5, carbs: 7, fat: 0.1, serving: '1 medium (67g)' },
  { name: 'Pomegranate', calories: 234, protein: 4.7, carbs: 53, fat: 3.3, serving: '1 medium (282g)' },
  { name: 'Dragon Fruit', calories: 60, protein: 1.2, carbs: 13, fat: 0, serving: '100g' },
  { name: 'Guava', calories: 37, protein: 1.4, carbs: 8, fat: 0.5, serving: '1 medium (55g)' },

  // More Vegetables
  { name: 'Asparagus', calories: 27, protein: 3, carbs: 5, fat: 0.2, serving: '1 cup (134g)' },
  { name: 'Green Beans', calories: 44, protein: 2.4, carbs: 10, fat: 0.4, serving: '1 cup (125g)' },
  { name: 'Cauliflower', calories: 25, protein: 2, carbs: 5, fat: 0.3, serving: '1 cup (100g)' },
  { name: 'Brussels Sprouts', calories: 56, protein: 4, carbs: 11, fat: 0.8, serving: '1 cup (156g)' },
  { name: 'Zucchini', calories: 33, protein: 2.4, carbs: 6, fat: 0.6, serving: '1 cup (180g)' },
  { name: 'Eggplant', calories: 35, protein: 0.8, carbs: 9, fat: 0.2, serving: '1 cup (82g)' },
  { name: 'Mushrooms', calories: 15, protein: 2.2, carbs: 2.3, fat: 0.2, serving: '1 cup (70g)' },
  { name: 'Onion', calories: 44, protein: 1.2, carbs: 10, fat: 0.1, serving: '1 medium (110g)' },
  { name: 'Garlic', calories: 4, protein: 0.2, carbs: 1, fat: 0, serving: '1 clove (3g)' },
  { name: 'Celery', calories: 14, protein: 0.7, carbs: 3, fat: 0.2, serving: '1 cup (101g)' },
  { name: 'Radish', calories: 19, protein: 0.8, carbs: 4, fat: 0.1, serving: '1 cup (116g)' },
  { name: 'Beets', calories: 58, protein: 2.2, carbs: 13, fat: 0.2, serving: '1 cup (136g)' },
  { name: 'Corn', calories: 132, protein: 5, carbs: 29, fat: 1.8, serving: '1 cup (145g)' },
  { name: 'Peas', calories: 134, protein: 8.6, carbs: 25, fat: 0.4, serving: '1 cup (160g)' },
  { name: 'Kale', calories: 33, protein: 2.9, carbs: 6, fat: 0.6, serving: '1 cup (67g)' },
  { name: 'Cabbage', calories: 22, protein: 1, carbs: 5, fat: 0.1, serving: '1 cup (89g)' },
  { name: 'Butternut Squash', calories: 82, protein: 1.8, carbs: 22, fat: 0.2, serving: '1 cup (205g)' },

  // More Proteins
  { name: 'Tilapia', calories: 128, protein: 26, carbs: 0, fat: 2.7, serving: '100g (cooked)' },
  { name: 'Cod', calories: 105, protein: 23, carbs: 0, fat: 0.9, serving: '100g (cooked)' },
  { name: 'Halibut', calories: 140, protein: 27, carbs: 0, fat: 3, serving: '100g (cooked)' },
  { name: 'Trout', calories: 190, protein: 27, carbs: 0, fat: 8.5, serving: '100g (cooked)' },
  { name: 'Crab', calories: 97, protein: 21, carbs: 0, fat: 1.1, serving: '100g (cooked)' },
  { name: 'Lobster', calories: 98, protein: 21, carbs: 1.3, fat: 0.6, serving: '100g (cooked)' },
  { name: 'Scallops', calories: 111, protein: 21, carbs: 5, fat: 1, serving: '100g (cooked)' },
  { name: 'Lamb Chop', calories: 294, protein: 25, carbs: 0, fat: 21, serving: '100g (cooked)' },
  { name: 'Bacon', calories: 161, protein: 12, carbs: 1.3, fat: 12, serving: '3 slices (34g)' },
  { name: 'Sausage', calories: 301, protein: 12, carbs: 1.4, fat: 27, serving: '100g (cooked)' },
  { name: 'Ham', calories: 145, protein: 21, carbs: 1.5, fat: 5.5, serving: '100g' },
  { name: 'Deli Turkey', calories: 56, protein: 11, carbs: 1.2, fat: 0.7, serving: '2 oz (56g)' },
  { name: 'Beef Jerky', calories: 116, protein: 9.4, carbs: 3.1, fat: 7.3, serving: '1 oz (28g)' },
  { name: 'Tempeh', calories: 195, protein: 20, carbs: 9, fat: 11, serving: '100g' },
  { name: 'Edamame', calories: 188, protein: 17, carbs: 14, fat: 8, serving: '1 cup (155g)' },
  { name: 'Black Beans', calories: 227, protein: 15, carbs: 41, fat: 0.9, serving: '1 cup (172g)' },
  { name: 'Chickpeas', calories: 269, protein: 14.5, carbs: 45, fat: 4.3, serving: '1 cup (164g)' },
  { name: 'Lentils', calories: 230, protein: 18, carbs: 40, fat: 0.8, serving: '1 cup (198g)' },
  { name: 'Kidney Beans', calories: 225, protein: 15, carbs: 40, fat: 0.9, serving: '1 cup (177g)' },

  // Breakfast Foods
  { name: 'Pancakes', calories: 227, protein: 6, carbs: 28, fat: 10, serving: '2 medium (140g)' },
  { name: 'Waffles', calories: 218, protein: 6, carbs: 25, fat: 11, serving: '2 waffles (140g)' },
  { name: 'French Toast', calories: 149, protein: 5, carbs: 16, fat: 7, serving: '1 slice (65g)' },
  { name: 'Breakfast Burrito', calories: 380, protein: 16, carbs: 38, fat: 18, serving: '1 burrito (200g)' },
  { name: 'Croissant', calories: 231, protein: 4.7, carbs: 26, fat: 12, serving: '1 medium (57g)' },
  { name: 'Muffin (Blueberry)', calories: 426, protein: 6.7, carbs: 61, fat: 17, serving: '1 large (113g)' },
  { name: 'Donut (Glazed)', calories: 269, protein: 3.6, carbs: 31, fat: 15, serving: '1 medium (63g)' },
  { name: 'Cinnamon Roll', calories: 420, protein: 6, carbs: 67, fat: 14, serving: '1 roll (150g)' },
  { name: 'Bagel with Cream Cheese', calories: 360, protein: 12, carbs: 58, fat: 10, serving: '1 bagel + 2 tbsp' },
  { name: 'Breakfast Sandwich', calories: 450, protein: 20, carbs: 35, fat: 24, serving: '1 sandwich' },
  { name: 'Hash Browns', calories: 151, protein: 1.9, carbs: 16, fat: 9.2, serving: '1 patty (57g)' },
  { name: 'Sausage McMuffin', calories: 400, protein: 14, carbs: 29, fat: 23, serving: '1 sandwich' },
  { name: 'Egg McMuffin', calories: 310, protein: 17, carbs: 30, fat: 13, serving: '1 sandwich' },

  // More Grains & Carbs
  { name: 'Couscous', calories: 176, protein: 6, carbs: 36, fat: 0.3, serving: '1 cup (157g cooked)' },
  { name: 'Barley', calories: 193, protein: 3.5, carbs: 44, fat: 0.7, serving: '1 cup (157g cooked)' },
  { name: 'Bulgur', calories: 151, protein: 5.6, carbs: 34, fat: 0.4, serving: '1 cup (182g cooked)' },
  { name: 'Wild Rice', calories: 166, protein: 6.5, carbs: 35, fat: 0.6, serving: '1 cup (164g cooked)' },
  { name: 'Rye Bread', calories: 83, protein: 3.3, carbs: 15, fat: 1.1, serving: '1 slice (32g)' },
  { name: 'Sourdough Bread', calories: 93, protein: 3.8, carbs: 18, fat: 0.6, serving: '1 slice (36g)' },
  { name: 'Pita Bread', calories: 165, protein: 5.5, carbs: 33, fat: 0.7, serving: '1 pita (60g)' },
  { name: 'Tortilla (Flour)', calories: 159, protein: 4.4, carbs: 27, fat: 3.6, serving: '1 tortilla (49g)' },
  { name: 'Tortilla (Corn)', calories: 52, protein: 1.4, carbs: 11, fat: 0.7, serving: '1 tortilla (26g)' },
  { name: 'Noodles (Egg)', calories: 221, protein: 7.3, carbs: 40, fat: 3.3, serving: '1 cup (160g cooked)' },
  { name: 'Soba Noodles', calories: 113, protein: 5.8, carbs: 24, fat: 0.1, serving: '1 cup (114g cooked)' },
  { name: 'Rice Noodles', calories: 192, protein: 1.6, carbs: 44, fat: 0.4, serving: '1 cup (176g cooked)' },
  { name: 'Udon Noodles', calories: 210, protein: 5.2, carbs: 43, fat: 0.8, serving: '1 cup (200g cooked)' },
  { name: 'Ramen Noodles', calories: 371, protein: 9.9, carbs: 51, fat: 14, serving: '1 package (85g)' },

  // Pizza
  { name: 'Cheese Pizza', calories: 272, protein: 12, carbs: 34, fat: 10, serving: '1 slice (107g)' },
  { name: 'Pepperoni Pizza', calories: 298, protein: 13, carbs: 34, fat: 12, serving: '1 slice (113g)' },
  { name: 'Veggie Pizza', calories: 235, protein: 10, carbs: 36, fat: 6, serving: '1 slice (120g)' },
  { name: 'Meat Lovers Pizza', calories: 350, protein: 16, carbs: 32, fat: 18, serving: '1 slice (130g)' },
  { name: 'Hawaiian Pizza', calories: 250, protein: 13, carbs: 31, fat: 8, serving: '1 slice (120g)' },

  // More Fast Food - Burger King
  { name: 'Whopper', calories: 657, protein: 28, carbs: 49, fat: 40, serving: '1 burger' },
  { name: 'Whopper Jr', calories: 310, protein: 13, carbs: 27, fat: 18, serving: '1 burger' },
  { name: 'BK Chicken Sandwich', calories: 670, protein: 28, carbs: 54, fat: 37, serving: '1 sandwich' },
  { name: 'Chicken Fries (9pc)', calories: 280, protein: 13, carbs: 20, fat: 17, serving: '9 pieces' },
  { name: 'Onion Rings', calories: 320, protein: 4, carbs: 40, fat: 16, serving: '1 medium' },

  // More Fast Food - Wendy's
  { name: "Wendy's Dave's Single", calories: 570, protein: 30, carbs: 39, fat: 34, serving: '1 burger' },
  { name: "Wendy's Spicy Chicken", calories: 510, protein: 33, carbs: 48, fat: 20, serving: '1 sandwich' },
  { name: "Wendy's Chili", calories: 250, protein: 21, carbs: 23, fat: 7, serving: '1 large' },
  { name: "Wendy's Frosty (Medium)", calories: 470, protein: 12, carbs: 79, fat: 12, serving: '1 medium' },
  { name: "Wendy's Baconator", calories: 960, protein: 57, carbs: 38, fat: 65, serving: '1 burger' },

  // More Fast Food - KFC
  { name: 'KFC Original Chicken (Breast)', calories: 320, protein: 32, carbs: 11, fat: 16, serving: '1 piece' },
  { name: 'KFC Extra Crispy (Breast)', calories: 530, protein: 35, carbs: 20, fat: 35, serving: '1 piece' },
  { name: 'KFC Popcorn Chicken', calories: 560, protein: 31, carbs: 32, fat: 33, serving: '1 large' },
  { name: 'KFC Biscuit', calories: 180, protein: 2, carbs: 20, fat: 10, serving: '1 biscuit' },
  { name: 'KFC Mashed Potatoes', calories: 110, protein: 2, carbs: 17, fat: 4, serving: '1 individual' },

  // Asian Food
  { name: 'Sushi Roll (California)', calories: 255, protein: 9, carbs: 38, fat: 7, serving: '6 pieces' },
  { name: 'Sushi Roll (Spicy Tuna)', calories: 290, protein: 24, carbs: 26, fat: 11, serving: '6 pieces' },
  { name: 'Sushi Roll (Salmon)', calories: 304, protein: 13, carbs: 42, fat: 8.7, serving: '6 pieces' },
  { name: 'Fried Rice', calories: 333, protein: 8, carbs: 48, fat: 12, serving: '1 cup (198g)' },
  { name: 'Lo Mein', calories: 310, protein: 10, carbs: 40, fat: 12, serving: '1 cup (220g)' },
  { name: 'Pad Thai', calories: 350, protein: 15, carbs: 40, fat: 15, serving: '1 cup (250g)' },
  { name: 'General Tso Chicken', calories: 1300, protein: 49, carbs: 135, fat: 57, serving: '1 order' },
  { name: 'Orange Chicken', calories: 490, protein: 19, carbs: 51, fat: 23, serving: '1 serving (200g)' },
  { name: 'Kung Pao Chicken', calories: 410, protein: 32, carbs: 28, fat: 18, serving: '1 cup (220g)' },
  { name: 'Beef and Broccoli', calories: 350, protein: 28, carbs: 16, fat: 19, serving: '1 cup (215g)' },
  { name: 'Sweet and Sour Pork', calories: 316, protein: 15, carbs: 40, fat: 10, serving: '1 cup (226g)' },
  { name: 'Egg Roll', calories: 222, protein: 5, carbs: 24, fat: 12, serving: '1 roll (85g)' },
  { name: 'Spring Roll', calories: 70, protein: 2, carbs: 10, fat: 2.5, serving: '1 roll (50g)' },
  { name: 'Dumplings (Fried)', calories: 80, protein: 4, carbs: 8, fat: 4, serving: '1 dumpling' },
  { name: 'Wonton Soup', calories: 181, protein: 14, carbs: 17, fat: 7, serving: '1 cup (241g)' },
  { name: 'Miso Soup', calories: 34, protein: 2.2, carbs: 4.3, fat: 1, serving: '1 cup (240ml)' },
  { name: 'Pho (Beef)', calories: 450, protein: 30, carbs: 50, fat: 12, serving: '1 bowl' },
  { name: 'Ramen (Restaurant)', calories: 500, protein: 20, carbs: 65, fat: 18, serving: '1 bowl' },
  { name: 'Teriyaki Chicken', calories: 380, protein: 35, carbs: 42, fat: 8, serving: '1 serving (250g)' },

  // Mexican Food
  { name: 'Taco (Beef)', calories: 210, protein: 10, carbs: 13, fat: 13, serving: '1 taco' },
  { name: 'Taco (Chicken)', calories: 180, protein: 12, carbs: 13, fat: 9, serving: '1 taco' },
  { name: 'Burrito (Beef)', calories: 650, protein: 29, carbs: 72, fat: 26, serving: '1 burrito' },
  { name: 'Burrito (Chicken)', calories: 580, protein: 32, carbs: 68, fat: 18, serving: '1 burrito' },
  { name: 'Quesadilla (Cheese)', calories: 490, protein: 20, carbs: 39, fat: 28, serving: '1 quesadilla' },
  { name: 'Enchilada', calories: 323, protein: 12, carbs: 30, fat: 18, serving: '1 enchilada' },
  { name: 'Nachos (with Cheese)', calories: 346, protein: 9.3, carbs: 36, fat: 19, serving: '1 serving (113g)' },
  { name: 'Guacamole', calories: 91, protein: 1.5, carbs: 8, fat: 7, serving: '1/4 cup (60g)' },
  { name: 'Salsa', calories: 36, protein: 1.5, carbs: 8, fat: 0.2, serving: '1/2 cup (123g)' },
  { name: 'Refried Beans', calories: 237, protein: 14, carbs: 39, fat: 3, serving: '1 cup (252g)' },
  { name: 'Spanish Rice', calories: 206, protein: 4.3, carbs: 40, fat: 3.8, serving: '1 cup (186g)' },
  { name: 'Churros', calories: 237, protein: 3, carbs: 27, fat: 13, serving: '2 churros (70g)' },
  { name: 'Fajitas (Chicken)', calories: 350, protein: 30, carbs: 28, fat: 14, serving: '1 serving' },
  { name: 'Tamale', calories: 285, protein: 11, carbs: 27, fat: 15, serving: '1 tamale (125g)' },

  // Italian Food
  { name: 'Spaghetti with Meat Sauce', calories: 332, protein: 19, carbs: 39, fat: 11, serving: '1 cup (248g)' },
  { name: 'Spaghetti Carbonara', calories: 460, protein: 22, carbs: 48, fat: 20, serving: '1 serving (300g)' },
  { name: 'Fettuccine Alfredo', calories: 800, protein: 26, carbs: 75, fat: 47, serving: '1 serving (350g)' },
  { name: 'Lasagna', calories: 377, protein: 21, carbs: 25, fat: 21, serving: '1 piece (215g)' },
  { name: 'Ravioli', calories: 220, protein: 11, carbs: 31, fat: 6, serving: '1 cup (125g)' },
  { name: 'Chicken Parmesan', calories: 520, protein: 41, carbs: 32, fat: 24, serving: '1 serving (300g)' },
  { name: 'Eggplant Parmesan', calories: 375, protein: 15, carbs: 32, fat: 21, serving: '1 serving (250g)' },
  { name: 'Minestrone Soup', calories: 127, protein: 4.5, carbs: 21, fat: 3, serving: '1 cup (241g)' },
  { name: 'Garlic Bread', calories: 186, protein: 4, carbs: 21, fat: 10, serving: '1 slice (50g)' },
  { name: 'Bruschetta', calories: 106, protein: 3, carbs: 18, fat: 3, serving: '1 piece (60g)' },
  { name: 'Caprese Salad', calories: 270, protein: 18, carbs: 6, fat: 20, serving: '1 serving (200g)' },
  { name: 'Tiramisu', calories: 240, protein: 5, carbs: 29, fat: 12, serving: '1 slice (100g)' },
  { name: 'Gelato', calories: 160, protein: 4, carbs: 24, fat: 6, serving: '1/2 cup (88g)' },

  // Condiments & Sauces
  { name: 'Ketchup', calories: 17, protein: 0.2, carbs: 4.5, fat: 0, serving: '1 tbsp (17g)' },
  { name: 'Mustard', calories: 3, protein: 0.2, carbs: 0.3, fat: 0.2, serving: '1 tsp (5g)' },
  { name: 'Mayonnaise', calories: 94, protein: 0.1, carbs: 0.1, fat: 10, serving: '1 tbsp (13.8g)' },
  { name: 'Ranch Dressing', calories: 73, protein: 0.4, carbs: 1.4, fat: 7.7, serving: '1 tbsp (15g)' },
  { name: 'Italian Dressing', calories: 43, protein: 0, carbs: 1.5, fat: 4.2, serving: '1 tbsp (15g)' },
  { name: 'Caesar Dressing', calories: 78, protein: 0.5, carbs: 0.5, fat: 8.5, serving: '1 tbsp (15g)' },
  { name: 'Balsamic Vinegar', calories: 14, protein: 0, carbs: 2.7, fat: 0, serving: '1 tbsp (15ml)' },
  { name: 'Olive Oil', calories: 119, protein: 0, carbs: 0, fat: 13.5, serving: '1 tbsp (13.5g)' },
  { name: 'Butter', calories: 102, protein: 0.1, carbs: 0, fat: 11.5, serving: '1 tbsp (14.2g)' },
  { name: 'Soy Sauce', calories: 8, protein: 1, carbs: 1, fat: 0, serving: '1 tbsp (18ml)' },
  { name: 'Teriyaki Sauce', calories: 16, protein: 0.5, carbs: 3, fat: 0, serving: '1 tbsp (18g)' },
  { name: 'BBQ Sauce', calories: 29, protein: 0.3, carbs: 7, fat: 0.1, serving: '1 tbsp (17g)' },
  { name: 'Hot Sauce', calories: 1, protein: 0.1, carbs: 0.2, fat: 0, serving: '1 tsp (5ml)' },
  { name: 'Honey', calories: 64, protein: 0.1, carbs: 17, fat: 0, serving: '1 tbsp (21g)' },
  { name: 'Maple Syrup', calories: 52, protein: 0, carbs: 13, fat: 0, serving: '1 tbsp (20g)' },
  { name: 'Jam/Jelly', calories: 56, protein: 0.1, carbs: 14, fat: 0, serving: '1 tbsp (20g)' },
  { name: 'Nutella', calories: 200, protein: 3, carbs: 21, fat: 12, serving: '2 tbsp (37g)' },
  { name: 'Hummus', calories: 25, protein: 1.2, carbs: 3, fat: 1.4, serving: '1 tbsp (15g)' },

  // Ice Cream & Desserts
  { name: 'Vanilla Ice Cream', calories: 207, protein: 3.5, carbs: 24, fat: 11, serving: '1/2 cup (66g)' },
  { name: 'Chocolate Ice Cream', calories: 216, protein: 3.8, carbs: 28, fat: 11, serving: '1/2 cup (66g)' },
  { name: 'Ben & Jerry\'s (avg)', calories: 260, protein: 4, carbs: 28, fat: 15, serving: '1/2 cup (106g)' },
  { name: 'Frozen Yogurt', calories: 114, protein: 2.9, carbs: 17.9, fat: 4, serving: '1/2 cup (72g)' },
  { name: 'Chocolate Chip Cookie', calories: 156, protein: 2, carbs: 20, fat: 8, serving: '1 cookie (35g)' },
  { name: 'Brownie', calories: 227, protein: 3, carbs: 36, fat: 9, serving: '1 brownie (56g)' },
  { name: 'Chocolate Cake', calories: 352, protein: 5, carbs: 51, fat: 15, serving: '1 slice (95g)' },
  { name: 'Cheesecake', calories: 321, protein: 5.5, carbs: 25.5, fat: 23, serving: '1 slice (92g)' },
  { name: 'Apple Pie', calories: 296, protein: 2.4, carbs: 43, fat: 14, serving: '1 slice (117g)' },
  { name: 'Pumpkin Pie', calories: 316, protein: 7, carbs: 41, fat: 14, serving: '1 slice (155g)' },
  { name: 'Cupcake', calories: 305, protein: 3.6, carbs: 45, fat: 13, serving: '1 cupcake (95g)' },
  { name: 'Danish Pastry', calories: 266, protein: 4.6, carbs: 29, fat: 15, serving: '1 pastry (71g)' },

  // Candy & Sweets
  { name: 'M&Ms', calories: 240, protein: 2, carbs: 34, fat: 10, serving: '1.69 oz package (48g)' },
  { name: 'Snickers Bar', calories: 250, protein: 4, carbs: 33, fat: 12, serving: '1.86 oz bar (52.7g)' },
  { name: 'Reese\'s Peanut Butter Cups', calories: 210, protein: 5, carbs: 24, fat: 13, serving: '2 cups (42g)' },
  { name: 'Kit Kat', calories: 218, protein: 3, carbs: 27, fat: 11, serving: '1.5 oz bar (42g)' },
  { name: 'Twix', calories: 250, protein: 3, carbs: 37, fat: 12, serving: '1.79 oz package (50.7g)' },
  { name: 'Skittles', calories: 231, protein: 0, carbs: 54, fat: 2.2, serving: '2.17 oz package (61.5g)' },
  { name: 'Starburst', calories: 160, protein: 0, carbs: 33, fat: 3.3, serving: '8 pieces (40g)' },
  { name: 'Gummy Bears', calories: 140, protein: 3, carbs: 32, fat: 0, serving: '17 pieces (40g)' },

  // More Snacks
  { name: 'Trail Mix', calories: 173, protein: 5, carbs: 17, fat: 11, serving: '1 oz (28g)' },
  { name: 'Beef Sticks', calories: 156, protein: 6, carbs: 2, fat: 14, serving: '1 oz (28g)' },
  { name: 'String Cheese', calories: 80, protein: 6, carbs: 1, fat: 6, serving: '1 piece (28g)' },
  { name: 'Rice Cakes', calories: 35, protein: 0.7, carbs: 7, fat: 0.3, serving: '1 cake (9g)' },
  { name: 'Crackers (Saltine)', calories: 62, protein: 1.3, carbs: 11, fat: 1.6, serving: '5 crackers (15g)' },
  { name: 'Goldfish Crackers', calories: 140, protein: 3, carbs: 20, fat: 5, serving: '55 pieces (30g)' },
  { name: 'Cheez-Its', calories: 150, protein: 3, carbs: 17, fat: 8, serving: '27 crackers (30g)' },
  { name: 'Fruit Snacks', calories: 80, protein: 1, carbs: 19, fat: 0, serving: '1 pouch (23g)' },
  { name: 'Applesauce', calories: 102, protein: 0.4, carbs: 27, fat: 0.2, serving: '1 cup (244g)' },
  { name: 'Pudding Cup', calories: 140, protein: 3, carbs: 25, fat: 3.5, serving: '1 cup (113g)' },
  { name: 'Jello', calories: 80, protein: 2, carbs: 19, fat: 0, serving: '1 cup (135g)' },
];

export function searchFoodDatabase(query: string): FoodItem[] {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  return foodDatabase
    .filter(food => food.name.toLowerCase().includes(lowerQuery))
    .slice(0, 10); // Limit to 10 results
}
