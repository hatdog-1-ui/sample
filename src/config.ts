import * as dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const config = {
  rpcUrl: process.env.RPC_URL || "https://api.mainnet-beta.solana.com",
  walletPrivateKey: required("WALLET_PRIVATE_KEY"),
  minSolBalance: parseFloat(process.env.MIN_SOL_BALANCE || "0.05"),
  compoundIntervalHours: parseInt(process.env.COMPOUND_INTERVAL_HOURS || "24"),
  telegramToken: process.env.TELEGRAM_BOT_TOKEN || "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID || "",
};
