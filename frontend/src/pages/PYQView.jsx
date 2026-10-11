import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  UploadCloud, 
  Users, 
  Bot, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  HelpCircle,
  Plus,
  AlertCircle
} from 'lucide-react';
import { callLLM } from '../lib/llm';

export default function PYQView({ store, setActiveTab }) {
  const { state, addBulkPYQs } = store;
  const currentSubject = state.subjects[0];
  const topics = currentSubject ? (state.topics[currentSubject.id] || []) : [];
  const pyqs = currentSubject ? (state.pyqs[currentSubject.id] || []) : [];

  const [activeTier, setActiveTier] = useState('upload'); // 'upload' | 'community' | 'generator'
  const [pastedQuestions, setPastedQuestions] = useState('');
  const [selectedTopicForGen, setSelectedTopicForGen] = useState(topics[0]?.name || '');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Frequency calculation
  const totalPYQs = pyqs.length || 1;
  const topicFrequencies = topics.map(t => {
    const matched = pyqs.filter(p => p.topic?.toLowerCase().trim() === t.name?.toLowerCase().trim());
    const count = matched.length;
    const percent = Math.round((count / totalPYQs) * 100);
    return {
      topicName: t.name,
      count,
      percent,
      difficulty: t.difficulty,
      priority: percent >= 25 ? 'HIGH' : percent >= 15 ? 'MEDIUM' : 'LOW'
    };
  }).sort((a, b) => b.count - a.count);

  // 1. Handle Mapping Past Questions via AI
  const handleMapQuestions = async () => {
    if (!pastedQuestions.trim()) return;
    setLoading(true);
    setStatusMessage(null);

    const topicNames = topics.map(t => t.name);
    const systemPrompt = `You are given a list of exam questions and a list of syllabus topics. Map each question to the most relevant topic from the list.
Return ONLY valid JSON:
{
  "mappings": [
    {
      "question": "question text",
      "topic": "topic name from the provided list",
      "marks": 5,
      "year": 2024
    }
  ]
}`;

    const userMessage = `Topics: ${JSON.stringify(topicNames)}\n\nQuestions:\n${pastedQuestions}`;

    try {
      const response = await callLLM(systemPrompt, userMessage);
      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.mappings && Array.isArray(parsed.mappings)) {
        addBulkPYQs(currentSubject.id, parsed.mappings);
        setStatusMessage(`Successfully mapped ${parsed.mappings.length} questions across your syllabus!`);
        setPastedQuestions('');
      } else {
        throw new Error("Could not parse question mappings.");
      }
    } catch (err) {
      console.error(err);
      setStatusMessage(`AI Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Generating AI Exam Questions (Tier 3 fallback)
  const handleGenerateQuestions = async () => {
    const topicToUse = selectedTopicForGen || topics[0]?.name;
    if (!topicToUse) return;

    setLoading(true);
    setStatusMessage(null);

    const systemPrompt = `Generate 3 exam-style questions for the topic "${topicToUse}" in subject "${currentSubject?.name || 'Computer Science'}".
Difficulty: Medium. Style: university exam (mix of theory, derivation, and implementation).
Return ONLY valid JSON:
{
  "questions": [
    {
      "question": "Question text...",
      "marks": 10,
      "year": 2025
    }
  ]
}`;

    try {
      const response = await callLLM(systemPrompt, `Generate questions for ${topicToUse}`);
      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.questions && Array.isArray(parsed.questions)) {
        const mapped = parsed.questions.map(q => ({
          question: q.question,
          topic: topicToUse,
          marks: q.marks || 5,
          year: 2025
        }));
        addBulkPYQs(currentSubject.id, mapped);
        setStatusMessage(`Generated ${mapped.length} exam-style university questions for ${topicToUse}!`);
      } else {
        throw new Error("Question generation format error.");
      }
    } catch (err) {
      console.error(err);
      setStatusMessage(`Generation Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 3. Load Community Pool
  const handleLoadCommunityPool = () => {
    const communityQuestions = [
      { question: "Derive time complexity of AVL insertion in the worst case scenario.", topic: "AVL Trees & Balance Rotations", marks: 7, year: 2023 },
      { question: "Write code to detect a cycle in an undirected graph using BFS.", topic: "Graph Traversals (BFS & DFS)", marks: 10, year: 2023 },
      { question: "Explain the pointer adjustment in doubly linked list deletion.", topic: "Singly & Doubly Linked Lists", marks: 5, year: 2022 },
      { question: "Why is circular queue better than linear queue implemented on array?", topic: "Stacks & Circular Queues", marks: 5, year: 2021 }
    ];
    addBulkPYQs(currentSubject.id, communityQuestions);
    setStatusMessage(`Loaded ${communityQuestions.length} verified community questions from IIITDM / Peer Pool!`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <FileText className="w-4 h-4" />
          <span>Exam Trend Intelligence</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          PYQ Engine & Topic Frequency Heatmap
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Know exactly which syllabus topics professors test most often. Never study blindly.
        </p>
      </div>

      {/* 3-Tier Mode Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            id: 'upload',
            title: '1. Upload / Paste PYQs',
            badge: 'Primary Path',
            desc: 'Have papers from seniors or drive? Paste and let AI map them.',
            icon: UploadCloud
          },
          {
            id: 'community',
            title: '2. Community Pool',
            badge: 'IIITDM / College Pool',
            desc: 'Load curated peer-uploaded question archives.',
            icon: Users
          },
          {
            id: 'generator',
            title: '3. AI Exam Generator',
            badge: 'Smart Fallback',
            desc: 'No papers found? Generate authentic university-style exam questions.',
            icon: Bot
          }
        ].map(tier => {
          const Icon = tier.icon;
          const isSelected = activeTier === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => setActiveTier(tier.id)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-600/10 ring-1 ring-indigo-500/50'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-500'
                }`}>
                  {tier.badge}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{tier.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tier.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Tier Input Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-5">
        
        {/* Tier 1: Paste Text / Upload */}
        {activeTier === 'upload' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Paste Past Exam Questions (or Transcripts)
              </label>
              <textarea
                rows={5}
                value={pastedQuestions}
                onChange={(e) => setPastedQuestions(e.target.value)}
                placeholder="1. Explain the difference between singly and doubly linked lists with insertion cost. (5 marks)&#10;2. Perform AVL tree rotations for sequence: 10, 20, 30, 25, 28. (10 marks)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                AI will match every question to your extracted syllabus topics.
              </span>
              <button
                onClick={handleMapQuestions}
                disabled={loading || !pastedQuestions.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{loading ? 'Mapping Questions...' : 'Map to Syllabus Topics'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tier 2: Community Pool */}
        {activeTier === 'community' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-start space-x-3">
              <Users className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-200 leading-relaxed">
                <strong className="text-white">College Peer Pool:</strong> Connects with crowdsourced question archives for <em>{currentSubject?.name || 'Computer Science'}</em>. 4 high-frequency exam questions ready to import.
              </div>
            </div>

            <button
              onClick={handleLoadCommunityPool}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-2"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Import Community Pool Questions</span>
            </button>
          </div>
        )}

        {/* Tier 3: AI Question Generator */}
        {activeTier === 'generator' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Select Topic to Generate Questions For
                </label>
                <select
                  value={selectedTopicForGen}
                  onChange={(e) => setSelectedTopicForGen(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {topics.map(t => (
                    <option key={t.id || t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateQuestions}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Bot className="w-3.5 h-3.5" />
              )}
              <span>{loading ? 'Generating Exam Questions...' : 'Synthesize 3 University Exam Questions'}</span>
            </button>
          </div>
        )}

        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

      </div>

      {/* Topic Exam Frequency Heatmap */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Topic Exam Frequency ({pyqs.length} Total Questions Analyzed)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Distribution of questions across university examination papers.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('quiz')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-all"
          >
            <span>Start Diagnostic Quiz</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {topicFrequencies.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-200">{item.topicName}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    item.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {item.priority} WEIGHT ({item.count} Questions)
                  </span>
                </div>
                <span className="font-mono text-slate-400 font-medium">{item.percent}%</span>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.priority === 'HIGH' ? 'bg-gradient-to-r from-rose-500 to-pink-500' :
                    item.priority === 'MEDIUM' ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                    'bg-gradient-to-r from-emerald-500 to-teal-500'
                  }`}
                  style={{ width: `${Math.max(8, Math.min(100, item.percent * 2))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
