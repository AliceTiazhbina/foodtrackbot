const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

// Import database service and models
const databaseService = require("./database");
const User = require("./models/User");
const FoodEntry = require("./models/FoodEntry");

// Initialize bot with token from environment variables
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Export for use in other modules
module.exports = {
  bot,
  databaseService,
  User,
  FoodEntry,
};

// Initialize database connection and start bot
async function startBot() {
  try {
    // Connect to MongoDB
    await databaseService.connect();
    console.log("Database connected successfully");

    // Import and initialize event handlers after database connection
    require("./events");

    console.log("Food Track Bot started successfully!");
  } catch (error) {
    console.error("Failed to start bot:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down bot...");
  await databaseService.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down bot...");
  await databaseService.disconnect();
  process.exit(0);
});

// Start the bot
startBot();
