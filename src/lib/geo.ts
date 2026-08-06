// Lightweight French city geocoding for the Ruche map.
// Matches free-text locations ("Paris 13e", "lyon", "Aix-en-Provence")
// against a curated list of cities — no external geocoding API needed.

export interface GeoPoint {
  lat: number
  lng: number
}

const CITIES: Record<string, GeoPoint> = {
  paris: { lat: 48.8566, lng: 2.3522 },
  marseille: { lat: 43.2965, lng: 5.3698 },
  lyon: { lat: 45.764, lng: 4.8357 },
  toulouse: { lat: 43.6047, lng: 1.4442 },
  nice: { lat: 43.7102, lng: 7.262 },
  nantes: { lat: 47.2184, lng: -1.5536 },
  montpellier: { lat: 43.6108, lng: 3.8767 },
  strasbourg: { lat: 48.5734, lng: 7.7521 },
  bordeaux: { lat: 44.8378, lng: -0.5792 },
  lille: { lat: 50.6292, lng: 3.0573 },
  rennes: { lat: 48.1173, lng: -1.6778 },
  reims: { lat: 49.2583, lng: 4.0317 },
  toulon: { lat: 43.1242, lng: 5.928 },
  grenoble: { lat: 45.1885, lng: 5.7245 },
  dijon: { lat: 47.322, lng: 5.0415 },
  angers: { lat: 47.4784, lng: -0.5632 },
  nimes: { lat: 43.8367, lng: 4.3601 },
  clermont: { lat: 45.7772, lng: 3.087 },
  tours: { lat: 47.3941, lng: 0.6848 },
  limoges: { lat: 45.8336, lng: 1.2611 },
  amiens: { lat: 49.8942, lng: 2.2957 },
  metz: { lat: 49.1193, lng: 6.1757 },
  besancon: { lat: 47.2378, lng: 6.0241 },
  orleans: { lat: 47.9029, lng: 1.9093 },
  rouen: { lat: 49.4431, lng: 1.0993 },
  caen: { lat: 49.1829, lng: -0.3707 },
  nancy: { lat: 48.6921, lng: 6.1844 },
  avignon: { lat: 43.9493, lng: 4.8055 },
  cannes: { lat: 43.5528, lng: 7.0174 },
  aix: { lat: 43.5297, lng: 5.4474 },
  brest: { lat: 48.3904, lng: -4.4861 },
  'le havre': { lat: 49.4944, lng: 0.1079 },
  perpignan: { lat: 42.6887, lng: 2.8948 },
  biarritz: { lat: 43.4832, lng: -1.5586 },
  annecy: { lat: 45.8992, lng: 6.1294 },
  'la rochelle': { lat: 46.1603, lng: -1.1511 },
}

/** Center of France — fallback and initial map view */
export const FRANCE_CENTER: GeoPoint = { lat: 46.6034, lng: 1.8883 }

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/** Finds the first known city mentioned in a free-text location. */
export function geocodeCity(location: string | null | undefined): GeoPoint | null {
  if (!location) return null
  const normalized = normalize(location)
  for (const [city, point] of Object.entries(CITIES)) {
    if (normalized.includes(city)) return point
  }
  return null
}

/** Scans several free-text fields and returns the first city found. */
export function geocodeFromTexts(texts: Array<string | null | undefined>): GeoPoint | null {
  for (const text of texts) {
    const point = geocodeCity(text)
    if (point) return point
  }
  return null
}

/**
 * Deterministic small offset so several pins in the same city don't
 * overlap perfectly (seeded by an id string — stable across renders).
 */
export function jitter(point: GeoPoint, seed: string): GeoPoint {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  const dLat = (((hash % 1000) / 1000 - 0.5) * 2) * 0.02
  const dLng = ((((hash >> 10) % 1000) / 1000 - 0.5) * 2) * 0.02
  return { lat: point.lat + dLat, lng: point.lng + dLng }
}

export interface MappablePin<T> {
  item: T
  position: GeoPoint
}

/** Geocodes a list of items; items without a recognizable city are dropped. */
export function toPins<T>(
  items: T[],
  getLocation: (item: T) => string | null | undefined,
  getId: (item: T) => string,
): MappablePin<T>[] {
  const pins: MappablePin<T>[] = []
  for (const item of items) {
    const point = geocodeCity(getLocation(item))
    if (point) {
      pins.push({ item, position: jitter(point, getId(item)) })
    }
  }
  return pins
}
