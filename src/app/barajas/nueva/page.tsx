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
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { createDeck } from "@/lib/actions"

export default function NuevaBarajaPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <h1 className="text-3xl font-bold">Nueva Baraja</h1>

      <form action={createDeck} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Baraja</CardTitle>
            <CardDescription>
              Completá la información para registrar una nueva baraja.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playPokemonId">Play! Pokémon ID</Label>
              <Input
                id="playPokemonId"
                name="playPokemonId"
                placeholder="ID de Pokémon del jugador"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Baraja</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Ej: Gardevoir ex"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Formato</Label>
              <Select name="format" defaultValue="standard">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Estándar</SelectItem>
                  <SelectItem value="expanded">Expandido</SelectItem>
                  <SelectItem value="unlimited">Ilimitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="list">Lista de Cartas</Label>
              <Textarea
                id="list"
                name="list"
                placeholder={`[{"id":"xy1-1","name":"Venusaur","quantity":2},...]`}
                rows={8}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Link
            href="/barajas"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background h-8 px-2.5 text-sm font-medium whitespace-nowrap transition-all hover:bg-muted"
          >
            Cancelar
          </Link>
          <Button type="submit">Guardar Baraja</Button>
        </div>
      </form>
    </div>
  )
}
