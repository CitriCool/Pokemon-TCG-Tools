import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const dynamic = 'force-dynamic'

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const player = await prisma.player.findUnique({
    where: { playPokemonId: id },
    include: {
      tournamentPlayers: {
        include: {
          tournament: true,
        },
        orderBy: {
          tournament: { date: "desc" },
        },
      },
      decks: true,
    },
  })

  if (!player) notFound()

  const totalTournaments = player.tournamentPlayers.length
  const totalWins = player.tournamentPlayers.reduce<number>((sum, tp) => sum + tp.wins, 0)
  const totalLosses = player.tournamentPlayers.reduce<number>((sum, tp) => sum + tp.losses, 0)
  const totalDecks = player.decks.length

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{player.name}</h1>
        <Badge variant="outline" className="font-mono">
          {player.playPokemonId}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Torneos Jugados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalTournaments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Victorias Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{totalWins}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Derrotas Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{totalLosses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Barajas Registradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalDecks}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Torneos{" "}
            <span className="text-muted-foreground">
              ({totalTournaments})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Torneo
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Récord
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Puntos
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Verificado
                </th>
              </tr>
            </thead>
            <tbody>
              {totalTournaments === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No ha participado en torneos.
                  </td>
                </tr>
              )}
              {player.tournamentPlayers.map((tp) => (
                <tr key={tp.id} className="border-b border-border">
                  <td className="px-4 py-3">
                    <Link
                      href={`/torneos/${tp.tournamentId}`}
                      className="font-medium hover:underline"
                    >
                      {tp.tournament.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {tp.tournament.date.toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {tp.wins}-{tp.losses}-{tp.ties}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {tp.points}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {tp.verified ? (
                      <Badge
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Verificado
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pendiente</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Barajas{" "}
            <span className="text-muted-foreground">
              ({totalDecks})
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
                  Formato
                </th>
              </tr>
            </thead>
            <tbody>
              {totalDecks === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No tiene barajas registradas.
                  </td>
                </tr>
              )}
              {player.decks.map((deck) => (
                <tr key={deck.id} className="border-b border-border">
                  <td className="px-4 py-3">
                    <Link
                      href={`/mazos/${deck.id}`}
                      className="font-medium hover:underline"
                    >
                      {deck.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <Badge variant="secondary">{deck.format}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
