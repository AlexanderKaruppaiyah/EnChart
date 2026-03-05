'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Timer from '@/components/Timer';
import FlowchartEditor from '@/components/FlowchartEditor';
import {
    Users, ChevronRight, ChevronLeft, Send,
    CheckCircle2, AlertCircle, Loader2, BookOpen, Lightbulb,
    LayoutDashboard, Database, X, Trophy, Clock, AlertTriangle
} from 'lucide-react';
import { toPng } from 'html-to-image';

interface Question {
    id: number;
    title: string;
    description: string;
    explanation: string;
}

interface TeamInfo {
    id: string;
    name: string;
}

/* ── Custom Confirm Modal ── */
function ConfirmModal({
    open,
    title,
    message,
    confirmLabel,
    confirmClass,
    onConfirm,
    onCancel,
}: {
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    confirmClass?: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm"
                onClick={onCancel}
            />
            <div className="relative bg-white rounded-[2rem] border border-surface-200 shadow-2xl p-8 max-w-md w-full animate-fade-up">
                <button
                    onClick={onCancel}
                    className="absolute top-5 right-5 p-2 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-all"
                >
                    <X className="w-4 h-4" />
                </button>
                <div className="mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-black text-surface-900 mb-2">{title}</h3>
                    <p className="text-surface-500 font-medium leading-relaxed text-sm">{message}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-2xl border-2 border-surface-200 text-surface-600 font-black text-sm hover:bg-surface-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 rounded-2xl font-black text-sm text-white transition-all ${confirmClass || 'bg-brand-500 hover:bg-brand-600 shadow-lg shadow-brand-500/20'}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Finish / Time-Up Overlay ── */
function FinishOverlay({
    teamName,
    reason,
    subCount,
    totalCount,
    onExit,
}: {
    teamName: string;
    reason: 'timesup' | 'manual';
    subCount: number;
    totalCount: number;
    onExit: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-md" />
            <div className="relative bg-white rounded-[3rem] border border-surface-200 shadow-2xl p-10 sm:p-14 max-w-lg w-full text-center animate-fade-up">
                {/* Icon */}
                <div className="relative inline-flex mb-8">
                    <div className="absolute inset-0 bg-brand-200 rounded-full blur-3xl opacity-30 animate-pulse" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-brand-50 to-white border border-brand-100 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-brand-500/10 rotate-3">
                        {reason === 'timesup'
                            ? <Clock className="w-12 h-12 text-amber-500" />
                            : <Trophy className="w-12 h-12 text-brand-600" />
                        }
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                </div>

                {/* Badge */}
                <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border
                    ${reason === 'timesup' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-brand-50 border-brand-100 text-brand-700'}`}>
                    {reason === 'timesup' ? '⏰ Time\'s Up!' : '✅ Test Finished'}
                </div>

                <h2 className="text-4xl sm:text-5xl font-black text-surface-900 tracking-tighter mb-3 italic leading-none">
                    {reason === 'timesup' ? 'Time Over,' : 'Well Done,'}
                    <br />
                    <span className="gradient-text">{teamName}</span>
                </h2>

                <p className="text-surface-500 font-medium text-base leading-relaxed mb-8">
                    {reason === 'timesup'
                        ? 'Your 75-minute session has ended. All your submitted answers have been recorded.'
                        : 'You have ended the test. All your submitted answers have been recorded.'}
                </p>

                {/* Score */}
                <div className="flex items-center justify-center gap-6 mb-8 py-6 border-t border-b border-surface-100">
                    <div className="text-center">
                        <p className="text-5xl font-black text-surface-900 tabular-nums">{subCount}</p>
                        <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mt-1">Submitted</p>
                    </div>
                    <div className="text-surface-200 text-3xl font-light">/</div>
                    <div className="text-center">
                        <p className="text-5xl font-black text-surface-300 tabular-nums">{totalCount}</p>
                        <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mt-1">Total</p>
                    </div>
                </div>

                <button
                    onClick={onExit}
                    className="btn-primary w-full h-16 text-lg font-black italic rounded-2xl shadow-2xl shadow-brand-500/20"
                >
                    Exit & View Summary
                </button>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [submissions, setSubmissions] = useState<Record<number, boolean>>({});
    const [submitting, setSubmitting] = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(true);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    // Custom modal state
    const [modal, setModal] = useState<{ type: 'finalize' | 'exit' } | null>(null);

    // Finish overlay
    const [finish, setFinish] = useState<{ reason: 'timesup' | 'manual' } | null>(null);

    useEffect(() => {
        const info = sessionStorage.getItem('teamInfo');
        if (!info) { router.push('/login'); return; }

        const fetchState = async (tid: string) => {
            try {
                const [qRes, sRes] = await Promise.all([
                    fetch('/api/questions'),
                    fetch(`/api/submissions?teamId=${tid}`),
                ]);
                const qJson = await qRes.json();
                const sJson = await sRes.json();

                setQuestions(qJson.questions || []);
                if (sJson.submissions) {
                    const subMap: Record<number, boolean> = {};
                    sJson.submissions.forEach((id: number) => subMap[id] = true);
                    setSubmissions(subMap);
                }
            } catch (err) {
                console.error('Error fetching state:', err);
                showToast('Failed to load dashboard', 'error');
            } finally {
                setLoadingQuestions(false);
            }
        };

        const loadedTeam = JSON.parse(info);
        setTeamInfo(loadedTeam);
        fetchState(loadedTeam.id);
    }, [router]);

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleTimeUp = useCallback(() => {
        setFinish({ reason: 'timesup' });
    }, []);

    const handleFinalizeConfirm = () => {
        setModal(null);
        setFinish({ reason: 'manual' });
    };

    const handleExitConfirm = () => {
        setModal(null);
        setFinish({ reason: 'manual' });
    };

    const handleFinishExit = () => {
        sessionStorage.clear();
        router.push('/submission-summary');
    };

    const handleSubmit = async () => {
        if (!teamInfo || submitting || questions.length === 0) return;
        setSubmitting(true);
        const q = questions[currentIdx];

        try {
            const editorEl = document.querySelector('.react-flow') as HTMLElement;
            if (!editorEl) throw new Error('Canvas not found');

            const dataUrl = await toPng(editorEl, { backgroundColor: '#ffffff', pixelRatio: 2 });

            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamId: teamInfo.id, questionId: q.id, imageData: dataUrl }),
            });
            const uploadData = await res.json();

            if (!uploadData.success) {
                throw new Error(uploadData.message || 'Submission failed');
            }

            setSubmissions(p => ({ ...p, [q.id]: true }));
            showToast('Answer submitted successfully!', 'success');
        } catch (err) {
            console.error('Submission error:', err);
            showToast(err instanceof Error ? err.message : 'Submission failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (!teamInfo) return null;
    if (loadingQuestions) return (
        <div className="flex h-screen items-center justify-center bg-surface-50">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-brand-500" />
                    <div className="absolute inset-0 blur-xl bg-brand-500/20 animate-pulse" />
                </div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-surface-400">Loading Questions…</p>
            </div>
        </div>
    );

    const q = questions[currentIdx] || { id: 0, title: 'No Title', description: 'No description available.', explanation: '' };
    const allSubmitted = questions.length > 0 && Object.keys(submissions).length === questions.length;
    const subCount = Object.keys(submissions).length;

    return (
        <div className="flex h-screen bg-surface-50 overflow-hidden font-sans">

            {/* ── Finish Overlay ── */}
            {finish && (
                <FinishOverlay
                    teamName={teamInfo.name}
                    reason={finish.reason}
                    subCount={subCount}
                    totalCount={questions.length}
                    onExit={handleFinishExit}
                />
            )}

            {/* ── Confirm Modals ── */}
            <ConfirmModal
                open={modal?.type === 'finalize'}
                title="Finish & Submit All?"
                message="This will end your test session. All submitted answers will be locked. You cannot go back to edit after this."
                confirmLabel="Yes, Finish Test"
                confirmClass="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                onConfirm={handleFinalizeConfirm}
                onCancel={() => setModal(null)}
            />
            <ConfirmModal
                open={modal?.type === 'exit'}
                title="Exit Test Early?"
                message="Are you sure you want to exit? This will end your session even if you haven't submitted all answers."
                confirmLabel="Yes, Exit Test"
                confirmClass="bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
                onConfirm={handleExitConfirm}
                onCancel={() => setModal(null)}
            />

            {/* ── Toast Overlay ── */}
            {toast && (
                <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-fade-up
                    ${toast.type === 'success'
                        ? 'bg-brand-50/90 border-brand-200 text-brand-800'
                        : 'bg-red-50/90 border-red-200 text-red-800'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-bold text-sm">{toast.msg}</span>
                </div>
            )}

            {/* ── Sidebar ── */}
            <aside className="w-20 lg:w-72 bg-white border-r border-surface-200 flex flex-col shrink-0 relative z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <div className="p-8 hidden lg:block">
                    <h1 className="text-2xl font-black italic tracking-tighter text-surface-900 leading-none">
                        EN<span className="gradient-text">CHART</span>
                    </h1>
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.3em] mt-2">Flowchart Competition</p>
                </div>

                <div className="flex-1 flex flex-col px-3 lg:px-6 py-4 overflow-y-auto">
                    <div className="mb-6 hidden lg:block">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-surface-400">Progress</p>
                            <span className="text-xs font-black text-brand-600 tabular-nums">{subCount}/{questions.length}</span>
                        </div>
                        <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-brand-500 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(20,184,166,0.5)]"
                                style={{ width: `${questions.length ? (subCount / questions.length) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    <nav className="space-y-1.5">
                        {questions.map((qu, i) => {
                            const done = submissions[qu.id];
                            const active = i === currentIdx;
                            return (
                                <button
                                    key={qu.id}
                                    onClick={() => setCurrentIdx(i)}
                                    className={`w-full group flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-200 border
                                        ${active
                                            ? 'bg-brand-500 border-brand-400 text-white shadow-lg shadow-brand-500/20 scale-[1.02]'
                                            : 'bg-white border-transparent hover:border-surface-200 text-surface-500 hover:text-surface-900'}`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-transform group-hover:scale-110
                                        ${done
                                            ? active ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                                            : active ? 'bg-white/20 text-white' : 'bg-surface-100 text-surface-400 border border-surface-200'}`}>
                                        {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                                    </div>
                                    <span className="text-sm font-bold truncate hidden lg:block">{qu.title}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 lg:p-6 border-t border-surface-100 space-y-3">
                    {allSubmitted && (
                        <button
                            onClick={() => setModal({ type: 'finalize' })}
                            className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/20"
                        >
                            <Send className="w-4 h-4" />
                            Finish Test
                        </button>
                    )}
                    <button
                        onClick={() => setModal({ type: 'exit' })}
                        className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 bg-surface-100 text-surface-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Exit Test
                    </button>
                    <div className="flex items-center gap-3 px-2 pt-1">
                        <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center border border-brand-100 shrink-0">
                            <Users className="w-4 h-4 text-brand-600" />
                        </div>
                        <div className="min-w-0 hidden lg:block">
                            <p className="text-[10px] font-black text-surface-400 uppercase tracking-tighter truncate">Team</p>
                            <p className="text-sm font-black text-surface-900 truncate leading-none">{teamInfo.name}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Main Canvas Area ── */}
            <main className="flex-1 flex flex-col relative z-10 bg-surface-50 overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-3 border-b border-surface-200 bg-white/60 backdrop-blur-md sticky top-0 z-40 shrink-0">
                    <div className="flex flex-col">
                        <h2 className="text-base font-black text-surface-900 tracking-tight leading-none mb-0.5">
                            {q.title || 'Sandbox'}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Question {currentIdx + 1} of {questions.length}</span>
                        </div>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                        <Timer onTimeUp={handleTimeUp} />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-100 border border-surface-200">
                            <Database className="w-3 h-3 text-surface-500" />
                            <span className="text-xs font-bold text-surface-600">ID: {String(teamInfo.id ?? '').slice(0, 6)}</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable content area */}
                <div className="flex-1 flex flex-col overflow-y-auto">

                    {/* Question Card */}
                    <div className="px-6 pt-5 pb-0 shrink-0">
                        <div className="bg-white rounded-3xl border border-surface-200 p-6 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12">
                                <BookOpen className="w-28 h-28 text-brand-600" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="bg-brand-50 text-brand-600 text-[10px] font-black px-3 py-1 rounded-full border border-brand-100 tracking-widest uppercase">
                                        Question {currentIdx + 1}
                                    </span>
                                    {submissions[q.id] && (
                                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-100 inline-flex items-center gap-1.5 uppercase tracking-widest">
                                            <CheckCircle2 className="w-3 h-3" /> Submitted
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-2xl font-black text-surface-900 mb-3 tracking-tighter">
                                    {q.title}
                                </h2>

                                <p className="text-surface-600 text-sm leading-relaxed font-medium mb-4">
                                    {q.description && q.description.length > 5
                                        ? q.description
                                        : 'No description available for this question.'}
                                </p>

                                {q.explanation && (
                                    <details className="group border-t border-surface-100 pt-4">
                                        <summary className="flex items-center gap-2 cursor-pointer text-xs font-black uppercase tracking-widest text-brand-600 select-none hover:text-brand-700 transition-colors">
                                            <Lightbulb className="w-4 h-4" />
                                            <span>Hint / Approach</span>
                                            <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                                        </summary>
                                        <div className="mt-3 pl-6 border-l-2 border-brand-100">
                                            <p className="text-sm font-medium text-surface-500 leading-relaxed">
                                                {q.explanation}
                                            </p>
                                        </div>
                                    </details>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Flowchart Editor */}
                    <div className="flex-1 mx-6 mt-4 mb-2 min-h-[420px] bg-white rounded-3xl border border-surface-200 overflow-hidden shadow-sm flex flex-col">
                        <FlowchartEditor questionId={q.id} />
                    </div>

                    {/* Bottom Navigation */}
                    <div className="flex items-center justify-between gap-4 px-6 py-4 shrink-0 bg-surface-50 border-t border-surface-200">
                        <button
                            disabled={currentIdx === 0}
                            onClick={() => setCurrentIdx(p => p - 1)}
                            className="btn-secondary h-12 px-6 border-2 text-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Previous</span>
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting || questions.length === 0}
                            className="btn-primary h-14 min-w-[220px] text-base shadow-brand-500/20"
                        >
                            {submitting ? (
                                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting…</>
                            ) : (
                                <><Send className="w-4 h-4 mr-2" /> {submissions[q.id] ? 'Resubmit Answer' : 'Submit Answer'}</>
                            )}
                        </button>

                        {currentIdx === questions.length - 1 ? (
                            <button
                                onClick={() => setModal({ type: 'finalize' })}
                                className="btn-secondary h-12 px-6 border-2 text-sm bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Finish Test</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentIdx(p => p + 1)}
                                className="btn-secondary h-12 px-6 border-2 text-sm"
                            >
                                <span>Next</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
