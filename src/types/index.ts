export type IntentType = 'transfer' | 'swap' | 'balance' | 'stake' | 'unknown';

export interface ParsedAction {
    type: IntentType;
    amount?: number;
    useMax?: boolean;
    token?: string;
    sourceToken?: string;
    destinationToken?: string;
    recipient?: string;
    message?: string;
}

export interface ParsedIntent {
    actions: ParsedAction[];
    rawResponse?: string;
}

export interface SimulationResult {
    success: boolean;
    message: string;
    fee?: number;
    transactionBase64?: string;
    logs?: string[];
}

export interface AgentMessage {
    id: string;
    role: 'user' | 'agent';
    content: string;
    parsedIntent?: ParsedIntent;
    simulateResult?: SimulationResult;
    timestamp: number;
}
