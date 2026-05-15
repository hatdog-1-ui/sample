import { Connection } from "@solana/web3.js";
import { config } from "./config";
import { loadWallet, getSolBalance, log } from "./wallet";
import { runStakingCycle } from "./staking";
import { initTelegram, sendTelegramMessage } from "./telegram";

async function main() {
  log("=== Solana Liquid Staking Bot ===");
  log(`RPC: ${config.rpcUrl}`);
  log(`Min SOL kept in wallet: ${config.minSolBalance} SOL`);
  log(`Compound interval: every ${config.compoundIntervalHours} hour(s)`);

  if (config.telegramToken && config.telegramChatId) {
    initTelegram(config.telegramToken, config.telegramChatId);
    log("Telegram notifications enabled");
    await sendTelegramMessage("🤖 *Solana Staking Bot Started!*\nMonitoring your wallet and staking SOL automatically.");
  } else {
    log("Telegram not configured — skipping notifications");
  }

  const connection = new Connection(config.rpcUrl, "confirmed");
  const wallet = loadWallet();

  log(`Wallet address: ${wallet.publicKey.toBase58()}`);

  const balance = await getSolBalance(connection, wallet.publicKey);
  log(`Starting SOL balance: ${balance.toFixed(4)} SOL`);

  if (balance < config.minSolBalance + 0.01) {
    log("ERROR: Wallet balance too low. Please fund your wallet first.");
    await sendTelegramMessage(`❌ *Bot Error*\n\nWallet balance too low to start.\nBalance: ${balance.toFixed(4)} SOL\nPlease add more SOL.`);
    process.exit(1);
  }

  await runStakingCycle(connection, wallet);

  const intervalMs = config.compoundIntervalHours * 60 * 60 * 1000;
  log(`Next cycle in ${config.compoundIntervalHours} hour(s). Bot is running...`);

  setInterval(async () => {
    log("--- Starting new staking cycle ---");
    try {
      await runStakingCycle(connection, wallet);
    } catch (err) {
      log(`Error during staking cycle: ${err}`);
      await sendTelegramMessage(`❌ *Staking Error*\n\n${err}\n\nBot will retry next cycle.`);
    }
    log(`Next cycle in ${config.compoundIntervalHours} hour(s).`);
  }, intervalMs);
}

main().catch(async (err) => {
  console.error("Fatal error:", err);
  await sendTelegramMessage(`🔴 *Bot crashed!*\n\n${err}`);
  process.exit(1);
});
