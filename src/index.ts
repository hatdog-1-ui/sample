import { Connection } from "@solana/web3.js";
import { config } from "./config";
import { loadWallet, getSolBalance, log } from "./wallet";
import { runStakingCycle } from "./staking";

async function main() {
  log("=== Solana Liquid Staking Bot ===");
  log(`RPC: ${config.rpcUrl}`);
  log(`Min SOL kept in wallet: ${config.minSolBalance} SOL`);
  log(`Compound interval: every ${config.compoundIntervalHours} hour(s)`);

  const connection = new Connection(config.rpcUrl, "confirmed");
  const wallet = loadWallet();

  log(`Wallet address: ${wallet.publicKey.toBase58()}`);

  const balance = await getSolBalance(connection, wallet.publicKey);
  log(`Starting SOL balance: ${balance.toFixed(4)} SOL`);

  if (balance < config.minSolBalance + 0.01) {
    log("ERROR: Wallet balance too low. Please fund your wallet first.");
    process.exit(1);
  }

  // Run immediately on start, then on interval
  await runStakingCycle(connection, wallet);

  const intervalMs = config.compoundIntervalHours * 60 * 60 * 1000;
  log(`Next cycle in ${config.compoundIntervalHours} hour(s). Bot is running...`);

  setInterval(async () => {
    log("--- Starting new staking cycle ---");
    try {
      await runStakingCycle(connection, wallet);
    } catch (err) {
      log(`Error during staking cycle: ${err}`);
    }
    log(`Next cycle in ${config.compoundIntervalHours} hour(s).`);
  }, intervalMs);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
