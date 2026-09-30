const POKEMON_TCG_API = "https://api.pokemontcg.io/v2";
const API_KEY = process.env.POKEMON_TCG_API_KEY || "";

const headers: HeadersInit = {
  "Content-Type": "application/json",
};
if (API_KEY) {
  (headers as Record<string, string>)["X-Api-Key"] = API_KEY;
}

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${POKEMON_TCG_API}${endpoint}`, { headers });
  if (!res.ok) throw new Error(`Pokemon TCG API error: ${res.status}`);
  return res.json();
}

export interface PokemonCard {
  id: string;
  name: string;
  images: { small: string; large: string };
  set: { name: string; id: string };
  types?: string[];
  supertype: string;
  subtypes?: string[];
  rarity?: string;
  hp?: string;
  number: string;
  legalities: { unlimited?: string; expanded?: string; standard?: string };
}

interface CardsResponse {
  data: PokemonCard[];
  totalCount: number;
  page: number;
  pageSize: number;
}

interface SetsResponse {
  data: { id: string; name: string; series: string; total: number }[];
}

export async function searchCards(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<CardsResponse> {
  const q = `name:*${encodeURIComponent(query)}*`;
  return fetchAPI<CardsResponse>(
    `/cards?q=${q}&page=${page}&pageSize=${pageSize}&orderBy=set.releaseDate desc`
  );
}

export async function getSets(): Promise<SetsResponse> {
  return fetchAPI<SetsResponse>("/sets?orderBy=releaseDate desc");
}

export async function getCardById(id: string): Promise<{ data: PokemonCard }> {
  return fetchAPI<{ data: PokemonCard }>(`/cards/${id}`);
}

export async function getCardsBySet(
  setId: string,
  page: number = 1,
  pageSize: number = 50
): Promise<CardsResponse> {
  return fetchAPI<CardsResponse>(
    `/cards?q=set.id:${setId}&page=${page}&pageSize=${pageSize}`
  );
}
