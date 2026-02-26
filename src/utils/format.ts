export function shortenAddress(address: string, chars = 4): string {
    if (!address) return '';
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatAmount(amount: number, decimals = 4): string {
    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: decimals
    }).format(amount);
}
