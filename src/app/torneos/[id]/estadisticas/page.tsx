import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getSortedStandings, type StandingsEntry } from "@/lib/tournament/swiss"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const dynamic = 'force-dynamic'

export default async function EstadisticasPage({
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
                include: { player: true },
              },
              player2: {
                include: { player: true },
              },
            },
          },
        },
      },
    },
  })

  if (!tournament) notFound()

  const allMatches = tournament.rounds.flatMap((r) => r.matches)

  const standingsInput: StandingsEntry[] = tournament.players.map((p) => ({
    id: p.id,
    playPokemonId: p.playPokemonId,
    name: p.player.name,
    wins: p.wins,
    losses: p.losses,
    ties: p.ties,
    points: p.points,
    omwPercent: p.omwPercent,
    oomwPercent: p.oomwPercent,
  }))

  const matchInput = allMatches.map((m) => ({
    player1Id: m.player1Id,
    player2Id: m.player2Id,
    result: m.result,
  }))

  const standings = getSortedStandings(standingsInput, matchInput)

  const victoriasLocales = allMatches.filter((m) => m.result === "player1Win").length
  const victoriasVisitantes = allMatches.filter((m) => m.result === "player2Win").length
  const empates = allMatches.filter((m) => m.result === "draw").length
  const sinJugar = allMatches.filter((m) => m.result === "unplayed").length
  const totalPartidas = victoriasLocales + victoriasVisitantes + empates

  const topQualifiers = standings.slice(0, tournament.topCutSize)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estadísticas</h1>
          <p className="text-muted-foreground">{tournament.name}</p>
        </div>
        <Link
          href={`/torneos/${tournament.id}`}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-background h-8 px-2.5 text-sm font-medium whitespace-nowrap transition-all hover:bg-muted"
        >
          Volver al Torneo
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tabla de Posiciones</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">Posición</TableHead>
                <TableHead>Jugador</TableHead>
                <TableHead className="text-center">Puntos</TableHead>
                <TableHead className="text-center">Victorias</TableHead>
                <TableHead className="text-center">Derrotas</TableHead>
                <TableHead className="text-center">Empates</TableHead>
                <TableHead className="text-center">OMW%</TableHead>
                <TableHead className="text-center">OOMW%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No hay jugadores en este torneo.
                  </TableCell>
                </TableRow>
              )}
              {standings.map((entry, index) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-center font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/jugadores/${entry.playPokemonId}`}
                      className="hover:underline"
                    >
                      {entry.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center">{entry.points}</TableCell>
                  <TableCell className="text-center">{entry.wins}</TableCell>
                  <TableCell className="text-center">{entry.losses}</TableCell>
                  <TableCell className="text-center">{entry.ties}</TableCell>
                  <TableCell className="text-center">
                    {(entry.omwPercent * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-center">
                    {(entry.oomwPercent * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Jugadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{tournament.players.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Partidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalPartidas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Victorias Locales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{victoriasLocales}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Victorias Visitantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{victoriasVisitantes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Empates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{empates}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Partidas Sin Jugar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{sinJugar}</p>
          </CardContent>
        </Card>
      </div>

      {topQualifiers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Cut — Top {tournament.topCutSize}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Jugador</TableHead>
                  <TableHead className="text-center">Puntos</TableHead>
                  <TableHead className="text-center">Récord</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topQualifiers.map((entry, index) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-center font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/jugadores/${entry.playPokemonId}`}
                        className="hover:underline"
                      >
                        {entry.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">{entry.points}</TableCell>
                    <TableCell className="text-center">
                      {entry.wins}-{entry.losses}-{entry.ties}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
