# FoodTrackBot 🍎

Telegram bot for food diary. Log meals, build healthy habits.

## Features

jhv,jhvvhj

- 📝 Log meals and snacks throughout the day
- 📊 View daily food entries
- 📈 Track eating statistics
- ⚙️ Simple and intuitive interface
- 💾 Data stored in memory (resets on restart)

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create a Telegram bot:**

   - Message [@BotFather](https://t.me/BotFather) on Telegram
   - Use `/newbot` command
   - Follow instructions to get your bot token

3. **Configure environment:**

   ```bash
   cp env.example .env
   ```

   Edit `.env` file and add your bot token:

   ```
   BOT_TOKEN=your_bot_token_here
   ```

4. **Run the bot:**

   ```bash
   npm start
   ```

   For development with auto-restart:

   ```bash
   npm run dev
   ```

## Commands

- `/start` - Start the bot and see welcome message
- `/help` - Show help and available commands
- `/log` - Log a meal (e.g., `/log breakfast oatmeal with fruits`)
- `/view` - View today's food entries
- `/stats` - Show eating statistics
- `/settings` - Bot settings (coming soon)

You can also just send a text message describing your meal - the bot will automatically log it!

## Example Usage

1. Start a conversation with your bot
2. Send `/start` to begin
3. Log your meals:
   - `/log завтрак овсянка с фруктами`
   - Or just send: `обед салат с курицей`
4. View your entries with `/view`
5. Check statistics with `/stats`

## Development

The bot is built with:

- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) - Telegram Bot API
- [dotenv](https://github.com/motdotla/dotenv) - Environment variables

## Notes

- Data is stored in memory and will be lost when the bot restarts
- For production use, consider adding a database (MongoDB, PostgreSQL, etc.)
- The bot uses polling method - suitable for development and small-scale usage
