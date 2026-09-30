export interface BracketMatch {
  round: number;
  matchIndex: number;
  player1Id?: string;
  player2Id?: string;
  winnerId?: string;
  parentMatch1?: { round: number; matchIndex: number };
  parentMatch2?: { round: number; matchIndex: number };
}

export function generateSingleElimBracket(
  playerCount: number
): BracketMatch[] {
  const totalRounds = Math.ceil(Math.log2(playerCount));
  const bracketSize = Math.pow(2, totalRounds);
  const matches: BracketMatch[] = [];
  let currentRoundSize = bracketSize / 2;

  for (let round = 1; round <= totalRounds; round++) {
    for (let i = 0; i < currentRoundSize; i++) {
      matches.push({ round, matchIndex: i });
    }
    currentRoundSize = Math.floor(currentRoundSize / 2);
  }

  return matches;
}
