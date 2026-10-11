import React, { useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Brain, 
  Target, 
  BookOpen, 
  ArrowUpRight,
  TrendingUp,
  Zap,
  RotateCcw,
  Users
} from 'lucide-react';
import KnowledgeMatrix from '../components/KnowledgeMatrix';

export default function Dashboard({ store, setActiveTab, setSelectedQuizTopic }) {
  const { state, calculatePriorityQueue, resolveMistake } = store;
  const [selectedSubjectId, setSelectedSubjectId] = useState(state.subjects[0]?.id || '');

  const activeSubject = state.subjects.find(s => s.id === selectedSubjectId) || state.subjects[0];
  const priorityList = activeSubject ? calculatePriorityQueue(activeSubject.id) : [];
  const topics = activeSubject ? (state.topics[activeSubject.id] || []) : [];
  const mistakes = state.mistakeLog.filter(m => !m.resolved);

  // Overall readiness calculation
  const totalTopics = topics.length || 1;
  const masteredTopics = topics.filter(t => (state.gapScores[t.name]?.score ?? 100) < 30).length;
  const inProgressTopics = topics.filter(t => {
    const s = state.gapScores[t.name]?.score ?? 70;
    return s >= 30 && s <= 65;
  }).length;
  const weakTopics = totalTopics - masteredTopics - inProgressTopics;
  const readinessPercent = Math.round((masteredTopics / totalTopics) * 100);

  // Days until exam
  const getDaysLeft = () => {
    if (!activeSubject?.examDate) return 4;
    const diff = new Date(activeSubject.examDate) - new Date();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };
  const daysLeft = getDaysLeft();

  const handleStartQuiz = (topicName) => {
    if (setSelectedQuizTopic) setSelectedQuizTopic(topicName);
    setActiveTab('quiz');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Top Banner: Subject Selector & Exam Countdown */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Adaptive Study Command Center</span>
            </div>
            
            {/* Subject Selector Tabs */}
            <div className="flex flex-wrap gap-2 mb-3">
              {state.subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    (activeSubject?.id === s.id)
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  {s.name} ({s.code || 'CS'})
                </button>
              ))}
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {activeSubject?.name || "Select Subject"}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Ranked dynamically by Knowledge Gap × Past Exam Frequency × Urgency
            </p>
          </div>

          {/* Exam Countdown Card */}
          <div className="flex items-center space-x-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center text-amber-400">
              <span className="text-xl font-black">{daysLeft}</span>
              <span className="text-[10px] uppercase font-semibold">Days</span>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400">Target Exam Date</div>
              <div className="text-sm font-bold text-slate-200">
                {activeSubject?.examDate ? new Date(activeSubject.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'In 3 days'}
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-amber-400 mt-1 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>{daysLeft <= 3 ? 'Critical Revision Window' : 'Prep Phase'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Grid: 3 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Readiness Meter */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Exam Readiness</div>
            <div className="text-3xl font-black text-white mt-1">{readinessPercent}%</div>
            <div className="text-xs text-slate-400 mt-1">
              <span className="text-emerald-400 font-semibold">{masteredTopics}</span> Mastered · <span className="text-amber-400 font-semibold">{inProgressTopics}</span> In Progress
            </div>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 flex items-center justify-center font-bold text-sm text-indigo-400">
            {readinessPercent}%
          </div>
        </div>

        {/* Knowledge Gaps Counter */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High-Risk Gaps</div>
            <div className="text-3xl font-black text-rose-400 mt-1">{weakTopics}</div>
            <div className="text-xs text-slate-400 mt-1">
              Topics with Gap Score &gt; 60%
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Active Conceptual Errors */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Misconceptions</div>
            <div className="text-3xl font-black text-amber-400 mt-1">{mistakes.length}</div>
            <div className="text-xs text-slate-400 mt-1">
              Logged in conceptual mistake memory
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Recurring Mistake Pattern Alert Box */}
      {mistakes.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
              <Brain className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-amber-300">
                  ⚠️ Recurring Conceptual Flaw Pattern Detected
                </h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('flashcards')}
                    className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>Practice in Flashcards</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('mistakes')}
                    className="text-xs text-amber-400 hover:text-amber-200 font-medium flex items-center space-x-1"
                  >
                    <span>Review All ({mistakes.length})</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                You've had multiple conceptual slips around <strong className="text-white">pointer reversal boundaries and tree rotation invariants</strong> across recent sessions.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {mistakes.slice(0, 2).map(m => (
                  <div key={m.id} className="text-xs bg-slate-900/80 border border-amber-500/20 px-3 py-1.5 rounded-lg text-slate-300 flex items-center justify-between gap-3">
                    <span className="font-medium text-amber-200">[{m.topic}]:</span>
                    <span className="text-slate-400 truncate max-w-xs">{m.conceptualError}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4-Quadrant Knowledge Risk Matrix */}
      <KnowledgeMatrix 
        priorityList={priorityList} 
        onSelectTopic={handleStartQuiz} 
      />

      {/* Main Feature: The Adaptive Priority Queue */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <span>Priority Study Queue</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked mathematically: Highest exam frequency + largest knowledge gap + least time remaining
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('flashcards')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600/90 hover:bg-purple-600 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Flashcards</span>
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Campus Archive</span>
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Schedule</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {priorityList.map((item, idx) => {
            const isHigh = item.priorityLevel === 'HIGH';
            const isMed = item.priorityLevel === 'MEDIUM';

            return (
              <div
                key={item.topic.id || idx}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-lg hover:shadow-indigo-500/5 group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Rank & Title */}
                  <div className="flex items-start space-x-3.5 flex-1">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isHigh ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      isMed ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      #{idx + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {item.topic.name}
                        </h3>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isHigh ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          isMed ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {item.priorityLevel} PRIORITY
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {item.topic.description}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Metrics Chips */}
                  <div className="flex items-center flex-wrap gap-4 text-xs font-medium">
                    
                    {/* Gap Score */}
                    <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Gap Score</div>
                      <div className={`text-sm font-bold ${
                        item.gapScore > 60 ? 'text-rose-400' :
                        item.gapScore > 30 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {item.gapScore}%
                      </div>
                    </div>

                    {/* PYQ Weightage */}
                    <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Exam Frequency</div>
                      <div className="text-sm font-bold text-indigo-400">
                        {item.pyqPercent}% of papers
                      </div>
                    </div>

                    {/* Estimated Hours */}
                    <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 hidden sm:block">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Est. Study Time</div>
                      <div className="text-sm font-bold text-slate-300">
                        {item.topic.estimatedHours}h
                      </div>
                    </div>

                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={() => handleStartQuiz(item.topic.name)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      <span>Diagnostic Quiz</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('chatbot')}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      title="Ask AI Coach for quick breakdown"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
