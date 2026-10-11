import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  MessageSquare, 
  AlertTriangle, 
  Settings, 
  RotateCcw, 
  Clock, 
  Layers, 
  Brain, 
  Users, 
  Compass, 
  Award, 
  Printer, 
  FileEdit, 
  Download,
  LogIn,
  LogOut,
  Cloud,
  RefreshCw,
  ChevronDown,
  Building2,
  GraduationCap,
  Target
} from 'lucide-react';
import AuthModal from './AuthModal';

// Group mapping to resolve any specific view to its parent tab category
export const TAB_GROUPS = {
  dashboard: 'dashboard',
  chatbot: 'chatbot',
  // Curriculum Group
  subjects: 'curriculum',
  syllabus: 'curriculum',
  pyq: 'curriculum',
  community: 'curriculum',
  // Practice Group
  quiz: 'practice',
  mock: 'practice',
  flashcards: 'practice',
  mistakes: 'practice',
  // Study Hub Group
  planner: 'studyhub',
  resources: 'studyhub',
  notes: 'studyhub',
  cheatsheet: 'studyhub'
};

export const SUB_TABS = {
  curriculum: [
    { id: 'subjects', label: 'Subjects', icon: Layers, desc: 'Setup & target scores' },
    { id: 'syllabus', label: 'Syllabus Parser', icon: BookOpen, desc: 'AI syllabus extractor' },
    { id: 'pyq', label: 'PYQ Engine', icon: FileText, desc: 'Past question frequency' },
    { id: 'community', label: 'Community Bank', icon: Users, desc: 'Shared college papers' }
  ],
  practice: [
    { id: 'quiz', label: 'Diagnostic Quiz', icon: CheckCircle2, desc: 'Topic gaps & diagnostics' },
    { id: 'mock', label: 'Mock Exam', icon: Award, desc: 'Timed end-sem simulator' },
    { id: 'flashcards', label: 'Flashcards Drill', icon: Brain, desc: 'Rapid active recall' },
    { id: 'mistakes', label: 'Mistake Memory', icon: AlertTriangle, desc: 'Conceptual error log' }
  ],
  studyhub: [
    { id: 'planner', label: 'Schedule & Matrix', icon: Clock, desc: 'Sprint planner & .ics' },
    { id: 'resources', label: 'Resource Vault', icon: Compass, desc: 'Curated guides & videos' },
    { id: 'notes', label: 'Notes Pad', icon: FileEdit, desc: 'Topic markdown notes' },
    { id: 'cheatsheet', label: 'Formula Sheet', icon: Printer, desc: 'Printable cheat sheets' }
  ]
};

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  store, 
  onOpenSettings 
}) {
  const { state, loadDemoData, user, isSyncing, onLogout, triggerManualSync, onAuthSuccess } = store;
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const activeGroup = TAB_GROUPS[activeTab] || 'dashboard';
  const currentSubject = state.subjects[0];
  const pendingMistakes = state.mistakeLog.filter(m => !m.resolved).length;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate days to closest exam
  const daysToExam = () => {
    if (!currentSubject?.examDate) return null;
    const diff = new Date(currentSubject.examDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const days = daysToExam();

  const handleGroupClick = (groupKey) => {
    if (groupKey === 'dashboard') setActiveTab('dashboard');
    else if (groupKey === 'chatbot') setActiveTab('chatbot');
    else if (groupKey === 'curriculum') {
      const subs = SUB_TABS.curriculum.map(s => s.id);
      if (!subs.includes(activeTab)) setActiveTab('subjects');
    } else if (groupKey === 'practice') {
      const subs = SUB_TABS.practice.map(s => s.id);
      if (!subs.includes(activeTab)) setActiveTab('quiz');
    } else if (groupKey === 'studyhub') {
      const subs = SUB_TABS.studyhub.map(s => s.id);
      if (!subs.includes(activeTab)) setActiveTab('planner');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer shrink-0" 
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  GapFill
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Axion
                </span>
              </div>
            </div>
          </div>

          {/* Primary Top-Level Category Tabs (Fits all screens with zero wrapping) */}
          <nav className="flex items-center space-x-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/90 shadow-inner">
            
            {/* 1. Dashboard */}
            <button
              onClick={() => handleGroupClick('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeGroup === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            {/* 2. Curriculum & Papers */}
            <button
              onClick={() => handleGroupClick('curriculum')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeGroup === 'curriculum'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Curriculum</span>
            </button>

            {/* 3. Practice & Tests */}
            <button
              onClick={() => handleGroupClick('practice')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
                activeGroup === 'practice'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Practice</span>
              {pendingMistakes > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>

            {/* 4. Study Hub */}
            <button
              onClick={() => handleGroupClick('studyhub')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeGroup === 'studyhub'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Study Hub</span>
            </button>

            {/* 5. AI Coach */}
            <button
              onClick={() => handleGroupClick('chatbot')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeGroup === 'chatbot'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Coach</span>
            </button>

          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2 shrink-0">
            {days !== null && (
              <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Exam in {days} {days === 1 ? 'day' : 'days'}</span>
              </div>
            )}

            {/* Cloud Database Sync Pill */}
            {user && (
              <div 
                onClick={triggerManualSync}
                title="Database Status: Click to sync with Cloud DB"
                className="hidden lg:flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 transition-colors"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                    <span className="text-sky-400 text-[11px] font-medium">Syncing...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px] font-medium">Synced</span>
                  </>
                )}
              </div>
            )}

            {/* Download JSON Backup */}
            <button
              onClick={store.exportStateJSON}
              title="Download Full Study Brain Backup (.json)"
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Reload Demo Data */}
            <button
              onClick={loadDemoData}
              title="Reload CS201 Demo Dataset"
              className="flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-indigo-400" />
              <span className="hidden sm:inline">Demo</span>
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              title="Configure AI Provider & Settings"
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {/* User Account / Auth Button */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1.5 pl-1.5 pr-2 py-1 rounded-xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/40 hover:border-indigo-400 text-slate-200 text-xs font-medium transition-all shadow-sm cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-[11px]">
                    {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                  <span className="max-w-[80px] sm:max-w-[110px] truncate font-semibold text-xs">
                    {user.full_name || user.email.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-200">
                    <div className="pb-2 mb-2 border-b border-slate-800">
                      <p className="font-bold text-sm text-white truncate">
                        {user.full_name || 'Student Account'}
                      </p>
                      <p className="text-xs text-indigo-300 font-mono truncate">
                        {user.email}
                      </p>
                      {user.college && (
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 truncate">
                          <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{user.college}</span>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        triggerManualSync();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-sky-400' : 'text-slate-400'}`} />
                      <span>Sync to Cloud Database</span>
                    </button>

                    <button
                      onClick={() => {
                        onLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-2.5 py-2 mt-1 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Secondary Sub-Navigation Pill Bar for Nested Categories */}
      {SUB_TABS[activeGroup] && (
        <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 lg:px-8 py-2 sticky top-[53px] z-40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
              {SUB_TABS[activeGroup].map(sub => {
                const Icon = sub.icon;
                const isSelected = activeTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveTab(sub.id)}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 text-white font-bold border border-indigo-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span>{sub.label}</span>
                    {sub.id === 'mistakes' && pendingMistakes > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        {pendingMistakes}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={onAuthSuccess}
      />
    </>
  );
}
