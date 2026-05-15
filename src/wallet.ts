import { Keypair, Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";
import { config } from "./config";

export function loadWallet(): Keypair {
  const decoded = bs58.decode(config.walletPrivateKey);
  return Keypair.fromSecretKey(decoded);
}

export async function getSolBalance(connection: Connection, pubkey: PublicKey): Promise<number> {
  const lamports = await connection.getBalance(pubkey);
  return lamports / LAMPORTS_PER_SOL;
}

export function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}
