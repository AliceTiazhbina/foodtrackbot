class FoodEntry {
  constructor(userId, foodData = {}) {
    this.userId = userId;
    this.foodName = foodData.foodName || "";
    this.quantity = foodData.quantity || 1;
    this.unit = foodData.unit || "serving";
    this.calories = foodData.calories || 0;
    this.protein = foodData.protein || 0;
    this.carbs = foodData.carbs || 0;
    this.fat = foodData.fat || 0;
    this.fiber = foodData.fiber || 0;
    this.sugar = foodData.sugar || 0;
    this.mealType = foodData.mealType || "snack"; // breakfast, lunch, dinner, snack
    this.notes = foodData.notes || "";
    this.createdAt = foodData.createdAt || new Date();
  }

  // Validation methods
  isValid() {
    return (
      this.userId && this.foodName && this.quantity > 0 && this.calories >= 0
    );
  }

  // Calculation methods
  calculateTotalCalories() {
    return this.calories * this.quantity;
  }

  calculateTotalProtein() {
    return this.protein * this.quantity;
  }

  calculateTotalCarbs() {
    return this.carbs * this.quantity;
  }

  calculateTotalFat() {
    return this.fat * this.quantity;
  }

  calculateTotalFiber() {
    return this.fiber * this.quantity;
  }

  calculateTotalSugar() {
    return this.sugar * this.quantity;
  }

  // Get nutritional summary
  getNutritionalSummary() {
    return {
      calories: this.calculateTotalCalories(),
      protein: this.calculateTotalProtein(),
      carbs: this.calculateTotalCarbs(),
      fat: this.calculateTotalFat(),
      fiber: this.calculateTotalFiber(),
      sugar: this.calculateTotalSugar(),
    };
  }

  // Update methods
  updateQuantity(newQuantity) {
    if (newQuantity > 0) {
      this.quantity = newQuantity;
    }
  }

  updateNutrition(nutritionData) {
    if (nutritionData.calories !== undefined)
      this.calories = nutritionData.calories;
    if (nutritionData.protein !== undefined)
      this.protein = nutritionData.protein;
    if (nutritionData.carbs !== undefined) this.carbs = nutritionData.carbs;
    if (nutritionData.fat !== undefined) this.fat = nutritionData.fat;
    if (nutritionData.fiber !== undefined) this.fiber = nutritionData.fiber;
    if (nutritionData.sugar !== undefined) this.sugar = nutritionData.sugar;
  }

  updateMealType(mealType) {
    const validMealTypes = ["breakfast", "lunch", "dinner", "snack"];
    if (validMealTypes.includes(mealType)) {
      this.mealType = mealType;
    }
  }

  // Formatting methods
  getFormattedEntry() {
    const nutrition = this.getNutritionalSummary();
    return (
      `${this.foodName} (${this.quantity} ${this.unit})\n` +
      `Calories: ${nutrition.calories}\n` +
      `Protein: ${nutrition.protein.toFixed(1)}g\n` +
      `Carbs: ${nutrition.carbs.toFixed(1)}g\n` +
      `Fat: ${nutrition.fat.toFixed(1)}g`
    );
  }

  getShortEntry() {
    return `${this.foodName} - ${this.calculateTotalCalories()} cal`;
  }

  // Convert to plain object for database storage
  toObject() {
    return {
      userId: this.userId,
      foodName: this.foodName,
      quantity: this.quantity,
      unit: this.unit,
      calories: this.calories,
      protein: this.protein,
      carbs: this.carbs,
      fat: this.fat,
      fiber: this.fiber,
      sugar: this.sugar,
      mealType: this.mealType,
      notes: this.notes,
      createdAt: this.createdAt,
    };
  }

  // Create from database object
  static fromObject(obj) {
    return new FoodEntry(obj.userId, obj);
  }

  // Static utility methods
  static getMealTypes() {
    return ["breakfast", "lunch", "dinner", "snack"];
  }

  static getUnits() {
    return [
      "serving",
      "g",
      "kg",
      "ml",
      "l",
      "cup",
      "tbsp",
      "tsp",
      "piece",
      "slice",
    ];
  }

  static calculateDailyTotals(entries) {
    return entries.reduce(
      (totals, entry) => {
        const nutrition = entry.getNutritionalSummary();
        totals.calories += nutrition.calories;
        totals.protein += nutrition.protein;
        totals.carbs += nutrition.carbs;
        totals.fat += nutrition.fat;
        totals.fiber += nutrition.fiber;
        totals.sugar += nutrition.sugar;
        totals.entryCount += 1;
        return totals;
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        entryCount: 0,
      }
    );
  }
}

module.exports = FoodEntry;
