import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { useInterviewStore } from '../../stores/interviewStore';
import { interviewService } from '../../services/interviewService';
import toast from 'react-hot-toast';
import {
    Code2,
    Users,
    Layers,
    Briefcase,
    Zap,
    Smile,
    Mic,
    MicOff,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Target,
    Building2,
    HelpCircle,
    CheckCircle2,
    Sparkles,
    Settings
} from 'lucide-react';

const interviewTypes = [
    {
        id: 'technical',
        name: 'Technical',
        description: 'Data structures, algorithms & coding problems',
        icon: Code2,
        color: 'from-blue-500 to-indigo-500',
        bgGlow: 'shadow-blue-500/20',
        subCategories: ['JavaScript', 'Python', 'React', 'Node.js', 'Algorithms', 'System Fundamentals']
    },
    {
        id: 'behavioral',
        name: 'Behavioral',
        description: 'Leadership, teamwork & conflict resolution',
        icon: Users,
        color: 'from-purple-500 to-fuchsia-500',
        bgGlow: 'shadow-purple-500/20',
        subCategories: ['Leadership', 'Teamwork', 'Conflict Resolution', 'Time Management']
    },
    {
        id: 'system-design',
        name: 'System Design',
        description: 'Architecture, scalability & trade-offs',
        icon: Layers,
        color: 'from-orange-500 to-red-500',
        bgGlow: 'shadow-orange-500/20',
        subCategories: ['Distributed Systems', 'Databases', 'API Design', 'Scalability']
    },
    {
        id: 'hr',
        name: 'HR Screening',
        description: 'Career goals, company fit & expectations',
        icon: Briefcase,
        color: 'from-emerald-500 to-teal-500',
        bgGlow: 'shadow-emerald-500/20',
        subCategories: ['Career Goals', 'Company Fit', 'Salary Negotiation']
    }
];

const personalities = [
    { id: 'friendly', name: 'Friendly', icon: Smile, description: 'Supportive, encouraging & relaxed' },
    { id: 'professional', name: 'Professional', icon: Briefcase, description: 'Balanced corporate standard style' },
    { id: 'strict', name: 'Strict', icon: Zap, description: 'Rigorous FAANG-style high-pressure' }
];

const difficulties = [
    { id: 'easy', name: 'Easy', description: 'Fundamentals' },
    { id: 'medium', name: 'Medium', description: 'Standard' },
    { id: 'hard', name: 'Hard', description: 'Advanced' },
    { id: 'expert', name: 'Expert', description: 'FAANG+' }
];

const steps = [
    { num: 1, title: 'Type', icon: Target },
    { num: 2, title: 'Settings', icon: Settings },
    { num: 3, title: 'Target', icon: Building2 }
];

export default function NewInterview() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuthStore();
    const { setSession, initSocket } = useInterviewStore();

    const [step, setStep] = useState(1);
    const [config, setConfig] = useState({
        interviewType: searchParams.get('type') || 'technical',
        subCategory: '',
        personality: user?.preferences?.interviewerPersonality || 'professional',
        difficulty: user?.preferences?.difficultyLevel || 'medium',
        targetCompany: '',
        targetRole: '',
        voiceEnabled: user?.preferences?.voiceEnabled ?? true,
        totalQuestions: 10
    });

    const startMutation = useMutation({
        mutationFn: interviewService.startInterview,
        onSuccess: (data) => {
            setSession(data.data);
            initSocket();
            navigate(`/interview/${data.data.sessionId}`);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to start interview');
        }
    });

    const selectedType = interviewTypes.find(t => t.id === config.interviewType);

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            startMutation.mutate(config);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white/80 backdrop-blur-xl border border-surface-200/60 shadow-xl rounded-3xl p-6 sm:p-10 lg:p-12">

                {/* Header Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-primary-50 rounded-2xl mb-4 shadow-sm border border-primary-100">
                        <Sparkles className="w-8 h-8 text-primary-500" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-surface-900 tracking-tight mb-3">
                        Configure Your Interview
                    </h1>
                    <p className="text-surface-500 text-sm sm:text-base max-w-xl mx-auto">
                        Customize your AI-driven interview session to perfectly match your target role and goals.
                    </p>
                </div>

                {/* Progress Stepper */}
                <div className="relative mb-12 sm:mb-16">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-100 -translate-y-1/2 rounded-full hidden sm:block"></div>
                    <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary-400 to-indigo-500 -translate-y-1/2 rounded-full hidden sm:block transition-all duration-500 ease-in-out" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>

                    <div className="relative flex justify-between sm:justify-around">
                        {steps.map((s, idx) => {
                            const isCompleted = s.num < step;
                            const isActive = s.num === step;
                            return (
                                <div key={s.num} className="flex flex-col items-center z-10">
                                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${isActive
                                        ? 'bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-primary-500/30 shadow-lg scale-110'
                                        : isCompleted
                                            ? 'bg-success-500 text-white shadow-success-500/20'
                                            : 'bg-white border-2 border-surface-200 text-surface-400 hover:border-primary-300'
                                        }`}>
                                        {isCompleted ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <s.icon className="w-4 h-4 sm:w-6 sm:h-6" />}
                                    </div>
                                    <span className={`mt-3 text-xs sm:text-sm font-bold transition-colors ${isActive ? 'text-primary-600' : isCompleted ? 'text-success-600' : 'text-surface-400'}`}>
                                        {s.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                                    {interviewTypes.map((type) => {
                                        const isSelected = config.interviewType === type.id;
                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => setConfig({ ...config, interviewType: type.id })}
                                                className={`group relative p-5 lg:p-6 rounded-2xl text-left transition-all duration-300 border-2 overflow-hidden ${isSelected
                                                    ? `border-primary-500/60 bg-primary-50/40 ${type.bgGlow} shadow-xl scale-[1.02]`
                                                    : 'border-surface-200/60 bg-white hover:border-primary-300 hover:shadow-md hover:bg-surface-50/50'
                                                    }`}
                                            >
                                                {isSelected && (
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-transparent blur-2xl -mr-10 -mt-10 rounded-full" />
                                                )}
                                                <div className="flex items-start gap-4 lg:gap-5 relative z-10">
                                                    <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl shadow-md flex items-center justify-center shrink-0 bg-gradient-to-br ${type.color}`}>
                                                        <type.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base lg:text-lg font-bold text-surface-900 mb-1 lg:mb-1.5">{type.name}</h3>
                                                        <p className="text-xs lg:text-sm text-surface-500 leading-relaxed">{type.description}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {selectedType && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="bg-surface-50/80 border border-surface-200 rounded-2xl p-5 lg:p-6"
                                    >
                                        <h4 className="text-sm font-bold text-surface-800 mb-4 flex items-center gap-2">
                                            <Target className="w-4 h-4 text-primary-500" />
                                            Specific Focus Area (Recommended)
                                        </h4>
                                        <div className="flex flex-wrap gap-2 lg:gap-3">
                                            {selectedType.subCategories.map((sub) => {
                                                const isSelected = config.subCategory === sub;
                                                return (
                                                    <button
                                                        key={sub}
                                                        onClick={() => setConfig({ ...config, subCategory: config.subCategory === sub ? '' : sub })}
                                                        className={`px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 border ${isSelected
                                                            ? 'bg-primary-500 text-white border-primary-600 shadow-md shadow-primary-500/20'
                                                            : 'bg-white text-surface-600 border-surface-200 hover:border-primary-300 hover:bg-primary-50/50'
                                                            }`}
                                                    >
                                                        {sub}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                {/* Interviewer Style */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-surface-800 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-indigo-500" />
                                        Interviewer Persona
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                        {personalities.map((p) => {
                                            const isSelected = config.personality === p.id;
                                            return (
                                                <button
                                                    key={p.id}
                                                    onClick={() => setConfig({ ...config, personality: p.id })}
                                                    className={`relative p-4 rounded-2xl text-left transition-all border-2 overflow-hidden ${isSelected
                                                        ? 'bg-indigo-50/50 border-indigo-400 shadow-lg shadow-indigo-500/10'
                                                        : 'bg-white border-surface-200 hover:border-indigo-200 hover:bg-surface-50'
                                                        }`}
                                                >
                                                    <p.icon className={`w-6 h-6 mb-3 ${isSelected ? 'text-indigo-600' : 'text-surface-400'}`} />
                                                    <h5 className={`font-bold text-sm mb-1 ${isSelected ? 'text-indigo-900' : 'text-surface-800'}`}>{p.name}</h5>
                                                    <p className="text-xs text-surface-500">{p.description}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Difficulty */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-surface-800 flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-amber-500" />
                                            Difficulty Level
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {difficulties.map((d) => {
                                                const isSelected = config.difficulty === d.id;
                                                return (
                                                    <button
                                                        key={d.id}
                                                        onClick={() => setConfig({ ...config, difficulty: d.id })}
                                                        className={`p-3 rounded-xl text-center transition-all border ${isSelected
                                                            ? 'bg-amber-50 border-amber-400 text-amber-700 font-bold shadow-sm'
                                                            : 'bg-white border-surface-200 text-surface-600 hover:border-amber-200 hover:bg-amber-50/30'
                                                            }`}
                                                    >
                                                        <div className="text-sm font-semibold">{d.name}</div>
                                                        <div className="text-[10px] text-surface-400 font-normal mt-0.5">{d.description}</div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Additional Toggles */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-surface-800 flex items-center gap-2">
                                            <Settings className="w-4 h-4 text-surface-500" />
                                            Configuration
                                        </h4>
                                        {/* Voice Toggle */}
                                        <div className="flex items-center justify-between p-4 bg-white border border-surface-200 rounded-xl hover:border-surface-300 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${config.voiceEnabled ? 'bg-primary-50 text-primary-500' : 'bg-surface-100 text-surface-400'}`}>
                                                    {config.voiceEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-sm text-surface-900">Voice Interaction</h5>
                                                    <p className="text-xs text-surface-500">Answer using your microphone</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setConfig({ ...config, voiceEnabled: !config.voiceEnabled })}
                                                className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${config.voiceEnabled ? 'bg-primary-500' : 'bg-surface-300'}`}
                                            >
                                                <div className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${config.voiceEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </button>
                                        </div>

                                        {/* Questions Count */}
                                        <div className="p-4 bg-white border border-surface-200 rounded-xl mt-3">
                                            <label className="text-xs font-bold text-surface-500 flex items-center gap-1.5 mb-2 block uppercase tracking-wide">
                                                <HelpCircle className="w-3.5 h-3.5" />
                                                Number of Questions
                                            </label>
                                            <select
                                                value={config.totalQuestions}
                                                onChange={(e) => setConfig({ ...config, totalQuestions: parseInt(e.target.value) })}
                                                className="w-full bg-surface-50 border outline-none focus:ring-2 focus:ring-primary-500/20 border-surface-200 rounded-lg px-3 py-2.5 text-sm font-semibold text-surface-800 transition-shadow"
                                            >
                                                <option value={5}>5 Questions (~15 min)</option>
                                                <option value={10}>10 Questions (~30 min)</option>
                                                <option value={15}>15 Questions (~45 min)</option>
                                                <option value={20}>20 Questions (~60 min)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                                    <h3 className="text-xl sm:text-2xl font-bold mb-2 relative z-10">Almost Ready!</h3>
                                    <p className="text-indigo-100 text-sm mb-6 max-w-lg relative z-10">Providing specific company and role details helps the AI tailor the questions to match the exact reality of your target interview.</p>

                                    <div className="space-y-4 relative z-10 grid md:grid-cols-2 gap-x-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5" />
                                                Target Company (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={config.targetCompany}
                                                onChange={(e) => setConfig({ ...config, targetCompany: e.target.value })}
                                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-indigo-200/50 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all backdrop-blur-sm"
                                                placeholder="e.g., Google, Amazon, Stripe"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                                                <Target className="w-3.5 h-3.5" />
                                                Target Role (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={config.targetRole}
                                                onChange={(e) => setConfig({ ...config, targetRole: e.target.value })}
                                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-indigo-200/50 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all backdrop-blur-sm"
                                                placeholder="e.g., Senior Frontend Engineer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Card */}
                                <div className="bg-surface-50 border border-surface-200 rounded-2xl p-5 mt-6">
                                    <h4 className="font-bold text-surface-900 text-sm mb-4">Interview Configuration Summary</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                                        <div>
                                            <span className="text-xs text-surface-500 block mb-0.5">Type</span>
                                            <span className="font-semibold text-surface-800 capitalize">{config.interviewType}</span>
                                        </div>
                                        {config.subCategory && (
                                            <div>
                                                <span className="text-xs text-surface-500 block mb-0.5">Focus Area</span>
                                                <span className="font-semibold text-surface-800">{config.subCategory}</span>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-xs text-surface-500 block mb-0.5">Persona</span>
                                            <span className="font-semibold text-surface-800 capitalize">{config.personality}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-surface-500 block mb-0.5">Difficulty</span>
                                            <span className="font-semibold text-surface-800 capitalize">{config.difficulty}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-surface-500 block mb-0.5">Questions</span>
                                            <span className="font-semibold text-surface-800">{config.totalQuestions}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-surface-500 block mb-0.5">Voice Mode</span>
                                            <span className="font-semibold text-surface-800">{config.voiceEnabled ? 'Enabled' : 'Disabled'}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div >

                {/* Footer Controls */}
                < div className="flex items-center justify-between mt-10 pt-6 border-t border-surface-100" >
                    <button
                        onClick={handleBack}
                        className={`group px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${step > 1
                                ? 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                                : 'opacity-0 pointer-events-none'
                            }`}
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={startMutation.isPending}
                        className="group bg-surface-900 hover:bg-black text-white text-sm font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 shadow-lg shadow-surface-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:scale-100"
                    >
                        {startMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Setting up...
                            </>
                        ) : step < 3 ? (
                            <>
                                Continue
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                Start Interview
                            </>
                        )}
                    </button>
                </div >
            </div >
        </div >
    );
}
