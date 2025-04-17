
import { useState, useEffect } from "react";

const genreMap = {
  Drama: 18,
  Comedy: 35,
  SciFi: 10765,
  Mystery: 9648,
  Documentary: 99,
  Action: 28,
  Comedy: 35,
  Drama: 18,
  Thriller: 53,
  Horror: 27,
  Romance: 10749
};

export default function SeriesPage() {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!selectedGenre) return;
    fetch(`/api/discover?type=tv&genreId=${genreMap[selectedGenre]}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setResults(data);
        else setResults([]);
      });
  }, [selectedGenre]);

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 30, backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <nav style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        <a href="/">Home</a>
        <a href="/tvs">Movies</a>
        <a href="/series">Series</a>
      </nav>

      <h1 style={{ fontSize: "2rem", marginBottom: 20 }}>Browse Series by Genre</h1>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 30 }}>
        {Object.keys(genreMap).map((genre) => (
          <button key={genre} onClick={() => setSelectedGenre(genre)} style={{
            padding: "10px 18px", borderRadius: 6, border: "none", backgroundColor: "#0070f3", color: "white", cursor: "pointer"
          }}>
            {genre}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
        {results.map(item => (
          <div key={item.id} style={{ backgroundColor: "white", padding: 16, borderRadius: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            <img src={item.poster} alt={item.name} style={{ width: "100%", borderRadius: 6, marginBottom: 8 }} />
            <h3>{item.name}</h3>
            <p><strong>Rating:</strong> {item.rating}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
