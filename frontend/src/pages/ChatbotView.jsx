import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Brain, 
  Flame, 
  Clock, 
  HelpCircle,
  Zap,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { callLLM } from '../lib/llm';

export default function ChatbotView({ store, setActiveTab }) {
  const { state, calculatePriorityQueue } = store;
  const currentSubject = state.subjects[0];
  const priorityList = currentSubject ? calculatePriorityQueue(currentSubject.id) : [];

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm **GapFill**, your personalized academic study coach.\n\n` +
        `I know your syllabus for **${currentSubject?.name || 'your courses'}**, your upcoming exam deadlines, your **${Object.keys(state.gapScores).length} tracked knowledge gaps**, and your recent conceptual errors.\n\n` +
        `Ask me anything — what to study right now, how to resolve your recurring mistakes, or how to pace your next 45 minutes.`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Construct context-rich system prompt dynamically
  const buildSystemPrompt = () => {
    const subjectsSummary = state.subjects.map(s => `${s.name} (Exam: ${s.examDate || 'Soon'})`).join(', ');
    const topGaps = priorityList.slice(0, 5).map(p => 
      `${p.topic.name}: Gap ${p.gapScore}%, Exam Frequency ${p.pyqPercent}%, Priority ${p.priorityLevel}`
    ).join('; ');
    const recentMistakes = state.mistakeLog.slice(0, 5).map(m => 
      `Topic [${m.topic}]: "${m.conceptualError}"`
    ).join(' | ');

    return `You are GapFill, a hyper-personalized academic study coach for a university student.
You have full access to this student's live academic profile.

STUDENT PROFILE:
- Subjects & Dates: ${subjectsSummary}
- Today's Date: ${new Date().toLocaleDateString()}
- Top Knowledge Gaps & Exam Frequencies: ${topGaps}
- Recent Conceptual Errors (Mistake Memory): ${recentMistakes || "None logged yet"}

RULES:
- Always refer to specific topics from their syllabus, never generic advice.
- When they ask "what should I study right now?", strictly rank by Priority Score = Gap Score × PYQ Exam Frequency × (1 / Days Until Exam).
- Reference their exact conceptual mistakes when relevant (e.g., "be careful with pointer reversal boundaries").
- When recommending resources, provide specific search queries or exact pedagogical advice.
- Keep answers structured, motivating, and actionable with bullet points.`;
  };

  const handleSendMessage = async (userText = inputText) => {
    const textToSend = userText.trim();
    if (!textToSend || loading) return;

    const newHistory = [...messages, { role: 'user', content: textToSend }];
    setMessages(newHistory);
    setInputText('');
    setLoading(true);

    try {
      const systemPrompt = buildSystemPrompt();
      const response = await callLLM(systemPrompt, textToSend, newHistory);
      setMessages([...newHistory, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages([
        ...newHistory, 
        { role: 'assistant', content: `⚠️ **Connection Note**: ${err.message}. Please check your AI settings.` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "What should I study right now?",
    "I only have 45 minutes today, what do I do?",
    "Why do I keep failing AVL tree rotations?",
    "Am I on track for my exam in 3 days?",
    "Give me an executive summary of my weakest areas"
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16 h-[calc(100vh-140px)] flex flex-col">
      
      {/* Title */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Context-Aware Study Assistant</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            AI Study Coach
          </h1>
        </div>
        <button
          onClick={() => setMessages([{
            role: 'assistant',
            content: "Context refreshed. How can I guide your preparation today?"
          }])}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Clear Conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Chat Box */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 overflow-hidden flex flex-col shadow-2xl">
        
        {/* Message History */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 rounded-tr-sm'
                    : 'bg-slate-950/80 border border-slate-800/80 text-slate-200 rounded-tl-sm whitespace-pre-wrap'
                }`}>
                  {msg.content}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl rounded-tl-sm p-4 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span className="text-xs text-slate-400">Consulting syllabus & mistake memory...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-3 pb-2 overflow-x-auto flex items-center space-x-2 scrollbar-none shrink-0 border-t border-slate-800/60">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              disabled={loading}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors font-medium flex items-center space-x-1"
            >
              <Zap className="w-3 h-3 text-indigo-400 shrink-0" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="pt-2 flex items-center space-x-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask GapFill anything based on your syllabus and mistake history..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !inputText.trim()}
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
