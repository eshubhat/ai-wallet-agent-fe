export type IntentType = 'transfer' | 'swap' | 'balance' | 'stake' | 'unknown';

export interface ScheduleDetails {
    type: 'time' | 'price_gte' | 'price_lte' | 'idle';
    isoDate?: string;
    token?: string;
    priceUsd?: number;
    hours?: number;
}

export interface ParsedAction {
    type: IntentType;
    amount?: number;
    useMax?: boolean;
    token?: string;
    sourceToken?: string;
    destinationToken?: string;
    recipient?: string;
    message?: string;
    schedule?: ScheduleDetails;
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

export interface ScheduledTask {
    id: string;
    userId: string;
    status: 'pending' | 'triggered' | 'dismissed' | 'cancelled';
    actionType: string;
    actionPayload: any;
    triggerType: string;
    triggerAt?: string;
    triggerPrice?: number;
    triggerToken?: string;
    idleHours?: number;
    label: string;
    createdAt: string;
}
