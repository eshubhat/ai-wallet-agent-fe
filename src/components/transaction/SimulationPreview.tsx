import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { type SimulationResult } from '../../types';
import { formatAmount } from '../../utils/format';

interface SimulationPreviewProps {
    result: SimulationResult;
    isPending: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function SimulationPreview({ result, isPending, onConfirm, onCancel }: SimulationPreviewProps) {
    if (!result.success) {
        return (
            <div className="simulation-preview" style={{ border: '1px solid var(--error)' }}>
                <div className="sim-header" style={{ color: 'var(--error)' }}>
                    <ShieldAlert size={18} />
                    <span>Simulation Failed</span>
                </div>
                <div className="sim-details">
                    <p>{result.message}</p>
                    {result.logs && result.logs.length > 0 && (
                        <div className="sim-logs" style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace', overflowX: 'auto' }}>
                            {result.logs.map((log, i) => (
                                <div key={i} style={{ color: log.toLowerCase().includes('err') || log.toLowerCase().includes('fail') ? 'var(--error)' : 'var(--text-secondary)' }}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="simulation-preview">
            <div className="sim-header" style={{ color: 'var(--success)' }}>
                <CheckCircle2 size={18} />
                <span>Simulation Successful</span>
            </div>

            <div className="sim-details">
                <div className="sim-detail-item">
                    <span>Network Fee est.</span>
                    <span>{result.fee ? formatAmount(result.fee, 6) : '< 0.00001'} SOL</span>
                </div>
                <div className="sim-detail-item">
                    <span>Status</span>
                    <span style={{ color: 'var(--success)' }}>Ready to execute</span>
                </div>
            </div>

            {result.logs && result.logs.length > 0 && (
                <div className="sim-logs" style={{ marginBottom: '1.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace', overflowX: 'auto', maxHeight: '200px', overflowY: 'auto' }}>
                    {result.logs.map((log, i) => (
                        <div key={i} style={{ color: log.toLowerCase().includes('err') || log.toLowerCase().includes('fail') ? 'var(--error)' : 'var(--text-secondary)' }}>
                            {log}
                        </div>
                    ))}
                </div>
            )}

            {isPending && (
                <div className="sim-actions">
                    <button className="btn-cancel" onClick={onCancel}>Cancel</button>
                    <button className="btn-confirm" onClick={onConfirm}>Confirm & Sign</button>
                </div>
            )}
        </div>
    );
}
