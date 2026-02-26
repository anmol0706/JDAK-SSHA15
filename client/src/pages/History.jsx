import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { interviewService } from '../services/interviewService';
import {
    Calendar,
    Filter,
    Search,
    BarChart3,
    Clock,
    ChevronRight,
    FileText,
    Target,
    Activity,
    Brain,
    Code2,
    Settings2,
    Users,
    ChevronLeft,
    CheckCircle2,
    XCircle,
    Play
} from 'lucide-react';

const INTERVIEW_CONFIG = {
    'technical': { icon: Code2, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    'behavioral': { icon: Brain, color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
    'system-design': { icon: Settings2, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    'hr': { icon: Users, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    'default': { icon: FileText, color: '#64748b', bg: 'rgba(100,116,139,0.1)' }
};

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

function StatusBadge({ status }) {
    if (status === 'completed') {
        return (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                <CheckCircle2 className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Completed</span>
            </div>
        );
    }
    if (status === 'abandoned') {
        return (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600">
                <XCircle className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Abandoned</span>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-600">
            <Activity className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
        </div>
    );
}

export default function History() {
    const [filters, setFilters] = useState({
        type: '',
        status: 'completed',
        page: 1,
        limit: 10
    });

    const { data, isLoading } = useQuery({
        queryKey: ['interview-history', filters],
        queryFn: () => interviewService.getHistory(filters)
    });

    const interviews = data?.data?.interviews || [];
    const pagination = data?.data?.pagination;

    return (
        <div className="space-y-6 lg:space-y-8 pb-8 max-w-5xl mx-auto">

            {/* ── HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-surface-900 tracking-tight mb-2">
                        Session History
                    </h1>
                    <p className="text-surface-500 text-sm sm:text-base max-w-xl">
                        Review your past performances, replay your answers, and track your ongoing progress.
                    </p>
                </div>
                <Link
                    to="/interview/new"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-105 hover:shadow-lg shadow-indigo-600/25"
                >
                    <Play className="w-4 h-4 fill-white" />
                    New Session
                </Link>
            </div>

            {/* ── FILTERS ── */}
            <div className="bg-white rounded-2xl border border-surface-200/70 p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center">
                            <Filter className="w-4 h-4 text-surface-600" />
                        </div>
                        <span className="text-surface-600 font-semibold text-sm">Filter Results:</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative group">
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
                                className="w-full sm:w-40 appearance-none bg-surface-50 border border-surface-200 hover:border-indigo-300 rounded-xl px-4 py-2.5 text-sm font-medium text-surface-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                            >
                                <option value="">All Types</option>
                                <option value="technical">Technical</option>
                                <option value="behavioral">Behavioral</option>
                                <option value="system-design">System Design</option>
                                <option value="hr">HR Round</option>
                            </select>
                            <ChevronRight className="w-4 h-4 text-surface-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
                        </div>

                        <div className="relative group">
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                                className="w-full sm:w-40 appearance-none bg-surface-50 border border-surface-200 hover:border-indigo-300 rounded-xl px-4 py-2.5 text-sm font-medium text-surface-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                            >
                                <option value="">Any Status</option>
                                <option value="completed">Completed</option>
                                <option value="in-progress">In Progress</option>
                                <option value="abandoned">Abandoned</option>
                            </select>
                            <ChevronRight className="w-4 h-4 text-surface-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── INTERVIEW LIST ── */}
            <div className="space-y-3 sm:space-y-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 sm:h-28 bg-surface-200/50 animate-pulse rounded-2xl border border-surface-100" />
                    ))
                ) : interviews.length > 0 ? (
                    interviews.map((interview, index) => {
                        const typeConfig = INTERVIEW_CONFIG[interview.interviewType?.toLowerCase()] || INTERVIEW_CONFIG.default;
                        const Icon = typeConfig.icon;
                        const sColor = scoreColor(interview.score);
                        const sBg = scoreBg(interview.score);

                        return (
                            <motion.div
                                key={interview.sessionId || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    to={`/interview/${interview.sessionId}/report`}
                                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 lg:p-6 bg-white rounded-2xl border border-surface-200/70 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    <div className="flex items-start sm:items-center gap-4 sm:gap-6 w-full">

                                        {/* Icon */}
                                        <div
                                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                                            style={{ background: typeConfig.bg, color: typeConfig.color }}
                                        >
                                            <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1 sm:mb-1.5">
                                                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-surface-900 capitalize truncate">
                                                    {interview.interviewType} Interview
                                                </h3>
                                                <StatusBadge status={interview.status || 'completed'} />
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-surface-500 font-medium tracking-tight">
                                                <span className="flex items-center gap-1.5 line-clamp-1 truncate">
                                                    <Calendar className="w-3.5 h-3.5 text-surface-400" />
                                                    {new Date(interview.startedAt || interview.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-surface-300" />
                                                <span className="flex items-center gap-1.5 text-surface-500">
                                                    <Target className="w-3.5 h-3.5 text-surface-400" />
                                                    {interview.questionsAnswered || 0} of {interview.totalQuestions || 0} Questions
                                                </span>
                                            </div>
                                        </div>

                                        {/* Score Right Side */}
                                        {interview.status === 'completed' && interview.score !== undefined && (
                                            <div className="hidden sm:flex flex-col items-end flex-shrink-0 min-w-[80px]">
                                                <div className="text-2xl lg:text-3xl font-black mb-0.5 leading-none" style={{ color: sColor }}>
                                                    {interview.score}<span className="text-lg opacity-70">%</span>
                                                </div>
                                                <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: sColor }}>
                                                    {scoreLabel(interview.score)}
                                                </span>
                                            </div>
                                        )}

                                        <div className="hidden sm:flex w-8 h-8 rounded-full bg-surface-50 items-center justify-center group-hover:bg-indigo-50 group-hover:translate-x-1 transition-all">
                                            <ChevronRight className="w-4 h-4 text-surface-400 group-hover:text-indigo-600" />
                                        </div>

                                        {/* Mobile view score overlay */}
                                        {interview.status === 'completed' && interview.score !== undefined && (
                                            <div className="sm:hidden flex items-center gap-2 mt-2 pt-2 border-t border-surface-100 w-full justify-between">
                                                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm" style={{ color: sColor, background: sBg }}>
                                                    {scoreLabel(interview.score)}
                                                </span>
                                                <div className="text-lg font-black leading-none flex items-center gap-2" style={{ color: sColor }}>
                                                    {interview.score}%
                                                    <ChevronRight className="w-3 h-3 block opacity-50" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-10 sm:p-16 text-center shadow-sm border border-surface-200/70 max-w-2xl mx-auto mt-8"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5 rotate-3">
                            <FileText className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-surface-900 mb-2">It's quiet in here...</h3>
                        <p className="text-surface-500 text-sm sm:text-base mb-8 max-w-sm mx-auto leading-relaxed">
                            You haven't completed any interviews matching these filters yet. Drop the filters or start your first session.
                        </p>
                        <Link
                            to="/interview/new"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-8 py-3.5 rounded-xl inline-flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-105"
                        >
                            <Play className="w-4 h-4 fill-white" />
                            Start Your First Session
                        </Link>
                    </motion.div>
                )}
            </div>

            {/* ── PAGINATION ── */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                    <button
                        onClick={() => filters.page > 1 && setFilters({ ...filters, page: filters.page - 1 })}
                        disabled={filters.page === 1}
                        className="w-10 h-10 rounded-xl flex items-center justify-center border border-surface-200 text-surface-500 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="bg-white border border-surface-200 rounded-xl flex items-center p-1 shadow-sm">
                        {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                            // Logic to center the current page nicely could go here, simplifying for now
                            const page = i + 1;
                            const isCurrent = filters.page === page;

                            return (
                                <button
                                    key={page}
                                    onClick={() => setFilters({ ...filters, page })}
                                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${isCurrent
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'text-surface-600 hover:bg-surface-100'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => filters.page < pagination.pages && setFilters({ ...filters, page: filters.page + 1 })}
                        disabled={filters.page === pagination.pages}
                        className="w-10 h-10 rounded-xl flex items-center justify-center border border-surface-200 text-surface-500 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
