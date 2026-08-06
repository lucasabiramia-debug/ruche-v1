import { describe, it, expect } from 'vitest'
import { geocodeCity, geocodeFromTexts, jitter, toPins, FRANCE_CENTER } from './geo'

describe('geocodeCity', () => {
  it('matches a plain city name', () => {
    expect(geocodeCity('Lyon')).toEqual({ lat: 45.764, lng: 4.8357 })
  })

  it('matches inside free text and ignores case/accents', () => {
    expect(geocodeCity('Basée à Orléans centre')).not.toBeNull()
    expect(geocodeCity('PARIS 13e arrondissement')).toEqual({ lat: 48.8566, lng: 2.3522 })
  })

  it('matches multi-word cities', () => {
    expect(geocodeCity('La Rochelle')).not.toBeNull()
  })

  it('returns null for unknown or empty locations', () => {
    expect(geocodeCity('Petit village inconnu')).toBeNull()
    expect(geocodeCity(null)).toBeNull()
    expect(geocodeCity('')).toBeNull()
  })
})

describe('geocodeFromTexts', () => {
  it('returns the first city found across several fields', () => {
    const point = geocodeFromTexts([null, 'Audience jeune', 'Étudiants à Rennes', 'Paris'])
    expect(point).toEqual(geocodeCity('Rennes'))
  })

  it('returns null when no field mentions a city', () => {
    expect(geocodeFromTexts(['Audience nationale', null, undefined])).toBeNull()
  })
})

describe('jitter', () => {
  it('is deterministic for the same seed', () => {
    const a = jitter(FRANCE_CENTER, 'user-1')
    const b = jitter(FRANCE_CENTER, 'user-1')
    expect(a).toEqual(b)
  })

  it('differs between seeds and stays close to the origin', () => {
    const a = jitter(FRANCE_CENTER, 'user-1')
    const b = jitter(FRANCE_CENTER, 'user-2')
    expect(a).not.toEqual(b)
    expect(Math.abs(a.lat - FRANCE_CENTER.lat)).toBeLessThan(0.05)
    expect(Math.abs(a.lng - FRANCE_CENTER.lng)).toBeLessThan(0.05)
  })
})

describe('toPins', () => {
  it('geocodes items and drops unknown locations', () => {
    const items = [
      { id: '1', city: 'Paris' },
      { id: '2', city: 'Nulle part' },
      { id: '3', city: 'bordeaux' },
    ]
    const pins = toPins(items, (i) => i.city, (i) => i.id)
    expect(pins).toHaveLength(2)
    expect(pins.map((p) => p.item.id)).toEqual(['1', '3'])
  })
})
