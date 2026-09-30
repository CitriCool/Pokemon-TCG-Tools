# Pokémon TCG Tools

Aplicación web para organizar y llevar el registro de torneos de Pokémon TCG: gestión de jugadores, barajas y torneos con emparejamientos automáticos (suizo y eliminación simple) y estadísticas.

## Funcionalidades

- **Jugadores**: listado y ficha individual.
- **Barajas**: creación y detalle de barajas, con datos de cartas desde la API de Pokémon TCG.
- **Torneos**: creación de torneos, rondas, resultados y estadísticas.
- **Emparejamientos**: formato suizo y eliminación simple (`src/lib/tournament`).

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + [shadcn/ui](https://ui.shadcn.com) (Base UI)
- [Prisma](https://www.prisma.io) 6 + SQLite
- [Pokémon TCG API](https://dev.pokemontcg.io)

## Cómo correrlo

```bash
npm install
cp .env.example .env     # en Windows: copy .env.example .env
npx prisma migrate dev   # crea la base de datos SQLite y genera el cliente
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Variables de entorno (`.env`):

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Ruta a la base SQLite (por defecto `file:./dev.db`). |
| `POKEMON_TCG_API_KEY` | Opcional. Sube el límite de requests de la API. |

## Próximos pasos (TODO)

- [ ] Verificar que las instrucciones de instalación funcionen desde cero.
- [ ] Probar el flujo completo de un torneo (crear, rondas, resultados, estadísticas) y corregir fallos.
- [ ] Tests unitarios para `swiss.ts` y `single-elim.ts` (byes, empates, desempates).
- [ ] Validación de formularios y manejo de errores en las server actions.
- [ ] Editar y eliminar jugadores, barajas y torneos.
- [ ] Importar listas de mazo (texto/PTCGL) y validar el formato.
- [ ] Clasificación y estadísticas por jugador y por baraja (win rate, matchups).
- [ ] Autenticación para que solo los organizadores editen torneos.
- [ ] Migrar de SQLite a Postgres para poder desplegar (por ejemplo en Vercel).
- [ ] Configurar CI en GitHub (lint + build + tests).
- [ ] Mejorar diseño responsive y modo oscuro.
