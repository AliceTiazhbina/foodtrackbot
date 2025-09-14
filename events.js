const { bot, userData } = require("./app");
const { logFood, getTodayEntries, getStats } = require("./utils");

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
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
bot.onText(/\/log/, (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.replace("/log", "").trim();

  logFood(chatId, text, userData);
});

// View command
bot.onText(/\/view/, (msg) => {
  const chatId = msg.chat.id;
  getTodayEntries(chatId, userData);
});

// Stats command
bot.onText(/\/stats/, (msg) => {
  const chatId = msg.chat.id;
  getStats(chatId, userData);
});

// Callback query handler for inline buttons
bot.on("callback_query", (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const data = callbackQuery.data;

  // Answer the callback query to remove loading state
  bot.answerCallbackQuery(callbackQuery.id);

  switch (data) {
    case "log_meal":
      bot.sendMessage(
        chatId,
        '🍽️ Please describe what you ate:\n\nExample: "breakfast oatmeal with fruits"'
      );
      break;

    case "view_today":
      getTodayEntries(chatId, userData);
      break;

    case "stats":
      getStats(chatId, userData);
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
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
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

  // Treat as food log entry
  logFood(chatId, text, userData, true);
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
