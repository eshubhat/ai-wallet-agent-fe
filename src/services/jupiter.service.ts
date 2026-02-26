import { VersionedTransaction } from '@solana/web3.js';

export const jupiterService = {
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50
  ) {
    const baseUrl = import.meta.env.DEV ? '/jup-api' : 'https://lite-api.jup.ag';
    const url = `${baseUrl}/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Status ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error: any) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error (Failed to fetch). The Jupiter API is aggressively blocking the request. The Vite proxy should bypass this, but please ensure your firewall allows it.');
      }
      throw new Error(`Jupiter quote error: ${error.message}`);
    }
  },

  async getSwapTransaction(
    quoteResponse: any,
    userPublicKey: string
  ): Promise<{ swapTransaction: string }> {
    const baseUrl = import.meta.env.DEV ? '/jup-api' : 'https://lite-api.jup.ag';
    const url = `${baseUrl}/swap/v1/swap`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey,
          wrapAndUnwrapSol: true
        })
      });
      if (!response.ok) {
        throw new Error(`Status ${response.status}: ${response.statusText}`);
      }
      return await response.json(); // { swapTransaction: base64 string }
    } catch (error: any) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error (Failed to fetch). The request to the Jupiter Swap API was blocked.');
      }
      throw new Error(`Jupiter swap builder error: ${error.message}`);
    }
  },

  deserializeTransaction(swapTransactionBase64: string): VersionedTransaction {
    const swapTransactionBuf = Buffer.from(swapTransactionBase64, 'base64');
    return VersionedTransaction.deserialize(swapTransactionBuf);
  }
};
