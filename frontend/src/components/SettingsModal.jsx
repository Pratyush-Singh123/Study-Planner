import React, { useState } from 'react';
import { X, Check, Key, Cpu, Zap, Info, ShieldCheck } from 'lucide-react';
import { callLLM } from '../lib/llm';

export default function SettingsModal({ isOpen, onClose, store }) {
  const { state, setLLMConfig } = store;
  const [provider, setProvider] = useState(state.llm_config?.provider || 'demo');
  const [apiKey, setApiKey] = useState(state.llm_config?.apiKey || '');
  const [model, setModel] = useState(state.llm_config?.model || 'claude-3-5-sonnet-20241022');
  const [ollamaEndpoint, setOllamaEndpoint] = useState(state.llm_config?.ollamaEndpoint || 'http://localhost:11434');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setLLMConfig({
      provider,
      apiKey,
      model,
      ollamaEndpoint
    });
    onClose();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Temporarily test with current modal values
      localStorage.setItem('llm_config', JSON.stringify({ provider, apiKey, model, ollamaEndpoint }));
      const res = await callLLM("You are a connection tester.", "Reply with 'Connection successful! GapFill is ready.' in 1 sentence.");
      setTestResult({ success: true, message: res });
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">AI Model & LLM Settings</h3>
              <p className="text-xs text-slate-400">Configure your intelligent study reasoning engine</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Provider Selection Cards */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'demo', name: 'Demo Simulator', tag: 'Instant / No Key', desc: 'Pre-configured test engine' },
                { id: 'anthropic', name: 'Anthropic Claude', tag: 'Claude 3.5 Sonnet', desc: 'Deepest reasoning' },
                { id: 'openai', name: 'OpenAI GPT', tag: 'GPT-4o / Mini', desc: 'Standard completions' },
                { id: 'gemini', name: 'Google Gemini', tag: 'Gemini 2.0 Flash', desc: 'Ultra-fast inference' },
                { id: 'ollama', name: 'Local Ollama', tag: 'Llama 3 / Mistral', desc: '100% private local' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setProvider(item.id);
                    if (item.id === 'anthropic' && !model) setModel('claude-3-5-sonnet-20241022');
                    if (item.id === 'openai' && !model) setModel('gpt-4o');
                    if (item.id === 'gemini' && !model) setModel('gemini-2.0-flash');
                    if (item.id === 'ollama' && !model) setModel('llama3');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    provider === item.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-sm ring-1 ring-indigo-500/50'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-200">{item.name}</div>
                  <div className="text-[10px] text-indigo-400 font-mono mt-0.5">{item.tag}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Demo Mode banner */}
          {provider === 'demo' && (
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-start space-x-3">
              <Zap className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-200 leading-relaxed">
                <span className="font-semibold text-white">Hackathon Demo Mode Enabled:</span> Real AI responses, syllabus parsers, question generations, and gap evaluations are simulated instantly with zero API keys required. Perfect for judging!
              </div>
            </div>
          )}

          {/* API Key Input */}
          {provider !== 'demo' && provider !== 'ollama' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                <span>{provider === 'anthropic' ? 'Anthropic API Key' : provider === 'gemini' ? 'Google AI Studio Key' : 'OpenAI API Key'}</span>
                <span className="text-[10px] text-slate-500">Stored locally in browser</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`sk-...`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Model Name */}
          {provider !== 'demo' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Model Name
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={
                  provider === 'anthropic' ? 'claude-3-5-sonnet-20241022' :
                  provider === 'openai' ? 'gpt-4o' :
                  provider === 'gemini' ? 'gemini-2.0-flash' : 'llama3'
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          )}

          {/* Ollama Endpoint */}
          {provider === 'ollama' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Ollama Endpoint
              </label>
              <input
                type="text"
                value={ollamaEndpoint}
                onChange={(e) => setOllamaEndpoint(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          )}

          {/* Test Connection Button & Result */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              {testing ? (
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              )}
              <span>{testing ? 'Testing LLM Connection...' : 'Test Connection'}</span>
            </button>

            {testResult && (
              <div className={`mt-2.5 p-3 rounded-xl text-xs border ${
                testResult.success 
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
              }`}>
                {testResult.message}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-800 bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>

      </div>
    </div>
  );
}
