import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = 'force-dynamic'

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  active: "Activo",
  complete: "Completado",
};

const statusVariants: Record<string, "secondary" | "default"> = {
  pending: "secondary",
  active: "default",
  complete: "default",
};

export default async function HomePage() {
  const [totalTournaments, activeTournaments, totalPlayers, totalDecks, recentTournaments] =
    await Promise.all([
      prisma.tournament.count(),
      prisma.tournament.count({ where: { status: "active" } }),
      prisma.player.count(),
      prisma.deck.count(),
      prisma.tournament.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { players: true } } },
      }),
    ]);

  const stats = [
    { label: "Torneos", value: totalTournaments, description: "Total de torneos creados" },
    { label: "Activos", value: activeTournaments, description: "Torneos en curso" },
    { label: "Jugadores", value: totalPlayers, description: "Jugadores registrados" },
    { label: "Barajas", value: totalDecks, description: "Barajas subidas" },
  ];

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pokémon TCG Tools</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona torneos, jugadores y barajas
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <CardDescription>{stat.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Acciones rápidas</h2>
        <div className="flex gap-3">
          <Link
            href="/torneos/nuevo"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground h-8 px-2.5 text-sm font-medium whitespace-nowrap transition-all hover:bg-primary/80"
          >
            Crear Torneo
          </Link>
          <Link
            href="/torneos"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background h-8 px-2.5 text-sm font-medium whitespace-nowrap transition-all hover:bg-muted"
          >
            Ver Torneos
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Torneos recientes</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Jugadores</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTournaments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No hay torneos todavía
                  </TableCell>
                </TableRow>
              ) : (
                recentTournaments.map((tournament) => (
                  <TableRow key={tournament.id}>
                    <TableCell className="font-medium">{tournament.name}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[tournament.status] ?? "secondary"} className={tournament.status === "active" ? "bg-green-600 hover:bg-green-700" : ""}>
                        {statusLabels[tournament.status] ?? tournament.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{tournament._count.players}</TableCell>
                    <TableCell>
                      {new Date(tournament.date).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
