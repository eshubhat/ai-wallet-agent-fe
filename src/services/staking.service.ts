import {
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    StakeProgram,
    Authorized,
    Lockup,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { type SignerWalletAdapterProps } from '@solana/wallet-adapter-base';

// A known reliable Devnet Validator Vote Account for testing delegation
// (Dynamic extraction via rpc getVoteAccounts)
const DEVNET_VALIDATOR_VOTE_KEY = new PublicKey('7AETLyAGJWjp6AWzZqZcP362yv5LQ3nLEdwnXNjdNwwF');

export interface StakingResult {
    signature: string;
    explorerUrl: string;
    stakeAccountPubkey: string;
    validatorVoteKey: string;
}

export const stakingService = {
    /**
     * Creates a stake account, funds it, and delegates to a validator in a single transaction.
     * 
     * @param connection - The Solana connection object
     * @param walletPublicKey - The public key of the user's wallet
     * @param signTransaction - The wallet adapter's signTransaction function
     * @param amountInSol - The amount of SOL to stake
     * @param validatorVoteKey - (Optional) The validator to delegate to. Defaults to a devnet validator.
     * @returns A promise resolving to the signature and explorer URL
     */
    async createAndDelegateStake(
        connection: Connection,
        walletPublicKey: PublicKey,
        signTransaction: SignerWalletAdapterProps['signTransaction'] | undefined,
        amountInSol: number,
        validatorVoteKey: PublicKey = DEVNET_VALIDATOR_VOTE_KEY
    ): Promise<StakingResult> {
        try {
            if (!signTransaction) {
                throw new Error('Wallet does not support transaction signing directly.');
            }

            // Generate a new keypair for the stake account
            const stakeAccount = Keypair.generate();

            // Calculate the total lamports needed
            // The stake account needs rent exemption + the amount to actually stake
            const rentExemption = await connection.getMinimumBalanceForRentExemption(StakeProgram.space);
            const amountLamports = Math.floor(amountInSol * LAMPORTS_PER_SOL);
            const totalLamportsToFund = rentExemption + amountLamports;

            // 1. Create the transaction
            const transaction = new Transaction();

            // 2. Add instruction to create the stake account and fund it
            const createStakeAccountInstruction = StakeProgram.createAccount({
                fromPubkey: walletPublicKey,
                stakePubkey: stakeAccount.publicKey,
                authorized: new Authorized(walletPublicKey, walletPublicKey),
                lockup: new Lockup(0, 0, walletPublicKey),
                lamports: totalLamportsToFund,
            });
            transaction.add(createStakeAccountInstruction);

            // 3. Add instruction to delegate the stake to the validator
            const delegateInstruction = StakeProgram.delegate({
                stakePubkey: stakeAccount.publicKey,
                authorizedPubkey: walletPublicKey,
                votePubkey: validatorVoteKey,
            });
            transaction.add(delegateInstruction);

            // 4. Get recent blockhash and set fee payer
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = walletPublicKey;

            // 5. Partially sign the transaction with the new stake account keypair
            transaction.partialSign(stakeAccount);

            // 6. Sign the transaction with the user's wallet
            const signedTransaction = await signTransaction(transaction);

            // 7. Send the transaction to the network
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());

            // 8. Wait for confirmation
            await connection.confirmTransaction({
                blockhash,
                lastValidBlockHeight,
                signature
            }, 'confirmed');

            return {
                signature,
                explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
                stakeAccountPubkey: stakeAccount.publicKey.toString(),
                validatorVoteKey: validatorVoteKey.toString()
            };

        } catch (error: any) {
            console.error('Staking Error:', error);
            throw new Error(`Failed to stake SOL: ${error.message || 'Unknown error'}`);
        }
    }
};
