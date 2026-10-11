import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  Video, 
  ExternalLink, 
  BookOpen, 
  Search, 
  Filter, 
  Flame, 
  Brain, 
  ArrowRight, 
  CheckCircle2, 
  Bookmark,
  Zap,
  HelpCircle,
  Code2,
  Layers
} from 'lucide-react';
import { recommendResource } from '../lib/api';

// Curated high-yield resources for CS syllabus topics
const CURATED_RESOURCE_CATALOG = {
  "AVL Trees & Balance Rotations": [
    {
      id: "r1",
      title: "Visualgo Interactive AVL Tree Simulator",
      type: "Visualizer",
      provider: "Visualgo.net",
      url: "https://visualgo.net/en/bst",
      duration: "Interactive Tool",
      whyWorks: "Animates single (LL, RR) and double (LR, RL) rotations step-by-step with real-time balance factors, eliminating pointer confusion.",
      learningStyle: "Interactive Simulation",
      bestFor: "Double rotation pivot transitions"
    },
    {
      id: "r2",
      title: "AVL Tree Rotations Explained Intuitive Guide",
      type: "Video",
      provider: "Abdul Bari",
      url: "https://www.youtube.com/results?search_query=abdul+bari+avl+trees+rotations",
      duration: "24 mins",
      whyWorks: "Draws exact subtree transfers by hand, showing why the middle key must become the new sub-root.",
      learningStyle: "Step-by-Step Lecture",
      bestFor: "Exam derivation and proof"
    },
    {
      id: "r3",
      title: "AVL Tree Height Invariant Cheat Sheet",
      type: "Cheat Sheet",
      provider: "CS Theory Notes",
      url: "https://www.geeksforgeeks.org/introduction-to-avl-tree/",
      duration: "5 min read",
      whyWorks: "Compact decision table showing when to apply LL, RR, LR, or RL based on inserted key position.",
      learningStyle: "Quick Reference",
      bestFor: "Last-minute formula check"
    }
  ],
  "Singly & Doubly Linked Lists": [
    {
      id: "r4",
      title: "In-Place Linked List Reversal 3-Pointer Animation",
      type: "Visualizer",
      provider: "NeetCode Visual",
      url: "https://www.youtube.com/results?search_query=neetcode+reverse+linked+list",
      duration: "8 mins",
      whyWorks: "Clearly separates 'prev', 'curr', and 'next' pointer movements to prevent accidental NULL reference crashes.",
      learningStyle: "Visual Code Trace",
      bestFor: "Avoiding cyclic pointer traps"
    },
    {
      id: "r5",
      title: "Doubly Linked List Sentinel Node Architecture",
      type: "Article",
      provider: "MIT OpenCourseWare 6.006",
      url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/",
      duration: "12 min read",
      whyWorks: "Explains how dummy head and tail sentinels eliminate 90% of edge-case conditional checks in deletion algorithms.",
      learningStyle: "Deep Architecture",
      bestFor: "Boundary condition design"
    }
  ],
  "Graph Traversals (BFS & DFS)": [
    {
      id: "r6",
      title: "Graph Traversal BFS vs DFS Explorer",
      type: "Visualizer",
      provider: "Visualgo.net",
      url: "https://visualgo.net/en/dfsbfs",
      duration: "Interactive Tool",
      whyWorks: "Shows color-coded visited sets and queue/stack state on cyclic graphs, illustrating why unvisited nodes cause infinite loops.",
      learningStyle: "Interactive Simulation",
      bestFor: "Cycle detection & shortest path tree"
    },
    {
      id: "r7",
      title: "Breadth-First Search & Level Order State Trace",
      type: "Video",
      provider: "William Fiset Algorithms",
      url: "https://www.youtube.com/results?search_query=william+fiset+bfs+dfs+graphs",
      duration: "18 mins",
      whyWorks: "Focuses on adjacency list representation and memory complexity of the BFS frontier queue.",
      learningStyle: "Algorithm Engineering",
      bestFor: "Space complexity trade-offs"
    }
  ],
  "Hash Tables & Collision Resolution": [
    {
      id: "r8",
      title: "Open Addressing Probing Simulation (Linear vs Quadratic)",
      type: "Visualizer",
      provider: "USFCA Visualizing Algorithms",
      url: "https://www.cs.usfca.edu/~galles/visualization/ClosedHash.html",
      duration: "Interactive Tool",
      whyWorks: "Directly illustrates primary clustering clusters forming under linear probing and how quadratic probing breaks them.",
      learningStyle: "Interactive Benchmark",
      bestFor: "Clustering & load factor analysis"
    },
    {
      id: "r9",
      title: "Hash Function Invariants & Universal Hashing",
      type: "Cheat Sheet",
      provider: "Stanford CS166 Notes",
      url: "https://web.stanford.edu/class/cs166/",
      duration: "10 min read",
      whyWorks: "Proof of expected O(1) retrieval under simple uniform hashing and collision handling comparisons.",
      learningStyle: "Mathematical Rigor",
      bestFor: "University theoretical questions"
    }
  ],
  "Stacks & Circular Queues": [
    {
      id: "r10",
      title: "Circular Queue Front/Rear Modulo Arithmetic Guide",
      type: "Visualizer",
      provider: "Algorithm Visualizer",
      url: "https://algorithm-visualizer.org/",
      duration: "Interactive Tool",
      whyWorks: "Visualizes the (rear + 1) % capacity logic that prevents capacity waste in circular ring buffers.",
      learningStyle: "Interactive",
      bestFor: "Full vs Empty condition ambiguity"
    }
  ]
};

export default function ResourceVaultView({ store, setActiveTab, setSelectedQuizTopic }) {
  const { state } = store;
  const currentSubject = state.subjects[0];
  const topics = currentSubject ? (state.topics[currentSubject.id] || []) : [];
  const gapScores = state.gapScores || {};

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL"); // 'ALL' | 'Visualizer' | 'Video' | 'Cheat Sheet'
  const [aiRecommendations, setAiRecommendations] = useState({});
  const [loadingAiTopic, setLoadingAiTopic] = useState(null);
  const [customConfusion, setCustomConfusion] = useState({});
  const [savedResourceIds, setSavedResourceIds] = useState({});

  // Sort topics by gap score descending (High Gap = Top Priority)
  const sortedTopics = [...topics].sort((a, b) => {
    const gapA = gapScores[a.name]?.score ?? 50;
    const gapB = gapScores[b.name]?.score ?? 50;
    return gapB - gapA;
  });

  const handleToggleSave = (id) => {
    setSavedResourceIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleRequestAiResource = async (topicName) => {
    setLoadingAiTopic(topicName);
    const confusionText = customConfusion[topicName] || "Unclear on core exam invariants and common mistakes";
    
    try {
      const res = await recommendResource({
        topic: topicName,
        subject: currentSubject?.name || "Computer Science",
        confusion: confusionText,
        learningStyle: "visual and concise",
        provider: state.llm_config?.provider,
        apiKey: state.llm_config?.apiKey,
        model: state.llm_config?.model
      });

      setAiRecommendations(prev => ({
        ...prev,
        [topicName]: res
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAiTopic(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Compass className="w-4 h-4" />
              <span>Targeted Resource Vault</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Curated High-Yield Study Guides
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              No more wasting 45 minutes searching through YouTube. Pre-curated visual simulators, concise lectures, and cheat sheets ranked by your highest knowledge gaps.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setActiveTab('flashcards')}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all flex items-center space-x-1.5"
            >
              <Brain className="w-4 h-4" />
              <span>Practice Flashcards</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>Diagnostic Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search topic, algorithm, or concept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Resource Type Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
          {['ALL', 'Visualizer', 'Video', 'Cheat Sheet'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedType === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
              }`}
            >
              {type === 'ALL' ? 'All Formats' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Topics & Curated Resources List */}
      <div className="space-y-6">
        {sortedTopics
          .filter(t => searchQuery === "" || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(topic => {
            const gap = gapScores[topic.name]?.score ?? 50;
            const isHighGap = gap > 60;
            const curatedList = CURATED_RESOURCE_CATALOG[topic.name] || [
              {
                id: `gen_${topic.id}`,
                title: `${topic.name} In-Depth Conceptual Breakdown`,
                type: "Video",
                provider: "Curated University Archive",
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic.name + " data structures concept walkthrough")}`,
                duration: "15 mins",
                whyWorks: `Focuses directly on exam boundary conditions for ${topic.name}.`,
                learningStyle: "Visual & Step-by-Step",
                bestFor: "Core Understanding"
              }
            ];

            const filteredResources = curatedList.filter(r => 
              selectedType === "ALL" || r.type.toLowerCase().includes(selectedType.toLowerCase())
            );

            const aiRec = aiRecommendations[topic.name];

            return (
              <div 
                key={topic.id || topic.name}
                className={`bg-slate-900 border rounded-3xl p-6 lg:p-7 space-y-5 transition-all shadow-lg ${
                  isHighGap ? 'border-rose-500/30 bg-slate-900/90 shadow-rose-500/5' : 'border-slate-800'
                }`}
              >
                {/* Topic Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {topic.name}
                      </h3>
                      {isHighGap && (
                        <span className="flex items-center space-x-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <Flame className="w-3 h-3 text-rose-400" />
                          <span>High Priority Gap</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {topic.description || "Core syllabus module with high probability in past exams."}
                    </p>
                  </div>

                  {/* Topic Metrics */}
                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-right">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Gap Score</div>
                      <div className={`text-xs font-bold ${
                        gap > 60 ? 'text-rose-400' : gap > 30 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {gap}%
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (setSelectedQuizTopic) setSelectedQuizTopic(topic.name);
                        setActiveTab('quiz');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center space-x-1 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Quiz</span>
                    </button>
                  </div>
                </div>

                {/* Curated Resources Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResources.map(res => {
                    const isSaved = savedResourceIds[res.id];

                    return (
                      <div 
                        key={res.id}
                        className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all group"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              res.type === 'Visualizer' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                              res.type === 'Video' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                              'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {res.type}
                            </span>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] text-slate-500 font-mono">{res.duration}</span>
                              <button
                                onClick={() => handleToggleSave(res.id)}
                                className={`p-1 rounded transition-colors ${
                                  isSaved ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'
                                }`}
                              >
                                <Bookmark className="w-3.5 h-3.5" fill={isSaved ? "currentColor" : "none"} />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                            {res.title}
                          </h4>

                          <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                            <strong className="text-slate-200 block text-[10px] uppercase font-semibold mb-0.5">Why this works:</strong>
                            {res.whyWorks}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-900 mt-3 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-medium">{res.provider}</span>
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/30 transition-all"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI Micro-Recommender Accordion for this topic */}
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                      <HelpCircle className="w-4 h-4 text-indigo-400" />
                      <span>Still stuck on a specific nuance in {topic.name}?</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="e.g. When to use RL vs RR rotation..."
                        value={customConfusion[topic.name] || ""}
                        onChange={(e) => setCustomConfusion(prev => ({ ...prev, [topic.name]: e.target.value }))}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-xs text-white placeholder-slate-500 w-48 sm:w-64 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleRequestAiResource(topic.name)}
                        disabled={loadingAiTopic === topic.name}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 shrink-0 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{loadingAiTopic === topic.name ? 'Diagnosing...' : 'Find Fix'}</span>
                      </button>
                    </div>
                  </div>

                  {aiRec && (
                    <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3.5 space-y-2 animate-fade-in text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-300 flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span>AI Curated Target Recommendation: {aiRec.title}</span>
                        </span>
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(aiRec.searchQuery || aiRec.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-400 hover:text-indigo-200 font-semibold flex items-center space-x-1"
                        >
                          <span>Google / YouTube Search</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {aiRec.why}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
      </div>

    </div>
  );
}
