import { useState, useEffect, useRef } from 'react';
import { DEMO_DATASET } from './demoData';
import { 
  getStoredUser, 
  getStoredToken, 
  clearAuth, 
  fetchUserStudyDataAPI, 
  syncUserStudyDataAPI, 
  fetchCurrentUserAPI 
} from '../lib/auth';

const STORAGE_KEY = 'gapfill_state_v1';

export function getInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEMO_DATASET,
        ...parsed,
        topicNotes: parsed.topicNotes || DEMO_DATASET.topicNotes || {},
        studyActivity: parsed.studyActivity || DEMO_DATASET.studyActivity || {},
        mockExamHistory: parsed.mockExamHistory || DEMO_DATASET.mockExamHistory || []
      };
    }
  } catch (e) {
    console.error('Failed to load local storage state', e);
  }
  return DEMO_DATASET;
}

export function saveStateToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

/**
 * Custom Hook for global reactive state with database cloud synchronization
 */
export function useStore() {
  const [state, setState] = useState(getInitialState);
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const isInitialMount = useRef(true);

  // Sync user state on mount if token is present
  useEffect(() => {
    if (token) {
      fetchCurrentUserAPI().then(u => {
        if (u) setUser(u);
        else setUser(null);
      });

      setIsSyncing(true);
      fetchUserStudyDataAPI().then(cloudData => {
        setIsSyncing(false);
        if (cloudData && cloudData.subjects && cloudData.subjects.length > 0) {
          setState(prev => ({ ...prev, ...cloudData }));
          setLastSyncedAt(new Date());
        }
      }).catch(() => setIsSyncing(false));
    }
  }, [token]);

  // Debounced auto-sync to cloud database whenever state updates
  useEffect(() => {
    saveStateToStorage(state);

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (user && token) {
      const timer = setTimeout(async () => {
        setIsSyncing(true);
        const success = await syncUserStudyDataAPI(state);
        setIsSyncing(false);
        if (success) {
          setLastSyncedAt(new Date());
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state, user, token]);

  const onAuthSuccess = async (loggedUser, authToken) => {
    setUser(loggedUser);
    setToken(authToken);
    setIsSyncing(true);

    try {
      const cloudData = await fetchUserStudyDataAPI();
      if (cloudData && cloudData.subjects && cloudData.subjects.length > 0) {
        setState(prev => ({ ...prev, ...cloudData }));
      } else {
        // First-time sync: initialize user cloud database with current data
        await syncUserStudyDataAPI(state);
      }
      setLastSyncedAt(new Date());
    } catch (e) {
      console.warn('Initial cloud sync error', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const onLogout = () => {
    clearAuth();
    setUser(null);
    setToken(null);
    setLastSyncedAt(null);
  };

  const triggerManualSync = async () => {
    if (!token) return;
    setIsSyncing(true);
    const success = await syncUserStudyDataAPI(state);
    setIsSyncing(false);
    if (success) setLastSyncedAt(new Date());
  };

  const loadDemoData = () => {
    setState(DEMO_DATASET);
  };

  const resetAllData = () => {
    const fresh = {
      llm_config: { provider: "demo", apiKey: "", model: "claude-3-5-sonnet-20241022" },
      subjects: [],
      rawSyllabus: {},
      schedule: { hoursPerDay: 3, blockedDates: [], sessionLength: 45 },
      topics: {},
      pyqs: {},
      gapScores: {},
      mistakeLog: [],
      topicNotes: {},
      studyActivity: {},
      mockExamHistory: []
    };
    setState(fresh);
  };

  const setLLMConfig = (llmConfig) => {
    setState(prev => ({ ...prev, llm_config: { ...prev.llm_config, ...llmConfig } }));
    localStorage.setItem('llm_config', JSON.stringify(llmConfig));
  };

  const addSubject = (subject) => {
    const newSub = {
      id: subject.id || `sub_${Date.now()}`,
      name: subject.name,
      code: subject.code || '',
      examDate: subject.examDate,
      difficulty: subject.difficulty || 'Medium',
      prepLevel: subject.prepLevel || 'Not started',
      targetScore: subject.targetScore || 85
    };
    setState(prev => ({
      ...prev,
      subjects: [...prev.subjects, newSub]
    }));
    return newSub.id;
  };

  const updateSubject = (id, updates) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const deleteSubject = (id) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id),
      topics: { ...prev.topics, [id]: undefined },
      pyqs: { ...prev.pyqs, [id]: undefined }
    }));
  };

  const setRawSyllabus = (subjectId, text) => {
    setState(prev => ({
      ...prev,
      rawSyllabus: { ...prev.rawSyllabus, [subjectId]: text }
    }));
  };

  const setTopics = (subjectId, topicsList) => {
    setState(prev => ({
      ...prev,
      topics: {
        ...prev.topics,
        [subjectId]: topicsList.map((t, idx) => ({
          id: t.id || `t_${idx}_${Date.now()}`,
          name: t.name,
          description: t.description || '',
          difficulty: t.difficulty || 'Medium',
          estimatedHours: Number(t.estimatedHours) || 2,
          prerequisites: t.prerequisites || [],
          status: t.status || 'not_started'
        }))
      }
    }));
  };

  const updateTopic = (subjectId, topicId, updates) => {
    setState(prev => ({
      ...prev,
      topics: {
        ...prev.topics,
        [subjectId]: (prev.topics[subjectId] || []).map(t =>
          t.id === topicId ? { ...t, ...updates } : t
        )
      }
    }));
  };

  const addBulkPYQs = (subjectId, pyqsList) => {
    setState(prev => ({
      ...prev,
      pyqs: {
        ...prev.pyqs,
        [subjectId]: [
          ...(prev.pyqs[subjectId] || []),
          ...pyqsList.map((p, idx) => ({
            id: p.id || `pyq_${idx}_${Date.now()}`,
            question: p.question,
            topic: p.topic,
            marks: Number(p.marks) || 5,
            year: p.year || new Date().getFullYear()
          }))
        ]
      }
    }));
  };

  const recordQuizResult = (topicName, quizResults) => {
    if (!quizResults || quizResults.length === 0) return;
    const avgScore = quizResults.reduce((acc, r) => acc + (r.score ?? (r.correct ? 10 : 2)), 0) / quizResults.length;
    const attempts = quizResults.length;

    const sessionGapScore = Math.max(0, Math.min(100, Math.round(100 - avgScore * 10)));

    setState(prev => {
      const prevEntry = prev.gapScores[topicName] || { score: 100, attempts: 0 };
      const totalAttempts = prevEntry.attempts + attempts;
      const weightedScore = Math.round(
        (prevEntry.score * prevEntry.attempts + sessionGapScore * attempts) / totalAttempts
      );

      return {
        ...prev,
        gapScores: {
          ...prev.gapScores,
          [topicName]: {
            score: weightedScore,
            attempts: totalAttempts,
            lastAttempted: new Date().toISOString()
          }
        }
      };
    });
  };

  const logMistake = (mistake) => {
    const entry = {
      id: `mistake_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      subject: mistake.subject || 'General',
      topic: mistake.topic,
      question: mistake.question,
      studentAnswer: mistake.studentAnswer,
      conceptualError: mistake.conceptualError,
      errorCategory: mistake.errorCategory || 'Conceptual Flaw',
      date: new Date().toISOString().split('T')[0],
      resolved: false
    };

    setState(prev => ({
      ...prev,
      mistakeLog: [entry, ...prev.mistakeLog]
    }));
  };

  const resolveMistake = (id) => {
    setState(prev => ({
      ...prev,
      mistakeLog: prev.mistakeLog.map(m => m.id === id ? { ...m, resolved: true } : m)
    }));
  };

  const calculatePriorityQueue = (subjectId) => {
    const subject = state.subjects.find(s => s.id === subjectId) || state.subjects[0];
    if (!subject) return [];

    const topicsList = state.topics[subject.id] || [];
    const pyqsList = state.pyqs[subject.id] || [];

    const today = new Date();
    const examDate = subject.examDate ? new Date(subject.examDate) : new Date(today.getTime() + 7 * 86400000);
    const diffTime = examDate.getTime() - today.getTime();
    const daysUntilExam = Math.max(0.5, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const totalPYQs = pyqsList.length || 1;

    return topicsList.map(t => {
      const topicPYQs = pyqsList.filter(p => p.topic?.toLowerCase().trim() === t.name?.toLowerCase().trim());
      const pyqFrequency = pyqsList.length > 0 ? (topicPYQs.length / totalPYQs) : 0.5;
      const pyqPercent = Math.round(pyqFrequency * 100);

      const gapData = state.gapScores[t.name];
      const gapScore = gapData ? gapData.score : (t.status === 'mastered' ? 15 : 75);

      const urgencyFactor = 1 / daysUntilExam;
      const rawPriority = gapScore * (pyqFrequency + 0.2) * (urgencyFactor * 10);
      const normalizedPriority = Math.min(100, Math.round(rawPriority));

      let priorityLevel = 'LOW';
      if (normalizedPriority >= 60) priorityLevel = 'HIGH';
      else if (normalizedPriority >= 35) priorityLevel = 'MEDIUM';

      return {
        topic: t,
        gapScore,
        pyqCount: topicPYQs.length,
        pyqPercent,
        daysUntilExam,
        priorityScore: normalizedPriority,
        priorityLevel,
        recentMistakes: state.mistakeLog.filter(m => m.topic === t.name && !m.resolved).length
      };
    }).sort((a, b) => b.priorityScore - a.priorityScore);
  };

  const saveTopicNote = (topicName, content) => {
    setState(prev => ({
      ...prev,
      topicNotes: {
        ...(prev.topicNotes || {}),
        [topicName]: content
      }
    }));
  };

  const logStudyActivity = (minutes = 30, questions = 1) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      const current = (prev.studyActivity && prev.studyActivity[today]) || { minutes: 0, questions: 0, sessions: 0 };
      return {
        ...prev,
        studyActivity: {
          ...(prev.studyActivity || {}),
          [today]: {
            minutes: current.minutes + minutes,
            questions: current.questions + questions,
            sessions: current.sessions + 1
          }
        }
      };
    });
  };

  const recordMockExamResult = (examRecord) => {
    setState(prev => ({
      ...prev,
      mockExamHistory: [examRecord, ...(prev.mockExamHistory || [])]
    }));
    logStudyActivity(examRecord.durationMins || 45, examRecord.questionResults?.length || 5);
  };

  const exportStateJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GapFill_Study_Brain_${today}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importStateJSON = (jsonString) => {
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      if (!parsed || !parsed.subjects) {
        throw new Error("Invalid GapFill backup file format: missing subjects.");
      }
      setState(parsed);
      return { success: true, message: `Successfully restored ${parsed.subjects.length} subjects & study data!` };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  return {
    state,
    user,
    token,
    isSyncing,
    lastSyncedAt,
    onAuthSuccess,
    onLogout,
    triggerManualSync,
    loadDemoData,
    resetAllData,
    setLLMConfig,
    addSubject,
    updateSubject,
    deleteSubject,
    setRawSyllabus,
    setTopics,
    updateTopic,
    addBulkPYQs,
    recordQuizResult,
    logMistake,
    resolveMistake,
    calculatePriorityQueue,
    saveTopicNote,
    logStudyActivity,
    recordMockExamResult,
    exportStateJSON,
    importStateJSON
  };
}
