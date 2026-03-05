'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    BookOpen, Clock, Shield, Zap, ArrowRight,
    CheckCircle2, AlertTriangle, Users, FileText,
    MousePointer2, Send, Info
} from 'lucide-react';

interface TeamInfo {
    id: string | number;
    name: string;
}

export default function InstructionsPage() {
    const router = useRouter();
    const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
    const [starting, setStarting] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const info = sessionStorage.getItem('teamInfo');
        if (!info) {
            router.push('/login');
        } else {
            setTeamInfo(JSON.parse(info));
        }
    }, [router]);

    // Countdown after start
    useEffect(() => {
        if (!starting) return;
        if (countdown <= 0) {
            router.push('/dashboard');
            return;
        }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [starting, countdown, router]);

    const handleStartEvent = async () => {
        if (!teamInfo || loading) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamId: teamInfo.id }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message || 'Failed to start event');
            // Store started_at in sessionStorage so Timer can use it immediately
            sessionStorage.setItem('startedAt', data.started_at);
            setStarting(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not start event. Try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!teamInfo) return null;

    const rules = [
        {
            icon: Clock,
            title: '75-Minute Timer',
            desc: 'Each team gets exactly 1 hour 15 minutes. Timer starts when you click "Start Event" and is unique to your team.',
            color: 'text-brand-600',
            bg: 'bg-brand-50',
            border: 'border-brand-100',
        },
        {
            icon: FileText,
            title: 'Multiple Questions',
            desc: 'You will be given several flowchart problems. Read each question carefully before drawing your flowchart.',
            color: 'text-sky-600',
            bg: 'bg-sky-50',
            border: 'border-sky-100',
        },
        {
            icon: MousePointer2,
            title: 'Drag & Drop Editor',
            desc: 'Use the shape palette on the left to drag nodes onto the canvas. Double-click any node to rename it.',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            border: 'border-purple-100',
        },
        {
            icon: Send,
            title: 'Submit Each Answer',
            desc: 'Click "Submit" for each question to save your flowchart. You can re-submit to update your answer.',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
        },
        {
            icon: Shield,
            title: 'No External Help',
            desc: 'This is an individual team effort. Use of AI tools, internet references, or external communication is not allowed.',
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-100',
        },
        {
            icon: Users,
            title: 'Team Collaboration',
            desc: 'Both team members should collaborate on each flowchart. Discuss the logic before finalizing your answer.',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
        },
    ];

    return (
        <div className="min-h-screen bg-surface-50 font-sans text-surface-900 pb-24">

            {/* Hero Header */}
            <div className="relative overflow-hidden bg-white border-b border-surface-200 pt-16 pb-24 px-6">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(20,184,166,0.1), transparent)' }} />
                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 mb-8">
                        <Zap className="w-3.5 h-3.5 text-brand-600 fill-brand-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-700">EnChart — Flowchart Competition 2024</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter mb-6">
                        EVENT <span className="gradient-text">INSTRUCTIONS</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-surface-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        Welcome, <span className="text-surface-900 font-bold underline decoration-brand-500 decoration-2 underline-offset-4">{teamInfo.name}</span>.{' '}
                        Read these instructions carefully before starting the event.
                    </p>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* ── Left: Instructions ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* About the Event */}
                        <div className="bg-white/80 backdrop-blur-xl border border-surface-200 rounded-[2rem] p-8 shadow-xl shadow-surface-200/50">
                            <h2 className="text-xl font-black italic tracking-tight text-surface-900 mb-6 flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-brand-500" />
                                About the Event
                            </h2>
                            <p className="text-surface-600 font-medium leading-relaxed mb-4">
                                {/* CHANGE THIS — Replace with your event description */}
                                <strong className="text-surface-900">EnChart</strong> is a flowchart design competition where teams solve real-world algorithmic and process problems by drawing clear, logical flowcharts. You will be evaluated on the accuracy, clarity, and completeness of your flowcharts.
                            </p>
                            <p className="text-surface-600 font-medium leading-relaxed">
                                {/* CHANGE THIS — Replace with evaluation criteria */}
                                Each problem will provide a scenario. Your task is to model the correct logical flow using the provided shapes. Ensure your flowcharts have proper Start and End nodes, correct decision branches, and clearly labelled steps.
                            </p>
                        </div>

                        {/* Rules Grid */}
                        <div className="bg-white/80 backdrop-blur-xl border border-surface-200 rounded-[2rem] p-8 shadow-xl shadow-surface-200/50">
                            <h2 className="text-xl font-black italic tracking-tight text-surface-900 mb-6 flex items-center gap-3">
                                <Shield className="w-5 h-5 text-brand-500" />
                                Rules & Guidelines
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {rules.map((r, i) => (
                                    <div key={i} className={`flex gap-4 p-4 rounded-2xl ${r.bg} border ${r.border}`}>
                                        <div className={`w-9 h-9 rounded-xl ${r.bg} border ${r.border} flex items-center justify-center shrink-0`}>
                                            <r.icon className={`w-4 h-4 ${r.color}`} />
                                        </div>
                                        <div>
                                            <p className={`text-xs font-black ${r.color} mb-1`}>{r.title}</p>
                                            <p className="text-[11px] font-medium text-surface-500 leading-relaxed">{r.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Important Notice */}
                        <div className="flex gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-200">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-black text-amber-900 mb-1">Important Notice</p>
                                <p className="text-xs font-medium text-amber-800 leading-relaxed">
                                    {/* CHANGE THIS — Replace with any important event-specific notes */}
                                    Once you click <strong>"Start Event"</strong>, the 75-minute timer begins immediately and <strong>cannot be paused or reset</strong>. Make sure both team members are present and ready before starting. Disconnecting or refreshing the page will not stop the timer.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Start Panel ── */}
                    <div className="space-y-5 lg:sticky lg:top-8">

                        {/* Team Card */}
                        <div className="bg-white border border-surface-200 rounded-[2rem] p-6 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 mb-4">Your Team</p>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                                    <Users className="w-4 h-4 text-brand-600" />
                                </div>
                                <div>
                                    <p className="text-base font-black text-surface-900 leading-none">{teamInfo.name}</p>
                                    <p className="text-[10px] font-bold text-surface-400 mt-0.5 uppercase tracking-wider">Registered & Ready</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-50 border border-surface-100">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-surface-500">
                                    ID: {String(teamInfo.id ?? '').slice(0, 8)}
                                </span>
                            </div>
                        </div>

                        {/* Timer Info */}
                        <div className="bg-white border border-surface-200 rounded-[2rem] p-6 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 mb-4">Time Allocation</p>
                            <div className="text-center py-2">
                                <p className="text-5xl font-black text-surface-900 tabular-nums">1:15</p>
                                <p className="text-xs font-black text-surface-400 uppercase tracking-widest mt-1">Hours : Minutes</p>
                            </div>
                            <div className="mt-4 flex items-start gap-2 text-[10px] text-surface-400 font-bold">
                                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>Timer is unique to your team. It starts the moment you click "Start Event".</span>
                            </div>
                        </div>

                        {/* Start Button / Countdown */}
                        {!starting ? (
                            <div className="space-y-3">
                                {error && (
                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-bold">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </div>
                                )}
                                <button
                                    id="start-event-btn"
                                    onClick={handleStartEvent}
                                    disabled={loading}
                                    className="btn-primary w-full h-20 rounded-[2rem] group relative overflow-hidden flex flex-col items-center justify-center gap-1 shadow-2xl shadow-brand-500/30 disabled:opacity-70"
                                >
                                    {loading ? (
                                        <>
                                            <span className="text-lg font-black italic tracking-tighter">Initializing…</span>
                                            <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden mt-1">
                                                <div className="h-full bg-white/60 rounded-full animate-pulse w-2/3" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xl font-black italic tracking-tighter">Start Event</span>
                                            <div className="flex items-center gap-2 opacity-60">
                                                <span className="text-[10px] font-black uppercase tracking-widest">Click to Begin Timer</span>
                                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-[10px] font-bold text-surface-400 uppercase tracking-widest">
                                    I have read all instructions
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-brand-500 rounded-[2rem] p-8 shadow-2xl shadow-brand-500/20 flex flex-col items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center text-white text-3xl font-black animate-pulse shadow-xl shadow-brand-500/30">
                                    {countdown > 0 ? countdown : '🚀'}
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-black text-brand-700 uppercase tracking-[0.2em]">
                                        {countdown > 0 ? 'Get Ready…' : 'Launching!'}
                                    </p>
                                    <p className="text-[10px] font-bold text-surface-400 mt-1">Timer has started for your team</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
