import { Client, Databases, ID } from 'appwrite';
import { demoMovies } from './data';

const apiKey = import.meta.env.VITE_TMDB_API_KEY;
const appwriteReady = import.meta.env.VITE_APPWRITE_PROJECT_ID && import.meta.env.VITE_APPWRITE_DATABASE_ID && import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const appwrite = appwriteReady ? new Databases(new Client().setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)) : null;

function mapTmdbMovie(movie) {
  return { ...movie, image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : demoMovies[0].image, backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : undefined, year: movie.release_date?.slice(0, 4) || '—', rating: movie.vote_average?.toFixed(1) || '—', genre: 'Featured', synopsis: movie.overview || 'No synopsis available.' };
}

export async function fetchMovies(query = '') {
  if (!apiKey) return demoMovies.filter((movie) => movie.title.toLowerCase().includes(query.toLowerCase()));
  const endpoint = query ? `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false` : `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error('TMDB request failed');
  const payload = await response.json();
  return payload.results.map(mapTmdbMovie);
}

export async function recordSearch(term, resultCount) {
  if (!appwrite) return;
  try {
    await appwrite.createDocument(import.meta.env.VITE_APPWRITE_DATABASE_ID, import.meta.env.VITE_APPWRITE_COLLECTION_ID, ID.unique(), { searchTerm: term, resultCount, searchedAt: new Date().toISOString() });
  } catch (error) {
    console.info('Appwrite analytics unavailable:', error.message);
  }
}
