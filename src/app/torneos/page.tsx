import Link from "next/link"
import { prisma } from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

export default async function TorneosPage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { date: "desc" },
    include: { _count: { select: { players: true } } },
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Torneos</h1>
        <Link
          href="/torneos/nuevo"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground h-8 px-2.5 text-sm font-medium whitespace-nowrap transition-all hover:bg-primary/80"
        >
          Crear Torneo
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los torneos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Participantes</TableHead>
                <TableHead>Ronda Actual</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournaments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay torneos aún. Crea uno para empezar.
                  </TableCell>
                </TableRow>
              )}
              {tournaments.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Link
                      href={`/torneos/${t.id}`}
                      className="font-medium hover:underline"
                    >
                      {t.name}
                    </Link>
                  </TableCell>
                  <TableCell>{formatLabels[t.format] ?? t.format}</TableCell>
                  <TableCell>{statusBadge(t.status)}</TableCell>
                  <TableCell>{t._count.players}</TableCell>
                  <TableCell>
                    {t.currentRound}/{t.totalRounds}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.date.toLocaleDateString("es-ES", {
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
