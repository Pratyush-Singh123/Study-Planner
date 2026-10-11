import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  store, 
  onOpenSettings 
}) {
  const { state, loadDemoData } = store;
  const currentSubject = state.subjects[0];

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
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
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
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
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
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
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
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'pyq'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>PYQ Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
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
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Diagnostic Quiz</span>
          </button>

          <button
            onClick={() => setActiveTab('mistakes')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
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
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
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
        <div className="flex items-center space-x-2.5">
          {days !== null && (
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Exam in {days} {days === 1 ? 'day' : 'days'}</span>
            </div>
          )}

          <button
            onClick={loadDemoData}
            title="Reload CS201 Demo Dataset"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Load Demo Data</span>
          </button>

          <button
            onClick={onOpenSettings}
            title="Configure AI Provider & Settings"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden overflow-x-auto space-x-2 pt-2.5 pb-1 border-t border-slate-800/60 mt-2.5 scrollbar-none">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'subjects', label: 'Subjects', icon: Layers },
          { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
          { id: 'pyq', label: 'PYQs', icon: FileText },
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
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium ${
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
    </header>
  );
}
