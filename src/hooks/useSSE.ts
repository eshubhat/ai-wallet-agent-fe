import { useEffect, useRef, useCallback } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const TOKEN_KEY = 'autofi_token';

type SSEEventHandler = (data: unknown) => void;

interface SSEOptions {
    /** Map of SSE event names → handler callbacks */
    onEvent: Record<string, SSEEventHandler>;
    /** Called when the `connected` handshake is received */
    onConnected?: () => void;
    /** Called when the EventSource errors or closes unexpectedly */
    onError?: (err: Event) => void;
    /** Whether to open the connection (set false when user is logged out) */
    enabled: boolean;
}

/**
 * useSSE — subscribes to the backend's Server-Sent Events stream.
 *
 * The browser's EventSource API:
 *  - Automatically reconnects after network drops (with exponential back-off)
 *  - Sends Authorization via ?token= query param (headers not supported)
 *
 * Usage:
 *   useSSE({
 *     enabled: !!user,
 *     onEvent: {
 *       stakes_updated:      (data) => setStakes(prev => [data, ...prev.filter(s => s.id !== data.id)]),
 *       transaction_updated: (data) => setTxs(prev => [data, ...prev.filter(t => t.id !== data.id)]),
 *     },
 *   });
 */
export function useSSE({ onEvent, onConnected, onError, enabled }: SSEOptions) {
    const esRef = useRef<EventSource | null>(null);

    // Stable reference to callbacks so we never need to reconnect just because
    // a handler function identity changed.
    const onEventRef = useRef(onEvent);
    onEventRef.current = onEvent;
    const onConnectedRef = useRef(onConnected);
    onConnectedRef.current = onConnected;

    const connect = useCallback(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return;

        // Close any existing connection first
        esRef.current?.close();

        const url = `${BACKEND_URL}/api/events?token=${encodeURIComponent(token)}`;
        const es = new EventSource(url);
        esRef.current = es;

        // Handshake
        es.addEventListener('connected', () => {
            onConnectedRef.current?.();
        });

        // Wire up all caller-provided event handlers
        for (const [eventName] of Object.entries(onEventRef.current)) {
            es.addEventListener(eventName, (e: MessageEvent) => {
                try {
                    const parsed = JSON.parse(e.data);
                    onEventRef.current[eventName]?.(parsed);
                } catch {
                    console.error(`[SSE] Failed to parse event "${eventName}":`, e.data);
                }
            });
        }

        es.onerror = (err) => {
            console.warn('[SSE] Connection error — EventSource will auto-retry.', err);
            onError?.(err);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!enabled) {
            esRef.current?.close();
            esRef.current = null;
            return;
        }

        connect();

        return () => {
            esRef.current?.close();
            esRef.current = null;
        };
    }, [enabled, connect]);
}
