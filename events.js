const { bot, databaseService, User, FoodEntry } = require("./app");
const { logFood, getTodayEntries, getStats } = require("./utils");

// Start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    // Check if user exists in database
    let user = await databaseService.getUser(userId);

    if (!user) {
      // Create new user
      const userData = {
        username: msg.from.username,
        firstName: msg.from.first_name,
        lastName: msg.from.last_name,
        languageCode: msg.from.language_code,
        isBot: msg.from.is_bot,
      };

      user = await databaseService.createUser(userId, userData);
      console.log(`New user created: ${userId}`);
    }

    const welcomeMessage = `
🍎 Welcome to FoodTrackBot!

This bot will help you keep a food diary and build healthy habits.

Choose an action below:
  `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: "📝 Log Meal", callback_data: "log_meal" },
          { text: "📋 View Today", callback_data: "view_today" },
        ],
        [
          { text: "📊 Statistics", callback_data: "stats" },
          { text: "⚙️ Settings", callback_data: "settings" },
        ],
        [{ text: "❓ Help", callback_data: "help" }],
      ],
    };

    bot.sendMessage(chatId, welcomeMessage, { reply_markup: keyboard });
  } catch (error) {
    console.error("Error in /start command:", error);
    bot.sendMessage(
      chatId,
      "Sorry, there was an error. Please try again later."
    );
  }
});

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  showHelp(chatId);
});

// Show help function
const showHelp = (chatId) => {
  const helpMessage = `
📋 How to use FoodTrackBot:

🍽️ **Logging Meals:**
• Use the "📝 Log Meal" button
• Or just send a text message describing your food
• Example: "breakfast oatmeal with fruits"

📋 **Viewing Entries:**
• Use the "📋 View Today" button to see today's meals
• All entries are organized by time

📊 **Statistics:**
• Use the "📊 Statistics" button to see your eating patterns
• View total meals, average per day, and recent entries

⚙️ **Settings:**
• Use the "⚙️ Settings" button for bot preferences
• More features coming soon!

💡 **Tips:**
• You can send food descriptions directly as text messages
• The bot will automatically log them
• Use buttons for quick access to features
  `;

  const keyboard = {
    inline_keyboard: [[{ text: "🏠 Main Menu", callback_data: "main_menu" }]],
  };

  bot.sendMessage(chatId, helpMessage, {
    reply_markup: keyboard,
    parse_mode: "Markdown",
  });
};

// Log command
bot.onText(/\/log/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text.replace("/log", "").trim();

  try {
    await logFood(chatId, userId, text, databaseService);
  } catch (error) {
    console.error("Error in /log command:", error);
    bot.sendMessage(
      chatId,
      "Sorry, there was an error logging your food. Please try again."
    );
  }
});

// View command
bot.onText(/\/view/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    await getTodayEntries(chatId, userId, databaseService);
  } catch (error) {
    console.error("Error in /view command:", error);
    bot.sendMessage(
      chatId,
      "Sorry, there was an error retrieving your entries. Please try again."
    );
  }
});

// Stats command
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    await getStats(chatId, userId, databaseService);
  } catch (error) {
    console.error("Error in /stats command:", error);
    bot.sendMessage(
      chatId,
      "Sorry, there was an error retrieving your statistics. Please try again."
    );
  }
});

// Callback query handler for inline buttons
bot.on("callback_query", async (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;

  // Answer the callback query to remove loading state
  bot.answerCallbackQuery(callbackQuery.id);

  try {
    switch (data) {
      case "log_meal":
        bot.sendMessage(
          chatId,
          '🍽️ Please describe what you ate:\n\nExample: "breakfast oatmeal with fruits"'
        );
        break;

      case "view_today":
        await getTodayEntries(chatId, userId, databaseService);
        break;

      case "stats":
        await getStats(chatId, userId, databaseService);
        break;

      case "settings":
        showSettings(chatId);
        break;

      case "help":
        showHelp(chatId);
        break;

      case "main_menu":
        showMainMenu(chatId);
        break;

      default:
        bot.sendMessage(chatId, "Unknown command. Please try again.");
    }
  } catch (error) {
    console.error("Error in callback query:", error);
    bot.sendMessage(chatId, "Sorry, there was an error. Please try again.");
  }
});

// Show main menu
const showMainMenu = (chatId) => {
  const welcomeMessage = `
🍎 FoodTrackBot

Choose an action below:
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "📝 Log Meal", callback_data: "log_meal" },
        { text: "📋 View Today", callback_data: "view_today" },
      ],
      [
        { text: "📊 Statistics", callback_data: "stats" },
        { text: "⚙️ Settings", callback_data: "settings" },
      ],
      [{ text: "❓ Help", callback_data: "help" }],
    ],
  };

  bot.sendMessage(chatId, welcomeMessage, { reply_markup: keyboard });
};

// Show settings
const showSettings = (chatId) => {
  const settingsMessage = `
⚙️ Settings

Coming soon:
- Meal notifications
- Diary reminders
- Data export
- Personalized recommendations

All settings are currently default.
  `;

  const keyboard = {
    inline_keyboard: [[{ text: "🏠 Main Menu", callback_data: "main_menu" }]],
  };

  bot.sendMessage(chatId, settingsMessage, { reply_markup: keyboard });
};

// Handle regular text messages (treat as food log)
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  // Skip if it's a command
  if (text.startsWith("/")) {
    return;
  }

  // Skip if it's a sticker, photo, etc.
  if (msg.photo || msg.sticker || msg.document) {
    bot.sendMessage(
      chatId,
      "Please send a text description of your food or use the /log command"
    );
    return;
  }

  try {
    // Treat as food log entry
    await logFood(chatId, userId, text, databaseService, true);
  } catch (error) {
    console.error("Error logging food from message:", error);
    bot.sendMessage(
      chatId,
      "Sorry, there was an error logging your food. Please try again."
    );
  }
});

// Error handling
bot.on("polling_error", (error) => {
  console.error("Polling error:", error);
});

bot.on("error", (error) => {
  console.error("Bot error:", error);
});

console.log("🍎 FoodTrackBot is running and ready!");
console.log("Press Ctrl+C to stop the bot");
