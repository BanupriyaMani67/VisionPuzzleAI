export function recommendDifficulty(stats) {
  const games = Number(stats?.gamesPlayed || 0);
  if (games < 3) return 'medium';
  const speed = Number(stats.averageTime || 0);
  const accuracy = Number(stats.accuracy || 0);
  if (accuracy >= 90 && speed < 120) return 'hard';
  if (accuracy < 65 || speed > 300) return 'easy';
  return 'medium';
}
