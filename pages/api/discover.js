export default async function handler(req, res) {
  const { type, genreId } = req.query;
  const tmdbKey = process.env.TMDB_API_KEY;

  if (!type || !genreId) {
    return res.status(400).json({ error: "Missing type or genreId" });
  }

  try {
    const url = `https://api.themoviedb.org/3/discover/${type}?api_key=${tmdbKey}&with_genres=${genreId}&language=en-US`;
    const response = await fetch(url);
    const data = await response.json();

    const results = data.results.slice(0, 12).map(item => ({
      id: item.id,
      title: item.title || item.name,
      rating: item.vote_average?.toFixed(1) || "N/A",
      poster: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : "/no-image.jpg"
    }));

    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch genre-based results" });
  }
}
