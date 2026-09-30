"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { createTournament } from "@/lib/actions"

export default function NuevoTorneoPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <h1 className="text-3xl font-bold">Crear Torneo</h1>

      <form action={createTournament} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Torneo</CardTitle>
            <CardDescription>
              Completá la información para crear un nuevo torneo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Torneo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Ej: Liga Semanal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Formato</Label>
              <Select name="format" defaultValue="swiss">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="swiss">Suizo</SelectItem>
                  <SelectItem value="single-elim">
                    Eliminación Directa
                  </SelectItem>
                  <SelectItem value="round-robin">Round Robin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultRoundTimer">
                Timer por Ronda (minutos)
              </Label>
              <Input
                id="defaultRoundTimer"
                name="defaultRoundTimer"
                type="number"
                defaultValue={30}
                min={5}
                max={120}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topCutSize">Top Cut</Label>
              <Input
                id="topCutSize"
                name="topCutSize"
                type="number"
                defaultValue={8}
                min={0}
                max={64}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Link
            href="/torneos"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background h-8 px-2.5 text-sm font-medium whitespace-nowrap transition-all hover:bg-muted"
          >
            Cancelar
          </Link>
          <Button type="submit">Crear Torneo</Button>
        </div>
      </form>
    </div>
  )
}
