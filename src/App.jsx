import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bookmark, Check, ChevronDown, Clapperboard, Clock3, Menu, Play, Search, Star, X } from 'lucide-react';
import { fetchMovies, recordSearch } from './api';
import { demoMovies, genres } from './data';

function MoviePoster({ movie, onSelect }) {
  return (
    <button className="poster-card" onClick={() => onSelect(movie)} type="button">
      <div className={`poster-image poster-${movie.accent || 'violet'}`} style={{ backgroundImage: `url(${movie.image})` }}>
        <span className="poster-rating"><Star size={12} fill="currentColor" /> {movie.rating}</span>
        <span className="poster-play"><Play size={17} fill="currentColor" /></span>
      </div>
      <div className="poster-meta">
        <h3>{movie.title}</h3>
        <p>{movie.year} <span>•</span> {movie.genre}</p>
      </div>
    </button>
  );
}

function App() {
  const [movies, setMovies] = useState(demoMovies);
  const [query, setQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [saved, setSaved] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setApiError('');
      try {
        const results = await fetchMovies(query);
        if (active) {
          setMovies(results);
          if (query.trim()) recordSearch(query.trim(), results.length);
        }
      } catch {
        if (active) setApiError('Could not reach TMDB. Showing your saved local picks instead.');
      } finally {
        if (active) setIsLoading(false);
      }
    }, 320);
    return () => { active = false; clearTimeout(timer); };
  }, [query]);

  const filteredMovies = useMemo(() => activeGenre === 'All' ? movies : movies.filter((movie) => movie.genre === activeGenre), [activeGenre, movies]);
  const trendingMovies = movies.slice(0, 4);
  const featured = movies[0] || demoMovies[0];

  function toggleSaved(movie) {
    setSaved((current) => current.some((item) => item.id === movie.id) ? current.filter((item) => item.id !== movie.id) : [...current, movie]);
  }

  return (
    <main className="app-shell">
      <header className="nav-bar">
        <a className="brand" href="#top" aria-label="Cinewave home"><span className="brand-mark"><Clapperboard size={18} /></span><span>CINEWAVE</span></a>
        <nav className={mobileMenu ? 'nav-links is-open' : 'nav-links'}>
          <a className="active" href="#discover">Discover</a><a href="#trending">Trending</a><a href="#saved">My list <span className="list-count">{saved.length || ''}</span></a>
        </nav>
        <div className="nav-actions"><button className="icon-button mobile-trigger" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu"><Menu size={20} /></button><button className="avatar" aria-label="Profile">JW</button></div>
      </header>

      <section className="hero" id="top" style={{ backgroundImage: `linear-gradient(90deg, rgba(8, 9, 14, .98) 10%, rgba(8, 9, 14, .76) 45%, rgba(8, 9, 14, .18) 100%), linear-gradient(0deg, #08090e 0%, transparent 28%), url(${featured.backdrop || featured.image})` }}>
        <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line" /> CINEWAVE ORIGINAL</p><h1>Stories that<br /><em>stay with you.</em></h1><p className="hero-description">A handpicked universe of films, built around what you love to watch next.</p><div className="hero-actions"><button className="primary-button" onClick={() => setSelectedMovie(featured)}><Play size={16} fill="currentColor" /> Watch trailer</button><button className="ghost-button" onClick={() => toggleSaved(featured)}><Bookmark size={17} fill={saved.some((item) => item.id === featured.id) ? 'currentColor' : 'none'} /> {saved.some((item) => item.id === featured.id) ? 'In my list' : 'Add to list'}</button></div><div className="hero-facts"><span><Star size={14} fill="currentColor" /> {featured.rating}</span><span>{featured.year}</span><span>{featured.genre}</span><span>{featured.runtime}</span></div></div>
        <div className="hero-scroll">Scroll to explore <ArrowRight size={15} /></div>
      </section>

      <section className="content-section" id="discover">
        <div className="section-heading"><div><p className="eyebrow"><span className="eyebrow-line" /> THE COLLECTION</p><h2>Find your next <em>favorite.</em></h2></div><div className="search-wrap"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search movies..." aria-label="Search movies" />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={15} /></button>}</div></div>
        <div className="filter-row">{genres.map((genre) => <button key={genre} onClick={() => setActiveGenre(genre)} className={activeGenre === genre ? 'filter active' : 'filter'}>{genre}</button>)}<button className="sort-button">Sort by <strong>Popularity</strong><ChevronDown size={15} /></button></div>
        {apiError && <p className="api-note">{apiError}</p>}
        <div className="movie-grid">{isLoading ? Array.from({ length: 4 }).map((_, index) => <div className="poster-skeleton" key={index} />) : filteredMovies.map((movie) => <MoviePoster key={movie.id} movie={movie} onSelect={setSelectedMovie} />)}</div>
        {!isLoading && !filteredMovies.length && <div className="empty-state">No films found. Try another search.</div>}
      </section>

      <section className="trending-section" id="trending"><div className="trending-heading"><div><p className="eyebrow"><span className="eyebrow-line" /> LIVE SIGNAL</p><h2>Trending <em>right now.</em></h2></div><p className="trend-explainer">Our algorithm blends searches, saves, and fresh ratings<br />to surface the films people are talking about.</p></div><div className="trending-list">{trendingMovies.map((movie, index) => <button className="trend-item" key={movie.id} onClick={() => setSelectedMovie(movie)}><span className="trend-number">0{index + 1}</span><img src={movie.image} alt="" /><span className="trend-title"><strong>{movie.title}</strong><small>{movie.genre} · {movie.year}</small></span><span className="trend-rating"><Star size={13} fill="currentColor" /> {movie.rating}</span><ArrowRight className="trend-arrow" size={18} /></button>)}</div></section>

      <footer><span className="brand"><span className="brand-mark"><Clapperboard size={15} /></span><span>CINEWAVE</span></span><span>Curated for the curious.</span><span>© 2024 Cinewave</span></footer>

      {selectedMovie && <div className="modal-backdrop" onClick={() => setSelectedMovie(null)}><aside className="movie-drawer" onClick={(event) => event.stopPropagation()}><button className="close-button" onClick={() => setSelectedMovie(null)} aria-label="Close details"><X size={20} /></button><div className="drawer-image" style={{ backgroundImage: `url(${selectedMovie.backdrop || selectedMovie.image})` }} /><div className="drawer-content"><p className="eyebrow"><span className="eyebrow-line" /> MOVIE DETAILS</p><h2>{selectedMovie.title}</h2><div className="hero-facts"><span><Star size={14} fill="currentColor" /> {selectedMovie.rating}</span><span>{selectedMovie.year}</span><span>{selectedMovie.genre}</span><span><Clock3 size={14} /> {selectedMovie.runtime || '2h 00m'}</span></div><p className="drawer-synopsis">{selectedMovie.synopsis}</p><div className="drawer-actions"><button className="primary-button"><Play size={16} fill="currentColor" /> Play trailer</button><button className="ghost-button" onClick={() => toggleSaved(selectedMovie)}><Bookmark size={17} fill={saved.some((item) => item.id === selectedMovie.id) ? 'currentColor' : 'none'} /> {saved.some((item) => item.id === selectedMovie.id) ? 'Saved' : 'Save'}</button></div>{saved.some((item) => item.id === selectedMovie.id) && <p className="saved-confirm"><Check size={14} /> Added to your list</p>}</div></aside></div>}
    </main>
  );
}

export default App;
