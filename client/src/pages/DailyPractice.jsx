import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDailyPracticeStore } from '../stores/dailyPracticeStore';
import { useAuthStore } from '../stores/authStore';
import { SkeletonDailyPractice } from '../components/ui/Skeleton';
import { Flame, Check, X, Trophy, ChevronRight, Zap, Target, BookOpen, Clock, AlertCircle } from 'lucide-react';

const categoryConfig = {
    communication: {
        title: 'Communication Skills',
        icon: <MessageBubbleIcon />,
        gradient: 'from-blue-500 to-indigo-500',
        bgGradient: 'from-blue-50 to-indigo-50',
        borderColor: 'border-blue-200',
        textColor: 'text-indigo-700',
        iconBg: 'bg-blue-100/50 text-blue-600'
    },
    aptitude: {
        title: 'Aptitude & Logic',
        icon: <BrainIcon />,
        gradient: 'from-purple-500 to-fuchsia-500',
        bgGradient: 'from-purple-50 to-fuchsia-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700',
        iconBg: 'bg-purple-100/50 text-purple-600'
    },
    generalKnowledge: {
        title: 'General Knowledge',
        icon: <GlobeIcon />,
        gradient: 'from-amber-400 to-orange-500',
        bgGradient: 'from-amber-50 to-orange-50',
        borderColor: 'border-amber-200',
        textColor: 'text-orange-700',
        iconBg: 'bg-amber-100/50 text-amber-600'
    }
};

function MessageBubbleIcon() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>;
}
function BrainIcon() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" /></svg>;
}
function GlobeIcon() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" /></svg>;
}

export default function DailyPractice() {
    const { user } = useAuthStore();
    const {
        questions,
        progress,
        isCompleted,
        streak,
        streakActive,
        stats,
        leaderboard,
        isLoading,
        isSubmitting,
        error,
        currentCategory,
        currentQuestionIndex,
        setCurrentCategory,
        setCurrentQuestionIndex,
        fetchDailyQuestions,
        submitAnswer,
        fetchStats,
        fetchLeaderboard,
        getOverallProgress
    } = useDailyPracticeStore();

    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [activeTab, setActiveTab] = useState('practice');
    const [showRewardModal, setShowRewardModal] = useState(false);
    const [rewardStreak, setRewardStreak] = useState(0);

    useEffect(() => {
        fetchDailyQuestions();
        fetchStats();
        fetchLeaderboard();
    }, []);

    const handleAnswerSelect = (answerId) => {
        if (isSubmitting || showResult) return;
        setSelectedAnswer(answerId);
    };

    const handleSubmitAnswer = async () => {
        if (!selectedAnswer || isSubmitting) return;

        try {
            const result = await submitAnswer(currentCategory, currentQuestionIndex, selectedAnswer);
            setLastResult(result);
            setShowResult(true);

            if (result.rewardGranted) {
                setRewardStreak(result.streak);
                setShowRewardModal(true);
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
        }
    };

    const handleNextQuestion = () => {
        if (isCompleted) {
            fetchStats();
            setActiveTab('stats');
            return;
        }

        const categoryQuestions = questions?.[currentCategory] || [];
        setShowResult(false);
        setSelectedAnswer(null);
        setLastResult(null);

        let nextIndex = currentQuestionIndex + 1;
        while (nextIndex < categoryQuestions.length && categoryQuestions[nextIndex]?.answered) {
            nextIndex++;
        }

        if (nextIndex < categoryQuestions.length) {
            setCurrentQuestionIndex(nextIndex);
        } else {
            const categories = Object.keys(categoryConfig);
            const currentIdx = categories.indexOf(currentCategory);
            for (let i = 1; i <= categories.length; i++) {
                const nextCat = categories[(currentIdx + i) % categories.length];
                const nextCatQuestions = questions?.[nextCat] || [];
                const unansweredIdx = nextCatQuestions.findIndex(q => !q.answered);
                if (unansweredIdx !== -1) {
                    setCurrentCategory(nextCat);
                    setCurrentQuestionIndex(unansweredIdx);
                    return;
                }
            }
        }
    };

    const handleCategoryChange = (category) => {
        setCurrentCategory(category);
        setCurrentQuestionIndex(0);
        setShowResult(false);
        setSelectedAnswer(null);
        setLastResult(null);
    };

    const currentQuestion = questions?.[currentCategory]?.[currentQuestionIndex];
    const overallProgress = getOverallProgress();

    if (isLoading) return <SkeletonDailyPractice />;

    if (error) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="bg-white border border-surface-200 rounded-3xl p-10 text-center max-w-md shadow-lg">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-black text-surface-900 mb-3 tracking-tight">Challenge Unavailable</h2>
                    <p className="text-surface-500 mb-8 font-medium">{error}</p>
                    <button onClick={() => fetchDailyQuestions()} className="bg-surface-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-surface-800 transition-colors w-full">
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-12">

            {/* ── HEADER ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-surface-900 tracking-tight mb-2 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Target className="w-6 h-6" />
                        </div>
                        Daily Challenge
                    </h1>
                    <p className="text-surface-500 text-sm sm:text-base font-medium">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Header Stats Group */}
                <div className="flex gap-4">
                    <div className="bg-white border border-surface-200/70 rounded-2xl p-4 shadow-sm flex items-center gap-4 min-w-[140px]">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${streakActive ? 'bg-orange-50 text-orange-500' : 'bg-surface-50 text-surface-400'}`}>
                            <Flame className={`w-6 h-6 ${streakActive ? 'fill-orange-500' : ''}`} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-surface-900 leading-none">{streak}</div>
                            <div className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mt-1">Day Streak</div>
                        </div>
                    </div>

                    <div className="bg-white border border-surface-200/70 rounded-2xl p-4 shadow-sm flex flex-col justify-center min-w-[180px]">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Completion</span>
                            <span className="text-base font-black text-indigo-600 leading-none">
                                {overallProgress.answered}/{overallProgress.total}
                            </span>
                        </div>
                        <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(overallProgress.answered / overallProgress.total) * 100}%` }}
                                className="h-full bg-indigo-500 rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── TABS ── */}
            <div className="flex gap-2 border-b border-surface-200 pb-px">
                {[
                    { id: 'practice', label: 'Practice', icon: <BookOpen className="w-4 h-4" /> },
                    { id: 'stats', label: 'Statistics', icon: <Trophy className="w-4 h-4" /> },
                    { id: 'leaderboard', label: 'Leaderboard', icon: <Flame className="w-4 h-4" /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-3 font-bold text-sm transition-all border-b-2 relative top-[1px] ${activeTab === tab.id
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-surface-500 hover:text-surface-800'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── PRACTICE TAB ── */}
            {activeTab === 'practice' && (
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* Sidebar Categories */}
                    <div className="lg:col-span-4 space-y-4">
                        <h3 className="text-sm font-bold text-surface-400 uppercase tracking-wider ml-1 mb-2">Topics</h3>
                        {Object.entries(categoryConfig).map(([key, config]) => {
                            const catQuestions = questions?.[key] || [];
                            const answered = catQuestions.filter(q => q.answered).length;
                            const correct = catQuestions.filter(q => q.isCorrect).length;
                            const isActive = currentCategory === key;
                            const progressPct = answered / (catQuestions.length || 1) * 100;

                            return (
                                <button
                                    key={key}
                                    onClick={() => handleCategoryChange(key)}
                                    className={`w-full group text-left rounded-3xl border transition-all duration-300 p-5 relative overflow-hidden ${isActive
                                            ? `bg-white border-2 border-indigo-500 shadow-md`
                                            : 'bg-white border-surface-200/70 hover:border-surface-300 shadow-sm hover:shadow-md'
                                        }`}
                                >
                                    {isActive && <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />}

                                    <div className="flex items-center gap-4 mb-4 relative z-10">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'bg-indigo-600 text-white' : config.iconBg
                                            }`}>
                                            {config.icon}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold transition-colors ${isActive ? 'text-surface-900' : 'text-surface-700'}`}>
                                                {config.title}
                                            </h4>
                                            <p className="text-xs font-semibold text-surface-400 mt-0.5">
                                                {answered === catQuestions.length ? 'Completed' : `${answered} of ${catQuestions.length} answered`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="h-1.5 w-full bg-surface-100 rounded-full overflow-hidden relative z-10">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPct}%` }}
                                            className={`h-full rounded-full ${isActive ? 'bg-indigo-500' : 'bg-surface-300'}`}
                                        />
                                    </div>

                                    {answered === catQuestions.length && catQuestions.length > 0 && (
                                        <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                            <Check className="w-3 h-3" /> {correct}/{answered}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Question Area */}
                    <div className="lg:col-span-8">
                        {currentQuestion ? (
                            <motion.div
                                key={currentQuestionIndex + currentCategory}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-surface-200/70 rounded-[2rem] p-6 sm:p-10 shadow-sm relative overflow-hidden"
                            >
                                {/* Decorative orb */}
                                <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 bg-gradient-to-br ${categoryConfig[currentCategory].gradient}`} />

                                {/* Header tags */}
                                <div className="flex flex-wrap items-center gap-3 mb-8 relative z-10">
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${categoryConfig[currentCategory].bgGradient} ${categoryConfig[currentCategory].textColor} ${categoryConfig[currentCategory].borderColor}`}>
                                        {categoryConfig[currentCategory].title}
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${currentQuestion.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                            currentQuestion.difficulty === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                'bg-rose-50 text-rose-600 border-rose-200'
                                        }`}>
                                        {currentQuestion.difficulty}
                                    </div>
                                    <div className="ml-auto text-sm font-black text-surface-300">
                                        Q{currentQuestionIndex + 1}
                                    </div>
                                </div>

                                {/* Question text */}
                                <h2 className="text-xl sm:text-2xl font-black text-surface-900 mb-8 leading-snug tracking-tight relative z-10">
                                    {currentQuestion.questionText}
                                </h2>

                                {/* Options */}
                                <div className="space-y-3 mb-10 relative z-10">
                                    {currentQuestion.options?.map((option, idx) => {
                                        const alphabet = ['A', 'B', 'C', 'D', 'E'];
                                        const isSelected = selectedAnswer === option.id;
                                        const isCorrect = showResult && option.id === lastResult?.correctAnswer;
                                        const isWrong = showResult && isSelected && !lastResult?.isCorrect;
                                        const isAnswered = currentQuestion.answered;

                                        let stateClass = "bg-white border-surface-200 hover:border-surface-300 text-surface-700 hover:bg-surface-50";
                                        let letterClass = "bg-surface-100 text-surface-500 font-bold";

                                        if (isCorrect) {
                                            stateClass = "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm";
                                            letterClass = "bg-emerald-500 text-white shadow-inner";
                                        } else if (isWrong) {
                                            stateClass = "bg-rose-50 border-rose-400 text-rose-900";
                                            letterClass = "bg-rose-500 text-white shadow-inner";
                                        } else if (isSelected) {
                                            stateClass = "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-inner";
                                            letterClass = "bg-indigo-600 text-white";
                                        } else if (isAnswered) {
                                            stateClass = "bg-surface-50 border-surface-200 opacity-60 pointer-events-none";
                                        }

                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => !isAnswered && handleAnswerSelect(option.id)}
                                                disabled={isAnswered || isSubmitting}
                                                className={`w-full group p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 ${stateClass}`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm transition-colors ${letterClass}`}>
                                                    {isCorrect ? <Check className="w-5 h-5" /> : isWrong ? <X className="w-5 h-5" /> : alphabet[idx]}
                                                </div>
                                                <span className="font-semibold text-sm sm:text-base leading-tight pt-0.5">{option.text}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Result Explanation */}
                                <AnimatePresence>
                                    {showResult && lastResult?.explanation && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className={`p-5 rounded-2xl mb-8 border ${lastResult.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                                                }`}
                                        >
                                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-4 ${lastResult.isCorrect ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-rose-100 text-rose-600 border-rose-200'
                                                    }`}>
                                                    {lastResult.isCorrect ? <Check strokeWidth={3} className="w-5 h-5" /> : <X strokeWidth={3} className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <h4 className={`font-black text-lg mb-1 ${lastResult.isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                                                        {lastResult.isCorrect ? 'Perfect!' : 'Not quite right.'}
                                                    </h4>
                                                    <p className={`text-sm font-medium ${lastResult.isCorrect ? 'text-emerald-700/80' : 'text-rose-700/80'}`}>
                                                        {lastResult.explanation}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Action Toolbar */}
                                <div className="flex items-center justify-between pt-6 border-t border-surface-100 relative z-10">
                                    {/* Question navigator */}
                                    <div className="flex gap-2 isolate">
                                        {(questions?.[currentCategory] || []).map((q, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setCurrentQuestionIndex(idx);
                                                    setShowResult(q.answered);
                                                    setSelectedAnswer(q.userAnswer);
                                                    if (q.answered) {
                                                        setLastResult({ isCorrect: q.isCorrect, correctAnswer: q.correctAnswer, explanation: q.explanation });
                                                    } else {
                                                        setLastResult(null);
                                                    }
                                                }}
                                                className={`w-3 h-3 rounded-full transition-all ${currentQuestionIndex === idx ? 'w-8 bg-indigo-600' :
                                                        q.answered ? (q.isCorrect ? 'bg-emerald-400' : 'bg-rose-400') :
                                                            'bg-surface-200 hover:bg-surface-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {!currentQuestion.answered && !showResult ? (
                                        <button
                                            onClick={handleSubmitAnswer}
                                            disabled={!selectedAnswer || isSubmitting}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-8 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                                        >
                                            {isSubmitting ? 'Evaluating...' : 'Submit Answer'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleNextQuestion}
                                            className="bg-surface-900 hover:bg-black text-white text-sm font-bold px-8 py-3 rounded-xl shadow-lg shadow-surface-900/20 transition-all hover:scale-[1.02] flex items-center gap-2"
                                        >
                                            {isCompleted ? 'View Results' : 'Next Question'}
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-white border border-surface-200/70 rounded-[2rem] p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[2rem] flex items-center justify-center rotate-12 mb-8 shadow-xl shadow-emerald-500/20">
                                    <Trophy className="w-12 h-12 text-white -rotate-12" />
                                </div>
                                <h2 className="text-3xl font-black text-surface-900 mb-3 tracking-tight">Challenge Completed!</h2>
                                <p className="text-surface-500 font-medium mb-8 max-w-md">You've successfully finished all daily practice questions. Come back tomorrow for a new set!</p>

                                <div className="flex gap-8 mb-8">
                                    <div>
                                        <div className="text-4xl font-black text-emerald-600 mb-1">{overallProgress.correct}</div>
                                        <div className="text-xs font-bold text-surface-400 uppercase tracking-wider">Correct</div>
                                    </div>
                                    <div className="w-px bg-surface-200" />
                                    <div>
                                        <div className="text-4xl font-black text-surface-900 mb-1">{overallProgress.total}</div>
                                        <div className="text-xs font-bold text-surface-400 uppercase tracking-wider">Total</div>
                                    </div>
                                </div>

                                <button onClick={() => setActiveTab('stats')} className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                                    View Detailed Statistics &rarr;
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── STATS TAB ── */}
            {activeTab === 'stats' && stats && (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white border border-surface-200/70 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                                <Flame className="w-6 h-6 fill-orange-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-surface-900 text-lg">Current Streak</h3>
                                <p className="text-xs text-surface-500 font-medium tracking-wide">Keep the fire burning</p>
                            </div>
                        </div>
                        <div className="text-5xl font-black text-surface-900 tracking-tight">{stats.currentStreak} <span className="text-xl text-surface-400 font-bold">Days</span></div>
                        <div className="mt-4 pt-4 border-t border-surface-100 flex justify-between">
                            <span className="text-sm font-semibold text-surface-400">Longest Record</span>
                            <span className="text-sm font-black text-orange-500">{stats.longestStreak} Days</span>
                        </div>
                    </div>

                    <div className="bg-white border border-surface-200/70 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                <Check className="w-6 h-6 stroke-[3]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-surface-900 text-lg">Days Completed</h3>
                                <p className="text-xs text-surface-500 font-medium tracking-wide">Total consistency</p>
                            </div>
                        </div>
                        <div className="text-5xl font-black text-surface-900 tracking-tight">{stats.totalDaysCompleted} <span className="text-xl text-surface-400 font-bold">Days</span></div>
                        <div className="mt-4 pt-4 border-t border-surface-100 flex justify-between">
                            <span className="text-sm font-semibold text-surface-400">Total Attempts</span>
                            <span className="text-sm font-black text-surface-600">{stats.totalDaysAttempted} Days</span>
                        </div>
                    </div>

                    <div className="bg-white border border-surface-200/70 rounded-3xl p-6 shadow-sm md:col-span-2 lg:col-span-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full" />
                        <h3 className="font-bold text-surface-900 text-lg mb-6 relative z-10">Skill Breakdown</h3>
                        <div className="space-y-5 relative z-10">
                            {Object.entries(stats.categoryPerformance || {}).map(([cat, perf]) => {
                                const config = categoryConfig[cat];
                                const percentage = perf.total > 0 ? Math.round((perf.correct / perf.total) * 100) : 0;
                                return (
                                    <div key={cat}>
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-sm font-bold text-surface-700">{config?.title || cat}</span>
                                            <span className="text-sm font-black text-indigo-600">{percentage}%</span>
                                        </div>
                                        <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                                            <div className={`h-full bg-gradient-to-r ${config?.gradient || 'from-indigo-400 to-purple-500'} rounded-full`} style={{ width: `${percentage}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white border border-surface-200/70 rounded-3xl p-6 shadow-sm md:col-span-2 lg:col-span-4">
                        <h3 className="font-bold text-surface-900 text-lg mb-6">Recent History</h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                            {(stats.recentHistory || []).map((day, idx) => (
                                <div key={idx} className={`flex-shrink-0 w-32 p-4 rounded-2xl border flex flex-col items-center justify-center text-center ${day.isCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-surface-50 border-surface-200'
                                    }`}>
                                    <div className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">
                                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className={`text-2xl font-black mb-2 ${day.isCompleted ? 'text-emerald-600' : 'text-surface-300'}`}>
                                        {day.totalScore}<span className="text-sm opacity-50">/{day.maxScore}</span>
                                    </div>
                                    {day.isCompleted && (
                                        <div className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-white px-2 py-1 rounded-full shadow-sm">
                                            <Flame className="w-3 h-3 fill-orange-500" /> {day.streak}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── LEADERBOARD TAB ── */}
            {activeTab === 'leaderboard' && (
                <div className="bg-white border border-surface-200/70 rounded-3xl shadow-sm overflow-hidden max-w-4xl mx-auto">
                    <div className="p-6 sm:p-8 bg-surface-50 border-b border-surface-200 flex items-center justify-between">
                        <div>
                            <h3 className="font-black text-2xl text-surface-900">Today's Top Performers</h3>
                            <p className="text-surface-500 text-sm font-medium mt-1">Updated in real-time</p>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-surface-200">
                            <Trophy className="w-6 h-6 text-indigo-500" />
                        </div>
                    </div>

                    {leaderboard.length > 0 ? (
                        <div className="divide-y divide-surface-100 p-2 sm:p-4">
                            {leaderboard.map((entry, idx) => (
                                <div key={idx} className={`p-4 rounded-2xl flex items-center gap-4 sm:gap-6 ${idx < 3 ? 'bg-indigo-50/50' : 'hover:bg-surface-50'} transition-colors`}>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${idx === 0 ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-white shadow-lg shadow-amber-500/30' :
                                            idx === 1 ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-white shadow-lg shadow-gray-400/30' :
                                                idx === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-600 text-white shadow-lg shadow-orange-500/30' :
                                                    'bg-surface-100 text-surface-400'
                                        }`}>
                                        #{idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-surface-900 text-lg">
                                            {entry.firstName} {entry.lastName}
                                        </div>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                                            <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">{entry.streak} Day Streak</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black text-indigo-600">
                                            {entry.totalScore}<span className="text-surface-300 text-base">/{entry.maxScore}</span>
                                        </div>
                                        <div className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
                                            {Math.round(entry.percentage)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-16 text-center text-surface-500">
                            <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trophy className="w-10 h-10 text-surface-300 grayscale" />
                            </div>
                            <h4 className="text-lg font-bold text-surface-900 mb-1">No Entries Yet</h4>
                            <p className="font-medium text-surface-400">Be the first to finish today's practice and take the #1 spot!</p>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
