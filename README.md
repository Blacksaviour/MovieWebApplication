# Cinewave

A cinematic movie discovery app inspired by the referenced Movie Web Application course project.

## Run locally

```bash
npm install
npm run dev
```

The app ships with a demo catalog so it works immediately. Copy `.env.example` to `.env` and add a TMDB API key to enable live trending and search results. Appwrite analytics is enabled when all `VITE_APPWRITE_*` values are set; create a collection with `searchTerm`, `resultCount`, and `searchedAt` attributes to store search events.
