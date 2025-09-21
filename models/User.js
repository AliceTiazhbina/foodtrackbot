class User {
  constructor(userId, userData = {}) {
    this.userId = userId;
    this.username = userData.username || null;
    this.firstName = userData.firstName || null;
    this.lastName = userData.lastName || null;
    this.languageCode = userData.languageCode || "en";
    this.isBot = userData.isBot || false;
    this.dailyCalorieGoal = userData.dailyCalorieGoal || 2000;
    this.preferences = userData.preferences || {
      notifications: true,
      reminderTime: "20:00",
      units: "metric", // metric or imperial
    };
    this.createdAt = userData.createdAt || new Date();
    this.updatedAt = userData.updatedAt || new Date();
  }

  // Validation methods
  isValid() {
    return this.userId && typeof this.userId === "number";
  }

  // Update methods
  updateProfile(profileData) {
    if (profileData.username !== undefined)
      this.username = profileData.username;
    if (profileData.firstName !== undefined)
      this.firstName = profileData.firstName;
    if (profileData.lastName !== undefined)
      this.lastName = profileData.lastName;
    if (profileData.languageCode !== undefined)
      this.languageCode = profileData.languageCode;
    this.updatedAt = new Date();
  }

  updatePreferences(preferences) {
    this.preferences = { ...this.preferences, ...preferences };
    this.updatedAt = new Date();
  }

  updateCalorieGoal(goal) {
    if (goal && goal > 0) {
      this.dailyCalorieGoal = goal;
      this.updatedAt = new Date();
    }
  }

  // Getter methods
  getFullName() {
    const parts = [this.firstName, this.lastName].filter(Boolean);
    return parts.join(" ") || this.username || `User ${this.userId}`;
  }

  getDisplayName() {
    return this.username ? `@${this.username}` : this.getFullName();
  }

  // Convert to plain object for database storage
  toObject() {
    return {
      userId: this.userId,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      languageCode: this.languageCode,
      isBot: this.isBot,
      dailyCalorieGoal: this.dailyCalorieGoal,
      preferences: this.preferences,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Create from database object
  static fromObject(obj) {
    return new User(obj.userId, obj);
  }
}

module.exports = User;
