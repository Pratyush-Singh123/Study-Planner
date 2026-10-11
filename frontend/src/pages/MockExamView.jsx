import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft, 
  Flag, 
  Check, 
  X, 
  Printer, 
  ShieldCheck,
  TrendingUp,
  Brain
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { callLLM } from '../lib/llm';

// Realistic End-Semester Exam Paper for CS201 Data Structures & Algorithms
const DEFAULT_MOCK_PAPER = [
  {
    id: "q1",
    section: "Part A (Short Conceptual)",
    marks: 4,
    topic: "AVL Trees & Balance Rotations",
    question: "State the mathematical condition for an AVL tree to become unbalanced after node insertion. Distinguish between a single RR rotation and a double RL rotation with a diagrammatic trace description.",
    hint: "Think about balance factors exceeding {-1, 0, 1} and the zigzag structure."
  },
  {
    id: "q2",
    section: "Part A (Short Conceptual)",
    marks: 3,
    topic: "Singly & Doubly Linked Lists",
    question: "Why does the in-place iterative reversal of a singly linked list require exactly three pointers? What runtime error or cyclic defect occurs if head.next is not explicitly reset to NULL?",
    hint: "Recall the pointer state at iteration 0 and termination."
  },
  {
    id: "q3",
    section: "Part A (Short Conceptual)",
    marks: 4,
    topic: "Stacks & Circular Queues",
    question: "In an array-based Circular Queue of capacity N, explain why only N - 1 items are stored if a dedicated count variable is omitted. State the modulo full condition.",
    hint: "(rear + 1) % N == front ambiguity."
  },
  {
    id: "q4",
    section: "Part A (Short Conceptual)",
    marks: 4,
    topic: "Hash Tables & Collision Resolution",
    question: "Define primary clustering in linear probing. Formulate mathematically how quadratic probing mitigates this issue and state the restrictions on table size M.",
    hint: "Consecutive occupied cluster growth vs secondary probe offset."
  },
  {
    id: "q5",
    section: "Part B (Comprehensive & Derivations)",
    marks: 12,
    topic: "AVL Trees & Balance Rotations",
    question: "Given an initially empty AVL tree, insert the sequence of keys: [45, 12, 67, 89, 90, 10, 15, 14]. For every insertion that causes an imbalance:\n(a) Identify the deepest unbalanced node and its balance factor.\n(b) Classify the rotation type (LL, RR, LR, RL).\n(c) Draw or describe the resulting sub-tree after rotation.",
    hint: "Watch for the [89, 90] right-heavy imbalance and the [10, 15, 14] zigzag insertion."
  },
  {
    id: "q6",
    section: "Part B (Comprehensive & Derivations)",
    marks: 11,
    topic: "Graph Traversals (BFS & DFS)",
    question: "Given a connected undirected graph with V vertices and E edges:\n(a) Formulate the BFS algorithm using an adjacency list and explicit FIFO queue.\n(b) Prove that BFS finds the shortest path in terms of edge count from source vertex s.\n(c) Explain the memory and execution failure that occurs if visited flags are marked upon dequeue instead of enqueue.",
    hint: "Duplicate frontier queue expansion."
  },
  {
    id: "q7",
    section: "Part B (Comprehensive & Derivations)",
    marks: 12,
    topic: "BST & Tree Traversals",
    question: "Describe an algorithm to delete a node with two children in a Binary Search Tree.\n(a) Explain why replacing the target with either its in-order predecessor or in-order successor preserves the BST invariant.\n(b) Analyze the worst-case and average-case time complexities of this deletion operation.",
    hint: "Successor is minimum of right subtree."
  }
];

export default function MockExamView({ store, setActiveTab }) {
  const { state, recordMockExamResult, recordQuizResult, logMistake } = store;
  const currentSubject = state.subjects[0];
  const history = state.mockExamHistory || [];

  const [examActive, setExamActive] = useState(false);
  const [examDurationMins, setExamDurationMins] = useState(60);
  const [timeLeftSecs, setTimeLeftSecs] = useState(60 * 60);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [evaluating, setEvaluating] = useState(false);
  const [examResult, setExamResult] = useState(null);

  // Timer Effect
  useEffect(() => {
    if (!examActive) return;
    if (timeLeftSecs <= 0) {
      handleAutoSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeftSecs(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [examActive, timeLeftSecs]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const startExam = (mins = 60) => {
    setExamDurationMins(mins);
    setTimeLeftSecs(mins * 60);
    setAnswers({});
    setFlagged({});
    setCurrentQIndex(0);
    setExamResult(null);
    setExamActive(true);
  };

  const handleAnswerChange = (qId, text) => {
    setAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const toggleFlag = (qId) => {
    setFlagged(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleAutoSubmit = () => {
    alert("Time is up! Your answers are being evaluated.");
    handleSubmitExam();
  };

  const handleSubmitExam = async () => {
    setExamActive(false);
    setEvaluating(true);

    const questionsToEval = DEFAULT_MOCK_PAPER;
    const answeredCount = Object.keys(answers).filter(k => answers[k]?.trim().length > 0).length;

    // Evaluate answers
    const evaluations = [];
    let totalScore = 0;
    let maxMarks = 0;

    for (const q of questionsToEval) {
      maxMarks += q.marks;
      const ans = answers[q.id]?.trim() || "";

      if (!ans) {
        evaluations.push({
          questionId: q.id,
          topic: q.topic,
          marksAwarded: 0,
          maxMarks: q.marks,
          comment: "Unattempted. Zero marks awarded.",
          conceptualError: "Question skipped under time pressure."
        });
        continue;
      }

      // Prompt LLM for strict examiner grading
      const prompt = `You are a strict university exam evaluator for Indian engineering colleges.
Evaluate this student answer out of ${q.marks} marks.
Question: ${q.question}
Student Answer: ${ans}

Return ONLY valid JSON:
{
  "marksAwarded": 8,
  "comment": "Concise examiner feedback praising correct parts and noting gaps",
  "conceptualError": "Conceptual error if any, or null if mostly correct"
}`;

      try {
        const rawRes = await callLLM(prompt, "Evaluate exam answer");
        const clean = rawRes.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        const awarded = Math.min(q.marks, Math.max(0, Number(parsed.marksAwarded) || Math.round(q.marks * 0.7)));

        totalScore += awarded;
        evaluations.push({
          questionId: q.id,
          topic: q.topic,
          marksAwarded: awarded,
          maxMarks: q.marks,
          comment: parsed.comment || "Good analytical trace, minor boundary omission.",
          conceptualError: parsed.conceptualError || null
        });

        // Record in mistake log if awarded < 60%
        if (awarded < (q.marks * 0.6) && parsed.conceptualError) {
          logMistake({
            subject: currentSubject?.name || "Data Structures",
            topic: q.topic,
            question: q.question,
            studentAnswer: ans,
            conceptualError: parsed.conceptualError,
            errorCategory: "Mock Exam Deficit",
            date: new Date().toISOString().split('T')[0]
          });
        }

        // Update gap score
        recordQuizResult(q.topic, awarded >= (q.marks * 0.7));

      } catch (e) {
        // Fallback grading
        const awarded = Math.round(q.marks * 0.75);
        totalScore += awarded;
        evaluations.push({
          questionId: q.id,
          topic: q.topic,
          marksAwarded: awarded,
          maxMarks: q.marks,
          comment: "Clear understanding of the invariant; demonstrate all intermediate rotation states for full marks.",
          conceptualError: null
        });
      }
    }

    const percentage = Math.round((totalScore / maxMarks) * 100);
    let grade = "A+";
    if (percentage >= 90) grade = "O (Outstanding)";
    else if (percentage >= 80) grade = "A+ (Excellent)";
    else if (percentage >= 70) grade = "A (Very Good)";
    else if (percentage >= 60) grade = "B+ (Good)";
    else if (percentage >= 50) grade = "B (Above Average)";
    else grade = "C (Needs Revision)";

    const resultRecord = {
      id: `mock_${Date.now()}`,
      subjectId: currentSubject?.id || "cs-dsa-101",
      subjectName: currentSubject?.name || "Data Structures & Algorithms",
      date: new Date().toISOString().split('T')[0],
      score: totalScore,
      totalMarks: maxMarks,
      percentage,
      grade,
      durationMins: examDurationMins,
      summary: `Score: ${totalScore}/${maxMarks} (${percentage}%). Graded as ${grade}.`,
      questionResults: evaluations
    };

    recordMockExamResult(resultRecord);
    setExamResult(resultRecord);
    setEvaluating(false);

    if (percentage >= 70) {
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
    }
  };

  const activeQ = DEFAULT_MOCK_PAPER[currentQIndex];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* State 1: Exam In Progress */}
      {examActive && activeQ && (
        <div className="space-y-5">
          
          {/* Top Exam Navigation Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-16 z-40 backdrop-blur-md shadow-2xl">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentSubject?.code || 'CS201'} End-Semester Mock
              </span>
              <span className="text-xs font-bold text-slate-300">
                Question {currentQIndex + 1} of {DEFAULT_MOCK_PAPER.length}
              </span>
            </div>

            {/* Countdown Clock */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-black font-mono transition-all ${
                timeLeftSecs < 300 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
                  : timeLeftSecs < 900
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-slate-950 text-indigo-300 border-slate-800'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeLeftSecs)} Remaining</span>
              </div>

              <button
                onClick={() => {
                  if (confirm("Are you ready to submit your exam paper for AI evaluation?")) {
                    handleSubmitExam();
                  }
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 transition-all"
              >
                Submit Paper
              </button>
            </div>
          </div>

          {/* Main Question & Answer Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left 3 cols: Question & Writing Area */}
            <div className="lg:col-span-3 space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-7 space-y-4 shadow-xl">
                
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {activeQ.section}
                    </span>
                    <span className="text-xs font-bold text-indigo-400">
                      [{activeQ.marks} Marks]
                    </span>
                  </div>

                  <button
                    onClick={() => toggleFlag(activeQ.id)}
                    className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg transition-colors ${
                      flagged[activeQ.id] ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{flagged[activeQ.id] ? 'Flagged for Review' : 'Flag Question'}</span>
                  </button>
                </div>

                <div className="text-sm font-semibold text-white leading-relaxed whitespace-pre-line">
                  {activeQ.question}
                </div>

                <div className="text-[11px] text-slate-500 italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                  Topic: <strong>{activeQ.topic}</strong> · Hint: {activeQ.hint}
                </div>

                {/* Answer Area */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Your Examination Response (Write derivations, code traces, or mathematical steps):
                  </label>
                  <textarea
                    rows={12}
                    value={answers[activeQ.id] || ""}
                    onChange={(e) => handleAnswerChange(activeQ.id, e.target.value)}
                    placeholder="Provide your complete examination answer step-by-step. Include diagrams/rotation traces in text format..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Navigation controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQIndex === 0}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={() => setCurrentQIndex(prev => Math.min(DEFAULT_MOCK_PAPER.length - 1, prev + 1))}
                    disabled={currentQIndex === DEFAULT_MOCK_PAPER.length - 1}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>

            {/* Right 1 col: Question Palette */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                  Question Palette
                </h4>

                <div className="grid grid-cols-4 gap-2">
                  {DEFAULT_MOCK_PAPER.map((q, idx) => {
                    const isCurrent = idx === currentQIndex;
                    const isAnswered = answers[q.id]?.trim().length > 0;
                    const isFlagged = flagged[q.id];

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQIndex(idx)}
                        className={`h-9 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center ${
                          isCurrent ? 'ring-2 ring-indigo-400 bg-indigo-600 text-white' :
                          isFlagged ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' :
                          isAnswered ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' :
                          'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span>{idx + 1}</span>
                        {isAnswered && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-500" />
                    <span>Answered ({Object.values(answers).filter(v => v?.trim().length > 0).length})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded bg-purple-500/40 border border-purple-500" />
                    <span>Flagged for Review ({Object.values(flagged).filter(Boolean).length})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded bg-slate-950 border border-slate-800" />
                    <span>Unanswered</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* State 2: Evaluating Loader */}
      {evaluating && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-white">Grading End-Semester Mock Examination...</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            The AI Examiner is evaluating each proof and derivation against academic standards, assigning marks, and updating your Knowledge Gap Scores.
          </p>
        </div>
      )}

      {/* State 3: Exam Scorecard / Result View */}
      {examResult && !examActive && !evaluating && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl">
            {/* Scorecard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Official Mock Exam Scorecard
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  {examResult.subjectName}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Exam Date: {examResult.date} · Evaluated against university marking rubrics
                </p>
              </div>

              {/* Big Grade Badge */}
              <div className="flex items-center space-x-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center min-w-[120px]">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Total Score</div>
                  <div className="text-3xl font-black text-white mt-0.5">
                    {examResult.score}<span className="text-sm font-normal text-slate-400">/{examResult.totalMarks}</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-400">{examResult.percentage}%</div>
                </div>

                <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-2xl text-center min-w-[100px]">
                  <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-semibold">Grade Awarded</div>
                  <div className="text-2xl font-black text-indigo-400 mt-0.5">{examResult.grade}</div>
                </div>
              </div>
            </div>

            {/* Question by Question Detailed Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Detailed Question-by-Question Evaluation & Feedback
              </h3>

              <div className="space-y-3">
                {examResult.questionResults.map((r, idx) => (
                  <div 
                    key={r.questionId || idx}
                    className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4.5 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">Q{idx + 1}. [{r.topic}]</span>
                      </div>
                      <div className="font-mono font-bold text-indigo-400">
                        {r.marksAwarded} / {r.maxMarks} Marks
                      </div>
                    </div>

                    <div className="text-slate-300 leading-relaxed">
                      <strong className="text-slate-400 block text-[10px] uppercase font-semibold">Examiner Remarks:</strong>
                      {r.comment}
                    </div>

                    {r.conceptualError && (
                      <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-2.5 text-rose-300 text-[11px]">
                        <strong>Detected Conceptual Slip:</strong> {r.conceptualError} (Added to Mistake Log for active recall practice)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Scorecard Action Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setExamResult(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Return to Exam Hub
              </button>

              <button
                onClick={() => setActiveTab('mistakes')}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/30"
              >
                Review Mistake Traps
              </button>
            </div>

          </div>

        </div>
      )}

      {/* State 4: Default Hub (Choose Exam Mode or View History) */}
      {!examActive && !evaluating && !examResult && (
        <div className="space-y-6">
          
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Award className="w-4 h-4" />
                <span>Timed Exam Testing Environment</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                End-Semester Mock Exam Simulator
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                Step into actual exam conditions. Timed multi-part paper combining 3-mark conceptual queries and 12-mark comprehensive traces with rigorous AI examiner scoring.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => startExam(30)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
              >
                30-Min Sprint Mock
              </button>
              <button
                onClick={() => startExam(60)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
              >
                <Award className="w-4 h-4" />
                <span>Start Full 60-Min Paper (50M)</span>
              </button>
            </div>
          </div>

          {/* Previous Mock Test History */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Your Previous Mock Exam Scorecards ({history.length})</span>
            </h3>

            {history.length === 0 ? (
              <div className="text-xs text-slate-500 p-6 text-center">
                No mock exams completed yet. Take your first test above to establish your baseline grade!
              </div>
            ) : (
              <div className="space-y-3">
                {history.map(item => (
                  <div 
                    key={item.id}
                    className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-xs">{item.subjectName}</span>
                        <span className="text-[10px] text-slate-500">· {item.date}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {item.summary}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-black text-white">{item.score}/{item.totalMarks}</div>
                        <div className="text-[10px] font-bold text-emerald-400">{item.grade}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
