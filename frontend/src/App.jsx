import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SettingsModal from './components/SettingsModal';
import Dashboard from './pages/Dashboard';
import SubjectSetupView from './pages/SubjectSetupView';
import SyllabusView from './pages/SyllabusView';
import PYQView from './pages/PYQView';
import QuizView from './pages/QuizView';
import ChatbotView from './pages/ChatbotView';
import MistakeLogView from './pages/MistakeLogView';
import { useStore } from './store/useStore';
import { Sparkles, Info } from 'lucide-react';

export default function App() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedQuizTopic, setSelectedQuizTopic] = useState('AVL Trees & Balance Rotations');

  const { state } = store;
  const isDemo = state.llm_config?.provider === 'demo';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Demo Banner for Hackathon Judges */}
      {isDemo && (
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-slate-900/60 border-b border-indigo-500/20 px-4 py-1.5 text-center text-xs text-indigo-200 flex items-center justify-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            <strong>Axion Hackathon Mode:</strong> Instant reasoning simulation active. Click <strong>Settings</strong> to connect Claude, OpenAI, Gemini, or Ollama API keys anytime.
          </span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        store={store}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            store={store}
            setActiveTab={setActiveTab}
            setSelectedQuizTopic={setSelectedQuizTopic}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectSetupView
            store={store}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'syllabus' && (
          <SyllabusView
            store={store}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'pyq' && (
          <PYQView
            store={store}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            store={store}
            selectedQuizTopic={selectedQuizTopic}
            setSelectedQuizTopic={setSelectedQuizTopic}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'mistakes' && (
          <MistakeLogView
            store={store}
            setActiveTab={setActiveTab}
            setSelectedQuizTopic={setSelectedQuizTopic}
          />
        )}

        {activeTab === 'chatbot' && (
          <ChatbotView
            store={store}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        store={store}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>GapFill — Intelligent Knowledge Gap Engine · Built for Axion Hackathon</p>
      </footer>

    </div>
  );
}
