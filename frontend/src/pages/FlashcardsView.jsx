import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  Brain, 
  Layers, 
  Filter, 
  Flame, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FlashcardsView({ store, setActiveTab, setSelectedQuizTopic }) {
  const { state, resolveMistake, recordQuizResult } = store;
  const currentSubject = state.subjects[0];
  const topics = currentSubject ? (state.topics[currentSubject.id] || []) : [];
  const mistakes = state.mistakeLog || [];

  const [deckFilter, setDeckFilter] = useState('ALL'); // 'ALL' | 'MISTAKES' | 'HIGH_RISK'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState({});
  const [deckComplete, setDeckComplete] = useState(false);

  // Build deck from syllabus topics + mistake memory
  const buildDeck = () => {
    const cards = [];

    // 1. Cards generated from Mistake Memory
    mistakes.forEach(m => {
      cards.push({
        id: `m_${m.id}`,
        topic: m.topic,
        type: "Past Mistake Trap",
        source: "Mistake Memory",
        isMistake: true,
        mistakeId: m.id,
        front: m.question,
        pitfall: m.conceptualError,
        back: `Core Mental Model: When dealing with ${m.topic}, avoid assuming intuitive shortcuts. Address boundary conditions first.`,
        examTip: "Examiners specifically look for step-by-step state traces rather than high-level approximations."
      });
    });

    // 2. High-Yield Conceptual Cards for Syllabus Topics
    const defaultConceptuals = [
      {
        id: "c1",
        topic: "AVL Trees & Balance Rotations",
        type: "Invariant Rule",
        source: "Core Curriculum",
        front: "When an element is inserted into the left subtree of the right child, which rotation sequence restores the AVL balance factor?",
        pitfall: "Confusing single left (RR) rotation with a double Right-Left (RL) rotation.",
        back: "Requires a Double RL (Right-Left) Rotation: First, perform a single Right rotation on the right child, followed by a Left rotation on the unbalanced node.",
        examTip: "Always show intermediate tree balance factors before and after each sub-rotation."
      },
      {
        id: "c2",
        topic: "Singly & Doubly Linked Lists",
        type: "Boundary Trap",
        source: "Core Curriculum",
        front: "What catastrophic error occurs if the original head's next pointer is not assigned to NULL during in-place reversal?",
        pitfall: "Treating node traversal as symmetrical with pointer redirection.",
        back: "The original head becomes the new tail. Failing to set `head.next = null` produces an infinite cycle back to the second node.",
        examTip: "Write the 3-pointer invariant: `next = curr.next; curr.next = prev; prev = curr; curr = next;`"
      },
      {
        id: "c3",
        topic: "Graph Traversals (BFS & DFS)",
        type: "Algorithm Invariant",
        source: "Core Curriculum",
        front: "Why must a visited set be updated immediately upon ENQUEUING in BFS rather than upon DEQUEUING?",
        pitfall: "Delaying visited status causes duplicate insertions of the same node from multiple neighbors.",
        back: "Enqueuing without immediately marking as visited allows adjacent frontier nodes to re-enqueue the same vertex multiple times, degrading space complexity to exponential.",
        examTip: "State time complexity as O(V + E) for adjacency list representations."
      },
      {
        id: "c4",
        topic: "Hash Tables & Collision Resolution",
        type: "Performance Boundary",
        source: "Core Curriculum",
        front: "What is primary clustering in linear probing, and why does secondary clustering in quadratic probing differ?",
        pitfall: "Conflating identical hash values with consecutive probe sequences.",
        back: "Primary clustering occurs when different keys collide into contiguous clusters. Quadratic probing eliminates primary clustering by using an $i^2$ step size.",
        examTip: "Mention that quadratic probing does not eliminate secondary clustering (keys hashing to the same initial index follow identical paths)."
      },
      {
        id: "c5",
        topic: "Stacks & Circular Queues",
        type: "Implementation Check",
        source: "Core Curriculum",
        front: "How do you distinguish between an EMPTY and a FULL circular queue in a fixed-size array?",
        pitfall: "Relying purely on `front == rear` which is identical for both empty and full without a count.",
        back: "Either sacrifice one array slot (Full when `(rear + 1) % size == front`), or maintain an explicit `count` variable.",
        examTip: "Draw the circular array index arithmetic diagram for 5 marks."
      }
    ];

    cards.push(...defaultConceptuals);

    if (deckFilter === 'MISTAKES') {
      return cards.filter(c => c.isMistake);
    } else if (deckFilter === 'HIGH_RISK') {
      return cards.filter(c => (state.gapScores[c.topic]?.score ?? 70) > 40);
    }
    return cards;
  };

  const currentDeck = buildDeck();
  const currentCard = currentDeck[currentIndex] || currentDeck[0];

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex, deckFilter]);

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex + 1 < currentDeck.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setDeckComplete(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleMarkMastered = () => {
    if (!currentCard) return;
    setMasteredCards(prev => ({ ...prev, [currentCard.id]: true }));
    if (currentCard.isMistake && currentCard.mistakeId) {
      resolveMistake(currentCard.mistakeId);
    }
    // Boost gap score for topic
    recordQuizResult(currentCard.topic, [{ score: 10, correct: true }]);
    handleNext();
  };

  const handleMarkConfused = () => {
    if (!currentCard) return;
    setMasteredCards(prev => ({ ...prev, [currentCard.id]: false }));
    // Slightly lower gap score to ensure it stays in priority queue
    recordQuizResult(currentCard.topic, [{ score: 4, correct: false }]);
    handleNext();
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Brain className="w-4 h-4" />
            <span>Active Recall Engine</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Rapid Concept Flashcards
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Drill high-yield exam traps and personal mistake patterns in rapid 60-second flip sessions.
          </p>
        </div>

        {/* Filter deck pills */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1 rounded-2xl">
          {[
            { id: 'ALL', label: 'All Cards' },
            { id: 'MISTAKES', label: `My Mistakes (${mistakes.filter(m => !m.resolved).length})` },
            { id: 'HIGH_RISK', label: 'High Gaps' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                setDeckFilter(f.id);
                setCurrentIndex(0);
                setDeckComplete(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                deckFilter === f.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Flashcard Container */}
      {!deckComplete && currentCard ? (
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Deck Counter & Progress */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Card {currentIndex + 1} of {currentDeck.length}</span>
            <div className="w-48 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${Math.round(((currentIndex + 1) / currentDeck.length) * 100)}%` }}
              />
            </div>
            <span className="text-indigo-400 font-bold">{Math.round(((currentIndex + 1) / currentDeck.length) * 100)}%</span>
          </div>

          {/* Interactive 3D-feel Flashcard */}
          <div 
            onClick={() => setIsFlipped(prev => !prev)}
            className="cursor-pointer select-none perspective-1000 min-h-[360px] relative transition-transform duration-300 hover:scale-[1.01]"
          >
            <div className={`w-full min-h-[360px] rounded-3xl p-8 border transition-all duration-500 flex flex-col justify-between shadow-2xl relative overflow-hidden ${
              isFlipped
                ? 'bg-gradient-to-b from-slate-900 via-indigo-950/30 to-slate-900 border-indigo-500/50 shadow-indigo-500/10'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-slate-950/50'
            }`}>
              
              {/* Card Top Metadata */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20">
                    {currentCard.topic}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    currentCard.isMistake ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {currentCard.type}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400">
                  <RotateCw className={`w-3.5 h-3.5 text-indigo-400 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
                  <span>{isFlipped ? 'Answer' : 'Question'}</span>
                </div>
              </div>

              {/* Card Main Body */}
              <div className="py-6 space-y-4">
                {!isFlipped ? (
                  /* FRONT */
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-bold text-white leading-relaxed">
                      {currentCard.front}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tap card or press to flip and reveal the conceptual model.
                    </p>
                  </div>
                ) : (
                  /* BACK */
                  <div className="space-y-4 animate-fade-in">
                    {/* Pitfall Box */}
                    {currentCard.pitfall && (
                      <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs">
                        <strong className="text-rose-300 block mb-0.5 font-bold">⚠️ Root Conceptual Trap:</strong>
                        <span className="text-slate-200">{currentCard.pitfall}</span>
                      </div>
                    )}

                    <div className="text-sm font-medium text-slate-100 leading-relaxed">
                      {currentCard.back}
                    </div>

                    {/* Exam Tip */}
                    <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200">
                      <strong className="text-indigo-300 font-bold">💡 Examiner Expectation: </strong>
                      {currentCard.examTip}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="text-center text-[11px] text-slate-500 font-medium border-t border-slate-800/80 pt-3">
                Click card to flip
              </div>

            </div>
          </div>

          {/* Action Ratings & Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            
            {/* Prev button */}
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Answer Evaluation Buttons */}
            {isFlipped ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleMarkConfused}
                  className="px-5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all flex items-center space-x-1.5"
                >
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Still Shaky</span>
                </button>

                <button
                  onClick={handleMarkMastered}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Got It Mastered</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsFlipped(true)}
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-2"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Show Invariant & Pitfall</span>
              </button>
            )}

            {/* Next button */}
            <button
              onClick={handleNext}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

          </div>

        </div>
      ) : (
        /* Deck Completed Screen */
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Flashcard Session Complete!</h2>
            <p className="text-xs text-slate-400">
              You reviewed {currentDeck.length} high-yield concept cards. Your knowledge gap scores have updated based on your self-rated mastery.
            </p>
          </div>

          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={() => {
                setDeckComplete(false);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Deck</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              Test with Diagnostic Quiz
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
