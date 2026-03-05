'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, CheckCircle2, Sparkles, LogOut, ShieldCheck, Zap } from 'lucide-react';

interface TeamInfo {
    id: string;
    name: string;
    members: Array<{ name: string; email: string; contact?: string }>;
}

export default function SubmissionSummaryPage() {
    const router = useRouter();
    const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
    const [subCount, setSubCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const info = sessionStorage.getItem('teamInfo');
        if (!info) { router.push('/login'); return; }

        const loadedTeam = JSON.parse(info) as TeamInfo;
        setTimeout(() => setTeamInfo(loadedTeam), 0);

        const fetchData = async () => {
            try {
                const [qRes, sRes] = await Promise.all([
                    fetch('/api/questions'),
                    fetch(`/api/submissions?teamId=${loadedTeam.id}`)
                ]);
                const qJson = await qRes.json();
                const sJson = await sRes.json();

                setTotalCount(qJson.questions?.length || 0);
                if (sJson.submissions) setSubCount(sJson.submissions.length);
            } catch (err) {
                console.error('Fetch error:', err);
            }
        };

        fetchData();
        setTimeout(() => setVisible(true), 150);
    }, [router]);

    const handleExit = () => {
        sessionStorage.clear();
        router.push('/login');
    };

    if (!teamInfo) return null;

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-surface-50 relative overflow-hidden font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-50 to-transparent opacity-60 pointer-events-none" />
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-200/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-accent-200/10 blur-[120px] rounded-full pointer-events-none" />

            <div className={`w-full max-w-3xl relative z-10 transition-all duration-1000 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="relative inline-flex mb-8">
                        <div className="absolute inset-0 bg-brand-200 rounded-full blur-3xl opacity-30 animate-pulse" />
                        <div className="relative w-28 h-28 bg-white border border-surface-200 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-brand-500/10 rotate-3 transition-transform hover:rotate-0">
                            <Trophy className="w-14 h-14 text-brand-600" />
                        </div>
                        <div className="absolute -top-3 -right-3 w-12 h-12 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
                        <Zap className="w-3.5 h-3.5 text-brand-600 fill-brand-600" />
                        <span>Transmission Complete</span>
                    </div>

                    <h1 className="text-5xl sm:text-7xl font-black text-surface-900 tracking-tighter mb-4 leading-[0.8] italic">
                        WELL DONE, <br />
                        <span className="gradient-text">{teamInfo.name}</span>
                    </h1>
                    <p className="text-surface-500 text-xl font-medium mt-6">Your operational logs have been securely archived.</p>
                </div>

                {/* Performance Dashboard */}
                <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-surface-200 p-10 sm:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] mb-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity grayscale">
                        <ShieldCheck className="w-64 h-64 text-brand-700" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 relative z-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-surface-400 mb-4">Submission Yield</p>
                            <div className="flex items-center gap-4">
                                <div className="text-7xl font-black text-surface-900 tracking-tighter tabular-nums">{subCount}</div>
                                <div className="text-surface-200 transform -rotate-12 text-4xl font-light">/</div>
                                <div className="text-3xl font-black text-surface-300 tabular-nums">{totalCount || 10}</div>
                            </div>
                            <div className="mt-6 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-sm font-bold text-surface-600 italic">Sync Successful</span>
                            </div>
                        </div>

                        <div className="md:border-l border-surface-100 md:pl-12">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-surface-400 mb-4">Operational Status</p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 py-2.5 px-5 bg-brand-50 rounded-2xl border border-brand-100 w-fit">
                                    <Sparkles className="w-4 h-4 text-brand-600" />
                                    <span className="text-xs font-black text-brand-700 uppercase tracking-widest">Awaiting Validation</span>
                                </div>
                                <p className="text-sm font-semibold text-surface-500 leading-relaxed italic">
                                    Final assessment is scheduled. Verify results on the official leaderboards soon.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-surface-100 to-transparent mb-10" />

                    {/* Roster Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                        {teamInfo.members.map((member, i) => {
                            const idx = i + 1;
                            if (!member) return null;
                            return (
                                <div key={idx} className="flex items-center gap-4 p-5 bg-surface-50/50 rounded-2xl border border-surface-100 transition-colors hover:bg-white hover:border-brand-200">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-lg ${idx === 1 ? 'bg-brand-500 text-white shadow-brand-500/10' : 'bg-surface-800 text-white shadow-surface-800/10'}`}>
                                        0{idx}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-surface-900 truncate mb-0.5 leading-none">{member.name || 'Anonymous'}</p>
                                        <p className="text-[9px] text-surface-400 font-bold uppercase tracking-widest truncate">{member.email || 'no-email@node.com'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Final Actions */}
                <div className="flex flex-col gap-6 text-center">
                    <button
                        onClick={handleExit}
                        className="btn-primary w-full h-20 text-xl font-black italic tracking-tight group rounded-[2rem] shadow-2xl shadow-brand-500/20"
                    >
                        <div className="flex items-center justify-center gap-3">
                            <LogOut className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
                            <span>TERMINATE SESSION</span>
                        </div>
                    </button>
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.4em] opacity-40">
                        Node Disconnect Imminent — Logic Locked
                    </p>
                </div>
            </div>
        </div>
    );
}
