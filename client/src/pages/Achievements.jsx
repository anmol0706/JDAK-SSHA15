import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { analyticsService } from '../services/interviewService';
import { BadgeGrid, BadgeModal, BadgeUnlockCelebration, BADGE_DEFINITIONS } from '../components/ui/AchievementBadges';
import { Trophy, Star, Flame, Target, Sparkles, Filter, ChevronDown, Check } from 'lucide-react';

// Categories matching previous logic
const CATEGORIES = [
    { id: 'all', name: 'All Awards', icon: '🏆' },
    { id: 'interviews', name: 'Milestones', icon: '🎯' },
    { id: 'streaks', name: 'Streaks', icon: '🔥' },
    { id: 'scores', name: 'High Scores', icon: '⭐' },
    { id: 'daily', name: 'Challenges', icon: '⚔️' },
    { id: 'types', name: 'Categories', icon: '📊' },
    { id: 'special', name: 'Special', icon: '✨' }
];

const RARITIES = [
    { id: 'all', name: 'Any Rarity' },
    { id: 'common', name: 'Common', color: 'bg-surface-100 text-surface-600 border-surface-200' },
    { id: 'uncommon', name: 'Uncommon', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { id: 'rare', name: 'Rare', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    { id: 'epic', name: 'Epic', color: 'bg-purple-50 text-purple-600 border-purple-200' },
    { id: 'legendary', name: 'Legendary', color: 'bg-amber-50 text-amber-600 border-amber-200' }
];

export default function Achievements() {
    const { user } = useAuthStore();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedRarity, setSelectedRarity] = useState('all');
    const [showLocked, setShowLocked] = useState(true);
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [newBadge, setNewBadge] = useState(null);
    const [rarityOpen, setRarityOpen] = useState(false);

    const { data: achievementsData, isLoading } = useQuery({
        queryKey: ['achievements'],
        queryFn: analyticsService.getDashboard
    });

    const calculateUnlockedBadges = () => {
        const stats = achievementsData?.data;
        if (!stats) return [];
        const unlocked = [];
        const overview = stats.overview || {};

        if (overview.totalInterviews >= 1) unlocked.push('first_interview');
        if (overview.totalInterviews >= 10) unlocked.push('interview_10');
        if (overview.totalInterviews >= 25) unlocked.push('interview_25');
        if (overview.totalInterviews >= 50) unlocked.push('interview_50');
        if (overview.totalInterviews >= 100) unlocked.push('interview_100');

        const streak = overview.currentStreak || 0;
        const longestStreak = overview.longestStreak || streak;
        if (longestStreak >= 3) unlocked.push('streak_3');
        if (longestStreak >= 7) unlocked.push('streak_7');
        if (longestStreak >= 14) unlocked.push('streak_14');
        if (longestStreak >= 30) unlocked.push('streak_30');
        if (longestStreak >= 100) unlocked.push('streak_100');

        if (overview.averageScore >= 80) unlocked.push('consistent');
        if (stats.recentInterviews?.some(i => i.score >= 100)) unlocked.push('perfect_score');
        if ((stats.recentInterviews?.filter(i => i.score >= 90).length || 0) >= 5) unlocked.push('high_scorer');

        const dailyDaysCompleted = user?.statistics?.streakDays || 0;
        if (dailyDaysCompleted >= 1) unlocked.push('daily_first');
        if (dailyDaysCompleted >= 7) unlocked.push('daily_7');
        if (dailyDaysCompleted >= 30) unlocked.push('daily_30');

        const hour = new Date().getHours();
        if (hour >= 0 && hour < 5) unlocked.push('night_owl');
        if (hour >= 4 && hour < 6) unlocked.push('early_bird');

        return unlocked;
    };

    const unlockedBadgeIds = calculateUnlockedBadges();
    const allBadges = Object.values(BADGE_DEFINITIONS);

    const filteredBadges = allBadges.filter(badge => {
        if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;
        if (selectedRarity !== 'all' && badge.rarity !== selectedRarity) return false;
        if (!showLocked && !unlockedBadgeIds.includes(badge.id)) return false;
        return true;
    });

    const totalBadges = allBadges.length;
    const unlockedCount = unlockedBadgeIds.length;
    const progressPercent = Math.round((unlockedCount / totalBadges) * 100) || 0;

    const badgesByCategory = CATEGORIES.slice(1).map(cat => ({
        ...cat,
        badges: filteredBadges.filter(b => b.category === cat.id),
        unlockedCount: filteredBadges.filter(b => b.category === cat.id && unlockedBadgeIds.includes(b.id)).length,
        totalCount: allBadges.filter(b => b.category === cat.id).length
    }));

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-6xl mx-auto pb-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="h-12 w-48 bg-surface-200/50 animate-pulse rounded-full" />
                    <div className="h-16 w-32 bg-surface-200/50 animate-pulse rounded-2xl" />
                </div>
                <div className="h-24 bg-surface-200/50 animate-pulse rounded-3xl" />
                <div className="flex gap-2">
                    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 w-24 bg-surface-200/50 animate-pulse rounded-xl" />)}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-32 bg-surface-200/50 animate-pulse rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 lg:space-y-8 pb-12 max-w-6xl mx-auto">

            {/* ── HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-surface-900 tracking-tight mb-2 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Trophy className="w-6 h-6" />
                        </div>
                        Trophy Room
                    </h1>
                    <p className="text-surface-500 text-sm sm:text-base max-w-xl">
                        A showcase of your milestones, consistent dedication, and excellence.
                    </p>
                </div>

                <div className="flex bg-white border border-surface-200/70 rounded-2xl p-4 shadow-sm min-w-[160px] items-center gap-4">
                    <div className="w-12 h-12 border-4 border-amber-100 rounded-full flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border-4 border-amber-500" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${progressPercent}%, 0 ${progressPercent}%)` }} />
                        <Sparkles className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-surface-900 leading-none">{unlockedCount}</div>
                        <div className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mt-1">Unlocked</div>
                    </div>
                </div>
            </div>

            {/* ── PROGRESS BAR ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-surface-200/70 rounded-3xl p-5 sm:p-7 shadow-sm relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="text-sm font-bold text-surface-900 uppercase tracking-wider">Completion Progress</span>
                    <span className="text-xl font-black text-amber-600">{progressPercent}%</span>
                </div>
                <div className="h-4 bg-surface-100 rounded-full overflow-hidden shadow-inner relative z-10 border border-surface-200/50">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                        className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full relative"
                    >
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-white/30 rounded-full w-full" />
                    </motion.div>
                </div>
                <div className="flex justify-between mt-4 text-[10px] sm:text-xs font-bold text-surface-400 uppercase tracking-wider relative z-10">
                    <span className={progressPercent >= 25 ? "text-amber-600" : ""}>Bronze (25%)</span>
                    <span className={progressPercent >= 50 ? "text-amber-600 text-center" : "text-center"}>Silver (50%)</span>
                    <span className={progressPercent >= 75 ? "text-amber-600 text-right" : "text-right"}>Gold (75%)</span>
                </div>
            </motion.div>

            {/* ── CONTROLS ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
            >
                {/* Categories Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-bold transition-all ${selectedCategory === cat.id
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                    : 'bg-white text-surface-600 border border-surface-200/70 hover:border-surface-300 hover:bg-surface-50'
                                }`}
                        >
                            <span className="text-base">{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Sub Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-surface-200/70 rounded-2xl p-3 sm:px-5 sm:py-3 shadow-sm">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative">
                            <button
                                onClick={() => setRarityOpen(!rarityOpen)}
                                className="flex items-center gap-2 px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm font-semibold text-surface-700 hover:bg-surface-100 transition-colors"
                            >
                                <Filter className="w-4 h-4 text-surface-400" />
                                {RARITIES.find(r => r.id === selectedRarity)?.name}
                                <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform ${rarityOpen ? "rotate-180" : ""}`} />
                            </button>

                            <AnimatePresence>
                                {rarityOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setRarityOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 mt-2 w-48 bg-white border border-surface-200 rounded-xl shadow-xl z-20 py-1"
                                        >
                                            {RARITIES.map(r => (
                                                <button
                                                    key={r.id}
                                                    onClick={() => { setSelectedRarity(r.id); setRarityOpen(false); }}
                                                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-surface-50 transition-colors text-left"
                                                >
                                                    <span className={r.color ? r.color.replace('bg-', 'text-').split(' ')[0] : 'text-surface-700'}>{r.name}</span>
                                                    {selectedRarity === r.id && <Check className="w-4 h-4 text-indigo-600" />}
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={showLocked}
                                    onChange={(e) => setShowLocked(e.target.checked)}
                                    className="peer appearance-none w-5 h-5 rounded-md border-2 border-surface-300 bg-white checked:bg-indigo-600 checked:border-indigo-600 transition-colors cursor-pointer"
                                />
                                <Check className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                            </div>
                            <span className="text-sm font-semibold text-surface-700 group-hover:text-surface-900 transition-colors">Show Locked</span>
                        </label>
                    </div>

                    <div className="text-xs font-bold text-surface-400 bg-surface-100 px-3 py-1.5 rounded-lg w-full sm:w-auto text-center">
                        Showing {filteredBadges.length} items
                    </div>
                </div>
            </motion.div>

            {/* ── GRID ── */}
            <div className="pt-2">
                {selectedCategory === 'all' ? (
                    <div className="space-y-10">
                        {badgesByCategory.map((category, index) => {
                            if (category.badges.length === 0) return null;
                            return (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.05 }}
                                    className="bg-white border border-surface-200/70 rounded-3xl p-5 sm:p-7 shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-100">
                                        <h3 className="text-lg font-black text-surface-900 flex items-center gap-2.5 tracking-tight">
                                            <span className="text-xl">{category.icon}</span>
                                            {category.name}
                                        </h3>
                                        <div className="bg-surface-100 text-surface-600 text-xs font-bold px-3 py-1.5 rounded-full">
                                            {category.unlockedCount} / {category.totalCount} Unlocked
                                        </div>
                                    </div>
                                    {/* The BadgeGrid styling itself lives in its own component, but the context around it is improved */}
                                    <BadgeGrid
                                        badges={category.badges}
                                        unlockedBadgeIds={unlockedBadgeIds}
                                        showLocked={showLocked}
                                        onBadgeClick={setSelectedBadge}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-surface-200/70 rounded-3xl p-5 sm:p-7 shadow-sm"
                    >
                        <BadgeGrid
                            badges={filteredBadges}
                            unlockedBadgeIds={unlockedBadgeIds}
                            showLocked={showLocked}
                            onBadgeClick={setSelectedBadge}
                        />
                    </motion.div>
                )}

                {filteredBadges.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl border border-surface-200/70 p-12 text-center shadow-sm max-w-2xl mx-auto"
                    >
                        <div className="text-6xl mb-4 grayscale opacity-50">🕵️</div>
                        <h3 className="text-xl font-black text-surface-900 mb-2">No badges collected yet</h3>
                        <p className="text-surface-500 text-sm max-w-sm mx-auto">
                            Try adjusting your filters or continue crushing interviews to unlock rare achievements!
                        </p>
                    </motion.div>
                )}
            </div>

            {selectedBadge && (
                <BadgeModal
                    badge={selectedBadge}
                    unlocked={unlockedBadgeIds.includes(selectedBadge.id)}
                    onClose={() => setSelectedBadge(null)}
                />
            )}
            {newBadge && (
                <BadgeUnlockCelebration
                    badge={newBadge}
                    onClose={() => setNewBadge(null)}
                />
            )}
        </div>
    );
}
