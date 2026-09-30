import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { startTournament, addPlayerToTournament } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export const dynamic = 'force-dynamic'

const formatLabels: Record<string, string> = {
  swiss: "Suizo",
  "single-elim": "Eliminación Directa",
  "round-robin": "Round Robin",
}

function statusBadge(status: string) {
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

function matchResultBadge(result: string) {
  switch (result) {
    case "player1_win":
      return <Badge variant="default">P1 Gana</Badge>
    case "player2_win":
      return <Badge variant="default">P2 Gana</Badge>
    case "draw":
      return <Badge variant="secondary">Empate</Badge>
    case "bye":
      return <Badge variant="outline">Bye</Badge>
    default:
      return <Badge variant="ghost">Sin jugar</Badge>
  }
}

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      players: {
        include: {
          player: true,
          deck: true,
        },
      },
      rounds: {
        orderBy: { roundNumber: "asc" },
        include: {
          matches: {
            include: {
              player1: {
                include: {
                  player: true,
                  deck: true,
                },
              },
              player2: {
                include: {
                  player: true,
                  deck: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!tournament) notFound()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {tournament.name}
          </h1>
          {statusBadge(tournament.status)}
          <Badge variant="outline">
            {formatLabels[tournament.format] ?? tournament.format}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {tournament.status === "pending" && (
            <form action={startTournament}>
              <input type="hidden" name="tournamentId" value={tournament.id} />
              <Button type="submit">Iniciar Torneo</Button>
            </form>
          )}
          {tournament.status === "active" && (
            <>
              <Link
                href={`/torneos/${tournament.id}/rondas`}
                className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground h-8 px-2.5 text-sm font-medium whitespace-nowrap transition-all hover:bg-primary/80"
              >
                Gestionar Rondas
              </Link>
              <Link
                href={`/torneos/${tournament.id}/estadisticas`}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background h-8 px-2.5 text-sm font-medium whitespace-nowrap transition-all hover:bg-muted"
              >
                Estadísticas
              </Link>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Torneo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Fecha</span>
              <span className="font-medium">
                {tournament.date.toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Formato</span>
              <span className="font-medium">
                {formatLabels[tournament.format] ?? tournament.format}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Timer por Ronda
              </span>
              <span className="font-medium">
                {tournament.defaultRoundTimer} min
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Top Cut
              </span>
              <span className="font-medium">
                Top {tournament.topCutSize}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Jugadores{" "}
            <span className="text-muted-foreground">
              ({tournament.players.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Play! ID
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Verificado
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Baraja
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Récord
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Puntos
                </th>
              </tr>
            </thead>
            <tbody>
              {tournament.players.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No hay jugadores en este torneo.
                  </td>
                </tr>
              )}
              {tournament.players.map((tp) => {
                const hasBye =
                  tournament.rounds.length > 0 &&
                  tournament.rounds.filter(
                    (r) =>
                      !r.matches.some(
                        (m) =>
                          m.player1Id === tp.id || m.player2Id === tp.id
                      )
                  ).length > 0

                return (
                  <tr key={tp.id} className="border-b border-border">
                    <td className="px-4 py-3">
                      <Link
                        href={`/jugadores/${tp.playPokemonId}`}
                        className="font-medium hover:underline"
                      >
                        {tp.player.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {tp.playPokemonId}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {tp.verified ? "✓" : "✗"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {tp.deck?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {tp.wins}-{tp.losses}-{tp.ties}
                      {hasBye && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          (Bye)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-medium">
                      {tp.points}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
        <Separator />
        <div className="p-4">
          <form action={addPlayerToTournament} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="tournamentId" value={tournament.id} />
            <div className="flex flex-col gap-1">
              <label htmlFor="playPokemonId" className="text-xs text-muted-foreground">
                Play! ID
              </label>
              <input
                id="playPokemonId"
                name="playPokemonId"
                type="text"
                required
                className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-xs text-muted-foreground">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
              />
            </div>
            <Button type="submit" size="sm">
              Añadir Jugador
            </Button>
          </form>
        </div>
      </Card>

      {(tournament.status === "active" || tournament.status === "complete") &&
        tournament.rounds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Rondas</CardTitle>
              <CardDescription>
                {tournament.rounds.length} rondas en total
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {tournament.rounds.map((round) => (
                <details key={round.id} className="group">
                  <summary className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-muted/50">
                    <span className="font-medium">
                      Ronda {round.roundNumber}
                    </span>
                    {statusBadge(round.status)}
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
                          {matchResultBadge(match.result)}
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
