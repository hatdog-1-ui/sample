import TelegramBot from "node-telegram-bot-api";

let bot: TelegramBot | null = null;
let chatId: string | null = null;

export function initTelegram(token: string, id: string) {
  bot = new TelegramBot(token);
  chatId = id;
}

export async function sendTelegramMessage(message: string): Promise<void> {
  if (!bot || !chatId) return;
  try {
    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (err) {
    console.error("Telegram send error:", err);
  }
}
