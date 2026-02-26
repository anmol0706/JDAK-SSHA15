import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { analyticsService } from '../services/interviewService';
import { SkeletonDashboard } from '../components/ui/Skeleton';
import { BadgeSummary, BADGE_DEFINITIONS } from '../components/ui/AchievementBadges';
import {
    MessageSquarePlus,
    TrendingUp,
    Clock,
    Award,
    Target,
    ArrowRight,
    Calendar,
    Flame,
    BarChart3,
    Sparkles,
    CheckCircle2,
    Trophy,
    Zap,
    Brain,
    Code2,
    Users,
    Settings2,
    ChevronRight,
    Activity,
    Star,
    Play,
    ArrowUpRight
} from 'lucide-react';

// Animated counter hook
function useCounter(end, duration = 1200, start = 0) {
    const [count, setCount] = useState(start);
    useEffect(() => {
        if (end === 0 || end === undefined) { setCount(0); return; }
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * (end - start) + start));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [end]);
    return count;
}

// Liquid progress ring
function LiquidRing({ value, size = 80, strokeWidth = 6, color = '#6366f1', label, sublabel }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const [animated, setAnimated] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => setAnimated(value), 300);
        return () => clearTimeout(timer);
    }, [value]);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
                    <circle
                        cx={size / 2} cy={size / 2} r={radius} fill="none"
                        stroke={color} strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - animated / 100)}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-black text-surface-800" style={{ fontSize: size * 0.2 }}>{Math.round(animated)}%</span>
                </div>
            </div>
            <div className="text-center">
                <p className="text-[10px] lg:text-xs font-semibold text-surface-700 truncate max-w-[80px]">{label}</p>
                {sublabel && <p className="text-[9px] text-surface-400">{sublabel}</p>}
            </div>
        </div>
    );
}

// Interview type cards
const INTERVIEW_TYPES = [
    {
        type: 'technical',
        label: 'Technical',
        icon: Code2,
        desc: 'DSA & System',
        gradient: 'from-[#6366f1] to-[#8b5cf6]',
        glow: 'rgba(99,102,241,0.3)',
        bg: 'rgba(99,102,241,0.08)'
    },
    {
        type: 'behavioral',
        label: 'Behavioral',
        icon: Brain,
        desc: 'Soft Skills',
        gradient: 'from-[#ec4899] to-[#f43f5e]',
        glow: 'rgba(236,72,153,0.3)',
        bg: 'rgba(236,72,153,0.08)'
    },
    {
        type: 'system-design',
        label: 'System Design',
        icon: Settings2,
        desc: 'Architecture',
        gradient: 'from-[#f59e0b] to-[#f97316]',
        glow: 'rgba(245,158,11,0.3)',
        bg: 'rgba(245,158,11,0.08)'
    },
    {
        type: 'hr',
        label: 'HR Round',
        icon: Users,
        desc: 'Culture Fit',
        gradient: 'from-[#10b981] to-[#06b6d4]',
        glow: 'rgba(16,185,129,0.3)',
        bg: 'rgba(16,185,129,0.08)'
    },
];

// Score color lookup
function scoreColor(score) {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#6366f1';
    if (score >= 55) return '#f59e0b';
    return '#f43f5e';
}

function scoreBg(score) {
    if (score >= 85) return 'rgba(16,185,129,0.1)';
    if (score >= 70) return 'rgba(99,102,241,0.1)';
    if (score >= 55) return 'rgba(245,158,11,0.1)';
    return 'rgba(244,63,94,0.1)';
}

function scoreLabel(score) {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Average';
    return 'Needs Work';
}

export default function Dashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(null);
    const [now] = useState(new Date());

    const { data: analytics, isLoading } = useQuery({
        queryKey: ['dashboard-analytics'],
        queryFn: analyticsService.getDashboard
    });

    const dashboardData = analytics?.data;
    const overview = dashboardData?.overview || {};

    // Animated numbers
    const totalInterviews = useCounter(overview.totalInterviews || 0);
    const avgScore = useCounter(overview.averageScore || 0);
    const streak = useCounter(overview.currentStreak || 0);

    const calculateUnlockedBadges = () => {
        const unlocked = [];
        if (overview.totalInterviews >= 1) unlocked.push('first_interview');
        if (overview.totalInterviews >= 10) unlocked.push('interview_10');
        if (overview.totalInterviews >= 25) unlocked.push('interview_25');
        if (overview.totalInterviews >= 50) unlocked.push('interview_50');
        const longestStreak = overview.longestStreak || overview.currentStreak || 0;
        if (longestStreak >= 3) unlocked.push('streak_3');
        if (longestStreak >= 7) unlocked.push('streak_7');
        if (longestStreak >= 14) unlocked.push('streak_14');
        if (overview.averageScore >= 80) unlocked.push('consistent');
        if ((dashboardData?.recentInterviews?.filter(i => i.score >= 90).length || 0) >= 5) unlocked.push('high_scorer');
        const dailyDaysCompleted = user?.statistics?.streakDays || 0;
        if (dailyDaysCompleted >= 1) unlocked.push('daily_first');
        if (dailyDaysCompleted >= 7) unlocked.push('daily_7');
        return unlocked;
    };

    const unlockedBadgeIds = calculateUnlockedBadges();

    const getGreeting = () => {
        const h = now.getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    if (isLoading) return <SkeletonDashboard />;

    const recentInterviews = dashboardData?.recentInterviews || [];
    const skills = dashboardData?.skillRadar || [];

    return (
        <div className="space-y-5 lg:space-y-7 pb-8">

            {/* ── HERO HEADER ── */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-2xl lg:rounded-3xl p-5 sm:p-7 lg:p-9"
                style={{
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 70%, #581c87 100%)',
                    boxShadow: '0 20px 60px rgba(79,70,229,0.35), 0 4px 16px rgba(0,0,0,0.2)'
                }}
            >
                {/* Decorative blobs */}
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }} />
                <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, #818cf8, transparent 70%)' }} />
                <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #c4b5fd, transparent 70%)' }} />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-indigo-300 text-xs font-semibold uppercase tracking-widest">{getGreeting()}</span>
                            <span className="w-1 h-1 rounded-full bg-indigo-400 inline-block" />
                            <span className="text-indigo-300 text-xs">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2 leading-tight">
                            {user?.firstName} <span className="text-indigo-300">👋</span>
                        </h1>
                        <p className="text-indigo-300/80 text-sm sm:text-base max-w-md">
                            Ready to crush your next interview? Your success story starts here.
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-4">
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5">
                                <Flame className="w-3.5 h-3.5 text-orange-400" />
                                <span className="text-white text-xs font-semibold">{streak}d streak</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5">
                                <Star className="w-3.5 h-3.5 text-yellow-400" />
                                <span className="text-white text-xs font-semibold">{totalInterviews} interviews done</span>
                            </div>
                        </div>
                    </div>
                    <Link
                        to="/interview/new"
                        className="group flex items-center gap-3 bg-white text-indigo-700 font-bold px-5 py-3.5 sm:px-7 sm:py-4 rounded-xl lg:rounded-2xl shadow-xl self-start sm:self-center transition-all duration-300 hover:scale-105 hover:shadow-2xl whitespace-nowrap"
                        style={{ boxShadow: '0 8px 32px rgba(255,255,255,0.25), 0 2px 8px rgba(0,0,0,0.15)' }}
                    >
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                        <span className="text-sm sm:text-base">Start Interview</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </motion.div>

            {/* ── STATS ROW ── */}
            <div className="grid grid-cols-3 gap-3 lg:gap-5">
                {[
                    {
                        icon: Activity,
                        label: 'Total Interviews',
                        value: totalInterviews,
                        suffix: '',
                        color: '#6366f1',
                        bg: 'rgba(99,102,241,0.07)',
                        border: 'rgba(99,102,241,0.2)',
                        trend: '+2 this week'
                    },
                    {
                        icon: Target,
                        label: 'Avg Score',
                        value: avgScore,
                        suffix: '%',
                        color: '#10b981',
                        bg: 'rgba(16,185,129,0.07)',
                        border: 'rgba(16,185,129,0.2)',
                        trend: overview.averageScore >= 70 ? 'Great job!' : 'Keep going!'
                    },
                    {
                        icon: Trophy,
                        label: 'Best Streak',
                        value: streak,
                        suffix: 'd',
                        color: '#f59e0b',
                        bg: 'rgba(245,158,11,0.07)',
                        border: 'rgba(245,158,11,0.2)',
                        trend: 'Current run'
                    },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="relative rounded-xl lg:rounded-2xl p-3 sm:p-5 overflow-hidden cursor-default"
                        style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
                    >
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center"
                                style={{ background: stat.color, boxShadow: `0 4px 12px ${stat.color}55` }}>
                                <stat.icon className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-white" style={{ width: '14px', height: '14px' }} />
                            </div>
                            <div className="flex items-center gap-1 bg-white/60 border border-white/80 rounded-full px-1.5 py-0.5">
                                <ArrowUpRight className="w-2.5 h-2.5" style={{ color: stat.color }} />
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-black text-surface-900 leading-none mb-0.5">
                            {stat.value}<span className="text-base lg:text-lg font-bold" style={{ color: stat.color }}>{stat.suffix}</span>
                        </p>
                        <p className="text-[10px] sm:text-xs text-surface-500 font-medium truncate">{stat.label}</p>
                        <p className="text-[9px] sm:text-[10px] font-semibold mt-0.5 truncate" style={{ color: stat.color }}>{stat.trend}</p>
                    </motion.div>
                ))}
            </div>

            {/* ── MAIN GRID ── */}
            <div className="grid gap-4 lg:gap-6 lg:grid-cols-5">

                {/* Quick Start — spans 2 cols on lg */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="lg:col-span-2 rounded-2xl lg:rounded-3xl overflow-hidden bg-white border border-surface-200/70 shadow-sm"
                >
                    <div className="p-4 sm:p-5 border-b border-surface-100">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-indigo-600" />
                            </div>
                            <h2 className="text-sm sm:text-base font-bold text-surface-800">Quick Start</h2>
                        </div>
                        <p className="text-xs text-surface-400 mt-0.5 ml-9">Jump into any interview type</p>
                    </div>
                    <div className="p-3 sm:p-4 grid grid-cols-2 gap-2.5">
                        {INTERVIEW_TYPES.map((iv, idx) => (
                            <motion.div
                                key={iv.type}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + idx * 0.07 }}
                            >
                                <Link
                                    to={`/interview/new?type=${iv.type}`}
                                    className="group flex flex-col gap-2.5 p-3 sm:p-4 rounded-xl transition-all duration-300 hover:scale-[1.03]"
                                    style={{
                                        background: iv.bg,
                                        border: '1.5px solid transparent',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.border = `1.5px solid ${iv.glow.replace('0.3', '0.5')}`;
                                        e.currentTarget.style.boxShadow = `0 8px 24px ${iv.glow}`;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.border = '1.5px solid transparent';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center"
                                        style={{ background: `linear-gradient(135deg, ${iv.gradient.replace('from-[', '').replace('] to-[', ', ').replace(']', '')})`, boxShadow: `0 4px 12px ${iv.glow}` }}>
                                        <iv.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" style={{ width: '16px', height: '16px' }} />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm font-bold text-surface-800 leading-tight">{iv.label}</p>
                                        <p className="text-[10px] text-surface-400">{iv.desc}</p>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-surface-300 group-hover:text-surface-500 group-hover:translate-x-0.5 transition-all mt-auto self-end" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Interviews — spans 3 cols on lg */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25, duration: 0.5 }}
                    className="lg:col-span-3 rounded-2xl lg:rounded-3xl overflow-hidden bg-white border border-surface-200/70 shadow-sm"
                >
                    <div className="p-4 sm:p-5 border-b border-surface-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-base font-bold text-surface-800">Recent Sessions</h2>
                                <p className="text-[10px] text-surface-400">Your interview history</p>
                            </div>
                        </div>
                        <Link to="/history" className="flex items-center gap-1 text-indigo-500 hover:text-indigo-700 text-xs font-semibold transition-colors">
                            View all <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="p-3 sm:p-4">
                        {recentInterviews.length > 0 ? (
                            <div className="space-y-2">
                                {recentInterviews.slice(0, 5).map((interview, idx) => {
                                    const color = scoreColor(interview.score);
                                    const bg = scoreBg(interview.score);
                                    return (
                                        <motion.div
                                            key={interview.sessionId}
                                            initial={{ opacity: 0, x: 12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.35 + idx * 0.07 }}
                                        >
                                            <Link
                                                to={`/interview/${interview.sessionId}/report`}
                                                className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-surface-50 hover:shadow-sm"
                                            >
                                                {/* Score ring mini */}
                                                <div className="relative w-10 h-10 flex-shrink-0">
                                                    <svg width="40" height="40" className="-rotate-90">
                                                        <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="4" />
                                                        <circle cx="20" cy="20" r="16" fill="none"
                                                            stroke={color} strokeWidth="4"
                                                            strokeDasharray={`${2 * Math.PI * 16}`}
                                                            strokeDashoffset={`${2 * Math.PI * 16 * (1 - interview.score / 100)}`}
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-[9px] font-black" style={{ color }}>{interview.score}</span>
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs sm:text-sm font-semibold text-surface-800 capitalize truncate">{interview.type} Interview</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-[10px] text-surface-400">{new Date(interview.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                        <span className="w-1 h-1 rounded-full bg-surface-300" />
                                                        <p className="text-[10px] text-surface-400 capitalize">{interview.difficulty}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color, background: bg }}>
                                                        {scoreLabel(interview.score)}
                                                    </span>
                                                    <ChevronRight className="w-3.5 h-3.5 text-surface-300 group-hover:text-surface-500 group-hover:translate-x-0.5 transition-all" />
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                    <BarChart3 className="w-8 h-8 text-indigo-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-surface-700 font-semibold text-sm mb-1">No sessions yet</p>
                                    <p className="text-surface-400 text-xs mb-4">Start your first interview to see results here</p>
                                    <Link to="/interview/new"
                                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all">
                                        <Play className="w-3.5 h-3.5 fill-white" /> Begin now
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* ── DAILY PRACTICE BANNER ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl lg:rounded-3xl p-5 sm:p-6"
                style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 60%, #ea580c 100%)',
                    boxShadow: '0 12px 40px rgba(124,58,237,0.3)'
                }}
            >
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, #fbbf24, transparent 70%)' }} />
                <div className="absolute bottom-0 left-1/4 w-28 h-28 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #f9a8d4, transparent 70%)' }} />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
                            <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-300" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">Daily Challenge</span>
                                <span className="bg-yellow-400 text-yellow-900 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">Live</span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-white">Daily Practice Round</h3>
                            <p className="text-white/70 text-xs sm:text-sm mt-0.5">Complete today's questions to keep your streak alive!</p>
                        </div>
                    </div>
                    <Link
                        to="/daily-practice"
                        className="group flex items-center gap-2.5 bg-white text-purple-700 font-bold px-5 py-3 rounded-xl sm:rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 self-start sm:self-center whitespace-nowrap"
                        style={{ boxShadow: '0 4px 20px rgba(255,255,255,0.3)' }}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">Practice Now</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </motion.div>

            {/* ── SKILL RADAR ── */}
            {skills.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    className="rounded-2xl lg:rounded-3xl bg-white border border-surface-200/70 shadow-sm overflow-hidden"
                >
                    <div className="p-4 sm:p-5 border-b border-surface-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-base font-bold text-surface-800">Skill Breakdown</h2>
                                <p className="text-[10px] text-surface-400">Your strengths & growth areas</p>
                            </div>
                        </div>
                        <Link to="/analytics" className="flex items-center gap-1 text-indigo-500 hover:text-indigo-700 text-xs font-semibold transition-colors">
                            Full report <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <div className="p-5 sm:p-7">
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-6">
                            {skills.slice(0, 5).map((skill, idx) => {
                                const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
                                return (
                                    <motion.div
                                        key={skill.skill}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 + idx * 0.08 }}
                                    >
                                        <LiquidRing
                                            value={skill.score}
                                            size={72}
                                            strokeWidth={5}
                                            color={colors[idx % colors.length]}
                                            label={skill.skill}
                                        />
                                    </motion.div>
                                );
                            })}
                        </div>
                        {/* Bar chart style breakdown */}
                        <div className="mt-6 space-y-3">
                            {skills.slice(0, 5).map((skill, idx) => {
                                const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
                                const color = colors[idx % colors.length];
                                return (
                                    <div key={skill.skill + '-bar'} className="flex items-center gap-3">
                                        <p className="text-[10px] sm:text-xs text-surface-500 font-medium w-20 sm:w-24 truncate flex-shrink-0">{skill.skill}</p>
                                        <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${skill.score}%` }}
                                                transition={{ delay: 0.5 + idx * 0.08, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                                className="h-full rounded-full"
                                                style={{ background: color }}
                                            />
                                        </div>
                                        <p className="text-[10px] sm:text-xs font-bold w-8 text-right flex-shrink-0" style={{ color }}>{skill.score}%</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── ACHIEVEMENTS ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <BadgeSummary
                    unlockedBadgeIds={unlockedBadgeIds}
                    onViewAll={() => navigate('/achievements')}
                />
            </motion.div>

            {/* ── UPGRADE BANNER (free users) ── */}
            {user?.subscription?.plan === 'free' && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="relative overflow-hidden rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4"
                    style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.08) 100%)',
                        border: '1.5px solid rgba(99,102,241,0.2)'
                    }}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-32 opacity-5"
                        style={{ background: 'radial-gradient(circle at right, #818cf8, transparent 70%)' }} />
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <Sparkles className="w-4.5 h-4.5 text-indigo-600" style={{ width: '18px', height: '18px' }} />
                        </div>
                        <div>
                            <h3 className="text-xs sm:text-sm font-bold text-surface-800">Unlock Unlimited Access</h3>
                            <p className="text-[10px] sm:text-xs text-surface-500 mt-0.5">
                                <span className="font-semibold text-indigo-600">{user.subscription.interviewsRemaining || 0}</span> free interviews remaining
                            </p>
                        </div>
                    </div>
                    <button className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg transition-all hover:scale-105"
                        style={{ boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
                        Upgrade Now
                    </button>
                </motion.div>
            )}
        </div>
    );
}
