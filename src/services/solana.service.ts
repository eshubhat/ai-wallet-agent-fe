import {
    Connection,
    PublicKey,
    SystemProgram,
    TransactionMessage,
    VersionedTransaction,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { type SimulationResult } from '../types';

export const solanaService = {
    async getBalance(connection: Connection, publicKey: PublicKey): Promise<number> {
        const balance = await connection.getBalance(publicKey);
        return balance / LAMPORTS_PER_SOL;
    },

    async createTransferTransaction(
        connection: Connection,
        fromPubkey: PublicKey,
        toPubkey: PublicKey,
        amountSol: number
    ): Promise<VersionedTransaction> {
        const latestBlockhash = await connection.getLatestBlockhash();
        const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

        const transferInstruction = SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports
        });

        const messageV0 = new TransactionMessage({
            payerKey: fromPubkey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions: [transferInstruction]
        }).compileToV0Message();

        return new VersionedTransaction(messageV0);
    },

    async simulateTransaction(
        connection: Connection,
        transaction: VersionedTransaction
    ): Promise<SimulationResult> {
        try {
            // Simulate
            const sim = await connection.simulateTransaction(transaction);
            if (sim.value.err) {
                return {
                    success: false,
                    message: `Simulation failed: ${JSON.stringify(sim.value.err)}`,
                    logs: sim.value.logs || []
                };
            }

            // Estimate fee
            // web3.js connection.getFeeForMessage expects a Message
            // Since VersionedTransaction has .message which is MessageV0 | Message
            let fee = 0;
            const feeResponse = await connection.getFeeForMessage(
                transaction.message,
                'confirmed'
            );
            if (feeResponse.value !== null) {
                fee = feeResponse.value / LAMPORTS_PER_SOL;
            }

            return {
                success: true,
                message: 'Simulation successful. Transaction is valid.',
                fee,
                transactionBase64: Buffer.from(transaction.serialize()).toString('base64'),
                logs: sim.value.logs || []
            };
        } catch (err: any) {
            console.error('Simulation Error:', err);
            return {
                success: false,
                message: err.message || 'Unknown simulation error'
            };
        }
    }
};
