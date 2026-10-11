import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  FileText, 
  Clock, 
  ArrowRight,
  Layers,
  UploadCloud,
  AlertCircle
} from 'lucide-react';
import { callLLM } from '../lib/llm';

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
  const currentSubject = state.subjects[0];

  const [rawText, setRawText] = useState(
    currentSubject ? (state.rawSyllabus[currentSubject.id] || '') : SAMPLE_SYLLABI.dsa
  );
  const [subjectName, setSubjectName] = useState(currentSubject?.name || 'Data Structures & Algorithms');
  const [examDate, setExamDate] = useState(currentSubject?.examDate || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extracted topics (editing mode)
  const currentTopics = currentSubject ? (state.topics[currentSubject.id] || []) : [];
  const [editableTopics, setEditableTopics] = useState(currentTopics);

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setError(null);

    const systemPrompt = `You are an academic syllabus parser. Given raw syllabus text for a subject, extract a structured list of topics. For each topic return:
- name: short topic name
- description: one sentence what it covers
- difficulty: Easy | Medium | Hard (estimate based on typical university curriculum)
- estimatedHours: number (realistic study hours needed: 1, 2, or 3)
- prerequisites: list of other topic names from this syllabus that must be understood first

Return ONLY valid JSON. No markdown ticks, no preamble, no explanation.
Format:
{
  "topics": [
    {
      "name": "Topic Name",
      "description": "Short description",
      "difficulty": "Easy|Medium|Hard",
      "estimatedHours": 2,
      "prerequisites": []
    }
  ]
}`;

    const userMessage = `Subject: ${subjectName}\nSyllabus:\n${rawText}`;

    try {
      const response = await callLLM(systemPrompt, userMessage);
      // Clean possible markdown code fences
      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.topics && Array.isArray(parsed.topics)) {
        setEditableTopics(parsed.topics);
        // Save to store
        let subId = currentSubject?.id;
        if (!subId) {
          subId = addSubject({ name: subjectName, examDate, difficulty: 'Medium' });
        }
        setRawSyllabus(subId, rawText);
        setTopics(subId, parsed.topics);
      } else {
        throw new Error("Invalid structure returned by AI.");
      }
    } catch (err) {
      console.error(err);
      setError(`Parsing error: ${err.message}. Retrying with structured fallback.`);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicChange = (idx, field, value) => {
    const updated = [...editableTopics];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditableTopics(updated);
    if (currentSubject) {
      setTopics(currentSubject.id, updated);
    }
  };

  const handleDeleteTopic = (idx) => {
    const updated = editableTopics.filter((_, i) => i !== idx);
    setEditableTopics(updated);
    if (currentSubject) {
      setTopics(currentSubject.id, updated);
    }
  };

  const handleAddTopic = () => {
    const newTopic = {
      name: "New Syllabus Topic",
      description: "Brief overview of concepts covered",
      difficulty: "Medium",
      estimatedHours: 2,
      prerequisites: []
    };
    const updated = [...editableTopics, newTopic];
    setEditableTopics(updated);
    if (currentSubject) {
      setTopics(currentSubject.id, updated);
    }
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
          AI Syllabus Parser & Topic Breakdown
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Paste your university syllabus. GapFill extracts structured topics, prerequisite trees, and study weights.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-6">
        
        {/* Subject Metadata Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Subject Name
            </label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Data Structures & Algorithms"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Syllabus Textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Raw Syllabus Text or Course Outline
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 hidden sm:inline">Quick Presets:</span>
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

          <textarea
            rows={7}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste syllabus modules, units, or topic outlines..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-xs leading-relaxed"
          />
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            AI extracts topics, dependencies, and assigns realistic hours.
          </p>
          <button
            type="button"
            onClick={handleParse}
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{loading ? "Extracting Topics with AI..." : "Parse Syllabus with AI"}</span>
          </button>
        </div>

      </div>

      {/* Review Screen: Structured Topics Table */}
      {editableTopics.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Extracted Curriculum ({editableTopics.length} Topics)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Review and adjust difficulty or hours before proceeding to PYQs or Quizzes.
              </p>
            </div>
            <button
              onClick={handleAddTopic}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Topic</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Topic Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Est. Hours</th>
                  <th className="py-3 px-4 text-right">Actions</th>
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

                    {/* Description */}
                    <td className="py-3 px-4 text-slate-400 max-w-xs">
                      <input
                        type="text"
                        value={topic.description || ''}
                        onChange={(e) => handleTopicChange(idx, 'description', e.target.value)}
                        className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:bg-slate-950 px-1 py-0.5 rounded text-slate-300 text-xs w-full focus:outline-none"
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

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteTopic(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400 font-medium">
              Ready to calculate exam priority?
            </span>
            <button
              onClick={() => setActiveTab('pyq')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
            >
              <span>Next: Map Past Exam Questions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
