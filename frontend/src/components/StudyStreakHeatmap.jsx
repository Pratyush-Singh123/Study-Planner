import React, { useState } from 'react';
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  Trophy,
  X
} from 'lucide-react';

export default function StudyStreakHeatmap({ store }) {
  const { state, logStudyActivity } = store;
  const activity = state.studyActivity || {};

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logMinutes, setLogMinutes] = useState(45);
  const [logQuestions, setLogQuestions] = useState(3);
  const [hoveredDay, setHoveredDay] = useState(null);

  // Generate last 70 days (10 weeks)
  const daysArray = [];
  const today = new Date();
  for (let i = 69; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const data = activity[dateStr] || null;
    daysArray.push({
      date: d,
      dateStr,
      data,
      dayOfWeek: d.getDay() // 0 = Sun, 6 = Sat
    });
  }

  // Calculate Streak
  const calculateStreak = () => {
    let streak = 0;
    const checkDate = new Date(today);
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activity[dateStr] && activity[dateStr].minutes > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  // Aggregate stats
  const totalMinutes = Object.values(activity).reduce((acc, a) => acc + (a.minutes || 0), 0);
  const totalQuestions = Object.values(activity).reduce((acc, a) => acc + (a.questions || 0), 0);
  const activeDaysCount = Object.values(activity).filter(a => a.minutes > 0).length;

  const getColorClass = (data) => {
    if (!data || data.minutes === 0) return 'bg-slate-800/60 border border-slate-700/40';
    if (data.minutes < 45) return 'bg-emerald-900/60 border border-emerald-700/40 text-emerald-300';
    if (data.minutes < 90) return 'bg-emerald-700/80 border border-emerald-500/50 text-emerald-100';
    if (data.minutes < 120) return 'bg-emerald-600 border border-emerald-400 text-white';
    return 'bg-emerald-500 border border-emerald-300 text-white shadow-sm shadow-emerald-500/40';
  };

  const handleLogManual = (e) => {
    e.preventDefault();
    logStudyActivity(Number(logMinutes), Number(logQuestions));
    setIsLogModalOpen(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-7 space-y-5 shadow-xl">
      
      {/* Header with Streak Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Consistency Engine</span>
          </div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Study Streak & Momentum</span>
            {currentStreak > 0 && (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentStreak} Day Streak!</span>
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Consistency trumps cramming. Tracks every quiz, mock test, and offline revision block.
          </p>
        </div>

        {/* 4 Stats Chips */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Streak</div>
              <div className="text-xs font-bold text-white">{currentStreak} Days</div>
            </div>
          </div>

          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Focus Hours</div>
              <div className="text-xs font-bold text-white">{Math.round((totalMinutes / 60) * 10) / 10}h</div>
            </div>
          </div>

          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Problems Solved</div>
              <div className="text-xs font-bold text-white">{totalQuestions}</div>
            </div>
          </div>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Study</span>
          </button>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="min-w-[650px] space-y-2">
          
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 justify-start">
            {daysArray.map((day) => {
              const hasData = day.data && day.data.minutes > 0;
              return (
                <div
                  key={day.dateStr}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`w-4 h-4 rounded-md transition-all cursor-pointer relative ${getColorClass(day.data)}`}
                  title={`${day.dateStr}: ${hasData ? `${day.data.minutes}m studied, ${day.data.questions} questions` : 'No study logged'}`}
                />
              );
            })}
          </div>

          {/* Legend & Tooltip Footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
            <div>
              {hoveredDay ? (
                <span className="text-white font-medium">
                  <strong>{hoveredDay.dateStr}:</strong> {hoveredDay.data ? `${hoveredDay.data.minutes} mins, ${hoveredDay.data.questions} questions, ${hoveredDay.data.sessions} sessions` : 'Rest day / No activity logged'}
                </span>
              ) : (
                <span>Hover over tiles to inspect daily study volume</span>
              )}
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-slate-500">Less</span>
              <div className="w-3 h-3 rounded bg-slate-800 border border-slate-700/40" />
              <div className="w-3 h-3 rounded bg-emerald-900 border border-emerald-700/40" />
              <div className="w-3 h-3 rounded bg-emerald-700 border border-emerald-500/40" />
              <div className="w-3 h-3 rounded bg-emerald-500 border border-emerald-300" />
              <span className="text-[10px] text-slate-500">More</span>
            </div>
          </div>

        </div>
      </div>

      {/* Manual Study Log Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-white font-bold text-base">
                <Clock className="w-5 h-5 text-indigo-400" />
                <span>Log Offline Study Session</span>
              </div>
              <button 
                onClick={() => setIsLogModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogManual} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Focus Minutes Studied (Textbook, lecture, offline notes):
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={logMinutes}
                  onChange={(e) => setLogMinutes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Questions / Proofs Solved:
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={logQuestions}
                  onChange={(e) => setLogQuestions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/30"
                >
                  Save to Heatmap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
