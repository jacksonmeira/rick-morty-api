import { useCallback, useEffect, useRef, useState } from 'react'
import { Activity, ArrowRight, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clapperboard, Dna, Globe2, LoaderCircle, MapPin, Radio, RotateCcw, Search, SlidersHorizontal, Users, X } from 'lucide-react'
import { fetchCharacters, type Character, type CharacterFilters } from './api'
import logo from './assets/logo.svg'

const initialFilters: CharacterFilters = { page: 1, name: '', status: '', gender: '', species: '' }
const statusTone: Record<string, string> = { Alive: 'alive', Dead: 'dead', unknown: 'unknown' }
const statusLabel: Record<string, string> = { Alive: 'Vivo', Dead: 'Morto', unknown: 'Desconhecido' }

function App() {
  const [filters, setFilters] = useState(initialFilters)
  const [characters, setCharacters] = useState<Character[]>([])
  const [pages, setPages] = useState(0)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Character | null>(null)
  const [mobileFilters, setMobileFilters] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    fetchCharacters(filters, controller.signal)
      .then((result) => { setCharacters(result.characters); setPages(result.pages); setCount(result.count) })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== 'AbortError') setError(err.message || 'Algo deu errado.')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [filters])

  useEffect(() => {
    const timer = window.setTimeout(() => setFilters((prev) => ({ ...prev, page: 1, name: query })), 350)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (!selected) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelected(null) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [selected])

  const updateFilter = useCallback((key: 'status' | 'gender' | 'species', value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }, [])
  const clearFilters = () => { setQuery(''); setFilters(initialFilters) }
  const activeFilters = Number(Boolean(filters.status)) + Number(Boolean(filters.gender)) + Number(Boolean(filters.species))

  return (
    <div className="app-shell min-h-screen text-slate-100">
      <header id="top" className="topbar">
        <a href="#top" className="brand" aria-label="Início"><img src={logo} alt="" /></a>
      </header>

      <main>
        <section id="characters" className="catalog-section">
          <div className="toolbar">
            <label className="search-box"><Search size={17} /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar personagem..." aria-label="Buscar personagem" />{query && <button className="clear-search" aria-label="Limpar busca" onClick={() => setQuery('')}><X size={14} /></button>}<kbd>/</kbd></label>
            <button className="mobile-filter-toggle" onClick={() => setMobileFilters(!mobileFilters)}><SlidersHorizontal size={15} /> Filtros {activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}</button>
            <div className={`filter-controls ${mobileFilters ? 'filters-open' : ''}`}>
              <span className="filter-label"><SlidersHorizontal size={14} /> FILTRAR POR</span>
              <FilterSelect label="Status" value={filters.status} options={[["", "Todos os status"], ["alive", "Vivo"], ["dead", "Morto"], ["unknown", "Desconhecido"]]} onChange={(value) => updateFilter('status', value)} />
              <FilterSelect label="Espécie" value={filters.species} options={[["", "Todas as espécies"], ["Human", "Humano"], ["Alien", "Alienígena"], ["Humanoid", "Humanoide"], ["Robot", "Robô"], ["Animal", "Animal"]]} onChange={(value) => updateFilter('species', value)} />
              <FilterSelect label="Gênero" value={filters.gender} options={[["", "Todos os gêneros"], ["Female", "Feminino"], ["Male", "Masculino"], ["Genderless", "Sem gênero"], ["unknown", "Desconhecido"]]} onChange={(value) => updateFilter('gender', value)} />
              {activeFilters > 0 && <button className="reset-filters" onClick={clearFilters} title="Limpar filtros"><RotateCcw size={14} /></button>}
            </div>
          </div>

          <div className="result-meta"><span>{loading ? 'Buscando no multiverso...' : <>Exibindo <strong>{characters.length ? (filters.page - 1) * 20 + 1 : 0}–{(filters.page - 1) * 20 + characters.length}</strong> de <strong>{count.toLocaleString('pt-BR')}</strong> personagens</>}</span><span className="sort-note"><Radio size={12} /> DADOS EM TEMPO REAL</span></div>

          {error ? <div className="state-panel error-panel"><CircleHelp size={24} /><h3>Falha na conexão</h3><p>{error}</p><button className="retry-button" onClick={() => setFilters((prev) => ({ ...prev }))}><RotateCcw size={14} /> Tentar novamente</button></div>
            : loading ? <div className="character-grid">{Array.from({ length: 8 }, (_, i) => <div className="skeleton-card" key={i}><div className="skeleton-image" /><div className="skeleton-body"><div className="skeleton-line wide" /><div className="skeleton-line" /><div className="skeleton-line short" /></div></div>)}</div>
            : characters.length === 0 ? <div className="state-panel"><Search size={24} /><h3>Nenhum personagem encontrado</h3><p>Tente mudar os filtros ou buscar por outro nome.</p><button className="retry-button" onClick={clearFilters}><RotateCcw size={14} /> Limpar filtros</button></div>
            : <div className="character-grid">{characters.map((character) => <CharacterCard key={character.id} character={character} onClick={() => setSelected(character)} />)}</div>}

          {pages > 1 && !loading && <nav className="pagination" aria-label="Paginação"><button className="page-arrow" disabled={filters.page <= 1} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))} aria-label="Página anterior"><ChevronLeft size={17} /></button>{getPageItems(filters.page, pages).map((item) => <button key={item} className={`page-number${filters.page === item ? ' active' : ''}`} aria-current={filters.page === item ? 'page' : undefined} onClick={() => setFilters((prev) => ({ ...prev, page: item }))}>{item}</button>)}<button className="page-arrow" disabled={filters.page >= pages} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))} aria-label="Próxima página"><ChevronRight size={17} /></button></nav>}
        </section>

      </main>

      {selected && <CharacterModal character={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function getPageItems(current: number, total: number): number[] {
  const windowSize = Math.min(5, total)
  const start = Math.max(1, Math.min(current - Math.floor(windowSize / 2), total - windowSize + 1))
  return Array.from({ length: windowSize }, (_, index) => start + index)
}
function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[][]; onChange: (value: string) => void }) {
  return <label className="select-wrap"><span className="sr-only">Filtrar por {label.toLowerCase()}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([optionValue, text]) => <option key={optionValue} value={optionValue}>{text}</option>)}</select><ChevronDown size={13} /></label>
}

function CharacterCard({ character, onClick }: { character: Character; onClick: () => void }) {
  return <button className="character-card" onClick={onClick} aria-label={`Ver detalhes de ${character.name}`}>
    <div className="card-image-wrap"><img src={character.image} alt={character.name} loading="lazy" /><span className={`status-badge ${statusTone[character.status]}`}><span />{statusLabel[character.status] ?? character.status}</span><span className="card-id">#{String(character.id).padStart(3, '0')}</span><span className="card-open"><ArrowRight size={15} /></span></div>
    <div className="card-content"><div className="card-species">{character.species}{character.type && <span> · {character.type}</span>}</div><h3>{character.name}</h3><div className="card-location"><MapPin size={13} /><span>{character.location.name}</span></div><div className="card-divider" /><div className="card-footer"><span>{character.gender === 'Male' ? 'Masculino' : character.gender === 'Female' ? 'Feminino' : character.gender === 'Genderless' ? 'Sem gênero' : character.gender}</span><span className="detail-link">VER PERFIL <ArrowRight size={11} /></span></div></div>
  </button>
}

function CharacterModal({ character, onClose }: { character: Character; onClose: () => void }) {
  const [episodes, setEpisodes] = useState<string[]>([])
  const [episodesLoading, setEpisodesLoading] = useState(true)
  useEffect(() => {
    const controller = new AbortController()
    Promise.all(character.episode.slice(0, 5).map(async (url) => {
      const response = await fetch(url, { signal: controller.signal })
      if (!response.ok) throw new Error('Falha ao buscar episódios')
      const episode: { episode: string; name: string } = await response.json()
      return `${episode.episode} · ${episode.name}`
    })).then(setEpisodes).catch(() => { if (!controller.signal.aborted) setEpisodes([]) }).finally(() => { if (!controller.signal.aborted) setEpisodesLoading(false) })
    return () => controller.abort()
  }, [character])
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="character-modal" role="dialog" aria-modal="true" aria-labelledby="modal-name">
      <button className="modal-close" onClick={onClose} aria-label="Fechar detalhes"><X size={18} /></button>
      <div className="modal-portrait"><img src={character.image} alt={character.name} /><div className="portrait-overlay" /><span className="modal-record">REGISTRO Nº {String(character.id).padStart(4, '0')}</span><span className={`status-badge ${statusTone[character.status]}`}><span />{statusLabel[character.status] ?? character.status}</span></div>
      <div className="modal-details"><div className="eyebrow section-kicker"><span className="pulse-dot" /> PERFIL DO PERSONAGEM</div><h2 id="modal-name">{character.name}</h2><p className="modal-subtitle">{character.species}{character.type ? ` · ${character.type}` : ''}</p>
        <div className="detail-grid"><DetailItem icon={<Dna size={15} />} label="Espécie" value={character.species} /><DetailItem icon={<Users size={15} />} label="Gênero" value={character.gender === 'Male' ? 'Masculino' : character.gender === 'Female' ? 'Feminino' : character.gender === 'Genderless' ? 'Sem gênero' : character.gender} /><DetailItem icon={<Globe2 size={15} />} label="Origem" value={character.origin.name} /><DetailItem icon={<MapPin size={15} />} label="Última localização" value={character.location.name} /></div>
        <div className="episode-section"><div className="episode-heading"><Clapperboard size={14} /><span>APARIÇÕES</span><span className="episode-count">{character.episode.length} episódios</span></div>{episodesLoading ? <div className="episode-loading"><LoaderCircle className="spin" size={14} /> Carregando episódios...</div> : <div className="episode-list">{episodes.length ? episodes.map((episode) => <span key={episode}>{episode}</span>) : <span className="no-episodes">Não foi possível carregar os episódios.</span>}{character.episode.length > 5 && <span className="more-episodes">+ {character.episode.length - 5} episódios</span>}</div>}</div>
        <div className="modal-footnote"><Activity size={13} /><span>ÚLTIMA TRANSMISSÃO DO ARQUIVO · {new Date(character.created).toLocaleDateString('pt-BR')}</span></div>
      </div>
    </section>
  </div>
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="detail-item"><span className="detail-icon">{icon}</span><div><span className="detail-label">{label}</span><strong>{value}</strong></div></div>
}

export default App
