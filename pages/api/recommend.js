export default async function handler(req, res) {
  const tmdbKey = process.env.TMDB_API_KEY;
  const watchmodeKey = process.env.WATCHMODE_API_KEY;
  const { title, type } = req.query;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "No title provided" });
  }

  try {
    let item = null;
    let isMovie = false;

    if (type === "movie" || type === "both") {
      const movieRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(title)}`);
      const movieData = await movieRes.json();
      if (movieData.results?.length) {
        item = movieData.results[0];
        isMovie = true;
      }
    }

    if ((!item && type === "tv") || (type === "both" && !item)) {
      const tvRes = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${tmdbKey}&query=${encodeURIComponent(title)}`);
      const tvData = await tvRes.json();
      if (tvData.results?.length) {
        item = tvData.results[0];
        isMovie = false;
      }
    }

    if (!item) {
      return res.status(404).json({ error: "Title not found" });
    }

    const recEndpoint = isMovie ? `movie/${item.id}` : `tv/${item.id}`;
    const recRes = await fetch(`https://api.themoviedb.org/3/${recEndpoint}/recommendations?api_key=${tmdbKey}`);
    const recData = await recRes.json();

    const results = await Promise.all(
      recData.results.slice(0, 8).map(async (rec) => {
        const name = rec.title || rec.name || "";
        if (!name) return null;

        const detailsRes = await fetch(`https://api.themoviedb.org/3/${isMovie ? "movie" : "tv"}/${rec.id}?api_key=${tmdbKey}`);
        const details = await detailsRes.json();

        let platforms = [];

        try {
          const wmSearch = await fetch(`https://api.watchmode.com/v1/search/?apiKey=${watchmodeKey}&search_field=name&search_value=${encodeURIComponent(name)}`);
          const wmData = await wmSearch.json();

          if (wmData.title_results?.length) {
            const wmId = wmData.title_results[0].id;
            const sourcesRes = await fetch(`https://api.watchmode.com/v1/title/${wmId}/sources/?apiKey=${watchmodeKey}`);
            const sources = await sourcesRes.json();
            platforms = [...new Set(sources.map((s) => s.name))];
          }
        } catch (watchmodeErr) {
          console.warn("Watchmode error:", watchmodeErr);
        }

        return {
          id: rec.id,
          title: name,
          overview: rec.overview,
          poster: rec.poster_path ? `https://image.tmdb.org/t/p/w500${rec.poster_path}` : "/no-image.jpg",
          genres: details.genres?.map((g) => g.name) || [],
          rating: details.vote_average?.toFixed(1) || "N/A",
          platforms: platforms.length ? platforms : ["Unknown"]
        };
      })
    );

    const filtered = results.filter(Boolean);
    return res.status(200).json(filtered);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}
