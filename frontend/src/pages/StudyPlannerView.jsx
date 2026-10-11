import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Flame, 
  ArrowRight, 
  RotateCcw,
  Sliders,
  ShieldAlert,
  Brain,
  Download
} from 'lucide-react';

export default function StudyPlannerView({ store, setActiveTab, setSelectedQuizTopic }) {
  const { state, calculatePriorityQueue } = store;
  const currentSubject = state.subjects[0];
  const priorityList = currentSubject ? calculatePriorityQueue(currentSubject.id) : [];

  const [hoursPerDay, setHoursPerDay] = useState(state.schedule?.hoursPerDay || 4);
  const [sessionLength, setSessionLength] = useState(state.schedule?.sessionLength || 45); // 25, 45, 90 min
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [completedBlocks, setCompletedBlocks] = useState({});

  // Calculate days remaining
  const getDaysLeft = () => {
    if (!currentSubject?.examDate) return 4;
    const diff = new Date(currentSubject.examDate) - new Date();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };
  const daysLeft = getDaysLeft();

  const handleGeneratePlan = () => {
    // Generate a day-by-day plan allocating daily hours into sessions
    const sessionsPerDay = Math.floor((hoursPerDay * 60) / sessionLength);
    const planDays = [];

    // Prioritize topics: High priority gets repeated sessions
    const queue = [...priorityList];
    let topicIndex = 0;

    for (let d = 1; d <= daysLeft; d++) {
      const isLastDay = d === daysLeft;
      const dayDate = new Date(Date.now() + (d - 1) * 86400000);
      const dateStr = dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      const daySessions = [];
      for (let s = 1; s <= sessionsPerDay; s++) {
        if (isLastDay) {
          // Last day is full rapid revision & mistake review
          daySessions.push({
            id: `d${d}_s${s}`,
            time: `Session ${s} (${sessionLength}m)`,
            topicName: s === 1 ? "Top Mistake Patterns Review" : queue[(s - 1) % queue.length]?.topic.name || "Exam Formulas & Review",
            type: "Final Review",
            focus: "Rapid recall, boundary cases, and previous mistake log resolution",
            priority: "CRITICAL"
          });
        } else {
          const currentItem = queue[topicIndex % queue.length];
          const isHighGap = currentItem?.gapScore > 50;
          
          daySessions.push({
            id: `d${d}_s${s}`,
            time: `Session ${s} (${sessionLength}m)`,
            topicName: currentItem?.topic.name || "Core Algorithms",
            type: isHighGap ? "Deep Concept Sprint" : "Practice & PYQs",
            focus: isHighGap 
              ? `Resolve conceptual gap (${currentItem?.gapScore}% gap score). Study core invariants.` 
              : `Solve 3 past university exam questions. Verify speed and edge cases.`,
            priority: currentItem?.priorityLevel || "MEDIUM"
          });

          // Rotate to next topic after each block or keep high priority for 2 blocks
          if (s % 2 === 0 || !isHighGap) {
            topicIndex++;
          }
        }
      }

      planDays.push({
        dayNumber: d,
        dateStr,
        isLastDay,
        sessions: daySessions
      });
    }

    setGeneratedPlan(planDays);
  };

  const toggleBlockCompleted = (id) => {
    setCompletedBlocks(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const totalSessions = generatedPlan ? generatedPlan.reduce((acc, d) => acc + d.sessions.length, 0) : 0;
  const completedCount = Object.values(completedBlocks).filter(Boolean).length;
  const progressPercent = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Calendar className="w-4 h-4" />
          <span>Dynamic Schedule Optimizer</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          Day-by-Day Study Sprint Planner
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Turns your knowledge gaps into an achievable, hour-by-hour countdown plan tailored to your available time.
        </p>
      </div>

      {/* Constraints Config Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <span>Your Schedule Constraints for {currentSubject?.name || 'Upcoming Exam'}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Daily Available Hours Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase text-slate-400">Daily Study Time</label>
              <span className="text-sm font-black text-indigo-400">{hoursPerDay} Hours / Day</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1h (Light)</span>
              <span>4h (Balanced)</span>
              <span>10h (Cram)</span>
            </div>
          </div>

          {/* Session Length Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase text-slate-400">Preferred Session Length</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { len: 25, label: '25m', sub: 'Pomodoro' },
                { len: 45, label: '45m', sub: 'Deep Work' },
                { len: 90, label: '90m', sub: 'Exam Sprint' }
              ].map(item => (
                <button
                  key={item.len}
                  type="button"
                  onClick={() => setSessionLength(item.len)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    sessionLength === item.len
                      ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Days until Exam Info */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex flex-col items-center justify-center shrink-0">
              <span className="text-lg font-black">{daysLeft}</span>
              <span className="text-[9px] uppercase font-bold">Days</span>
            </div>
            <div className="text-xs">
              <div className="text-slate-400 font-medium">Exam Date: <strong className="text-white">{currentSubject?.examDate || 'In 4 days'}</strong></div>
              <div className="text-amber-400 font-semibold mt-0.5">Total Study Capacity: {daysLeft * hoursPerDay} Hours</div>
            </div>
          </div>

        </div>

        {/* Generate Plan Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleGeneratePlan}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xl shadow-indigo-600/30 transition-all flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Optimized Countdown Plan</span>
          </button>
        </div>

      </div>

      {/* Generated Day-by-Day Schedule View */}
      {generatedPlan && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Plan Progress Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Countdown Schedule Execution</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {completedCount}/{totalSessions} Sessions Done
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Check off blocks as you finish them. Priority gaps are scheduled first with revision buffers.
              </p>
            </div>

            {/* Velocity Bar */}
            <div className="w-full sm:w-48 space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">Plan Progress</span>
                <span className="text-indigo-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Days Grid */}
          <div className="space-y-6">
            {generatedPlan.map(day => (
              <div 
                key={day.dayNumber} 
                className={`bg-slate-900 border rounded-3xl p-6 lg:p-7 space-y-4 ${
                  day.isLastDay 
                    ? 'border-amber-500/40 shadow-lg shadow-amber-500/5 bg-slate-900/90' 
                    : 'border-slate-800'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-xl text-xs font-black uppercase ${
                      day.isLastDay ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                    }`}>
                      Day {day.dayNumber}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{day.dateStr}</h4>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {day.isLastDay ? '⚠️ Final 24-Hour Revision & Mistake Hardening' : `${day.sessions.length} Targeted Deep-Work Sessions`}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-500 font-medium">
                    {day.sessions.length * sessionLength} mins
                  </span>
                </div>

                {/* Day Sessions List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  {day.sessions.map(session => {
                    const isDone = !!completedBlocks[session.id];
                    const isHigh = session.priority === 'HIGH' || session.priority === 'CRITICAL';

                    return (
                      <div
                        key={session.id}
                        onClick={() => toggleBlockCompleted(session.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start space-x-3 ${
                          isDone 
                            ? 'bg-slate-950/40 border-slate-800/50 opacity-60 line-through' 
                            : isHigh
                            ? 'bg-slate-950/90 border-slate-800 hover:border-indigo-500/60 shadow-sm'
                            : 'bg-slate-950/70 border-slate-800/70 hover:border-slate-700'
                        }`}
                      >
                        {/* Checkbox Icon */}
                        <div className="mt-0.5 shrink-0 text-indigo-400">
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                              {session.time} · {session.type}
                            </span>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              session.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                              session.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {session.priority}
                            </span>
                          </div>

                          <h5 className="text-xs font-bold text-white">
                            {session.topicName}
                          </h5>

                          <p className="text-[11px] text-slate-400 leading-relaxed no-underline">
                            {session.focus}
                          </p>

                          {/* Quick Quiz link */}
                          {!isDone && (
                            <div className="pt-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (setSelectedQuizTopic) setSelectedQuizTopic(session.topicName);
                                  setActiveTab('quiz');
                                }}
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1"
                              >
                                <span>Take 5-Min Diagnostic Quiz</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
