import { type AgentMessage } from '../../types';
import { SimulationPreview } from '../transaction/SimulationPreview';

interface MessageBubbleProps {
    message: AgentMessage;
    isPendingTx: boolean;
    onConfirmTx: () => void;
    onCancelTx: () => void;
}

export function MessageBubble({ message, isPendingTx, onConfirmTx, onCancelTx }: MessageBubbleProps) {
    const isAgent = message.role === 'agent';

    return (
        <div className={`message-row ${message.role}`}>
            <div className={`message-bubble ${message.role}`}>
                <p>{message.content}</p>

                {isAgent && message.simulateResult && (
                    <SimulationPreview
                        result={message.simulateResult}
                        isPending={isPendingTx}
                        onConfirm={onConfirmTx}
                        onCancel={onCancelTx}
                    />
                )}
            </div>
        </div>
    );
}
