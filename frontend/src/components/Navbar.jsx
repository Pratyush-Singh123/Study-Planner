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
  User,
  Cloud,
  RefreshCw,
  ChevronDown,
  Building2
} from 'lucide-react';
import AuthModal from './AuthModal';

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

  const currentSubject = state.subjects[0];

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

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                GapFill
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Axion
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Intelligent Knowledge Gap Engine</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'subjects'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Subjects</span>
          </button>

          <button
            onClick={() => setActiveTab('syllabus')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'syllabus'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Syllabus</span>
          </button>

          <button
            onClick={() => setActiveTab('pyq')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'pyq'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>PYQs</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'community'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Community</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'resources'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Resources</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Quiz</span>
          </button>

          <button
            onClick={() => setActiveTab('mock')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'mock'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Mock Exam</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileEdit className="w-4 h-4" />
            <span>Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('cheatsheet')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'cheatsheet'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Formula Sheet</span>
          </button>

          <button
            onClick={() => setActiveTab('mistakes')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'mistakes'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Mistakes ({state.mistakeLog.filter(m => !m.resolved).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chatbot')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'chatbot'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Coach</span>
          </button>
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center space-x-2">
          {days !== null && (
            <div className="hidden 2xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Exam in {days} {days === 1 ? 'day' : 'days'}</span>
            </div>
          )}

          {/* Database Cloud Sync Status Pill */}
          {user && (
            <div 
              onClick={triggerManualSync}
              title="Database Status: Click to sync with Cloud DB"
              className="hidden lg:flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 transition-colors"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  <span className="text-sky-400 text-[11px] font-medium">Syncing DB...</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px] font-medium">Cloud DB</span>
                </>
              )}
            </div>
          )}

          {/* Download JSON Backup */}
          <button
            onClick={store.exportStateJSON}
            title="Download Full Study Brain Backup (.json)"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Reload Demo Data */}
          <button
            onClick={loadDemoData}
            title="Reload CS201 Demo Dataset"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Demo</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Configure AI Provider & Settings"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Account / Auth Button */}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 pl-2 pr-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/40 hover:border-indigo-400 text-slate-200 text-xs font-medium transition-all shadow-sm cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate hidden sm:inline font-semibold">
                  {user.full_name || user.email.split('@')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-200">
                  <div className="pb-2.5 mb-2.5 border-b border-slate-800">
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
                    <span>Sync to Cloud Database Now</span>
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

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden overflow-x-auto space-x-2 pt-2.5 pb-1 border-t border-slate-800/60 mt-2.5 scrollbar-none">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'subjects', label: 'Subjects', icon: Layers },
          { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
          { id: 'pyq', label: 'PYQs', icon: FileText },
          { id: 'community', label: 'Community', icon: Users },
          { id: 'mock', label: 'Mock Exam', icon: Award },
          { id: 'notes', label: 'Notes Pad', icon: FileEdit },
          { id: 'cheatsheet', label: 'Formula Sheet', icon: Printer },
          { id: 'resources', label: 'Resources', icon: Compass },
          { id: 'planner', label: 'Schedule', icon: Clock },
          { id: 'quiz', label: 'Quiz', icon: CheckCircle2 },
          { id: 'mistakes', label: 'Mistakes', icon: AlertTriangle },
          { id: 'chatbot', label: 'AI Coach', icon: MessageSquare }
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium cursor-pointer ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/60 text-slate-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={onAuthSuccess}
      />
    </header>
  );
}
