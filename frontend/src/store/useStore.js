import { useState, useEffect } from 'react';
import { DEMO_DATASET } from './demoData';

const STORAGE_KEY = 'gapfill_state_v1';

export function getInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load local storage state', e);
  }
  // Default to Demo Dataset so the app is immediately alive and functional
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
 * Custom Hook for global reactive state
 */
export function useStore() {
  const [state, setState] = useState(getInitialState);

  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

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
      mistakeLog: []
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

  /**
   * Update knowledge gap score based on quiz performance
   * avgScore is 0 to 10
   */
  const recordQuizResult = (topicName, quizResults) => {
    if (!quizResults || quizResults.length === 0) return;
    const avgScore = quizResults.reduce((acc, r) => acc + (r.score ?? (r.correct ? 10 : 2)), 0) / quizResults.length;
    const attempts = quizResults.length;

    // Gap score: 0 = completely mastered, 100 = completely unknown
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

  /**
   * Priority score formula:
   * Priority Score = Gap Score * PYQ Frequency * (1 / Days Until Exam)
   */
  const calculatePriorityQueue = (subjectId) => {
    const subject = state.subjects.find(s => s.id === subjectId) || state.subjects[0];
    if (!subject) return [];

    const topicsList = state.topics[subject.id] || [];
    const pyqsList = state.pyqs[subject.id] || [];

    // Calculate days until exam
    const today = new Date();
    const examDate = subject.examDate ? new Date(subject.examDate) : new Date(today.getTime() + 7 * 86400000);
    const diffTime = examDate.getTime() - today.getTime();
    const daysUntilExam = Math.max(0.5, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Total PYQs for subject
    const totalPYQs = pyqsList.length || 1;

    return topicsList.map(t => {
      // Topic PYQ count
      const topicPYQs = pyqsList.filter(p => p.topic?.toLowerCase().trim() === t.name?.toLowerCase().trim());
      const pyqFrequency = pyqsList.length > 0 ? (topicPYQs.length / totalPYQs) : 0.5; // normalized 0..1
      const pyqPercent = Math.round(pyqFrequency * 100);

      // Gap score: 0 to 100 (defaults to 75 if unattempted)
      const gapData = state.gapScores[t.name];
      const gapScore = gapData ? gapData.score : (t.status === 'mastered' ? 15 : 75);

      // Urgency factor
      const urgencyFactor = 1 / daysUntilExam;

      // Priority formula
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

  return {
    state,
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
    calculatePriorityQueue
  };
}
