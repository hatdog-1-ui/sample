import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  Marinade,
  MarinadeConfig,
} from "@marinade.finance/marinade-ts-sdk";
import BN from "bn.js";
import { config } from "./config";
import { getSolBalance, log } from "./wallet";

export async function getMarinadeClient(wallet: Keypair, connection: Connection): Promise<Marinade> {
  const marinadeConfig = new MarinadeConfig({
    connection,
    publicKey: wallet.publicKey,
  });
  return new Marinade(marinadeConfig);
}

export async function stakeSol(
  marinade: Marinade,
  connection: Connection,
  wallet: Keypair,
  amountSol: number
): Promise<string> {
  const amountLamports = Math.floor(amountSol * LAMPORTS_PER_SOL);
  const { transaction } = await marinade.deposit(new BN(amountLamports));

  const tx = new Transaction().add(...transaction.instructions);
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = wallet.publicKey;

  const sig = await sendAndConfirmTransaction(connection, tx, [wallet], {
    commitment: "confirmed",
  });
  return sig;
}

export async function getMsolBalance(
  connection: Connection,
  wallet: Keypair,
  msolMint: PublicKey
): Promise<number> {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      wallet.publicKey,
      { mint: msolMint }
    );

    if (tokenAccounts.value.length === 0) return 0;

    const amount = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    return amount ?? 0;
  } catch {
    return 0;
  }
}

export async function runStakingCycle(
  connection: Connection,
  wallet: Keypair
): Promise<void> {
  const solBalance = await getSolBalance(connection, wallet.publicKey);
  log(`Current SOL balance: ${solBalance.toFixed(4)} SOL`);

  const stakeable = solBalance - config.minSolBalance;

  if (stakeable <= 0.01) {
    log(`Not enough SOL to stake. Need more than ${config.minSolBalance + 0.01} SOL total.`);
    return;
  }

  log(`Staking ${stakeable.toFixed(4)} SOL via Marinade...`);

  const marinade = await getMarinadeClient(wallet, connection);

  // mSOL mint address (mainnet)
  const MSOL_MINT = new PublicKey("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So");

  const msolBefore = await getMsolBalance(connection, wallet, MSOL_MINT);
  log(`mSOL balance before: ${msolBefore.toFixed(4)} mSOL`);

  const sig = await stakeSol(marinade, connection, wallet, stakeable);
  log(`Stake transaction confirmed: ${sig}`);
  log(`View on explorer: https://solscan.io/tx/${sig}`);

  const msolAfter = await getMsolBalance(connection, wallet, MSOL_MINT);
  log(`mSOL balance after: ${msolAfter.toFixed(4)} mSOL`);
  log(`Earned ${(msolAfter - msolBefore).toFixed(4)} mSOL this cycle`);
}
