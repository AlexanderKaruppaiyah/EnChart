'use client';

import { useEffect, useState, useRef } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

const TOTAL = 75 * 60; // 1h 15m in seconds

export default function Timer({ onTimeUp }: { onTimeUp: () => void }) {
    const [left, setLeft] = useState<number | null>(null); // null = loading
    const calledUp = useRef(false);

    useEffect(() => {
        // Try to get started_at from sessionStorage (stored when team clicked "Start Event")
        const startedAt = sessionStorage.getItem('startedAt');

        let startMs: number;
        if (startedAt) {
            startMs = new Date(startedAt).getTime();
        } else {
            // Fallback: use old-style numeric startTime (backward compat)
            const legacyStart = sessionStorage.getItem('startTime');
            startMs = legacyStart ? parseInt(legacyStart) : Date.now();
            if (!legacyStart) sessionStorage.setItem('startTime', startMs.toString());
        }

        const compute = () => {
            const elapsed = Math.floor((Date.now() - startMs) / 1000);
            return Math.max(0, TOTAL - elapsed);
        };

        // Set initial value
        setLeft(compute());

        const id = setInterval(() => {
            const remaining = compute();
            setLeft(remaining);
            if (remaining <= 0 && !calledUp.current) {
                calledUp.current = true;
                clearInterval(id);
                onTimeUp();
            }
        }, 1000);

        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (left === null) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-surface-200 shadow-sm min-w-[140px]">
                <Clock className="w-3.5 h-3.5 text-surface-400 animate-pulse" />
                <span className="text-sm font-mono font-black text-surface-400">00:00:00</span>
            </div>
        );
    }

    const h = Math.floor(left / 3600).toString().padStart(2, '0');
    const m = Math.floor((left % 3600) / 60).toString().padStart(2, '0');
    const s = (left % 60).toString().padStart(2, '0');

    const pct = (left / TOTAL) * 100;
    const isLow = left < 10 * 60;     // < 10 min
    const isCritical = left < 2 * 60; // < 2 min

    return (
        <div className={`flex flex-col gap-1.5 min-w-[160px] px-4 py-2.5 rounded-2xl bg-white border transition-all shadow-sm
            ${isCritical ? 'border-red-300 bg-red-50/60 shadow-red-100' : isLow ? 'border-amber-200 bg-amber-50/40' : 'border-surface-200'}`}>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${isCritical ? 'bg-red-100' : isLow ? 'bg-amber-100' : 'bg-brand-50'}`}>
                        {isCritical
                            ? <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                            : <Clock className={`w-3.5 h-3.5 ${isLow ? 'text-amber-600' : 'text-brand-600'}`} />
                        }
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-surface-400 leading-none mb-0.5">Time Left</p>
                        <p className={`text-sm font-mono font-black tabular-nums leading-none
                            ${isCritical ? 'text-red-600 animate-pulse' : isLow ? 'text-amber-600' : 'text-surface-900'}`}>
                            {h}:{m}:{s}
                        </p>
                    </div>
                </div>
            </div>
            <div className="h-1.5 w-full bg-surface-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000
                        ${isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-brand-500'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
