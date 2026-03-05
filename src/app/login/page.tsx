'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Mail, Phone, ShieldCheck, Zap, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        teamName: '',
        member1: { name: '', email: '', contact: '' } as { name: string; email: string; contact: string },
        member2: { name: '', email: '', contact: '' } as { name: string; email: string; contact: string },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await res.json();
            if (!result.success) throw new Error(result.message);
            sessionStorage.setItem('teamInfo', JSON.stringify(result.team));
            router.push('/instructions');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const updateMember = (idx: 1 | 2, field: string, value: string) =>
        setFormData(p => ({
            ...p,
            [`member${idx}`]: { ...(p[`member${idx}` as 'member1' | 'member2']), [field]: value },
        }));

    const memberVal = (idx: 1 | 2) => formData[`member${idx}` as 'member1' | 'member2'];

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-8 bg-surface-50 font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-50 to-transparent opacity-60 pointer-events-none" />
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-200/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-accent-200/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-4xl px-2 animate-fade-up">
                {/* Brand Header */}
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-surface-200 shadow-sm mb-6">
                        <div className="p-1 rounded-full bg-brand-500">
                            <Zap className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-surface-500">Official Competition Node</span>
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-surface-900 mb-4 font-sans italic">
                        EN<span className="gradient-text">CHART</span>
                    </h1>
                    <p className="text-surface-500 text-lg sm:text-xl font-medium max-w-lg mx-auto leading-relaxed">
                        Precision Flowcharting Challenge 2024. <br />
                        Secure your entry below.
                    </p>
                </div>

                {/* Main Registration Card */}
                <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-surface-200/60 p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] grayscale">
                        <Users className="w-48 h-48 text-brand-500" />
                    </div>

                    <form onSubmit={handleSubmit} className="relative z-10">
                        {/* Team Section */}
                        <div className="max-w-md mx-auto mb-12">
                            <label className="input-label text-center mb-4">Team Name</label>
                            <div className="group transition-all">
                                <input
                                    type="text"
                                    required
                                    className="input-field h-16 text-center text-xl font-bold tracking-tight border-2 border-surface-200 focus:border-brand-500 rounded-2xl shadow-sm"
                                    placeholder="TEAM ALPHA-7"
                                    value={formData.teamName}
                                    onChange={e => setFormData({ ...formData, teamName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-8 mb-12">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-surface-200"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 whitespace-nowrap">Team Details</span>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-surface-200"></div>
                        </div>

                        {/* Members Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 mb-12">
                            {([1, 2] as const).map(idx => (
                                <div key={idx} className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-lg ${idx === 1
                                            ? 'bg-brand-500 text-white shadow-brand-500/20'
                                            : 'bg-surface-800 text-white shadow-surface-800/20'
                                            }`}>
                                            0{idx}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-surface-900 leading-none">Member Profile</h3>
                                            
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="group border-b border-surface-200 focus-within:border-brand-500 transition-colors py-2">
                                            <label className="text-[10px] font-bold text-surface-400 uppercase tracking-widest pl-1">Full Name</label>
                                            <input type="text" required className="w-full bg-transparent border-none outline-none text-base font-bold text-surface-900 p-1 placeholder:text-surface-200"
                                                placeholder="John Doe"
                                                value={memberVal(idx).name}
                                                onChange={e => updateMember(idx, 'name', e.target.value)} />
                                        </div>

                                        <div className="group border-b border-surface-200 focus-within:border-brand-500 transition-colors py-2">
                                            <label className="text-[10px] font-bold text-surface-400 uppercase tracking-widest pl-1">Email</label>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-surface-300" />
                                                <input type="email" required className="w-full bg-transparent border-none outline-none text-base font-bold text-surface-900 p-1 placeholder:text-surface-200"
                                                    placeholder="john@example.com"
                                                    value={memberVal(idx).email}
                                                    onChange={e => updateMember(idx, 'email', e.target.value)} />
                                            </div>
                                        </div>

                                        <div className="group border-b border-surface-200 focus-within:border-brand-500 transition-colors py-2">
                                            <label className="text-[10px] font-bold text-surface-400 uppercase tracking-widest pl-1">Phone Number</label>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-surface-300" />
                                                <input type="tel" required className="w-full bg-transparent border-none outline-none text-base font-bold text-surface-900 p-1 placeholder:text-surface-200"
                                                    placeholder="+91 XXXXX XXXXX"
                                                    value={memberVal(idx).contact}
                                                    onChange={e => updateMember(idx, 'contact', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl mb-10 text-sm flex items-center gap-3 animate-fade-in font-bold">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full h-16 sm:h-20 text-xl font-black group rounded-3xl"
                        >
                            {loading ? (
                                <><Loader2 className="w-6 h-6 animate-spin mr-3" /> System Initializing...</>
                            ) : (
                                <>
                                    <span>Register & Enter Sandbox</span>
                                    <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-2" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-12 flex items-center justify-center gap-6 opacity-30">
                    <ShieldCheck className="w-5 h-5" />
                    <Sparkles className="w-5 h-5" />
                    <Zap className="w-5 h-5" />
                </div>
                <p className="text-center text-surface-400 text-[10px] sm:text-xs mt-6 font-bold uppercase tracking-[0.3em]">
                    Encrypted Node Entry — 256-bit Logic Security
                </p>
            </div>
        </div>
    );
}
