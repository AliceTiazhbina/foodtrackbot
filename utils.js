const { bot, FoodEntry } = require("./app");

// Log food entry
const logFood = async (
  chatId,
  userId,
  text,
  databaseService,
  isAutoLog = false
) => {
  if (!text) {
    bot.sendMessage(
      chatId,
      "Please specify what you ate. For example: /log breakfast oatmeal with fruits"
    );
    return;
  }

  try {
    // Parse the food description to extract meal type and food name
    const { mealType, foodName } = parseFoodDescription(text);

    // Create a basic food entry (in a real app, you'd use a food database API)
    const foodData = {
      foodName: foodName,
      quantity: 1,
      unit: "serving",
      calories: estimateCalories(foodName),
      protein: estimateProtein(foodName),
      carbs: estimateCarbs(foodName),
      fat: estimateFat(foodName),
      mealType: mealType,
      notes: text,
    };

    // Create food entry in database
    const entry = await databaseService.createFoodEntry(userId, foodData);

    const time = new Date().toLocaleTimeString();
    const message = isAutoLog
      ? `✅ Logged: ${foodName}\nTime: ${time}\nCalories: ${foodData.calories}\n\nUse /view to see all today's entries.`
      : `✅ Logged: ${foodName}\nTime: ${time}\nCalories: ${foodData.calories}`;

    bot.sendMessage(chatId, message);
  } catch (error) {
    console.error("Error logging food:", error);
    bot.sendMessage(
      chatId,
      "Sorry, there was an error logging your food. Please try again."
    );
  }
};

// Get today's entries
const getTodayEntries = async (chatId, userId, databaseService) => {
  try {
    const today = new Date();
    const entries = await databaseService.getFoodEntries(userId, today);

    if (entries.length === 0) {
      const keyboard = {
        inline_keyboard: [
          [
            { text: "📝 Log Meal", callback_data: "log_meal" },
            { text: "🏠 Main Menu", callback_data: "main_menu" },
          ],
        ],
      };

      bot.sendMessage(
        chatId,
        "📝 No entries for today yet. Use the button below to add a meal.",
        { reply_markup: keyboard }
      );
      return;
    }

    let message = `📋 Today's entries (${today.toDateString()}):\n\n`;
    let totalCalories = 0;

    entries.forEach((entry, index) => {
      const foodEntry = FoodEntry.fromObject(entry);
      const time = foodEntry.createdAt.toLocaleTimeString();
      const nutrition = foodEntry.getNutritionalSummary();
      totalCalories += nutrition.calories;

      message += `${index + 1}. ${foodEntry.foodName}\n`;
      message += `   ⏰ ${time} | 🍽️ ${foodEntry.mealType}\n`;
      message += `   🔥 ${
        nutrition.calories
      } cal | 🥩 ${nutrition.protein.toFixed(1)}g protein\n\n`;
    });

    message += `📊 Total calories today: ${totalCalories}`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: "📝 Log Another Meal", callback_data: "log_meal" },
          { text: "🏠 Main Menu", callback_data: "main_menu" },
        ],
      ],
    };

    bot.sendMessage(chatId, message, { reply_markup: keyboard });
  } catch (error) {
    console.error("Error getting today's entries:", error);
    bot.sendMessage(
      chatId,
      "Sorry, there was an error retrieving your entries. Please try again."
    );
  }
};

// Get statistics
const getStats = async (chatId, userId, databaseService) => {
  try {
    // Get last 30 days of entries
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const entries = await databaseService.getFoodEntries(
      userId,
      startDate,
      endDate
    );

    if (entries.length === 0) {
      const keyboard = {
        inline_keyboard: [
          [
            { text: "📝 Log Meal", callback_data: "log_meal" },
            { text: "🏠 Main Menu", callback_data: "main_menu" },
          ],
        ],
      };

      bot.sendMessage(
        chatId,
        "📊 No data for statistics yet. Start logging meals to see your progress!",
        { reply_markup: keyboard }
      );
      return;
    }

    // Calculate statistics
    const stats = FoodEntry.calculateDailyTotals(
      entries.map((entry) => FoodEntry.fromObject(entry))
    );
    const daysWithEntries = new Set(
      entries.map((entry) => entry.createdAt.toDateString())
    ).size;

    let message = `📊 Food Statistics (Last 30 days):\n\n`;
    message += `📅 Days with entries: ${daysWithEntries}\n`;
    message += `🍽️ Total meals logged: ${stats.entryCount}\n`;
    message += `📈 Average per day: ${(
      stats.entryCount / daysWithEntries
    ).toFixed(1)}\n\n`;

    message += `🔥 Total calories: ${stats.calories}\n`;
    message += `🥩 Total protein: ${stats.protein.toFixed(1)}g\n`;
    message += `🍞 Total carbs: ${stats.carbs.toFixed(1)}g\n`;
    message += `🥑 Total fat: ${stats.fat.toFixed(1)}g\n\n`;

    // Show recent entries (last 5)
    const recentEntries = entries
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    message += `📋 Recent entries:\n`;
    recentEntries.forEach((entry) => {
      const foodEntry = FoodEntry.fromObject(entry);
      const date = foodEntry.createdAt.toLocaleDateString();
      const time = foodEntry.createdAt.toLocaleTimeString();
      message += `  • ${foodEntry.foodName} (${date} ${time})\n`;
    });

    const keyboard = {
      inline_keyboard: [
        [
          { text: "📋 View Today", callback_data: "view_today" },
          { text: "🏠 Main Menu", callback_data: "main_menu" },
        ],
      ],
    };

    bot.sendMessage(chatId, message, { reply_markup: keyboard });
  } catch (error) {
    console.error("Error getting statistics:", error);
    bot.sendMessage(
      chatId,
      "Sorry, there was an error retrieving your statistics. Please try again."
    );
  }
};

// Helper function to parse food description
const parseFoodDescription = (text) => {
  const lowerText = text.toLowerCase();
  let mealType = "snack";

  if (
    lowerText.includes("breakfast") ||
    lowerText.includes("утром") ||
    lowerText.includes("завтрак")
  ) {
    mealType = "breakfast";
  } else if (lowerText.includes("lunch") || lowerText.includes("обед")) {
    mealType = "lunch";
  } else if (lowerText.includes("dinner") || lowerText.includes("ужин")) {
    mealType = "dinner";
  }

  // Remove meal type keywords from food name
  const foodName = text
    .replace(/\b(breakfast|lunch|dinner|snack|утром|завтрак|обед|ужин)\b/gi, "")
    .trim();

  return { mealType, foodName: foodName || text };
};

// Simple calorie estimation (in a real app, use a food database API)
const estimateCalories = (foodName) => {
  const lowerName = foodName.toLowerCase();

  if (lowerName.includes("oatmeal") || lowerName.includes("овсянка"))
    return 150;
  if (lowerName.includes("apple") || lowerName.includes("яблоко")) return 80;
  if (lowerName.includes("banana") || lowerName.includes("банан")) return 100;
  if (lowerName.includes("bread") || lowerName.includes("хлеб")) return 80;
  if (lowerName.includes("rice") || lowerName.includes("рис")) return 130;
  if (lowerName.includes("chicken") || lowerName.includes("курица")) return 200;
  if (lowerName.includes("salad") || lowerName.includes("салат")) return 50;
  if (lowerName.includes("pasta") || lowerName.includes("паста")) return 200;
  if (lowerName.includes("pizza") || lowerName.includes("пицца")) return 300;
  if (lowerName.includes("soup") || lowerName.includes("суп")) return 150;

  // Default estimation based on text length
  return Math.max(50, Math.min(500, foodName.length * 10));
};

const estimateProtein = (foodName) => {
  const lowerName = foodName.toLowerCase();

  if (lowerName.includes("chicken") || lowerName.includes("курица")) return 25;
  if (lowerName.includes("meat") || lowerName.includes("мясо")) return 20;
  if (lowerName.includes("fish") || lowerName.includes("рыба")) return 22;
  if (lowerName.includes("egg") || lowerName.includes("яйцо")) return 6;
  if (lowerName.includes("milk") || lowerName.includes("молоко")) return 8;
  if (lowerName.includes("cheese") || lowerName.includes("сыр")) return 7;

  return Math.max(2, Math.min(30, foodName.length * 0.5));
};

const estimateCarbs = (foodName) => {
  const lowerName = foodName.toLowerCase();

  if (lowerName.includes("rice") || lowerName.includes("рис")) return 28;
  if (lowerName.includes("pasta") || lowerName.includes("паста")) return 25;
  if (lowerName.includes("bread") || lowerName.includes("хлеб")) return 15;
  if (lowerName.includes("potato") || lowerName.includes("картофель"))
    return 20;
  if (lowerName.includes("fruit") || lowerName.includes("фрукт")) return 15;
  if (lowerName.includes("sugar") || lowerName.includes("сахар")) return 25;

  return Math.max(5, Math.min(50, foodName.length * 0.8));
};

const estimateFat = (foodName) => {
  const lowerName = foodName.toLowerCase();

  if (lowerName.includes("oil") || lowerName.includes("масло")) return 14;
  if (lowerName.includes("butter") || lowerName.includes("масло сливочное"))
    return 12;
  if (lowerName.includes("cheese") || lowerName.includes("сыр")) return 9;
  if (lowerName.includes("nuts") || lowerName.includes("орехи")) return 15;
  if (lowerName.includes("avocado") || lowerName.includes("авокадо")) return 15;

  return Math.max(1, Math.min(20, foodName.length * 0.3));
};

module.exports = {
  logFood,
  getTodayEntries,
  getStats,
};
