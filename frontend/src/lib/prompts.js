export const SYLLABUS_PARSER_PROMPT = `You are an academic syllabus parser for Indian engineering college courses.
Given raw syllabus text for a subject, extract a structured topic list.
For each topic return:
- name: short topic name (3-6 words max)
- description: one sentence explaining what it covers
- difficulty: Easy | Medium | Hard
- estimatedHours: integer 1, 2, or 3
- prerequisites: list of other topic names from this same syllabus

Return ONLY valid JSON:
{"topics": [{"name": "...", "description": "...", "difficulty": "...", "estimatedHours": 1, "prerequisites": []}]}`;

export const PYQ_MAPPER_PROMPT = `Map each exam question to the most relevant topic from the provided list.
Return ONLY valid JSON:
{"mappings": [{"question": "...", "topic": "...", "marks": 5}]}`;

export const QUESTION_GENERATOR_PROMPT = `Generate exam-style questions for an Indian engineering college exam.
Mix question types: theory explanation (5 marks), implementation/algorithm (10 marks), short answer (2 marks).
Return ONLY valid JSON:
{"questions": [{"question": "...", "type": "theory|implementation|short", "marks": 5, "keyPoints": ["point1"]}]}`;

export const QUIZ_EVALUATOR_PROMPT = `You are evaluating a student's exam answer. Be honest but constructive.
Score out of 10. Identify the conceptual error if wrong.
Return ONLY valid JSON:
{
  "correct": true,
  "score": 8,
  "conceptualError": null,
  "explanation": "clear explanation",
  "hint": "one-line hint",
  "relatedTopics": []
}`;

export const RESOURCE_RECOMMENDER_PROMPT = `A student is stuck on a specific concept. Recommend ONE resource.
Return ONLY valid JSON:
{
  "resourceType": "video|article",
  "title": "specific descriptive title",
  "why": "one sentence why this fits their exact confusion",
  "searchQuery": "exact query to find this on YouTube or Google"
}`;
