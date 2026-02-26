import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Zap, Target, Trophy, ArrowRight, Brain, MessageSquare, BarChart3, Shield, TrendingUp, UserPlus, PlayCircle, CheckCircle, Award, Home, Layers, Star, Play } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import TestimonialCard from '../components/TestimonialCard';
import GDGLogo from '../components/GDGLogo';

export default function Landing() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { scrollY } = useScroll();

    // Parallax hero effect
    const heroY = useTransform(scrollY, [0, 500], [0, 150]);
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    }, [isMobileMenuOpen]);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Testimonials', href: '#testimonials' },
    ];

    const testimonials = [
        {
            id: 1, name: 'Sarah Kim', role: 'Software Engineer', initials: 'SK',
            text: 'This platform completely transformed my interview skills. The AI feedback was incredibly detailed and helped me identify areas I never knew I needed to improve.',
            avatarGradient: 'from-indigo-500 to-purple-600', borderColor: 'indigo'
        },
        {
            id: 2, name: 'Michael Patel', role: 'Product Manager', initials: 'MP',
            text: 'I landed my dream job after just 2 weeks of practice! The adaptive difficulty kept me challenged and the analytics showed exactly where to focus my efforts.',
            avatarGradient: 'from-emerald-500 to-teal-600', borderColor: 'emerald'
        },
        {
            id: 3, name: 'Emily Chen', role: 'Data Scientist', initials: 'EC',
            text: 'The real-time feedback is a game-changer. It\'s like having a personal interview coach available 24/7. My confidence has skyrocketed!',
            avatarGradient: 'from-amber-400 to-orange-500', borderColor: 'amber'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] text-surface-900 pb-safe selection:bg-indigo-500/30 font-sans">

            {/* ── NAVBAR ── */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-surface-200/50 py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-300">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tight text-surface-900">JDAK</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <a key={link.name} href={link.href} className="text-sm font-bold text-surface-500 hover:text-surface-900 transition-colors">
                                    {link.name}
                                </a>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            <button onClick={() => navigate('/login')} className="text-sm font-bold text-surface-600 hover:text-surface-900 transition-colors px-4 py-2">
                                Sign In
                            </button>
                            <button onClick={() => navigate('/register')} className="bg-surface-900 hover:bg-black text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-surface-900/10 transition-all hover:scale-105">
                                Get Started
                            </button>
                        </div>

                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-surface-900 bg-surface-100 rounded-lg">
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden overflow-hidden bg-white border-b border-surface-200 px-4 pt-2 pb-6 absolute w-full top-full shadow-2xl"
                        >
                            <div className="flex flex-col gap-4">
                                {navLinks.map((link) => (
                                    <a key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-lg font-bold text-surface-600 bg-surface-50 rounded-xl">
                                        {link.name}
                                    </a>
                                ))}
                                <div className="h-px bg-surface-200 my-2" />
                                <button onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} className="px-4 py-3 text-lg font-bold text-surface-900">
                                    Sign In
                                </button>
                                <button onClick={() => { setIsMobileMenuOpen(false); navigate('/register'); }} className="bg-indigo-600 text-white text-lg font-bold px-4 py-3 rounded-xl shadow-lg shadow-indigo-600/20">
                                    Get Started
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ── HERO SECTION ── */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-4">
                <div className="absolute top-0 right-0 -mr-64 -mt-64 w-[800px] h-[800px] bg-gradient-to-bl from-indigo-100/50 via-purple-50/50 to-transparent blur-3xl rounded-full" />
                <div className="absolute top-40 left-0 -ml-64 w-[600px] h-[600px] bg-gradient-to-tr from-rose-50/50 to-transparent blur-3xl rounded-full" />

                <motion.div
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="max-w-5xl mx-auto text-center relative z-10"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-surface-200/60 shadow-sm mb-8"
                    >
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-surface-600">The Modern Interview Prep Platform</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-[5.5rem] font-black leading-[1.1] tracking-tight mb-8"
                    >
                        Master Interviews with <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            Elite AI Coaching
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-surface-500 mb-12 max-w-2xl mx-auto font-medium"
                    >
                        Elevate your career trajectory. Practice with ultra-realistic AI, get deep behavioral insights, and outshine the competition in high-stakes interviews.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button onClick={() => navigate('/register')} className="w-full sm:w-auto bg-surface-900 text-white hover:bg-black font-bold text-lg px-8 py-4 rounded-2xl shadow-xl shadow-surface-900/20 transition-all hover:scale-105 flex items-center justify-center gap-2">
                            Start Free Trial <ArrowRight className="w-5 h-5" />
                        </button>
                        <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto bg-white text-surface-900 border-2 border-surface-200 hover:border-surface-300 font-bold text-lg px-8 py-4 rounded-2xl transition-all hover:bg-surface-50 flex items-center justify-center gap-2">
                            <PlayCircle className="w-5 h-5" /> View Demo
                        </button>
                    </motion.div>

                    {/* Elite Stats Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
                    >
                        {[
                            { label: 'Success Rate', value: '96%', icon: Target, color: 'text-emerald-500' },
                            { label: 'Active Users', value: '25K+', icon: UserPlus, color: 'text-indigo-500' },
                            { label: 'Interviews Prep', value: '150K+', icon: Brain, color: 'text-purple-500' },
                            { label: 'Fortune 500 Placements', value: '4.5K', icon: Trophy, color: 'text-amber-500' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/60 backdrop-blur-md border border-surface-200/50 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                <stat.icon className={`w-6 h-6 mb-3 ${stat.color}`} />
                                <div className="text-3xl font-black text-surface-900 mb-1">{stat.value}</div>
                                <div className="text-xs font-bold text-surface-400 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* ── LOGOS ── */}
            <section className="py-12 bg-white border-y border-surface-100 overflow-hidden flex flex-col items-center justify-center">
                <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-8">Trusted by candidates moving to</p>
                <div className="flex gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700 w-full overflow-x-auto hide-scrollbar px-10 items-center justify-start md:justify-center">
                    {['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Tesla'].map(company => (
                        <div key={company} className="text-2xl font-black tracking-tighter shrink-0">{company}</div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="py-24 lg:py-32 px-4 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-surface-900 mb-6">Designed for Excellence</h2>
                    <p className="text-lg text-surface-500 font-medium">Bypass generic prep tools. Experience adaptive AI that pinpoints your weaknesses and sculpts your delivery into an executive-level performance.</p>
                </div>

                <div className="grid md:grid-cols-12 gap-6">
                    {/* BENTO LARGE */}
                    <div className="md:col-span-8 bg-surface-900 rounded-[2.5rem] p-10 lg:p-14 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                                <Brain className="w-7 h-7 text-indigo-300" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-4">Hyper-Realistic AI Modeling</h3>
                            <p className="text-surface-300 text-lg mb-8 max-w-md">Our engine analyzes your tone, cadence, and content—delivering real-time feedback that mimics the industry's toughest hiring managers.</p>
                            <div className="mt-auto relative w-full h-40 bg-[#161616] rounded-2xl border border-white/10 p-6 overflow-hidden">
                                {/* Decor element */}
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
                                <div className="relative z-10 flex flex-col gap-3">
                                    <div className="h-4 w-3/4 bg-white/10 rounded-full" />
                                    <div className="h-4 w-1/2 bg-white/10 rounded-full" />
                                    <div className="h-4 w-5/6 bg-indigo-500/30 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BENTO TALL */}
                    <div className="md:col-span-4 bg-white border border-surface-200/70 rounded-[2.5rem] p-10 lg:p-14 shadow-sm relative overflow-hidden flex flex-col">
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8">
                                <TrendingUp className="w-7 h-7 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-black text-surface-900 mb-4">Adaptive Rigor</h3>
                            <p className="text-surface-500 mb-8">The AI dynamically scales difficulty based on your success rate, ensuring you never hit a plateau.</p>

                            <div className="mt-auto space-y-4">
                                {['Junior', 'Mid-Level', 'Senior', 'Staff Engineer'].map((tier, i) => (
                                    <div key={tier} className="bg-surface-50 border border-surface-200 p-4 rounded-2xl flex items-center justify-between">
                                        <span className="font-bold text-surface-700 text-sm">{tier}</span>
                                        <div className="flex gap-1">
                                            {Array.from({ length: 4 }).map((_, j) => (
                                                <div key={j} className={`w-2 h-2 rounded-full ${j <= i ? 'bg-emerald-500' : 'bg-surface-200'}`} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* BENTO STANDARD 1 */}
                    <div className="md:col-span-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-[2.5rem] p-10 relative overflow-hidden">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6">
                            <MessageSquare className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h3 className="text-2xl font-black text-surface-900 mb-3">Live Interventions</h3>
                        <p className="text-surface-600">Receive precise adjustments on your pacing and filler words mid-interview, rapidly accelerating your polish.</p>
                    </div>

                    {/* BENTO STANDARD 2 */}
                    <div className="md:col-span-6 bg-white border border-surface-200/70 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
                        <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-6 text-rose-600">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-black text-surface-900 mb-3">Vault-Grade Privacy</h3>
                        <p className="text-surface-600">Your voice data and transcripts are fully encrypted. Practice in total confidence behind closed doors.</p>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="how-it-works" className="py-24 bg-surface-900 text-white overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-indigo-500/20 blur-[150px] pointer-events-none rounded-[100%]" />

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6">The Path to Dominance</h2>
                        <p className="text-surface-400 text-lg max-w-2xl mx-auto">Four strategic phases to completely overhaul your interview capabilities.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: '01', title: 'Initialize', desc: 'Securely register and define your target role, seniority level, and company domain.', icon: UserPlus },
                            { step: '02', title: 'Configure', desc: 'Select from hundreds of AI personas ranging from friendly HR to aggressive technical leads.', icon: Target },
                            { step: '03', title: 'Execute', desc: 'Engage in fluid, voice-interactive sessions with zero latency delays.', icon: Play },
                            { step: '04', title: 'Calibrate', desc: 'Review granular analytics on your logic, tone, and brevity. Iterate and improve.', icon: BarChart3 }
                        ].map((item, idx) => (
                            <div key={idx} className="relative group">
                                <div className="text-7xl font-black text-white/5 mb-6 group-hover:text-indigo-500/20 transition-colors">
                                    {item.step}
                                </div>
                                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                                <p className="text-surface-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-32 px-4">
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/20 blur-3xl rounded-full" />

                    <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8 relative z-10">Stop guessing.<br />Start succeeding.</h2>
                    <p className="text-lg md:text-xl text-indigo-100 mb-12 max-w-2xl mx-auto font-medium relative z-10">Join elite candidates who are securing dream roles at top tech companies. The edge you need is one click away.</p>

                    <button onClick={() => navigate('/register')} className="bg-white text-indigo-900 hover:bg-surface-50 font-black text-lg px-10 py-5 rounded-2xl shadow-xl transition-all hover:scale-105 inline-flex flex-col items-center justify-center relative z-10">
                        <span>Unlock Your Potential</span>
                    </button>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-white border-t border-surface-200 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-900 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-black text-surface-900 tracking-tight">JDAK</span>
                    </div>
                    <div className="flex gap-8 text-sm font-bold text-surface-400">
                        <a href="#" className="hover:text-surface-900 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-surface-900 transition-colors">Terms</a>
                        <a href="#" className="hover:text-surface-900 transition-colors">Contact</a>
                    </div>
                    <p className="text-sm font-semibold text-surface-400">© 2026 JDAK Platform.</p>
                </div>
            </footer>

        </div>
    );
}
