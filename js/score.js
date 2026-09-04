export function calculateScore({ difficulty, completionTime, moves, mistakes, accuracy }) {
  const difficultyBonus = { easy: 100, medium: 250, hard: 450, expert: 700 }[difficulty] || 100;
  const speedBonus = Math.max(0, difficultyBonus - completionTime * 2);
  return Math.max(0, Math.round(300 + difficultyBonus + speedBonus + accuracy * 4 - moves * 3 - mistakes * 20));
}
