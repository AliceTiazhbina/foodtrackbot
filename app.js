const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

// Initialize bot with token from environment variables
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Store user data in memory (in production, use a database)
const userData = new Map();

// Export for use in other modules
module.exports = {
  bot,
  userData,
};

// Import and initialize event handlers
require("./events");
