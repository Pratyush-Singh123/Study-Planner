import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Trash2, 
  Edit3, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Layers
} from 'lucide-react';

export default function SubjectSetupView({ store, setActiveTab }) {
  const { state, addSubject, updateSubject, deleteSubject } = store;
  
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [prepLevel, setPrepLevel] = useState('Not started');
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateSubject(editingId, { name, examDate, difficulty, prepLevel });
      setEditingId(null);
    } else {
      addSubject({ name, examDate, difficulty, prepLevel });
    }

    setName('');
    setExamDate('');
    setDifficulty('Medium');
    setPrepLevel('Not started');
  };

  const handleEdit = (sub) => {
    setEditingId(sub.id);
    setName(sub.name);
    setExamDate(sub.examDate || '');
    setDifficulty(sub.difficulty || 'Medium');
    setPrepLevel(sub.prepLevel || 'Not started');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Onboarding & Course Catalog</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          Subject & Exam Setup
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Add your target exam courses, dates, and initial preparedness levels.
        </p>
      </div>

      {/* Add / Edit Subject Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Plus className="w-5 h-5 text-indigo-400" />
          <span>{editingId ? 'Edit Subject Details' : 'Add a New Subject'}</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Subject Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Subject Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Operating Systems, Compiler Design, DSA"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            {/* Exam Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Target Exam Date
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Difficulty Toggle */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Perceived Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Easy', 'Medium', 'Hard'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      difficulty === d
                        ? d === 'Hard' ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : d === 'Medium' ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Prep Level Toggle */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Current Preparation Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Not started', 'Partial', 'Mostly done'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrepLevel(p)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      prepLevel === p
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setName('');
                  setExamDate('');
                }}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? 'Update Subject' : 'Add Subject'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Subjects Cards List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>Active Exam Targets ({state.subjects.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.subjects.map(s => {
            const daysLeft = s.examDate ? Math.max(0, Math.ceil((new Date(s.examDate) - new Date()) / (1000 * 60 * 60 * 24))) : 'TBD';
            const topicCount = (state.topics[s.id] || []).length;

            return (
              <div
                key={s.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{s.name}</h3>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{daysLeft} days until exam ({s.examDate || 'No date set'})</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSubject(s.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${
                      s.difficulty === 'Hard' ? 'bg-rose-500/20 text-rose-300' :
                      s.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {s.difficulty}
                    </span>
                    <span className="text-slate-400">Prep: <strong className="text-slate-200">{s.prepLevel}</strong></span>
                  </div>

                  <span className="text-indigo-400 font-semibold">{topicCount} Topics</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
