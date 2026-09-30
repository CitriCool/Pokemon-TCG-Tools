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

const formatLabels: Record<string, string> = {
  standard: "Estándar",
  expanded: "Expandido",
  unlimited: "Ilimitado",
}

interface CardEntry {
  id: string
  name: string
  quantity: number
}

function parseCardList(list: string): CardEntry[] {
  try {
    const cards = JSON.parse(list)
    return Array.isArray(cards) ? cards : []
  } catch {
    return []
  }
}

export default async function BarajaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const deck = await prisma.deck.findUnique({
    where: { id },
    include: { player: true },
  })

  if (!deck) notFound()

  const cards = parseCardList(deck.list)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{deck.name}</h1>
        <Badge variant="secondary">
          {formatLabels[deck.format] ?? deck.format}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jugador</CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            href={`/jugadores/${deck.playPokemonId}`}
            className="font-medium hover:underline"
          >
            {deck.player.name}
          </Link>
          <span className="ml-2 text-sm text-muted-foreground font-mono">
            ({deck.playPokemonId})
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Cartas{" "}
            <span className="text-muted-foreground">
              ({cards.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {cards.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              No hay cartas en esta baraja
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground w-20">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.id} className="border-b border-border">
                    <td className="px-4 py-3 text-center font-mono">
                      {card.quantity}
                    </td>
                    <td className="px-4 py-3 font-medium">{card.name}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {card.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Link
        href="/barajas"
        className="text-sm text-muted-foreground hover:underline"
      >
        &larr; Volver a Barajas
      </Link>
    </div>
  )
}
