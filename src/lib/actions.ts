"use server";

import { prisma } from "@/lib/prisma";
import { getSwissRounds, generateSwissPairings, getSortedStandings } from "@/lib/tournament/swiss";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPlayer(formData: FormData) {
  const playPokemonId = formData.get("playPokemonId") as string;
  const name = formData.get("name") as string;

  await prisma.player.upsert({
    where: { playPokemonId },
    update: { name },
    create: { playPokemonId, name },
  });

  revalidatePath("/jugadores");
}

export async function registerPlayerInTournament(formData: FormData) {
  const tournamentId = formData.get("tournamentId") as string;
  const playPokemonId = formData.get("playPokemonId") as string;
  const name = formData.get("name") as string;
  const registeredBy = formData.get("registeredBy") as "owner" | "player";

  await prisma.player.upsert({
    where: { playPokemonId },
    update: { name },
    create: { playPokemonId, name },
  });

  const verified = registeredBy === "player";

  await prisma.tournamentPlayer.create({
    data: {
      tournamentId,
      playPokemonId,
      registeredBy,
      verified,
      verifiedAt: verified ? new Date() : null,
    },
  });

  revalidatePath(`/torneos/${tournamentId}`);
}

export async function createTournament(formData: FormData) {
  const name = formData.get("name") as string;
  const format = (formData.get("format") as string) || "swiss";
  const defaultRoundTimer = parseInt(formData.get("defaultRoundTimer") as string) || 30;
  const topCutSize = parseInt(formData.get("topCutSize") as string) || 8;

  const tournament = await prisma.tournament.create({
    data: { name, format, defaultRoundTimer, topCutSize },
  });

  revalidatePath("/torneos");
  redirect(`/torneos/${tournament.id}`);
}

export async function startTournament(formData: FormData) {
  const tournamentId = formData.get("tournamentId") as string;

  const playerCount = await prisma.tournamentPlayer.count({
    where: { tournamentId },
  });

  const totalRounds = getSwissRounds(playerCount);

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      status: "active",
      totalRounds,
      currentRound: 1,
    },
  });

  const players = await prisma.tournamentPlayer.findMany({
    where: { tournamentId },
  });

  const playerEntries = players.map((p) => ({
    id: p.id,
    playPokemonId: p.playPokemonId,
    name: "",
    wins: 0,
    losses: 0,
    ties: 0,
    points: 0,
    omwPercent: 0,
    oomwPercent: 0,
  }));

  const pairings = generateSwissPairings(playerEntries, []);

  const tournamentInfo = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { defaultRoundTimer: true },
  });

  const round = await prisma.round.create({
    data: {
      tournamentId,
      roundNumber: 1,
      status: "active",
      timerMinutes: tournamentInfo?.defaultRoundTimer,
      timerStartedAt: new Date(),
    },
  });

  for (const pair of pairings) {
    await prisma.match.create({
      data: {
        roundId: round.id,
        player1Id: pair.player1Id,
        player2Id: pair.player2Id,
      },
    });
  }

  revalidatePath(`/torneos/${tournamentId}`);
}

export async function addPlayerToTournament(formData: FormData) {
  const tournamentId = formData.get("tournamentId") as string;
  const playPokemonId = formData.get("playPokemonId") as string;
  const name = formData.get("name") as string;

  await prisma.player.upsert({
    where: { playPokemonId },
    update: { name },
    create: { playPokemonId, name },
  });

  await prisma.tournamentPlayer.create({
    data: {
      tournamentId,
      playPokemonId,
      registeredBy: "owner",
    },
  });

  revalidatePath(`/torneos/${tournamentId}`);
}

export async function verifyPlayerInTournament(formData: FormData) {
  const tournamentId = formData.get("tournamentId") as string;
  const playPokemonId = formData.get("playPokemonId") as string;

  await prisma.tournamentPlayer.update({
    where: {
      tournamentId_playPokemonId: { tournamentId, playPokemonId },
    },
    data: {
      verified: true,
      verifiedAt: new Date(),
    },
  });

  revalidatePath(`/torneos/${tournamentId}`);
}

export async function startRound(formData: FormData) {
  const roundId = formData.get("roundId") as string;

  await prisma.round.update({
    where: { id: roundId },
    data: {
      status: "active",
      timerStartedAt: new Date(),
    },
  });

  const round = await prisma.round.findUnique({
    where: { id: roundId },
    select: { tournamentId: true },
  });

  if (round) {
    revalidatePath(`/torneos/${round.tournamentId}`);
  }
}

export async function recordMatchResult(formData: FormData) {
  const matchId = formData.get("matchId") as string;
  const result = formData.get("result") as "player1Win" | "player2Win" | "draw";

  const match = await prisma.match.update({
    where: { id: matchId },
    data: { result },
    include: {
      round: { select: { tournamentId: true } },
    },
  });

  const tournamentId = match.round.tournamentId;

  const [allPlayers, allMatches] = await Promise.all([
    prisma.tournamentPlayer.findMany({
      where: { tournamentId },
    }),
    prisma.match.findMany({
      where: {
        round: { tournamentId },
        NOT: { result: "unplayed" },
      },
    }),
  ]);

  const playerStats = allPlayers.map((p) => {
    let wins = 0;
    let losses = 0;
    let ties = 0;

    for (const m of allMatches) {
      if (m.player1Id === p.id) {
        if (m.result === "player1Win") wins++;
        else if (m.result === "player2Win") losses++;
        else if (m.result === "draw") ties++;
      } else if (m.player2Id === p.id) {
        if (m.result === "player2Win") wins++;
        else if (m.result === "player1Win") losses++;
        else if (m.result === "draw") ties++;
      }
    }

    return {
      id: p.id,
      playPokemonId: p.playPokemonId,
      name: "",
      wins,
      losses,
      ties,
      points: wins * 3 + ties,
      omwPercent: 0,
      oomwPercent: 0,
    };
  });

  const matchData = allMatches.map((m) => ({
    player1Id: m.player1Id,
    player2Id: m.player2Id,
    result: m.result,
  }));

  const sorted = getSortedStandings(playerStats, matchData);

  const sortedMap = new Map(sorted.map((s) => [s.id, s]));

  for (const player of allPlayers) {
    const stats = sortedMap.get(player.id);
    if (stats) {
      await prisma.tournamentPlayer.update({
        where: { id: player.id },
        data: {
          wins: stats.wins,
          losses: stats.losses,
          ties: stats.ties,
          points: stats.points,
          omwPercent: stats.omwPercent,
          oomwPercent: stats.oomwPercent,
        },
      });
    }
  }

  revalidatePath(`/torneos/${tournamentId}`);
}

export async function endRound(formData: FormData) {
  const roundId = formData.get("roundId") as string;

  const round = await prisma.round.findUnique({
    where: { id: roundId },
    select: { roundNumber: true, tournamentId: true },
  });

  if (!round) throw new Error("Round not found");

  const { tournamentId, roundNumber } = round;

  await prisma.round.update({
    where: { id: roundId },
    data: { status: "complete" },
  });

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { totalRounds: true, defaultRoundTimer: true },
  });

  if (!tournament) throw new Error("Tournament not found");

  if (roundNumber >= tournament.totalRounds) {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "complete" },
    });
  } else {
    const nextRoundNumber = roundNumber + 1;

    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { currentRound: nextRoundNumber },
    });

    const [players, matches] = await Promise.all([
      prisma.tournamentPlayer.findMany({
        where: { tournamentId },
      }),
      prisma.match.findMany({
        where: {
          round: { tournamentId },
          NOT: { result: "unplayed" },
        },
      }),
    ]);

    const playerEntries = players.map((p) => ({
      id: p.id,
      playPokemonId: p.playPokemonId,
      name: "",
      wins: p.wins,
      losses: p.losses,
      ties: p.ties,
      points: p.points,
      omwPercent: p.omwPercent,
      oomwPercent: p.oomwPercent,
    }));

    const matchData = matches.map((m) => ({
      player1Id: m.player1Id,
      player2Id: m.player2Id,
      result: m.result,
    }));

    const pairings = generateSwissPairings(playerEntries, matchData);

    const nextRound = await prisma.round.create({
      data: {
        tournamentId,
        roundNumber: nextRoundNumber,
        timerMinutes: tournament.defaultRoundTimer,
      },
    });

    for (const pair of pairings) {
      await prisma.match.create({
        data: {
          roundId: nextRound.id,
          player1Id: pair.player1Id,
          player2Id: pair.player2Id,
        },
      });
    }
  }

  revalidatePath(`/torneos/${tournamentId}`);
}

export async function pauseTimer(formData: FormData) {
  const roundId = formData.get("roundId") as string;

  const round = await prisma.round.update({
    where: { id: roundId },
    data: {
      timerPausedAt: new Date(),
    },
    select: { tournamentId: true },
  });

  revalidatePath(`/torneos/${round.tournamentId}`);
}

export async function resumeTimer(formData: FormData) {
  const roundId = formData.get("roundId") as string;

  const round = await prisma.round.update({
    where: { id: roundId },
    data: {
      timerPausedAt: null,
      timerStartedAt: new Date(),
    },
    select: { tournamentId: true },
  });

  revalidatePath(`/torneos/${round.tournamentId}`);
}

export async function updateTimer(formData: FormData) {
  const roundId = formData.get("roundId") as string;
  const minutes = parseInt(formData.get("minutes") as string);

  const round = await prisma.round.update({
    where: { id: roundId },
    data: { timerMinutes: minutes },
    select: { tournamentId: true },
  });

  revalidatePath(`/torneos/${round.tournamentId}`);
}

export async function createDeck(formData: FormData) {
  const playPokemonId = formData.get("playPokemonId") as string;
  const name = formData.get("name") as string;
  const format = (formData.get("format") as string) || "standard";
  const list = (formData.get("list") as string) || "[]";
  const tournamentId = formData.get("tournamentId") as string | null;

  const deck = await prisma.deck.create({
    data: { playPokemonId, name, format, list },
  });

  if (tournamentId) {
    await prisma.tournamentPlayer.update({
      where: {
        tournamentId_playPokemonId: { tournamentId, playPokemonId },
      },
      data: { deckId: deck.id },
    });
  }

  revalidatePath("/barajas");
  redirect("/barajas");
}

export async function deleteDeck(formData: FormData) {
  const deckId = formData.get("deckId") as string;

  await prisma.tournamentPlayer.updateMany({
    where: { deckId },
    data: { deckId: null },
  });

  await prisma.deck.delete({ where: { id: deckId } });

  revalidatePath("/barajas");
}

export async function findPlayerByPokemonId(playPokemonId: string) {
  const player = await prisma.player.findUnique({
    where: { playPokemonId },
    select: {
      playPokemonId: true,
      name: true,
      createdAt: true,
    },
  });

  return JSON.stringify(player);
}
