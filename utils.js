const { bot } = require("./app");

// Log food entry
const logFood = (chatId, text, userData, isAutoLog = false) => {
  if (!text) {
    bot.sendMessage(
      chatId,
      "Please specify what you ate. For example: /log breakfast oatmeal with fruits"
    );
    return;
  }

  // Get current date
  const today = new Date().toDateString();

  // Initialize user data if not exists
  if (!userData.has(chatId)) {
    userData.set(chatId, {});
  }

  const user = userData.get(chatId);
  if (!user[today]) {
    user[today] = [];
  }

  // Add food entry
  const entry = {
    time: new Date().toLocaleTimeString(),
    food: text,
    timestamp: Date.now(),
  };

  user[today].push(entry);
  userData.set(chatId, user);

  const message = isAutoLog
    ? `✅ Logged: ${text}\nTime: ${entry.time}\n\nUse /view to see all today's entries.`
    : `✅ Logged: ${text}\nTime: ${entry.time}`;

  bot.sendMessage(chatId, message);
};

// Get today's entries
const getTodayEntries = (chatId, userData) => {
  const today = new Date().toDateString();

  if (!userData.has(chatId) || !userData.get(chatId)[today]) {
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

  const entries = userData.get(chatId)[today];
  let message = `📋 Today's entries (${today}):\n\n`;

  entries.forEach((entry, index) => {
    message += `${index + 1}. ${entry.food}\n   ⏰ ${entry.time}\n\n`;
  });

  const keyboard = {
    inline_keyboard: [
      [
        { text: "📝 Log Another Meal", callback_data: "log_meal" },
        { text: "🏠 Main Menu", callback_data: "main_menu" },
      ],
    ],
  };

  bot.sendMessage(chatId, message, { reply_markup: keyboard });
};

// Get statistics
const getStats = (chatId, userData) => {
  if (!userData.has(chatId)) {
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

  const user = userData.get(chatId);
  const dates = Object.keys(user);
  const totalEntries = dates.reduce((sum, date) => sum + user[date].length, 0);

  let message = `📊 Food Statistics:\n\n`;
  message += `📅 Total days with entries: ${dates.length}\n`;
  message += `🍽️ Total meals logged: ${totalEntries}\n`;
  message += `📈 Average per day: ${(totalEntries / dates.length).toFixed(
    1
  )}\n\n`;

  // Show last 3 days
  const recentDates = dates.sort().slice(-3);
  message += `📋 Recent entries:\n`;

  recentDates.forEach((date) => {
    const dayEntries = user[date];
    message += `\n${date} (${dayEntries.length} entries):\n`;
    dayEntries.forEach((entry) => {
      message += `  • ${entry.food} (${entry.time})\n`;
    });
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
};

module.exports = {
  logFood,
  getTodayEntries,
  getStats,
};
