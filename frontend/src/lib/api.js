/**
 * GapFill API Client
 * Calls the Flask API backend routes, with client-side fallback if backend is offline.
 * Automatically injects JWT Bearer tokens for authenticated personalized cloud database access.
 */
import { callLLM, getLLMConfig } from './llm';
import { getAuthHeaders } from './auth';

const API_BASE = '/api';

export async function parseSyllabusAPI(subjectName, syllabusText) {
  const config = getLLMConfig();
  try {
    const res = await fetch(`${API_BASE}/syllabus/parse`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        subjectName,
        syllabusText,
        provider: config.provider,
        apiKey: config.apiKey,
        model: config.model
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.topics && Array.isArray(data.topics)) return data.topics;
    }
  } catch (e) {
    console.warn('Backend /api/syllabus/parse unreachable, using client LLM fallback', e);
  }

  // Client-side fallback
  const prompt = `You are an academic syllabus parser for Indian engineering college courses.
Given raw syllabus text for a subject, extract a structured topic list.
For each topic return:
- name: short topic name (3-6 words max)
- description: one sentence explaining what it covers
- difficulty: Easy | Medium | Hard
- estimatedHours: integer 1, 2, or 3
- prerequisites: list of other topic names from this same syllabus

Return ONLY valid JSON:
{"topics": [{"name": "...", "description": "...", "difficulty": "...", "estimatedHours": 1, "prerequisites": []}]}`;

  const res = await callLLM(prompt, `Subject: ${subjectName}\nSyllabus:\n${syllabusText}`);
  const clean = res.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(clean);
  return parsed.topics || [];
}

export async function mapPYQsAPI(questions, topics) {
  const config = getLLMConfig();
  try {
    const res = await fetch(`${API_BASE}/pyq/map`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        questions,
        topics,
        provider: config.provider,
        apiKey: config.apiKey,
        model: config.model
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend /api/pyq/map unreachable, using client LLM fallback', e);
  }

  // Client-side fallback
  const prompt = `Map each exam question to the most relevant topic from the provided list.
Return ONLY valid JSON:
{"mappings": [{"question": "...", "topic": "...", "marks": 5}]}`;

  const res = await callLLM(prompt, `Topics: ${JSON.stringify(topics)}\nQuestions:\n${JSON.stringify(questions)}`);
  const clean = res.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(clean);
  const mappings = parsed.mappings || [];
  const frequency = {};
  topics.forEach(t => frequency[t] = 0);
  mappings.forEach(m => {
    if (frequency[m.topic] !== undefined) frequency[m.topic]++;
    else frequency[m.topic] = 1;
  });
  return { mappings, frequency };
}

export async function generateQuestionsAPI(topic, subject, difficulty, count = 3) {
  const config = getLLMConfig();
  try {
    const res = await fetch(`${API_BASE}/pyq/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        topic,
        subject,
        difficulty,
        count,
        provider: config.provider,
        apiKey: config.apiKey,
        model: config.model
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.questions) return data.questions;
    }
  } catch (e) {
    console.warn('Backend /api/pyq/generate unreachable, using client LLM fallback', e);
  }

  // Client-side fallback
  const prompt = `Generate exam-style questions for an Indian engineering college exam.
Subject: ${subject}, Topic: ${topic}, Difficulty: ${difficulty}.
Return ONLY valid JSON:
{"questions": [{"question": "...", "type": "theory|implementation|short", "marks": 5, "keyPoints": ["point1"]}]}`;

  const res = await callLLM(prompt, `Generate questions for ${topic}`);
  const clean = res.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(clean);
  return parsed.questions || [];
}

export async function evaluateQuizAnswerAPI(topic, question, studentAnswer, keyPoints = [], subject = 'General') {
  const config = getLLMConfig();
  try {
    const res = await fetch(`${API_BASE}/quiz/evaluate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        topic,
        question,
        studentAnswer,
        keyPoints,
        subject,
        provider: config.provider,
        apiKey: config.apiKey,
        model: config.model
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend /api/quiz/evaluate unreachable, using client fallback', e);
  }

  // Client-side fallback
  const prompt = `You are evaluating a student's exam answer. Be honest but constructive.
Topic: ${topic}
Question: ${question}
Expected key points: ${JSON.stringify(keyPoints)}
Student's answer: ${studentAnswer}

Score out of 10. Identify the conceptual error if wrong.
Return ONLY valid JSON:
{
  "correct": true,
  "score": 8,
  "conceptualError": null,
  "explanation": "clear explanation",
  "hint": "one-line hint",
  "relatedTopics": ["${topic}"]
}`;

  const res = await callLLM(prompt, studentAnswer);
  const clean = res.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(clean);
}

export async function chatCoachAPI(message, history, context) {
  const config = getLLMConfig();
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        message,
        history,
        context,
        provider: config.provider,
        apiKey: config.apiKey,
        model: config.model
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.reply) return data.reply;
    }
  } catch (e) {
    console.warn('Backend /api/chat unreachable, using client fallback', e);
  }

  // Client-side fallback
  const subjectsStr = (context.subjects || []).map(s => `${s.name} (${s.examDate})`).join(', ');
  const prompt = `You are GapFill, a study assistant. Context: Subjects: ${subjectsStr}. Current Date: ${context.currentDate || '2026-10-11'}. Answer specifically using their syllabus.`;
  return await callLLM(prompt, message, history);
}

export async function recommendResourceAPI(topic, subject, confusion, learningStyle = 'video') {
  const config = getLLMConfig();
  try {
    const res = await fetch(`${API_BASE}/resource/recommend`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        topic,
        subject,
        confusion,
        learningStyle,
        provider: config.provider,
        apiKey: config.apiKey,
        model: config.model
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend /api/resource/recommend unreachable, using client fallback', e);
  }

  const prompt = `A student is stuck on: ${confusion} in topic ${topic}. Recommend ONE targeted resource.
Return ONLY valid JSON:
{"resourceType": "video", "title": "Resource title", "why": "Why this fits", "searchQuery": "YouTube search query"}`;

  const res = await callLLM(prompt, confusion);
  const clean = res.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(clean);
}

export const recommendResource = recommendResourceAPI;

export async function uploadPYQPDFAPI(file) {
  const formData = new FormData();
  formData.append('file', file);

  const authHeaders = getAuthHeaders();
  delete authHeaders['Content-Type']; // Let browser set boundary

  const res = await fetch(`${API_BASE}/pyq/upload`, {
    method: 'POST',
    headers: authHeaders,
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload PDF');
  }
  return await res.json();
}
