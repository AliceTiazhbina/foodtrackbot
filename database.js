const { MongoClient } = require("mongodb");

class DatabaseService {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const connectionString =
        process.env.MONGODB_URI || "mongodb://localhost:27017/foodtrackbot";
      this.client = new MongoClient(connectionString);
      await this.client.connect();
      this.db = this.client.db("FoodLog");
      this.isConnected = true;
      console.log("Connected to MongoDB successfully");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log("Disconnected from MongoDB");
    }
  }

  getCollection(collectionName) {
    if (!this.isConnected) {
      throw new Error("Database not connected");
    }
    return this.db.collection(collectionName);
  }

  // User operations
  async createUser(userId, userData) {
    const users = this.getCollection("users");
    const user = {
      userId,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await users.insertOne(user);
    return user;
  }

  async getUser(userId) {
    const users = this.getCollection("users");
    return await users.findOne({ userId });
  }

  async updateUser(userId, updateData) {
    const users = this.getCollection("users");
    updateData.updatedAt = new Date();
    return await users.updateOne({ userId }, { $set: updateData });
  }

  async deleteUser(userId) {
    const users = this.getCollection("users");
    return await users.deleteOne({ userId });
  }

  // Food entry operations
  async createFoodEntry(userId, foodData) {
    const foodEntries = this.getCollection("foodEntries");
    const entry = {
      userId,
      ...foodData,
      createdAt: new Date(),
    };
    await foodEntries.insertOne(entry);
    return entry;
  }

  async getFoodEntries(userId, date = null) {
    const foodEntries = this.getCollection("foodEntries");
    const query = { userId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    return await foodEntries.find(query).sort({ createdAt: -1 }).toArray();
  }

  async updateFoodEntry(entryId, updateData) {
    const foodEntries = this.getCollection("foodEntries");
    return await foodEntries.updateOne({ _id: entryId }, { $set: updateData });
  }

  async deleteFoodEntry(entryId) {
    const foodEntries = this.getCollection("foodEntries");
    return await foodEntries.deleteOne({ _id: entryId });
  }

  // Statistics operations
  async getUserStats(userId, startDate, endDate) {
    const foodEntries = this.getCollection("foodEntries");
    const pipeline = [
      {
        $match: {
          userId,
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: "$calories" },
          totalProtein: { $sum: "$protein" },
          totalCarbs: { $sum: "$carbs" },
          totalFat: { $sum: "$fat" },
          entryCount: { $sum: 1 },
        },
      },
    ];

    const result = await foodEntries.aggregate(pipeline).toArray();
    return (
      result[0] || {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        entryCount: 0,
      }
    );
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

module.exports = databaseService;
