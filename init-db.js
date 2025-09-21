const databaseService = require("./database");

async function initializeDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await databaseService.connect();

    console.log("Database connected successfully!");
    console.log("Connected to database: FoodLog");
    console.log("You can now start the bot with: npm start");

    // Optional: Create some indexes for better performance
    const usersCollection = databaseService.getCollection("users");
    const foodEntriesCollection = databaseService.getCollection("foodEntries");

    // Create indexes
    await usersCollection.createIndex({ userId: 1 }, { unique: true });
    await foodEntriesCollection.createIndex({ userId: 1 });
    await foodEntriesCollection.createIndex({ createdAt: 1 });
    await foodEntriesCollection.createIndex({ userId: 1, createdAt: 1 });

    console.log("Database indexes created successfully!");

    await databaseService.disconnect();
    console.log("Database initialization completed!");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
