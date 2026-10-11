import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Layers, 
  AlertCircle,
  X,
  ArrowRight,
  Save
} from 'lucide-react';
import { parseSyllabusAPI } from '../lib/api';

const SAMPLE_SYLLABI = {
  dsa: `Unit 1: Arrays and Dynamic Memory - Arrays, Amortized Analysis of resizing, Dynamic Memory Allocation, Singly and Doubly Linked Lists, Circular Lists.
Unit 2: Stacks, Queues and Recursion - Stack ADT, Applications in Expression Evaluation (Infix, Prefix, Postfix), Queue ADT, Circular Queue, Deque, Recursion and Call Stack.
Unit 3: Trees and Hierarchical Structures - Binary Trees, Traversals (Inorder, Preorder, Postorder), Binary Search Trees, Balanced Trees, AVL Tree Rotations, B-Trees.
Unit 4: Graph Algorithms - Graph Representations (Adjacency List & Matrix), Breadth-First Search (BFS), Depth-First Search (DFS), Cycle Detection, Minimum Spanning Trees (Prim's & Kruskal's), Dijkstra's Shortest Path.
Unit 5: Hashing and Advanced Data Structures - Hash Functions, Collision Resolution (Chaining, Linear & Quadratic Probing), Heaps and Priority Queues, Trie.`,
  os: `Unit 1: Operating System Overview - OS Architecture, System Calls, Process Management, Process Control Block (PCB), Context Switching.
Unit 2: CPU Scheduling & Synchronization - FCFS, SJF, Round Robin, Priority Scheduling, Critical Section Problem, Semaphores, Mutex, Classic Synchronization Problems.
Unit 3: Deadlocks - Deadlock Characterization, Resource Allocation Graphs, Deadlock Prevention, Avoidance (Banker's Algorithm), Detection and Recovery.
Unit 4: Memory Management - Logical vs Physical Address Space, Paging, Page Tables, Segmentation, Virtual Memory, Demand Paging, Page Replacement Algorithms (FIFO, LRU, Optimal).
Unit 5: Storage and File Systems - Disk Scheduling (FCFS, SSTF, SCAN, C-SCAN), File Organization, Directory Implementation, Allocation Methods.`
};

export default function SyllabusView({ store, setActiveTab }) {
  const { state, setRawSyllabus, setTopics, addSubject } = store;
  const [selectedSubjectId, setSelectedSubjectId] = useState(state.subjects[0]?.id || '');

  const activeSubject = state.subjects.find(s => s.id === selectedSubjectId) || state.subjects[0];
  const activeSubjectId = activeSubject?.id || 'cs_sub_1';

  const [rawText, setRawText] = useState(
    state.rawSyllabus?.[activeSubjectId] || SAMPLE_SYLLABI.dsa
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  // Extracted topics (editing mode)
  const currentTopics = state.topics?.[activeSubjectId] || [];
  const [editableTopics, setEditableTopics] = useState(currentTopics);

  // Manual Add Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualTopicName, setManualTopicName] = useState('');
  const [manualDifficulty, setManualDifficulty] = useState('Medium');
  const [manualHours, setManualHours] = useState(2);

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setError(null);
    setConfirmed(false);

    try {
      const parsedTopics = await parseSyllabusAPI(activeSubject?.name || 'Computer Science', rawText);
      if (parsedTopics && Array.isArray(parsedTopics)) {
        setEditableTopics(parsedTopics);
        setRawSyllabus(activeSubjectId, rawText);
        setTopics(activeSubjectId, parsedTopics);
      } else {
        throw new Error("Invalid structure returned by AI parser.");
      }
    } catch (err) {
      console.error(err);
      setError(`Parsing error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTopics = () => {
    setTopics(activeSubjectId, editableTopics);
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 3000);
  };

  const handleTopicChange = (idx, field, value) => {
    const updated = [...editableTopics];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditableTopics(updated);
  };

  const handleDeleteTopic = (idx) => {
    const updated = editableTopics.filter((_, i) => i !== idx);
    setEditableTopics(updated);
    setTopics(activeSubjectId, updated);
  };

  const handleAddManualTopic = (e) => {
    e.preventDefault();
    if (!manualTopicName.trim()) return;
    const newTopic = {
      name: manualTopicName.trim(),
      description: `Manual curriculum topic`,
      difficulty: manualDifficulty,
      estimatedHours: Number(manualHours) || 2,
      prerequisites: []
    };
    const updated = [...editableTopics, newTopic];
    setEditableTopics(updated);
    setTopics(activeSubjectId, updated);
    setManualTopicName('');
    setIsManualModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Page Title */}
      <div>
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Curriculum Ingestion</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          Syllabus Parser & Topic Review
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Paste syllabus units or add topics manually. GapFill extracts structured topics, prerequisite trees, and study weights.
        </p>
      </div>

      {/* Tabs per Subject */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {state.subjects.map(s => (
          <button
            key={s.id}
            onClick={() => {
              setSelectedSubjectId(s.id);
              setRawText(state.rawSyllabus?.[s.id] || '');
              setEditableTopics(state.topics?.[s.id] || []);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              (activeSubject?.id === s.id)
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Input Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-6">
        
        {/* Header & Presets */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Paste Syllabus Outline for {activeSubject?.name || 'Selected Subject'}
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Presets:</span>
            <button
              type="button"
              onClick={() => setRawText(SAMPLE_SYLLABI.dsa)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-indigo-300 hover:bg-slate-700 transition-colors"
            >
              DSA
            </button>
            <button
              type="button"
              onClick={() => setRawText(SAMPLE_SYLLABI.os)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-indigo-300 hover:bg-slate-700 transition-colors"
            >
              OS
            </button>
          </div>
        </div>

        {/* Syllabus Textarea */}
        <textarea
          rows={7}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste syllabus modules, units, or topic outlines..."
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
        />

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Buttons Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => setIsManualModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Add Topics Manually</span>
          </button>

          <button
            type="button"
            onClick={handleParse}
            disabled={loading || !rawText.trim()}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{loading ? "Extracting Topics with AI..." : "Parse with AI"}</span>
          </button>
        </div>

      </div>

      {/* Topic Review Screen: Structured Topics Table */}
      {editableTopics.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Extracted Curriculum ({editableTopics.length} Topics)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Edit topics inline. Click "Confirm Topics" to commit to study queue.
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={handleConfirmTopics}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  confirmed 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                }`}
              >
                {confirmed ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{confirmed ? 'Topics Confirmed!' : 'Confirm Topics'}</span>
              </button>

              <button
                onClick={() => setActiveTab('pyq')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1"
              >
                <span>Proceed to PYQs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Topic Name</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Est. Hours</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {editableTopics.map((topic, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    
                    {/* Name */}
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      <input
                        type="text"
                        value={topic.name}
                        onChange={(e) => handleTopicChange(idx, 'name', e.target.value)}
                        className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:bg-slate-950 px-1 py-0.5 rounded text-white font-medium text-xs w-full focus:outline-none"
                      />
                    </td>

                    {/* Difficulty */}
                    <td className="py-3 px-4">
                      <select
                        value={topic.difficulty}
                        onChange={(e) => handleTopicChange(idx, 'difficulty', e.target.value)}
                        className={`bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-semibold ${
                          topic.difficulty === 'Hard' ? 'text-rose-400' :
                          topic.difficulty === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </td>

                    {/* Hours */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={topic.estimatedHours || 2}
                          onChange={(e) => handleTopicChange(idx, 'estimatedHours', Number(e.target.value))}
                          className="w-14 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-indigo-500"
                        />
                        <span className="text-slate-500">h</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteTopic(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Delete topic"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Topic Manually Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Topic Manually</h3>
              <button 
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Topic Name</label>
                <input
                  type="text"
                  required
                  value={manualTopicName}
                  onChange={(e) => setManualTopicName(e.target.value)}
                  placeholder="e.g. Dynamic Programming & Memoization"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Difficulty</label>
                  <select
                    value={manualDifficulty}
                    onChange={(e) => setManualDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Est. Hours</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={manualHours}
                    onChange={(e) => setManualHours(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
