function getSwissRounds(participants: number): number {
  if (participants <= 4) return 3;
  if (participants <= 8) return 3;
  if (participants <= 16) return 4;
  if (participants <= 32) return 5;
  if (participants <= 64) return 7;
  if (participants <= 128) return 8;
  if (participants <= 256) return 9;
  if (participants <= 512) return 10;
  if (participants <= 1024) return 11;
  if (participants <= 2048) return 12;
  if (participants <= 4096) return 13;
  return 14;
}

function getDay2Threshold(participants: number): number | null {
  if (participants <= 64) return null;
  if (participants <= 128) return 12;
  if (participants <= 256) return 15;
  if (participants <= 512) return 18;
  if (participants <= 1024) return 18;
  if (participants <= 2048) return 18;
  if (participants <= 4096) return 21;
  return 21;
}

export interface StandingsEntry {
  id: string;
  playPokemonId: string;
  name: string;
  wins: number;
  losses: number;
  ties: number;
  points: number;
  omwPercent: number;
  oomwPercent: number;
}

function calculatePoints(wins: number, ties: number): number {
  return wins * 3 + ties;
}

function calculateOMW(
  playerId: string,
  players: StandingsEntry[],
  matches: { player1Id: string; player2Id: string; result: string }[]
): number {
  const opponentIds = new Set<string>();
  for (const m of matches) {
    if (m.player1Id === playerId) opponentIds.add(m.player2Id);
    if (m.player2Id === playerId) opponentIds.add(m.player1Id);
  }
  if (opponentIds.size === 0) return 0;
  let totalOpponentWinPercent = 0;
  for (const oppId of opponentIds) {
    const opp = players.find((p) => p.id === oppId);
    if (opp) {
      const oppGames = opp.wins + opp.losses + opp.ties;
      totalOpponentWinPercent += oppGames > 0 ? opp.wins / oppGames : 0;
    }
  }
  return totalOpponentWinPercent / opponentIds.size;
}

function calculateOOMW(
  playerId: string,
  players: StandingsEntry[],
  matches: { player1Id: string; player2Id: string; result: string }[]
): number {
  const opponentIds = new Set<string>();
  for (const m of matches) {
    if (m.player1Id === playerId) opponentIds.add(m.player2Id);
    if (m.player2Id === playerId) opponentIds.add(m.player1Id);
  }
  if (opponentIds.size === 0) return 0;
  let totalOpponentOOMW = 0;
  for (const oppId of opponentIds) {
    totalOpponentOOMW += calculateOMW(oppId, players, matches);
  }
  return totalOpponentOOMW / opponentIds.size;
}

export function getSortedStandings(
  players: StandingsEntry[],
  matches: { player1Id: string; player2Id: string; result: string }[]
): StandingsEntry[] {
  const updated = players.map((p) => ({
    ...p,
    points: calculatePoints(p.wins, p.ties),
    omwPercent: calculateOMW(p.id, players, matches),
    oomwPercent: calculateOOMW(p.id, players, matches),
  }));

  updated.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.omwPercent !== a.omwPercent) return b.omwPercent - a.omwPercent;
    if (b.oomwPercent !== a.oomwPercent) return b.oomwPercent - a.oomwPercent;
    return 0;
  });

  return updated;
}

export function generateSwissPairings(
  players: StandingsEntry[],
  matches: { player1Id: string; player2Id: string; result: string }[]
): { player1Id: string; player2Id: string }[] {
  const sorted = getSortedStandings([...players], matches);
  const paired = new Set<string>();
  const pairings: { player1Id: string; player2Id: string }[] = [];

  const alreadyPlayed = new Map<string, Set<string>>();
  for (const m of matches) {
    if (!alreadyPlayed.has(m.player1Id))
      alreadyPlayed.set(m.player1Id, new Set());
    if (!alreadyPlayed.has(m.player2Id))
      alreadyPlayed.set(m.player2Id, new Set());
    alreadyPlayed.get(m.player1Id)!.add(m.player2Id);
    alreadyPlayed.get(m.player2Id)!.add(m.player1Id);
  }

  for (const player of sorted) {
    if (paired.has(player.id)) continue;

    let opponent: StandingsEntry | undefined;
    for (const potential of sorted) {
      if (
        potential.id !== player.id &&
        !paired.has(potential.id) &&
        !alreadyPlayed.get(player.id)?.has(potential.id)
      ) {
        opponent = potential;
        break;
      }
    }

    if (!opponent) {
      for (const potential of sorted) {
        if (potential.id !== player.id && !paired.has(potential.id)) {
          opponent = potential;
          break;
        }
      }
    }

    if (opponent) {
      paired.add(player.id);
      paired.add(opponent.id);
      pairings.push({ player1Id: player.id, player2Id: opponent.id });
    } else {
      pairings.push({ player1Id: player.id, player2Id: player.id });
    }
  }

  return pairings;
}

export { getSwissRounds, getDay2Threshold };
