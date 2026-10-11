import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Brain, 
  RotateCcw, 
  Trash2, 
  ArrowRight,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';

export default function MistakeLogView({ store, setActiveTab, setSelectedQuizTopic }) {
  const { state, resolveMistake } = store;
  const [filterTopic, setFilterTopic] = useState('ALL');

  const mistakes = state.mistakeLog;
  const uniqueTopics = ['ALL', ...new Set(mistakes.map(m => m.topic))];

  const filtered = filterTopic === 'ALL' 
    ? mistakes 
    : mistakes.filter(m => m.topic === filterTopic);

  const unresolvedCount = mistakes.filter(m => !m.resolved).length;

  const handleRetestTopic = (topicName) => {
    if (setSelectedQuizTopic) setSelectedQuizTopic(topicName);
    setActiveTab('quiz');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Brain className="w-4 h-4" />
          <span>Long-Term Conceptual Memory</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          Persistent Mistake Log
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          GapFill remembers your underlying reasoning errors so you never repeat the same misconception in the exam hall.
        </p>
      </div>

      {/* Summary Card & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            {unresolvedCount}
          </div>
          <div>
            <div className="text-sm font-bold text-white">Active Misconceptions to Fix</div>
            <div className="text-xs text-slate-400">Total errors tracked: {mistakes.length}</div>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {uniqueTopics.map(t => (
              <option key={t} value={t}>{t === 'ALL' ? 'All Topics' : t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mistake Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No Unresolved Mistakes!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your conceptual models are currently aligned. Take another diagnostic quiz to stress-test other topics.
            </p>
          </div>
        ) : (
          filtered.map(mistake => (
            <div
              key={mistake.id}
              className={`border rounded-2xl p-6 transition-all ${
                mistake.resolved
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-lg'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                <div className="space-y-3 flex-1">
                  
                  {/* Topic Badge & Date */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                      {mistake.topic}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {mistake.errorCategory || 'Conceptual Error'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {mistake.date}
                    </span>
                  </div>

                  {/* Question */}
                  <div className="text-sm font-semibold text-slate-200">
                    Q: {mistake.question}
                  </div>

                  {/* Student Answer */}
                  <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 font-mono uppercase text-[10px] block mb-1">Your Stated Answer:</span>
                    <span className="text-rose-300 font-mono">"{mistake.studentAnswer}"</span>
                  </div>

                  {/* The Conceptual Flaw */}
                  <div className="text-xs text-amber-200 bg-amber-950/20 p-3.5 rounded-xl border border-amber-500/20">
                    <strong className="text-amber-300 block mb-0.5">Diagnosed Mental Model Gap:</strong>
                    {mistake.conceptualError}
                  </div>

                </div>

                {/* Right Actions */}
                <div className="flex md:flex-col items-center space-y-0 md:space-y-2 space-x-2 md:space-x-0 shrink-0">
                  <button
                    onClick={() => handleRetestTopic(mistake.topic)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retest Topic</span>
                  </button>

                  <button
                    onClick={() => resolveMistake(mistake.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                      mistake.resolved
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{mistake.resolved ? 'Resolved' : 'Mark Fixed'}</span>
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
