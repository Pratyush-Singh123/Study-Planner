import React, { useState } from 'react';
import { Target, AlertTriangle, ShieldCheck, HelpCircle, ArrowUpRight, Flame } from 'lucide-react';

export default function KnowledgeMatrix({ priorityList, onSelectTopic }) {
  const [hoveredTopic, setHoveredTopic] = useState(null);

  // Group topics into 4 quadrants
  // High Gap >= 40, High Freq >= 20
  const emergencyZone = priorityList.filter(p => p.gapScore >= 40 && p.pyqPercent >= 20);
  const secondaryRisks = priorityList.filter(p => p.gapScore >= 40 && p.pyqPercent < 20);
  const safeZone = priorityList.filter(p => p.gapScore < 40 && p.pyqPercent >= 20);
  const lowPriority = priorityList.filter(p => p.gapScore < 40 && p.pyqPercent < 20);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <span>4-Quadrant Knowledge Risk Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Plots curriculum topics by Knowledge Gap Size (Y) vs Past Exam Frequency (X)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[10px] font-semibold">
          <span className="flex items-center space-x-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Emergency Zone</span>
          </span>
          <span className="flex items-center space-x-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Secondary Risk</span>
          </span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Safe Zone</span>
          </span>
        </div>
      </div>

      {/* 2x2 Grid Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Quadrant 1: Emergency Zone (Top Right in 2D plane) */}
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>1. Emergency Zone (High Gap + High Exam Freq)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
              {emergencyZone.length} Topics
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Appears frequently in university papers, but your performance reveals severe conceptual gaps. <strong>Top study priority.</strong>
          </p>

          <div className="space-y-2 pt-1">
            {emergencyZone.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectTopic && onSelectTopic(item.topic.name)}
                className="bg-slate-900/90 border border-rose-500/30 hover:border-rose-400 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-900"
              >
                <div>
                  <h4 className="text-xs font-bold text-white hover:text-rose-300 transition-colors">
                    {item.topic.name}
                  </h4>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Gap: <strong className="text-rose-400">{item.gapScore}%</strong> · Exam Freq: <strong className="text-indigo-300">{item.pyqPercent}%</strong>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-rose-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 2: Secondary Risks (High Gap + Low Freq) */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>2. Secondary Risks (High Gap + Low Exam Freq)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
              {secondaryRisks.length} Topics
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            You are confused here, but professors rarely test this heavily. Study only after clearing the Emergency Zone.
          </p>

          <div className="space-y-2 pt-1">
            {secondaryRisks.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">No secondary risks detected</div>
            ) : (
              secondaryRisks.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectTopic && onSelectTopic(item.topic.name)}
                  className="bg-slate-900/90 border border-amber-500/20 hover:border-amber-400 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.topic.name}</h4>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Gap: <strong className="text-amber-400">{item.gapScore}%</strong> · Exam Freq: {item.pyqPercent}%
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-amber-400 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quadrant 3: Safe Zone (Low Gap + High Freq) */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>3. Safe Zone (Mastered Core Topics)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              {safeZone.length} Topics
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            High exam weightage, but your mental models are sound and quiz scores are high. Quick 10-minute refreshers are sufficient.
          </p>

          <div className="space-y-2 pt-1">
            {safeZone.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectTopic && onSelectTopic(item.topic.name)}
                className="bg-slate-900/90 border border-emerald-500/20 hover:border-emerald-400 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{item.topic.name}</h4>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Gap: <strong className="text-emerald-400">{item.gapScore}%</strong> · Exam Freq: <strong className="text-indigo-300">{item.pyqPercent}%</strong>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 4: Low Priority (Low Gap + Low Freq) */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>4. Low Priority (Low Gap + Low Exam Freq)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {lowPriority.length} Topics
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Minor curriculum topics that you already grasp sufficiently. Safe to skip during tight revision windows.
          </p>

          <div className="space-y-2 pt-1">
            {lowPriority.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectTopic && onSelectTopic(item.topic.name)}
                className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-300">{item.topic.name}</h4>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Gap: {item.gapScore}% · Exam Freq: {item.pyqPercent}%
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
