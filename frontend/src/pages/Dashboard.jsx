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
  Users,
  Compass,
  Award,
  FileEdit,
  Printer,
  Layers
} from 'lucide-react';
import KnowledgeMatrix from '../components/KnowledgeMatrix';
import StudyStreakHeatmap from '../components/StudyStreakHeatmap';

export default function Dashboard({ store, setActiveTab, setSelectedQuizTopic }) {
  const { state, calculatePriorityQueue, resolveMistake } = store;
  const [selectedSubjectId, setSelectedSubjectId] = useState(state.subjects[0]?.id || '');
  const [dashTab, setDashTab] = useState('priority'); // 'priority' | 'matrix' | 'streak' | 'mistakes'

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
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Top Banner: Subject Selector & Exam Countdown */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-7 relative overflow-hidden shadow-2xl">
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
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Readiness Meter */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 lg:p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Exam Readiness</div>
            <div className="text-3xl font-black text-white mt-1">{readinessPercent}%</div>
            <div className="text-xs text-slate-400 mt-1">
              <span className="text-emerald-400 font-semibold">{masteredTopics}</span> Mastered · <span className="text-amber-400 font-semibold">{inProgressTopics}</span> In Progress
            </div>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 flex items-center justify-center font-bold text-xs text-indigo-400">
            {readinessPercent}%
          </div>
        </div>

        {/* Knowledge Gaps Counter */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 lg:p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High-Risk Gaps</div>
            <div className="text-3xl font-black text-rose-400 mt-1">{weakTopics}</div>
            <div className="text-xs text-slate-400 mt-1">
              Topics with Gap Score &gt; 60%
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Active Conceptual Errors */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 lg:p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Misconceptions</div>
            <div className="text-3xl font-black text-amber-400 mt-1">{mistakes.length}</div>
            <div className="text-xs text-slate-400 mt-1">
              Logged in conceptual mistake memory
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Segmented Tab Switcher for Dashboard Sections (Fits perfectly in one screen) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setDashTab('priority')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              dashTab === 'priority'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Priority Queue ({priorityList.length})</span>
          </button>

          <button
            onClick={() => setDashTab('matrix')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              dashTab === 'matrix'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>4-Quadrant Risk Matrix</span>
          </button>

          <button
            onClick={() => setDashTab('streak')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              dashTab === 'streak'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Study Heatmap & Streak</span>
          </button>

          <button
            onClick={() => setDashTab('mistakes')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              dashTab === 'mistakes'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Mistake Memory ({mistakes.length})</span>
          </button>
        </div>

        {/* Quick Tool Links */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setActiveTab('mock')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Mock Exam</span>
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Flashcards</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: PRIORITY QUEUE VIEW */}
      {dashTab === 'priority' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <span>Next Recommended Study Sessions</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Formula: Gap Score × PYQ Exam Frequency × (1 / Days Until Exam)
              </p>
            </div>
            <button
              onClick={() => setActiveTab('quiz')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Diagnostic Quiz Mode</span>
            </button>
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
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isHigh ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            isMed ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {item.priorityLevel} PRIORITY
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {item.topic.description || 'Core syllabus topic.'}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Metrics Pills */}
                    <div className="flex items-center space-x-4 shrink-0 text-xs text-slate-300">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Gap Score</span>
                        <span className={`font-bold ${item.gapScore > 65 ? 'text-rose-400' : item.gapScore > 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {item.gapScore}%
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">PYQ Weight</span>
                        <span className="font-bold text-indigo-400">
                          {item.pyqPercent}%
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Formula Rank</span>
                        <span className="font-extrabold text-white text-sm">
                          {item.priorityScore}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleStartQuiz(item.topic.name)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Practice Quiz</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedQuizTopic(item.topic.name);
                          setActiveTab('resources');
                        }}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                        title="View Curated Resources"
                      >
                        <Compass className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: 4-QUADRANT RISK MATRIX VIEW */}
      {dashTab === 'matrix' && (
        <div className="animate-in fade-in duration-150">
          <KnowledgeMatrix 
            priorityList={priorityList} 
            onSelectTopic={handleStartQuiz} 
          />
        </div>
      )}

      {/* SECTION 3: STREAK HEATMAP VIEW */}
      {dashTab === 'streak' && (
        <div className="animate-in fade-in duration-150">
          <StudyStreakHeatmap store={store} />
        </div>
      )}

      {/* SECTION 4: MISTAKE MEMORY VIEW */}
      {dashTab === 'mistakes' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Active Conceptual Flaws & Misconceptions</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every quiz error is analyzed for its fundamental misunderstanding and remembered.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('mistakes')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
            >
              <span>Full Mistake Manager</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {mistakes.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-semibold text-white">Zero unresolved mistakes logged!</p>
              <p className="text-xs text-slate-400 mt-1">Take a quiz to diagnose conceptual flaws.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {mistakes.map(m => (
                <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">
                      {m.topic}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                      {m.errorCategory || 'Conceptual Error'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {m.conceptualError}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">{m.date}</span>
                    <button
                      onClick={() => handleStartQuiz(m.topic)}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      Retest Topic →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
