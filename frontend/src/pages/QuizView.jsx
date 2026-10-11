import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Brain, 
  AlertTriangle, 
  HelpCircle, 
  ArrowRight, 
  ChevronRight, 
  RotateCcw,
  BookOpen,
  Send,
  Video,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { callLLM } from '../lib/llm';

export default function QuizView({ 
  store, 
  selectedQuizTopic, 
  setSelectedQuizTopic,
  setActiveTab 
}) {
  const { state, recordQuizResult, logMistake } = store;
  const currentSubject = state.subjects[0];
  const topics = currentSubject ? (state.topics[currentSubject.id] || []) : [];

  const [activeTopic, setActiveTopic] = useState(
    selectedQuizTopic || topics[0]?.name || "AVL Trees & Balance Rotations"
  );

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [sessionResults, setSessionResults] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [stuckResource, setStuckResource] = useState(null);
  const [loadingResource, setLoadingResource] = useState(false);

  // Load questions when topic changes
  useEffect(() => {
    loadQuestionsForTopic(activeTopic);
  }, [activeTopic]);

  const loadQuestionsForTopic = async (topicName) => {
    setLoadingQuestions(true);
    setQuestions([]);
    setCurrentIdx(0);
    setStudentAnswer('');
    setCurrentFeedback(null);
    setSessionResults([]);
    setQuizCompleted(false);
    setStuckResource(null);

    // Look for matching PYQs first
    const pyqList = currentSubject ? (state.pyqs[currentSubject.id] || []) : [];
    const matchedPYQs = pyqList.filter(p => p.topic?.toLowerCase().trim() === topicName?.toLowerCase().trim());

    if (matchedPYQs.length >= 2) {
      setQuestions(matchedPYQs.slice(0, 3).map((p, idx) => ({
        id: `q_${idx}`,
        question: p.question,
        marks: p.marks || 5,
        type: 'short_answer'
      })));
      setLoadingQuestions(false);
      return;
    }

    // Otherwise generate 3 dynamic exam questions
    const systemPrompt = `Generate 3 exam-style questions for the topic "${topicName}".
Return ONLY valid JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text...",
      "marks": 5,
      "correctAnswer": "Brief key points"
    }
  ]
}`;

    try {
      const res = await callLLM(systemPrompt, `Topic: ${topicName}`);
      const cleanJson = res.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.questions && Array.isArray(parsed.questions)) {
        setQuestions(parsed.questions);
      } else {
        throw new Error("Invalid questions response");
      }
    } catch (e) {
      // Fallback default questions
      setQuestions([
        {
          id: "fb1",
          question: `Explain the fundamental concept of ${topicName} and why it is used in computer science.`,
          marks: 5
        },
        {
          id: "fb2",
          question: `What is the worst-case time complexity of core operations in ${topicName}, and what causes degradation?`,
          marks: 5
        }
      ]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleEvaluate = async () => {
    if (!studentAnswer.trim() || !questions[currentIdx]) return;
    setEvaluating(true);
    setCurrentFeedback(null);
    setStuckResource(null);

    const q = questions[currentIdx];
    const systemPrompt = `You are evaluating a student's answer to an exam question.
Topic: ${activeTopic}
Question: ${q.question}
Correct approach: ${q.correctAnswer || "Academic standard answer"}
Student's answer: ${studentAnswer}

Evaluate and return ONLY valid JSON:
{
  "correct": true|false,
  "score": 0-10,
  "conceptualError": "what the student conceptually misunderstood (null if correct)",
  "errorCategory": "Mental Model Misconception|Edge Case Overlooked|Terminology Confusion|None",
  "explanation": "clear explanation of the correct approach",
  "hint": "one-line hint if they want to try again",
  "relatedTopics": ["topics they should review based on this mistake"]
}`;

    try {
      const res = await callLLM(systemPrompt, studentAnswer);
      const cleanJson = res.replace(/```json/g, '').replace(/```/g, '').trim();
      const feedback = JSON.parse(cleanJson);

      setCurrentFeedback(feedback);
      const newResult = {
        questionId: q.id,
        score: feedback.score || (feedback.correct ? 9 : 3),
        correct: feedback.correct
      };
      const updatedResults = [...sessionResults, newResult];
      setSessionResults(updatedResults);

      // If incorrect, log mistake into persistent mistake log
      if (!feedback.correct && feedback.conceptualError) {
        logMistake({
          subject: currentSubject?.name || 'General',
          topic: activeTopic,
          question: q.question,
          studentAnswer: studentAnswer,
          conceptualError: feedback.conceptualError,
          errorCategory: feedback.errorCategory
        });
      }

      // Check if finished
      if (currentIdx + 1 >= questions.length) {
        setQuizCompleted(true);
        recordQuizResult(activeTopic, updatedResults);
        if (updatedResults.every(r => r.correct || r.score >= 7)) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      }
    } catch (e) {
      console.error(e);
      // Fallback grading
      const fallback = {
        correct: studentAnswer.length > 25,
        score: studentAnswer.length > 25 ? 8 : 4,
        conceptualError: studentAnswer.length <= 25 ? "Answer lacks core detail and key invariants." : null,
        explanation: "Good attempt. Ensure you mention boundary conditions and time complexities.",
        hint: "Consider how pointers or balance factors behave."
      };
      setCurrentFeedback(fallback);
      setSessionResults([...sessionResults, { score: fallback.score, correct: fallback.correct }]);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setCurrentFeedback(null);
    setStudentAnswer('');
    setStuckResource(null);
    setCurrentIdx(prev => prev + 1);
  };

  // Phase 8: Resource Recommender
  const handleGetStuckResource = async () => {
    if (!currentFeedback?.conceptualError) return;
    setLoadingResource(true);

    const systemPrompt = `A student is stuck on a specific concept. Recommend the single best targeted resource for that exact confusion — not the topic generally.
Subject: ${currentSubject?.name || 'Computer Science'}
Topic: ${activeTopic}
Their confusion: ${currentFeedback.conceptualError}
Learning style: video

Return ONLY valid JSON:
{
  "resourceType": "video|article",
  "title": "specific resource name or creator",
  "why": "one sentence why this is the best fit for their confusion",
  "searchQuery": "exact search query to find it on YouTube/Google"
}`;

    try {
      const res = await callLLM(systemPrompt, `Confusion: ${currentFeedback.conceptualError}`);
      const cleanJson = res.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      setStuckResource(parsed);
    } catch (err) {
      setStuckResource({
        resourceType: "video",
        title: `${activeTopic} In-Depth Conceptual Walkthrough`,
        why: "Visualizes the pointer transitions and invariant balances.",
        searchQuery: `${activeTopic} explained visually`
      });
    } finally {
      setLoadingResource(false);
    }
  };

  const activeQuestion = questions[currentIdx];
  const currentGap = state.gapScores[activeTopic]?.score ?? 75;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Title & Topic Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Brain className="w-4 h-4" />
            <span>Interactive Diagnostic Engine</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Diagnostic Quiz & Knowledge Gap Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tests your deep mental models. Evaluates conceptual misconceptions, not just right or wrong.
          </p>
        </div>

        {/* Topic dropdown */}
        <div className="shrink-0">
          <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Testing Topic</label>
          <select
            value={activeTopic}
            onChange={(e) => setActiveTopic(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 shadow-md"
          >
            {topics.map(t => (
              <option key={t.id || t.name} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Topic Status Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
            {currentIdx + 1}/{questions.length || 1}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{activeTopic}</div>
            <div className="text-xs text-slate-400">Current Knowledge Gap: <span className="font-bold text-rose-400">{currentGap}%</span></div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentIdx
                  ? 'bg-indigo-500 ring-4 ring-indigo-500/20'
                  : i < currentIdx
                  ? 'bg-emerald-500'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question Card */}
      {loadingQuestions ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Synthesizing exam questions for {activeTopic}...</p>
        </div>
      ) : activeQuestion && !quizCompleted ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
          
          {/* Question Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Exam Question #{currentIdx + 1}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {activeQuestion.marks || 5} Marks
              </span>
            </div>
            <h3 className="text-lg font-bold text-white leading-relaxed">
              {activeQuestion.question}
            </h3>
          </div>

          {/* Student Answer Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Your Answer / Reasoning
            </label>
            <textarea
              rows={4}
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Type your explanation, algorithm trace, or reasoning..."
              disabled={!!currentFeedback || evaluating}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Evaluation Trigger */}
          {!currentFeedback && (
            <div className="flex items-center justify-end">
              <button
                onClick={handleEvaluate}
                disabled={evaluating || !studentAnswer.trim()}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {evaluating ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{evaluating ? 'Diagnosing Conceptual Reasoning...' : 'Submit & Diagnose Answer'}</span>
              </button>
            </div>
          )}

          {/* AI Feedback & Conceptual Diagnosis Box */}
          {currentFeedback && (
            <div className={`p-6 rounded-2xl border space-y-4 animate-fade-in ${
              currentFeedback.correct
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : 'bg-rose-950/20 border-rose-500/30'
            }`}>
              
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  {currentFeedback.correct ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <h4 className={`text-base font-bold ${currentFeedback.correct ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {currentFeedback.correct ? 'Concept Understood!' : 'Conceptual Gap Identified'}
                    </h4>
                    <span className="text-xs text-slate-400">
                      Score: <strong className="text-white">{currentFeedback.score}/10</strong> · {currentFeedback.errorCategory || 'Evaluation'}
                    </span>
                  </div>
                </div>

                {/* Next Question button */}
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <span>{currentIdx + 1 < questions.length ? 'Next Question' : 'Complete Quiz'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Conceptual Flaw diagnosis */}
              {!currentFeedback.correct && currentFeedback.conceptualError && (
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-500/20 text-xs">
                  <div className="text-[10px] uppercase font-bold text-rose-400 tracking-wider mb-1">
                    What You Misunderstood (Added to Mistake Memory):
                  </div>
                  <div className="text-slate-200 font-medium">
                    {currentFeedback.conceptualError}
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Explanation: </strong>
                {currentFeedback.explanation}
              </div>

              {/* One-line hint */}
              {currentFeedback.hint && (
                <div className="flex items-center space-x-2 text-xs text-amber-300 font-medium">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Hint: {currentFeedback.hint}</span>
                </div>
              )}

              {/* "I'm Stuck" Resource Recommender Button */}
              {!currentFeedback.correct && (
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Need to fix this mental model right now?
                  </span>
                  <button
                    onClick={handleGetStuckResource}
                    disabled={loadingResource}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{loadingResource ? 'Finding best resource...' : "I'm Stuck — Find Resource"}</span>
                  </button>
                </div>
              )}

              {/* Stuck Resource Output Card */}
              {stuckResource && (
                <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-2 mt-2">
                  <div className="text-xs font-bold text-white flex items-center space-x-2">
                    <Video className="w-4 h-4 text-amber-400" />
                    <span>{stuckResource.title}</span>
                  </div>
                  <p className="text-xs text-slate-300">{stuckResource.why}</p>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(stuckResource.searchQuery)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold mt-1"
                  >
                    <span>Search YouTube: "{stuckResource.searchQuery}"</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

            </div>
          )}

        </div>
      ) : null}

      {/* Quiz Completion Screen */}
      {quizCompleted && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 lg:p-12 text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-black text-white">Diagnostic Session Complete!</h2>
            <p className="text-xs text-slate-400">
              GapFill has updated your knowledge gap score for <strong className="text-white">{activeTopic}</strong> and recorded any conceptual flaws into your active mistake memory.
            </p>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Return to Priority Dashboard
            </button>
            <button
              onClick={() => loadQuestionsForTopic(activeTopic)}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Topic</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
