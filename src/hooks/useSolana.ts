import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import { solanaService } from '../services/solana.service';

export function useSolana() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction, signTransaction } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);

    const refreshBalance = useCallback(async () => {
        if (publicKey) {
            try {
                const bal = await solanaService.getBalance(connection, publicKey);
                setBalance(bal);
            } catch (e) {
                console.error('Failed to get balance:', e);
            }
        } else {
            setBalance(null);
        }
    }, [connection, publicKey]);

    useEffect(() => {
        refreshBalance();

        if (publicKey) {
            // Setup subscription to automatically update balance when account changes
            const id = connection.onAccountChange(
                publicKey,
                (account) => setBalance(account.lamports / 1e9),
                'confirmed'
            );
            return () => {
                connection.removeAccountChangeListener(id);
            };
        }
    }, [connection, publicKey, refreshBalance]);

    return {
        connection,
        publicKey,
        balance,
        sendTransaction,
        signTransaction,
        refreshBalance
    };
}
