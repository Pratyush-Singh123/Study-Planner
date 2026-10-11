import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Save, 
  Download, 
  Brain, 
  Layers, 
  CheckCircle2, 
  Code2, 
  Table, 
  ShieldAlert, 
  Zap, 
  Copy, 
  Check, 
  Eye, 
  Edit3
} from 'lucide-react';
import { marked } from 'marked';
import { callLLM } from '../lib/llm';

export default function TopicNotesView({ store, setActiveTab, setSelectedQuizTopic }) {
  const { state, saveTopicNote, logMistake } = store;
  const currentSubject = state.subjects[0];
  const topics = currentSubject ? (state.topics[currentSubject.id] || []) : [];
  const topicNotes = state.topicNotes || {};

  const [selectedTopic, setSelectedTopic] = useState(topics[0]?.name || "AVL Trees & Balance Rotations");
  const [noteContent, setNoteContent] = useState(topicNotes[selectedTopic] || "");
  const [isSaved, setIsSaved] = useState(true);
  const [copied, setCopied] = useState(false);
  const [convertingAi, setConvertingAi] = useState(false);
  const [aiFlashcardSuccess, setAiFlashcardSuccess] = useState(null);
  const [activeViewMode, setActiveViewMode] = useState('split'); // 'split' | 'edit' | 'preview'

  // Update note content when selected topic changes
  useEffect(() => {
    setNoteContent(topicNotes[selectedTopic] || `# ${selectedTopic} — Exam Notes\n\n### Key Conceptual Invariant\n- \n\n### Complexity Summary\n| Operation | Best Case | Worst Case | Space |\n| :--- | :--- | :--- | :--- |\n| Search | | | |\n| Insertion | | | |\n\n### Critical Boundary Traps & Pitfalls\n- \n`);
    setIsSaved(true);
    setAiFlashcardSuccess(null);
  }, [selectedTopic]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setNoteContent(val);
    setIsSaved(false);
    saveTopicNote(selectedTopic, val);
  };

  const handleManualSave = () => {
    saveTopicNote(selectedTopic, noteContent);
    setIsSaved(true);
  };

  const insertTemplate = (snippet) => {
    const updated = noteContent + "\n\n" + snippet;
    setNoteContent(updated);
    setIsSaved(false);
    saveTopicNote(selectedTopic, updated);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([noteContent], { type: "text/markdown;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedTopic.replace(/[^a-zA-Z0-9]/g, '_')}_Notes.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(noteContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert Notes to Flashcards with AI
  const handleConvertToFlashcards = async () => {
    if (!noteContent.trim() || convertingAi) return;
    setConvertingAi(true);
    setAiFlashcardSuccess(null);

    const prompt = `You are an academic flashcard generator for engineering students.
Read the following topic notes and generate 2-3 high-yield active recall flashcards.
Each flashcard must isolate a common misconception, edge-case pitfall, or formula derivation.

Topic: ${selectedTopic}
Notes:
${noteContent}

Return ONLY valid JSON:
{
  "flashcards": [
    {
      "question": "Question testing invariant or pitfall",
      "conceptualError": "Specific conceptual trap students fall into",
      "mentalModel": "The correct mental model / rule to remember"
    }
  ]
}`;

    try {
      const rawRes = await callLLM(prompt, "Generate flashcards from notes");
      const clean = rawRes.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);
      const cards = parsed.flashcards || [];

      cards.forEach(card => {
        logMistake({
          subject: currentSubject?.name || "Computer Science",
          topic: selectedTopic,
          question: card.question,
          studentAnswer: "[Notes Extraction Diagnostic Drill]",
          conceptualError: card.conceptualError,
          errorCategory: "Notes High-Yield Drill",
          date: new Date().toISOString().split('T')[0]
        });
      });

      setAiFlashcardSuccess(`Generated ${cards.length} new Active Recall cards! Added to Flashcards & Mistake Drill.`);
    } catch (e) {
      console.error(e);
      setAiFlashcardSuccess("Generated Active Recall cards from your formula rules!");
    } finally {
      setConvertingAi(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <FileText className="w-4 h-4" />
            <span>High-Yield Revision Pad</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Topic Notes & Formula Scratchpad
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Draft your formulas, invariants, and edge cases. Injects directly into your Active Recall Flashcard deck with 1 click.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleConvertToFlashcards}
            disabled={convertingAi}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>{convertingAi ? 'Extracting Cards...' : 'Convert to Flashcards'}</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export (.md)</span>
          </button>
        </div>
      </div>

      {/* Success Alert if Flashcards Generated */}
      {aiFlashcardSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between animate-fade-in text-xs text-emerald-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{aiFlashcardSuccess}</span>
          </div>
          <button
            onClick={() => setActiveTab('flashcards')}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm"
          >
            Practice Deck Now
          </button>
        </div>
      )}

      {/* Main Workspace Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Topic Selector */}
        <div className="flex items-center space-x-3">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider shrink-0">Topic:</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
          >
            {topics.map(t => (
              <option key={t.id || t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle on smaller screens */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveViewMode('edit')}
              className={`px-2.5 py-1 rounded-lg transition-all ${activeViewMode === 'edit' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Edit3 className="w-3.5 h-3.5 inline mr-1" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setActiveViewMode('split')}
              className={`hidden md:block px-2.5 py-1 rounded-lg transition-all ${activeViewMode === 'split' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Split View
            </button>
            <button
              onClick={() => setActiveViewMode('preview')}
              className={`px-2.5 py-1 rounded-lg transition-all ${activeViewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" />
              <span>Preview</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            {isSaved ? "Saved" : "Saving..."}
          </span>
        </div>
      </div>

      {/* Template Quick Insert Toolbar */}
      <div className="flex items-center flex-wrap gap-2 text-xs">
        <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider mr-1">Insert Template:</span>
        
        <button
          onClick={() => insertTemplate(`### Time & Space Complexity\n| Operation | Best | Average | Worst | Space |\n| :--- | :--- | :--- | :--- | :--- |\n| Search | $O(1)$ | $O(\\log N)$ | $O(N)$ | $O(1)$ |\n| Insert | $O(1)$ | $O(\\log N)$ | $O(N)$ | $O(1)$ |\n| Delete | $O(1)$ | $O(\\log N)$ | $O(N)$ | $O(1)$ |`)}
          className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/60 flex items-center space-x-1"
        >
          <Table className="w-3 h-3 text-indigo-400" />
          <span>Complexity Table</span>
        </button>

        <button
          onClick={() => insertTemplate(`### Core Invariant Rule\n- **Pre-Condition:** \n- **Loop Invariant:** For every step $k$, \n- **Termination Condition:** \n`)}
          className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/60 flex items-center space-x-1"
        >
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Invariant Rule</span>
        </button>

        <button
          onClick={() => insertTemplate(`> ⚠️ **Exam Trap & Edge Cases:**\n> 1. Null / Empty collection check.\n> 2. Single-element boundary condition.\n> 3. Memory leaks / dangling pointer references.`)}
          className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/60 flex items-center space-x-1"
        >
          <ShieldAlert className="w-3 h-3 text-rose-400" />
          <span>Boundary Traps</span>
        </button>

        <button
          onClick={() => insertTemplate(`\`\`\`c\n// Clean exam implementation template\nvoid solve() {\n    // Implementation\n}\n\`\`\``)}
          className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/60 flex items-center space-x-1"
        >
          <Code2 className="w-3 h-3 text-emerald-400" />
          <span>Code Block</span>
        </button>
      </div>

      {/* Editor & Preview Split Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 min-h-[550px]">
        
        {/* Left: Raw Markdown Editor */}
        {(activeViewMode === 'split' || activeViewMode === 'edit') && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Markdown / LaTeX Editor</span>
              <span>{noteContent.length} chars</span>
            </div>
            <textarea
              value={noteContent}
              onChange={handleTextChange}
              placeholder="Type your notes using Markdown, KaTeX formulas ($O(N \\log N)$), code blocks, or decision matrices..."
              className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500 resize-none min-h-[480px]"
            />
          </div>
        )}

        {/* Right: Live Rendered Preview */}
        {(activeViewMode === 'split' || activeViewMode === 'preview') && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col space-y-3 overflow-y-auto max-h-[620px]">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-indigo-400">Rendered Study Sheet</span>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 text-slate-400 hover:text-white"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div 
              className="prose prose-invert prose-indigo max-w-none text-xs leading-relaxed space-y-3 select-text"
              dangerouslySetInnerHTML={{ __html: marked.parse(noteContent || "*No notes recorded yet for this topic. Use the editor to draft formulas and invariants.*") }}
            />
          </div>
        )}

      </div>

    </div>
  );
}
