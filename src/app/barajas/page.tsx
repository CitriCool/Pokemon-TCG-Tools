import Link from "next/link"
import { prisma } from "@/lib/prisma"
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

const formatLabels: Record<string, string> = {
  standard: "Estándar",
  expanded: "Expandido",
  unlimited: "Ilimitado",
}

function parseCardCount(list: string): number {
  try {
    const cards = JSON.parse(list)
    return Array.isArray(cards) ? cards.length : 0
  } catch {
    return 0
  }
}

export default async function BarajasPage() {
  const decks = await prisma.deck.findMany({
    orderBy: { createdAt: "desc" },
    include: { player: true },
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Barajas</h1>
        <Link
          href="/barajas/nueva"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground h-8 px-2.5 text-sm font-medium whitespace-nowrap transition-all hover:bg-primary/80"
        >
          Crear Baraja
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las barajas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Jugador</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead className="text-center">Cartas</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {decks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No hay barajas registradas.
                  </TableCell>
                </TableRow>
              )}
              {decks.map((deck) => (
                <TableRow key={deck.id}>
                  <TableCell>
                    <Link
                      href={`/barajas/${deck.id}`}
                      className="font-medium hover:underline"
                    >
                      {deck.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/jugadores/${deck.playPokemonId}`}
                      className="hover:underline"
                    >
                      {deck.player.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {formatLabels[deck.format] ?? deck.format}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {parseCardCount(deck.list)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {deck.createdAt.toLocaleDateString("es-ES", {
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
