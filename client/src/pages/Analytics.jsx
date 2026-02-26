import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { analyticsService } from '../services/interviewService';
import {
    TrendingUp,
    Target,
    Award,
    Calendar,
    BarChart3,
    Lightbulb,
    Zap,
    ShieldCheck,
    AlertCircle,
    Activity
} from 'lucide-react';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    RadialLinearScale,
    Filler,
    RadarController,
    LineController
} from 'chart.js';
import { Line, Radar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    ChartTooltip,
    Legend,
    RadialLinearScale,
    Filler,
    RadarController,
    LineController
);

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
            let nextCount = (eased * (end - start) + start);
            if (end % 1 !== 0) {
                setCount(Number(nextCount.toFixed(1)));
            } else {
                setCount(Math.floor(nextCount));
            }
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [end]);
    return count;
}

export default function Analytics() {
    const { data: performanceData, isLoading: perfLoading } = useQuery({
        queryKey: ['performance-analytics'],
        queryFn: () => analyticsService.getPerformance('30days')
    });

    const { data: strengthsData, isLoading: statsLoading } = useQuery({
        queryKey: ['strengths-weaknesses'],
        queryFn: analyticsService.getStrengthsWeaknesses
    });

    const isLoading = perfLoading || statsLoading;
    const performance = performanceData?.data || {};
    const strengths = strengthsData?.data || {};

    const interviewCount = useCounter(performance.totalInterviews || 0);
    const avgScore = useCounter(performance.averageScore || 0);
    const improvement = useCounter(performance.improvementRate || 0);

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto pb-8">
                <div className="h-20 bg-surface-200/50 animate-pulse rounded-2xl" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-32 bg-surface-200/50 animate-pulse rounded-2xl" />
                    ))}
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="h-96 bg-surface-200/50 animate-pulse rounded-3xl" />
                    <div className="h-96 bg-surface-200/50 animate-pulse rounded-3xl" />
                </div>
            </div>
        );
    }

    const skillEntries = strengths.skillAverages ? Object.entries(strengths.skillAverages).sort((a, b) => b[1] - a[1]) : [];
    const topStrengths = skillEntries.filter(([_, score]) => score >= 75).slice(0, 3);
    const areasToImprove = skillEntries.filter(([_, score]) => score < 60).slice(0, 3);

    // ── LINE CHART DATA (Performance over time) ──
    const dailyData = performance.dailyPerformance || [];
    const lineChartData = {
        labels: dailyData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: 'Average Score',
                data: dailyData.map(d => d.averageScore),
                borderColor: '#6366f1', // Indigo 500
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#6366f1',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            }
        ]
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e1b4b',
                titleFont: { family: 'inherit', size: 13, weight: 'bold' },
                bodyFont: { family: 'inherit', size: 14 },
                padding: 12,
                cornerRadius: 12,
                displayColors: false,
                callbacks: {
                    label: (context) => `Score: ${context.parsed.y}%`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: '#f1f5f9', drawBorder: false },
                ticks: { font: { family: 'inherit', weight: '600' }, color: '#94a3b8', stepSize: 25 }
            },
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { font: { family: 'inherit', weight: '600' }, color: '#94a3b8' }
            }
        },
        interaction: { intersect: false, mode: 'index' }
    };

    // ── RADAR CHART DATA (Skill Distribution) ──
    const radarChartData = {
        labels: skillEntries.map(([skill]) => {
            if (skill === 'postureAndPresence') return 'Posture & Presence';
            return skill.charAt(0).toUpperCase() + skill.slice(1);
        }),
        datasets: [
            {
                label: 'Skill Proficiency',
                data: skillEntries.map(([_, score]) => score),
                backgroundColor: 'rgba(16, 185, 129, 0.2)', // Emerald 500
                borderColor: '#10b981',
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#10b981',
                borderWidth: 2,
            }
        ]
    };

    const radarChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#064e3b',
                titleFont: { family: 'inherit', size: 13, weight: 'bold' },
                bodyFont: { family: 'inherit', size: 14 },
                padding: 12,
                cornerRadius: 12,
                displayColors: false,
                callbacks: { label: (context) => `Proficiency: ${context.raw}%` }
            }
        },
        scales: {
            r: {
                angleLines: { color: '#f1f5f9' },
                grid: { color: '#f1f5f9' },
                pointLabels: {
                    font: { family: 'inherit', size: 12, weight: '700' },
                    color: '#64748b'
                },
                ticks: { display: false, min: 0, max: 100 }
            }
        }
    };

    return (
        <div className="space-y-6 lg:space-y-8 pb-12 max-w-7xl mx-auto">
            {/* ── HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-surface-900 tracking-tight flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Activity className="w-6 h-6" />
                        </div>
                        Analytics
                    </h1>
                    <p className="text-surface-500 text-sm sm:text-base font-medium max-w-xl">
                        Deep dive into your interview metrics using dynamic visualization graphs.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white px-5 py-2.5 border border-surface-200/70 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <Calendar className="w-4 h-4 text-surface-400" />
                    <span className="text-sm font-bold text-surface-700">Last 30 Days</span>
                </div>
            </div>

            {/* ── STATS GRID ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[
                    {
                        icon: Target, label: 'Interviews Taken', value: interviewCount, color: 'from-blue-500 to-indigo-600',
                        bg: 'bg-indigo-50', text: 'text-indigo-600'
                    },
                    {
                        icon: BarChart3, label: 'Average Score', value: avgScore, suffix: '%', color: 'from-emerald-400 to-emerald-600',
                        bg: 'bg-emerald-50', text: 'text-emerald-600'
                    },
                    {
                        icon: TrendingUp, label: 'Improvement', value: improvement > 0 ? `+${improvement}` : improvement, suffix: '%',
                        color: improvement >= 0 ? 'from-amber-400 to-orange-500' : 'from-rose-400 to-rose-600',
                        bg: improvement >= 0 ? 'bg-orange-50' : 'bg-rose-50', text: improvement >= 0 ? 'text-orange-600' : 'text-rose-600'
                    },
                    {
                        icon: Award, label: 'Top Category', value: performance?.bestPerformingCategory || 'Unknown', isString: true,
                        color: 'from-purple-500 to-pink-600', bg: 'bg-purple-50', text: 'text-purple-600'
                    }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05, type: 'spring' }}
                        className="relative bg-white border border-surface-200/70 rounded-3xl p-5 lg:p-6 shadow-sm overflow-hidden group hover:border-surface-300 transition-colors"
                    >
                        <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${stat.color} opacity-[0.05] group-hover:opacity-[0.10] transition-opacity blur-2xl`} />

                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.text} flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="relative z-10">
                            {stat.isString ? (
                                <p className="text-xl lg:text-3xl font-black text-surface-900 capitalize truncate mb-1">
                                    {stat.value}
                                </p>
                            ) : (
                                <div className="flex items-baseline gap-1 mb-1">
                                    <p className="text-3xl lg:text-4xl font-black text-surface-900 leading-none">
                                        {stat.value}
                                    </p>
                                    {stat.suffix && <span className="text-lg font-bold text-surface-400">{stat.suffix}</span>}
                                </div>
                            )}
                            <p className="text-surface-500 font-bold text-[10px] sm:text-xs uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {skillEntries.length > 0 ? (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* ── PERFORMANCE TREND GRAPH (LINE CHART) ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white border border-surface-200/70 rounded-[2.5rem] p-6 sm:p-8 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-surface-900 tracking-tight">Score Trajectory</h2>
                                <p className="text-sm font-medium text-surface-500">Your average score across recent sessions</p>
                            </div>
                        </div>
                        <div className="w-full h-[300px]">
                            {dailyData.length > 0 ? (
                                <Line data={lineChartData} options={lineChartOptions} />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-surface-400 font-bold text-sm bg-surface-50 rounded-3xl border border-dashed border-surface-200">
                                    <BarChart3 className="w-8 h-8 mb-2 opacity-50" />
                                    Not enough trend data yet
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* ── SKILL DISTRIBUTION GRAPH (RADAR CHART) ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white border border-surface-200/70 rounded-[2.5rem] p-6 sm:p-8 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <Target className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-surface-900 tracking-tight">Competency Mapping</h2>
                                <p className="text-sm font-medium text-surface-500">Radar graph of your core skills</p>
                            </div>
                        </div>
                        <div className="w-full h-[300px] flex items-center justify-center">
                            <Radar data={radarChartData} options={radarChartOptions} />
                        </div>
                    </motion.div>

                    {/* ── INSIGHTS PANEL (Strengths / Weaknesses) ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2 grid md:grid-cols-2 gap-6"
                    >
                        <div className="bg-white border border-surface-200/70 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-150 transition-transform duration-700" />
                            <div className="flex items-center gap-3 mb-6">
                                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                <h3 className="text-lg font-black text-surface-900">Top Strengths</h3>
                            </div>

                            {topStrengths.length > 0 ? (
                                <div className="space-y-4 relative z-10">
                                    {topStrengths.map(([skill, score]) => (
                                        <div key={skill} className="flex items-center justify-between">
                                            <span className="text-base font-bold text-surface-700 capitalize">{skill}</span>
                                            <div className="flex items-center gap-4">
                                                <div className="w-32 h-2 bg-surface-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${score}%` }} />
                                                </div>
                                                <span className="text-sm font-black text-emerald-600 tracking-wider w-8 text-right">{score}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm font-bold text-surface-500 italic">Play more to discover your strengths.</p>
                            )}
                        </div>

                        <div className="bg-white border border-surface-200/70 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-150 transition-transform duration-700" />
                            <div className="flex items-center gap-3 mb-6">
                                <AlertCircle className="w-6 h-6 text-rose-500" />
                                <h3 className="text-lg font-black text-surface-900">Focus Areas</h3>
                            </div>

                            {areasToImprove.length > 0 ? (
                                <div className="space-y-4 relative z-10">
                                    {areasToImprove.map(([skill, score]) => (
                                        <div key={skill} className="flex items-center justify-between">
                                            <span className="text-base font-bold text-surface-700 capitalize">{skill}</span>
                                            <div className="flex items-center gap-4">
                                                <div className="w-32 h-2 bg-surface-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${score}%` }} />
                                                </div>
                                                <span className="text-sm font-black text-rose-600 tracking-wider w-8 text-right">{score}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm font-bold text-surface-500 italic">No major weak areas detected.</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            ) : (
                /* ── EMPTY STATE ── */
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-100 rounded-3xl p-10 sm:p-16 text-center shadow-sm max-w-3xl mx-auto mt-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full" />
                    <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200/50 rotate-3">
                        <Lightbulb className="w-12 h-12 text-indigo-500" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-surface-900 mb-3 tracking-tight relative z-10">Data insufficient for analytics</h3>
                    <p className="text-surface-500 text-sm sm:text-base mb-8 max-w-sm mx-auto font-medium relative z-10">
                        We need more interview data to build a complete graphical profile of your skills. Complete a few sessions to unlock charts.
                    </p>
                    <a href="/interview/new" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 relative z-10">
                        <Zap className="w-4 h-4 fill-white text-white" />
                        Start Interview
                    </a>
                </motion.div>
            )}
        </div>
    );
}
