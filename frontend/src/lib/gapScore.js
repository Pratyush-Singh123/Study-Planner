/**
 * Person 4 - Gap Score & Priority Score Calculator
 */

export function updateGapScore(topic, quizResults) {
  const gapScores = JSON.parse(localStorage.getItem("gapScores") || "{}");
  const avgScore = quizResults.reduce((s, r) => s + (r.score ?? 5), 0) / quizResults.length;
  const newGap = Math.max(0, 100 - avgScore * 10);
  const prev = gapScores[topic] || { score: 100, attempts: 0 };
  const totalAttempts = prev.attempts + quizResults.length;
  
  gapScores[topic] = {
    score: (prev.score * prev.attempts + newGap * quizResults.length) / totalAttempts,
    attempts: totalAttempts,
    lastAttempted: new Date().toISOString()
  };
  
  localStorage.setItem("gapScores", JSON.stringify(gapScores));
  return gapScores[topic];
}

export function getPriorityScore(topic, gapScores, pyqFrequency, examDate) {
  const gap = gapScores[topic]?.score || 100;
  const freq = (pyqFrequency && pyqFrequency[topic]) ? pyqFrequency[topic] : 0.5;
  const daysLeft = Math.max(1, (new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
  return (gap * freq) / daysLeft;
}
