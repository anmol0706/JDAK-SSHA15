import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import {
    LayoutDashboard,
    MessageSquarePlus,
    History,
    BarChart3,
    Settings,
    LogOut,
    ChevronLeft,
    Menu,
    X,
    Sparkles,
    User,
    Flame,
    Trophy,
    LogOutIcon
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/daily-practice', icon: Flame, label: 'Daily Practice' },
    { path: '/interview/new', icon: MessageSquarePlus, label: 'New Interview' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/achievements', icon: Trophy, label: 'Achievements' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex selection:bg-indigo-500/30 font-sans">
            {/* ── DESKTOP SIDEBAR ── */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarCollapsed ? 90 : 280 }}
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white border-r border-surface-200/60 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
            >
                {/* Logo Area */}
                <div className="h-24 flex items-center px-6 justify-between relative">
                    <AnimatePresence mode="wait">
                        {!sidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-3 overflow-hidden origin-left"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg shadow-indigo-600/20 flex-shrink-0">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-black tracking-tight text-surface-900 truncate">
                                    JDAK
                                </span>
                            </motion.div>
                        )}
                        {sidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg shadow-indigo-600/20 flex-shrink-0"
                            >
                                <Sparkles className="w-5 h-5 text-white" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Collapse Toggle */}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className={`absolute -right-4 top-8 w-8 h-8 rounded-full bg-white border border-surface-200/80 shadow-sm flex items-center justify-center text-surface-400 hover:text-surface-900 hover:border-surface-300 hover:shadow-md transition-all z-10 ${sidebarCollapsed ? 'rotate-180' : ''}`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 overflow-y-auto hide-scrollbar flex flex-col gap-1.5">
                    <p className={`px-4 text-[10px] font-bold uppercase tracking-widest text-surface-400 mb-2 transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 text-center' : 'opacity-100'}`}>
                        {sidebarCollapsed ? 'Nav' : 'Main Menu'}
                    </p>

                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `relative group flex items-center gap-3.5 px-3.5 py-3.5 rounded-2xl transition-all duration-200 overflow-hidden ${isActive
                                    ? 'text-indigo-700 font-bold'
                                    : 'text-surface-500 font-semibold hover:text-surface-900 hover:bg-surface-50/80 border border-transparent'
                                } ${sidebarCollapsed ? 'justify-center mx-1' : ''}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-nav-bg"
                                            className="absolute inset-0 bg-indigo-50 border-indigo-100/50 rounded-2xl -z-10"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <div className={`relative z-10 transition-colors ${isActive ? 'text-indigo-600' : 'text-surface-400 group-hover:text-surface-700'}`}>
                                        <item.icon className="w-5 h-5 flex-shrink-0" />
                                    </div>
                                    {!sidebarCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="relative z-10 whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom User Area */}
                <div className="p-4 mt-auto">
                    {sidebarCollapsed ? (
                        <button
                            onClick={() => setSidebarCollapsed(false)}
                            className="w-12 h-12 mx-auto rounded-xl bg-surface-100 border border-surface-200 hover:border-surface-300 flex items-center justify-center transition-all overflow-hidden shadow-sm"
                        >
                            {user?.avatar ? (
                                <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-bold">
                                    {user?.firstName?.charAt(0) || 'U'}
                                </div>
                            )}
                        </button>
                    ) : (
                        <div className="bg-surface-50 border border-surface-200/70 p-3 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md hover:border-surface-300 transition-all group">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 border border-surface-200 flex-shrink-0 flex items-center justify-center">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-indigo-600 font-bold text-sm">
                                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 pr-2">
                                <p className="text-sm font-bold text-surface-900 truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-surface-500 font-medium truncate">
                                    {user?.email}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-8 h-8 rounded-lg text-surface-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all flex-shrink-0 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                                title="Sign Out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </motion.aside>

            {/* ── MOBILE HEADER ── */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-surface-200/60 z-40 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-black tracking-tight text-surface-900">
                        JDAK
                    </span>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="w-10 h-10 rounded-xl bg-surface-100 hover:bg-surface-200 flex items-center justify-center text-surface-900 transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* ── MOBILE MENU OVERLAY ── */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:hidden fixed inset-0 bg-surface-900/40 backdrop-blur-sm z-50"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed right-0 top-0 bottom-0 w-4/5 max-w-[320px] bg-white z-50 shadow-2xl flex flex-col"
                        >
                            <div className="h-16 border-b border-surface-100 flex items-center justify-between px-6">
                                <span className="text-sm font-bold uppercase tracking-widest text-surface-400">Navigation</span>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center text-surface-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${isActive
                                                ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/50'
                                                : 'text-surface-600 font-semibold hover:bg-surface-50'
                                            }`
                                        }
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </NavLink>
                                ))}
                            </nav>

                            <div className="p-4 border-t border-surface-100">
                                <div className="bg-surface-50 p-4 rounded-2xl flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                        {user?.firstName?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-surface-900 truncate">{user?.firstName}</p>
                                        <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-10 h-10 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── MAIN CONTENT ── */}
            <main
                className={`flex-1 transition-all duration-400 ease-in-out ${sidebarCollapsed ? 'lg:ml-[90px]' : 'lg:ml-[280px]'} pt-16 lg:pt-0 min-w-0 pb-10 sm:pb-0`}
            >
                <div className="min-h-screen p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto safe-area-padding">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
