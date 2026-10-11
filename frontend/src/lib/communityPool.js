/**
 * Person 4 - Community Pool Engine (localStorage based)
 * Allows colleges (like IIITDM) to share peer-uploaded past exam papers.
 */

export function saveToPool(college, subject, questions) {
  const safeCollege = (college || 'iiitdm').toLowerCase().replace(/\s/g, '_');
  const safeSubject = (subject || 'cs_general').toLowerCase().replace(/\s/g, '_');
  const key = `pool_${safeCollege}_${safeSubject}`;
  
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  const merged = [...new Set([...existing, ...questions])];
  localStorage.setItem(key, JSON.stringify(merged));
  return merged;
}

export function getFromPool(college, subject) {
  const safeCollege = (college || 'iiitdm').toLowerCase().replace(/\s/g, '_');
  const safeSubject = (subject || 'cs_general').toLowerCase().replace(/\s/g, '_');
  const key = `pool_${safeCollege}_${safeSubject}`;
  
  const stored = JSON.parse(localStorage.getItem(key) || "[]");
  if (stored.length > 0) return stored;

  // Curated college defaults if pool empty
  return [
    "Explain the difference between singly and doubly linked lists with insertion cost. (5 marks)",
    "Perform AVL tree rotations for sequence: 10, 20, 30, 25, 28. (10 marks)",
    "Write an algorithm for BFS traversal and state its time complexity using an adjacency list. (10 marks)",
    "How does collision resolution work in separate chaining vs linear probing? (5 marks)"
  ];
}
