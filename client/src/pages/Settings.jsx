import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { User, Settings as SettingsIcon, Mic, MicOff, Shield, Loader2, Save, Sparkles, Sliders, Briefcase, Zap, Smile } from 'lucide-react';

export default function Settings() {
    const { user, updatePreferences, updateProfile } = useAuthStore();
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isPrefsLoading, setIsPrefsLoading] = useState(false);

    const [profile, setProfile] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        'profile.experience': user?.profile?.experience || 0,
        'profile.targetRole': user?.profile?.targetRole || '',
        'profile.targetCompany': user?.profile?.targetCompany || ''
    });

    const [preferences, setPreferences] = useState({
        interviewerPersonality: user?.preferences?.interviewerPersonality || 'professional',
        difficultyLevel: user?.preferences?.difficultyLevel || 'medium',
        voiceEnabled: user?.preferences?.voiceEnabled ?? true
    });

    const handleProfileSave = async () => {
        setIsProfileLoading(true);
        try {
            await updateProfile(profile);
            toast.success('Profile updated successfully', { icon: '✨' });
        } catch (e) {
            toast.error('Failed to update profile');
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handlePreferencesSave = async () => {
        setIsPrefsLoading(true);
        try {
            await updatePreferences(preferences);
            toast.success('Preferences saved', { icon: '⚙️' });
        } catch (e) {
            toast.error('Failed to update preferences');
        } finally {
            setIsPrefsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-6">

            {/* ── HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    <div className="inline-flex items-center justify-center p-2.5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mb-4 shadow-sm border border-indigo-200/50">
                        <SettingsIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-surface-900 tracking-tight mb-2">
                        Account Settings
                    </h1>
                    <p className="text-surface-500 text-sm sm:text-base max-w-xl">
                        Manage your personal details and customize your AI interview experience to match your unique goals.
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">

                {/* ── PROFILE SECTION ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-7 space-y-6"
                >
                    <div className="bg-white/80 backdrop-blur-xl border border-surface-200/60 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden group">
                        {/* Decorative blur */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl transition-all duration-500 group-hover:bg-indigo-500/20" />

                        <div className="flex items-center gap-4 mb-6 lg:mb-8 border-b border-surface-100 pb-5 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center shadow-inner">
                                <User className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-surface-900">Personal Profile</h2>
                                <p className="text-xs text-surface-500 font-medium">Update your basic information</p>
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-surface-700 uppercase tracking-wider ml-1">First Name</label>
                                    <input
                                        value={profile.firstName}
                                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                        className="w-full bg-surface-50/50 border border-surface-200 rounded-xl px-4 py-3 text-sm font-semibold text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-surface-700 uppercase tracking-wider ml-1">Last Name</label>
                                    <input
                                        value={profile.lastName}
                                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                        className="w-full bg-surface-50/50 border border-surface-200 rounded-xl px-4 py-3 text-sm font-semibold text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 border-t border-surface-100/50" />

                            <div className="flex items-center gap-2 mb-2">
                                <Briefcase className="w-5 h-5 text-indigo-500" />
                                <h3 className="text-base font-bold text-surface-800">Career Objectives</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-surface-700 uppercase tracking-wider ml-1">Target Role</label>
                                    <input
                                        value={profile['profile.targetRole']}
                                        onChange={(e) => setProfile({ ...profile, 'profile.targetRole': e.target.value })}
                                        className="w-full bg-surface-50/50 border border-surface-200 rounded-xl px-4 py-3 text-sm font-semibold text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
                                        placeholder="e.g., Senior Full Stack Engineer"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-surface-700 uppercase tracking-wider ml-1">Experience (Yrs)</label>
                                    <input
                                        type="number"
                                        value={profile['profile.experience']}
                                        onChange={(e) => setProfile({ ...profile, 'profile.experience': parseInt(e.target.value) || 0 })}
                                        className="w-full bg-surface-50/50 border border-surface-200 rounded-xl px-4 py-3 text-sm font-semibold text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
                                        min="0"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-surface-700 uppercase tracking-wider ml-1">Target Company</label>
                                    <input
                                        value={profile['profile.targetCompany']}
                                        onChange={(e) => setProfile({ ...profile, 'profile.targetCompany': e.target.value })}
                                        className="w-full bg-surface-50/50 border border-surface-200 rounded-xl px-4 py-3 text-sm font-semibold text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
                                        placeholder="e.g., Google, Stripe"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end relative z-10">
                            <button
                                onClick={handleProfileSave}
                                disabled={isProfileLoading}
                                className="group flex items-center gap-2 bg-surface-900 hover:bg-black text-white text-sm font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-surface-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                            >
                                {isProfileLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                <span>Save Profile</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* ── PREFERENCES SECTION ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-5 space-y-6"
                >
                    <div className="bg-white/80 backdrop-blur-xl border border-surface-200/60 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden group">
                        {/* Decorative blur */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl transition-all duration-500 group-hover:bg-purple-500/20" />

                        <div className="flex items-center gap-4 mb-6 lg:mb-8 border-b border-surface-100 pb-5 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200/50 flex items-center justify-center shadow-inner">
                                <Sliders className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-surface-900">Experience Tuning</h2>
                                <p className="text-xs text-surface-500 font-medium">Configure your AI interviewer</p>
                            </div>
                        </div>

                        <div className="space-y-7 relative z-10">

                            {/* Difficulty */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-black text-surface-800 uppercase tracking-wider">
                                    Difficulty Level
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['easy', 'medium', 'hard', 'expert'].map((level) => {
                                        const isSelected = preferences.difficultyLevel === level;
                                        return (
                                            <button
                                                key={level}
                                                onClick={() => setPreferences({ ...preferences, difficultyLevel: level })}
                                                className={`py-3 px-2 rounded-xl capitalize text-sm font-bold transition-all border-2 ${isSelected
                                                        ? 'bg-purple-50 border-purple-400 text-purple-700 shadow-md shadow-purple-500/10 scale-[1.02]'
                                                        : 'bg-surface-50/50 border-surface-200 text-surface-500 hover:bg-white hover:border-surface-300'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Interviewer Style */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-black text-surface-800 uppercase tracking-wider">
                                    Persona Style
                                </label>
                                <div className="flex flex-col gap-3">
                                    {[
                                        { id: 'friendly', desc: 'Supportive & encouraging', icon: Smile, color: 'text-emerald-500', activeBg: 'bg-emerald-50', activeBorder: 'border-emerald-400' },
                                        { id: 'professional', desc: 'Balanced & standard', icon: Briefcase, color: 'text-indigo-500', activeBg: 'bg-indigo-50', activeBorder: 'border-indigo-400' },
                                        { id: 'strict', desc: 'Direct & high-pressure', icon: Zap, color: 'text-amber-500', activeBg: 'bg-amber-50', activeBorder: 'border-amber-400' }
                                    ].map((style) => {
                                        const isSelected = preferences.interviewerPersonality === style.id;
                                        return (
                                            <button
                                                key={style.id}
                                                onClick={() => setPreferences({ ...preferences, interviewerPersonality: style.id })}
                                                className={`flex items-center justify-between p-4 rounded-xl transition-all border-2 text-left group ${isSelected
                                                        ? `${style.activeBg} ${style.activeBorder} shadow-md scale-[1.02]`
                                                        : 'bg-surface-50/50 border-surface-200 hover:bg-white hover:border-surface-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg bg-white shadow-sm border border-surface-100 ${isSelected ? style.color : 'text-surface-400'}`}>
                                                        <style.icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold capitalize text-sm ${isSelected ? 'text-surface-900' : 'text-surface-700'}`}>
                                                            {style.id}
                                                        </p>
                                                        <p className={`text-[11px] font-medium mt-0.5 ${isSelected ? 'text-surface-600' : 'text-surface-500'}`}>
                                                            {style.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? style.activeBorder.replace('border-', 'border-') : 'border-surface-300'
                                                    }`}>
                                                    {isSelected && <div className={`w-2.5 h-2.5 rounded-full ${style.color.replace('text-', 'bg-')}`} />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Voice Control */}
                            <div className="pt-4 border-t border-surface-100" />
                            <div className="flex items-center justify-between bg-white border-2 border-surface-200/60 shadow-sm p-4 rounded-2xl hover:border-purple-300 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${preferences.voiceEnabled ? 'bg-purple-100 text-purple-600' : 'bg-surface-100 text-surface-400'}`}>
                                        {preferences.voiceEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-surface-900 text-sm">Voice Interactions</p>
                                        <p className="text-xs text-surface-500 font-medium">Enable mic during interviews</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPreferences({ ...preferences, voiceEnabled: !preferences.voiceEnabled })}
                                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-inner ${preferences.voiceEnabled ? 'bg-purple-600' : 'bg-surface-300'
                                        }`}
                                >
                                    <div className={`absolute left-0.5 top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 flex items-center justify-center ${preferences.voiceEnabled ? 'translate-x-7' : 'translate-x-0'
                                        }`}>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end relative z-10">
                            <button
                                onClick={handlePreferencesSave}
                                disabled={isPrefsLoading}
                                className="group flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                            >
                                {isPrefsLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Sparkles className="w-5 h-5" />
                                )}
                                <span>Save Tuning</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
