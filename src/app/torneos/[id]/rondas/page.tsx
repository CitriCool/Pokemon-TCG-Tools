import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import {
  startRound,
  recordMatchResult,
  endRound,
  pauseTimer,
  resumeTimer,
  updateTimer,
} from "@/lib/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const dynamic = 'force-dynamic'

function roundStatusBadge(status: string) {
  switch (status) {
    case "active":
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          Activo
        </Badge>
      )
    case "complete":
      return <Badge variant="outline">Completado</Badge>
    default:
      return <Badge variant="secondary">Pendiente</Badge>
  }
}

function matchResultBadge(result: string, player1Name?: string, player2Name?: string) {
  switch (result) {
    case "player1Win":
      return <Badge variant="default">{player1Name ?? "P1"} Gana</Badge>
    case "player2Win":
      return <Badge variant="default">{player2Name ?? "P2"} Gana</Badge>
    case "draw":
      return <Badge variant="secondary">Empate</Badge>
    default:
      return <Badge variant="ghost">Sin jugar</Badge>
  }
}

export default async function RondasPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      rounds: {
        orderBy: { roundNumber: "asc" },
        include: {
          matches: {
            include: {
              player1: { include: { player: true } },
              player2: { include: { player: true } },
            },
          },
        },
      },
    },
  })

  if (!tournament) notFound()

  const currentRound = tournament.rounds.find(
    (r) => r.roundNumber === tournament.currentRound
  )
  const pastRounds = tournament.rounds.filter(
    (r) => r.roundNumber !== tournament.currentRound
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Rondas
          </h1>
          <p className="text-muted-foreground">{tournament.name}</p>
        </div>
        <Link
          href={`/torneos/${tournament.id}`}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-background h-8 px-2.5 text-sm font-medium whitespace-nowrap transition-all hover:bg-muted"
        >
          Volver al Torneo
        </Link>
      </div>

      {tournament.status === "active" && currentRound && (
        <Card>
          <CardHeader>
            <CardTitle>Configurar Timer</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateTimer} className="flex items-end gap-3">
              <input type="hidden" name="roundId" value={currentRound.id} />
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="minutes"
                  className="text-xs text-muted-foreground"
                >
                  Minutos
                </label>
                <input
                  id="minutes"
                  name="minutes"
                  type="number"
                  min={1}
                  defaultValue={
                    currentRound.timerMinutes ?? tournament.defaultRoundTimer
                  }
                  required
                  className="h-8 w-20 rounded-lg border border-border bg-background px-2.5 text-sm"
                />
              </div>
              <Button type="submit" size="sm">
                Actualizar Timer
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {currentRound ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle>Ronda {currentRound.roundNumber}</CardTitle>
              {roundStatusBadge(currentRound.status)}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {currentRound.status === "pending" && (
              <form action={startRound}>
                <input type="hidden" name="roundId" value={currentRound.id} />
                <Button type="submit">Iniciar Ronda</Button>
              </form>
            )}

            {currentRound.status === "active" && (
              <div className="flex gap-2">
                {currentRound.timerPausedAt ? (
                  <form action={resumeTimer}>
                    <input
                      type="hidden"
                      name="roundId"
                      value={currentRound.id}
                    />
                    <Button type="submit" variant="outline">
                      Reanudar
                    </Button>
                  </form>
                ) : (
                  <form action={pauseTimer}>
                    <input
                      type="hidden"
                      name="roundId"
                      value={currentRound.id}
                    />
                    <Button type="submit" variant="outline">
                      Pausar
                    </Button>
                  </form>
                )}
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mesa</TableHead>
                  <TableHead>Jugador 1</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Jugador 2</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRound.matches.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No hay partidos en esta ronda.
                    </TableCell>
                  </TableRow>
                )}
                {currentRound.matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>{match.tableNumber ?? "—"}</TableCell>
                    <TableCell className="font-medium">
                      {match.player1.player.name}
                    </TableCell>
                    <TableCell>
                      {match.result === "unplayed" &&
                      currentRound.status !== "complete" ? (
                        <form
                          action={recordMatchResult}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="hidden"
                            name="matchId"
                            value={match.id}
                          />
                          <select
                            name="result"
                            required
                            className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
                          >
                            <option value="">Seleccionar</option>
                            <option value="player1Win">
                              {match.player1.player.name} Gana
                            </option>
                            {match.player2 && (
                              <option value="player2Win">
                                {match.player2.player.name} Gana
                              </option>
                            )}
                            <option value="draw">Empate</option>
                          </select>
                          <Button type="submit" size="sm">
                            Guardar
                          </Button>
                        </form>
                      ) : (
                        matchResultBadge(
                          match.result,
                          match.player1.player.name,
                          match.player2?.player.name
                        )
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {match.player2 ? (
                        match.player2.player.name
                      ) : (
                        <span className="italic text-muted-foreground">
                          Bye
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {currentRound.status !== "complete" && (
              <form action={endRound} className="self-start">
                <input type="hidden" name="roundId" value={currentRound.id} />
                <Button type="submit">Finalizar Ronda</Button>
              </form>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay rondas disponibles para este torneo.
          </CardContent>
        </Card>
      )}

      {pastRounds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rondas Anteriores</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {pastRounds.map((round) => (
              <details key={round.id} className="group">
                <summary className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-muted/50">
                  <span className="font-medium">
                    Ronda {round.roundNumber}
                  </span>
                  {roundStatusBadge(round.status)}
                  <span className="text-sm text-muted-foreground">
                    {round.matches.length} partidos
                  </span>
                </summary>
                <div className="flex flex-col gap-2 p-3 pt-2">
                  {round.matches.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No hay partidos en esta ronda.
                    </p>
                  )}
                  {round.matches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm"
                    >
                      <span className="flex-1 font-medium">
                        {match.player1.player.name}
                      </span>
                      {match.player2 ? (
                        <>
                          <span className="text-muted-foreground">vs</span>
                          <span className="flex-1 font-medium">
                            {match.player2.player.name}
                          </span>
                        </>
                      ) : (
                        <span className="flex-1 italic text-muted-foreground">
                          Bye
                        </span>
                      )}
                      <div className="ml-auto">
                        {matchResultBadge(
                          match.result,
                          match.player1.player.name,
                          match.player2?.player.name
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
