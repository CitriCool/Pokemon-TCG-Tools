import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { createPlayer } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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

export default async function JugadoresPage() {
  const [players, total] = await Promise.all([
    prisma.player.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { tournamentPlayers: true, decks: true } },
      },
    }),
    prisma.player.count(),
  ])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Jugadores</h1>
        <Badge variant="secondary" className="text-sm">
          {total} total
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrar Jugador</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createPlayer} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="playPokemonId" className="text-xs text-muted-foreground">
                Play! Pokémon ID
              </label>
              <Input
                id="playPokemonId"
                name="playPokemonId"
                placeholder="Ej: 1234567890"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-xs text-muted-foreground">
                Nombre
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Nombre del jugador"
                required
              />
            </div>
            <Button type="submit">Registrar Jugador</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Todos los jugadores</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Play! ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-center">Torneos</TableHead>
                <TableHead className="text-center">Barajas</TableHead>
                <TableHead>Fecha Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No hay jugadores registrados.
                  </TableCell>
                </TableRow>
              )}
              {players.map((player) => (
                <TableRow key={player.playPokemonId}>
                  <TableCell className="font-mono text-muted-foreground">
                    {player.playPokemonId}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/jugadores/${player.playPokemonId}`}
                      className="font-medium hover:underline"
                    >
                      {player.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center">{player._count.tournamentPlayers}</TableCell>
                  <TableCell className="text-center">{player._count.decks}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {player.createdAt.toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
