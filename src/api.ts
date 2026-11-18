export interface Character {
  id: number
  name: string
  status: 'Alive' | 'Dead' | 'unknown'
  species: string
  type: string
  gender: string
  origin: { name: string; url: string }
  location: { name: string; url: string }
  image: string
  episode: string[]
  url: string
  created: string
}

interface CharacterResponse {
  info: { count: number; pages: number; next: string | null; prev: string | null }
  results: Character[]
}

export interface CharacterFilters {
  page: number
  name: string
  status: string
  gender: string
  species: string
}

const API = 'https://rickandmortyapi.com/api/character'
const MAX_RETRIES = 2

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('A operação foi cancelada.', 'AbortError'))
      return
    }
    const timeout = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      window.clearTimeout(timeout)
      reject(new DOMException('A operação foi cancelada.', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

async function fetchWithRetry(url: string, signal?: AbortSignal) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let response: Response
    try {
      response = await fetch(url, { signal })
    } catch (error) {
      if (signal?.aborted || (error instanceof Error && error.name === 'AbortError')) throw error
      if (attempt === MAX_RETRIES) {
        throw new Error('Falha temporária ao conectar à API. Tente novamente em instantes.')
      }
      await wait(500 * 2 ** attempt, signal)
      continue
    }

    if (response.status === 404 || response.ok) return response
    if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
      await wait(500 * 2 ** attempt, signal)
      continue
    }
    return response
  }
  throw new Error('Não foi possível carregar os personagens. Tente novamente.')
}

export async function fetchCharacters(filters: CharacterFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(filters.page) })
  if (filters.name.trim()) params.set('name', filters.name.trim())
  if (filters.status) params.set('status', filters.status)
  if (filters.gender) params.set('gender', filters.gender)
  if (filters.species) params.set('species', filters.species)

  const response = await fetchWithRetry(`${API}?${params}`, signal)
  if (response.status === 404) return { characters: [], pages: 0, count: 0 }
  if (!response.ok) throw new Error('Não foi possível carregar os personagens. Tente novamente.')
  const data: CharacterResponse = await response.json()
  return { characters: data.results, pages: data.info.pages, count: data.info.count }
}
