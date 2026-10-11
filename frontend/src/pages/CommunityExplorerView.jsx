import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  ThumbsUp, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { saveToPool } from '../lib/communityPool';

const INITIAL_COMMUNITY_PAPERS = [
  {
    id: "cp1",
    college: "IIITDM Kancheepuram",
    course: "Data Structures & Algorithms",
    code: "CS201",
    year: 2024,
    marks: 10,
    topic: "AVL Trees & Balance Rotations",
    question: "Insert the sequence of keys [14, 17, 11, 7, 53, 4, 13] into an empty AVL tree. State the balance factor of each node after every insertion and specify the exact single (LL, RR) or double (LR, RL) rotations performed.",
    upvotes: 42,
    verified: true,
    contributor: "Senior Batch '24"
  },
  {
    id: "cp2",
    college: "IIITDM Kancheepuram",
    course: "Data Structures & Algorithms",
    code: "CS201",
    year: 2024,
    marks: 7,
    topic: "Singly & Doubly Linked Lists",
    question: "Given a singly linked list, formulate an in-place reversal algorithm using O(1) auxiliary memory. Trace your 3-pointer movements and prove that cyclic references are avoided at the initial head.",
    upvotes: 38,
    verified: true,
    contributor: "Anonymous Student"
  },
  {
    id: "cp3",
    college: "IIITDM Kancheepuram",
    course: "Data Structures & Algorithms",
    code: "CS201",
    year: 2023,
    marks: 10,
    topic: "Graph Traversals (BFS & DFS)",
    question: "Write an algorithm for Breadth-First Search (BFS) on an undirected cyclic graph using an adjacency list. Explain why enqueuing vertices without immediate visited flags leads to exponential queue expansion.",
    upvotes: 56,
    verified: true,
    contributor: "Competitive Coding Club"
  },
  {
    id: "cp4",
    college: "IIT Madras",
    course: "Data Structures & Algorithms",
    code: "CS2100",
    year: 2023,
    marks: 5,
    topic: "Hash Tables & Collision Resolution",
    question: "Differentiate between primary clustering in linear probing and secondary clustering in quadratic probing. Provide a mathematical example where two keys with different initial hashes collide along identical probe sequences.",
    upvotes: 29,
    verified: true,
    contributor: "IITM Open Archives"
  },
  {
    id: "cp5",
    college: "NIT Trichy",
    course: "Data Structures & Algorithms",
    code: "CSPC21",
    year: 2023,
    marks: 6,
    topic: "Stacks & Circular Queues",
    question: "Design an array-based Circular Queue ADT that supports enqueue and dequeue in O(1) time without ambiguous states when full vs empty. Compare the 'count variable' approach with the 'sacrificed slot' approach.",
    upvotes: 31,
    verified: true,
    contributor: "CSE Dept Council"
  },
  {
    id: "cp6",
    college: "IIITDM Kancheepuram",
    course: "Operating Systems",
    code: "CS204",
    year: 2024,
    marks: 10,
    topic: "CPU Scheduling & Synchronization",
    question: "Explain the Dining Philosophers Problem. Implement a deadlock-free semaphore solution and prove that no thread experiences starvation under priority inversion.",
    upvotes: 47,
    verified: true,
    contributor: "OS TA '25"
  },
  {
    id: "cp7",
    college: "Anna University",
    course: "Data Structures & Algorithms",
    code: "CS8391",
    year: 2022,
    marks: 8,
    topic: "AVL Trees & Balance Rotations",
    question: "Derive the recurrence relation for the minimum number of nodes in an AVL tree of height h. Prove that the worst-case height is strictly bounded by 1.44 log2(N).",
    upvotes: 25,
    verified: false,
    contributor: "AU Student Forum"
  }
];

export const COLLEGES = [
  "All Colleges",
  "IIITDM Kancheepuram",
  "IIT Madras",
  "NIT Trichy",
  "Anna University",
  "VTU Karnataka"
];

export default function CommunityExplorerView({ store, setActiveTab, setSelectedQuizTopic }) {
  const { state, addBulkPYQs } = store;
  const currentSubject = state.subjects[0];

  const [papers, setPapers] = useState(INITIAL_COMMUNITY_PAPERS);
  const [selectedCollege, setSelectedCollege] = useState("All Colleges");
  const [searchQuery, setSearchQuery] = useState("");
  const [upvotedIds, setUpvotedIds] = useState({});
  const [importedIds, setImportedIds] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);

  // Contribute Question Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newTopic, setNewTopic] = useState("AVL Trees & Balance Rotations");
  const [newCollege, setNewCollege] = useState("IIITDM Kancheepuram");
  const [newMarks, setNewMarks] = useState(10);
  const [newYear, setNewYear] = useState(2024);

  // Filtered list
  const filtered = papers.filter(p => {
    const matchesCollege = selectedCollege === "All Colleges" || p.college === selectedCollege;
    const matchesSearch = searchQuery === "" || 
      p.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.course.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCollege && matchesSearch;
  });

  const handleUpvote = (id) => {
    if (upvotedIds[id]) return;
    setUpvotedIds(prev => ({ ...prev, [id]: true }));
    setPapers(prev => prev.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
  };

  const handleImportSingle = (paper) => {
    if (!currentSubject) return;
    addBulkPYQs(currentSubject.id, [{
      question: paper.question,
      topic: paper.topic,
      marks: paper.marks,
      year: paper.year
    }]);
    setImportedIds(prev => ({ ...prev, [paper.id]: true }));
    setStatusMessage(`Imported "${paper.topic}" exam question into your personal PYQ engine!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleImportAllFiltered = () => {
    if (!currentSubject || filtered.length === 0) return;
    const mapped = filtered.map(p => ({
      question: p.question,
      topic: p.topic,
      marks: p.marks,
      year: p.year
    }));
    addBulkPYQs(currentSubject.id, mapped);
    filtered.forEach(p => setImportedIds(prev => ({ ...prev, [p.id]: true })));
    setStatusMessage(`Successfully imported ${mapped.length} community questions into ${currentSubject.name}!`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleContribute = (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const paper = {
      id: `cp_${Date.now()}`,
      college: newCollege,
      course: currentSubject?.name || "Data Structures & Algorithms",
      code: currentSubject?.code || "CS201",
      year: Number(newYear) || 2024,
      marks: Number(newMarks) || 10,
      topic: newTopic,
      question: newQuestion.trim(),
      upvotes: 1,
      verified: false,
      contributor: "You (Submitted Just Now)"
    };

    setPapers([paper, ...papers]);
    saveToPool(newCollege, currentSubject?.name, [newQuestion.trim()]);
    setIsModalOpen(false);
    setNewQuestion("");
    setStatusMessage("Thank you for contributing! Your question is now available to your campus community pool.");
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Users className="w-4 h-4" />
          <span>Crowdsourced Campus Archives</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          Community PYQ & Exam Question Pool
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Solve the past paper scarcity. Browse, verify, and import questions uploaded by seniors across engineering colleges.
        </p>
      </div>

      {/* College Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-7 space-y-4 shadow-xl">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exam questions by concept (e.g. AVL rotation, DFS cycle, circular queue)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* College Selector */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
            >
              {COLLEGES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Contribute Paper</span>
            </button>

            <button
              onClick={handleImportAllFiltered}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Import All ({filtered.length})</span>
            </button>
          </div>

        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

      </div>

      {/* Questions Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Showing {filtered.length} verified past paper questions</span>
          <span>Target Subject: <strong className="text-white">{currentSubject?.name || 'Computer Science'}</strong></span>
        </div>

        <div className="space-y-3.5">
          {filtered.map(paper => {
            const isImported = !!importedIds[paper.id];
            const isUpvoted = !!upvotedIds[paper.id];

            return (
              <div
                key={paper.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all shadow-lg space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-white bg-slate-800 px-3 py-1 rounded-xl">
                      {paper.college}
                    </span>
                    <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                      {paper.topic}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded">
                      {paper.year} Exam · {paper.marks} Marks
                    </span>
                    {paper.verified && (
                      <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified by Seniors</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
                    By {paper.contributor}
                  </span>
                </div>

                {/* Question Text */}
                <h3 className="text-sm font-semibold text-slate-100 leading-relaxed">
                  {paper.question}
                </h3>

                {/* Actions row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => handleUpvote(paper.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isUpvoted 
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{paper.upvotes} Upvotes</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (setSelectedQuizTopic) setSelectedQuizTopic(paper.topic);
                        setActiveTab('quiz');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center space-x-1"
                    >
                      <span>Take Diagnostic Quiz</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleImportSingle(paper)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                        isImported
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      }`}
                    >
                      {isImported ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                      <span>{isImported ? 'Imported to PYQs' : 'Import Question'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Contribute Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Contribute Exam Question</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Your College</label>
                <input
                  type="text"
                  required
                  value={newCollege}
                  onChange={(e) => setNewCollege(e.target.value)}
                  placeholder="e.g. IIITDM Kancheepuram"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Relevant Syllabus Topic</label>
                <input
                  type="text"
                  required
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. AVL Trees & Balance Rotations"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Marks</label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={newMarks}
                    onChange={(e) => setNewMarks(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Exam Year</label>
                  <input
                    type="number"
                    min={2018}
                    max={2026}
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Question Text</label>
                <textarea
                  rows={4}
                  required
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Type or paste the exam question as printed in the end-sem paper..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30"
                >
                  Submit to Community Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
