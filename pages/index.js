
import { useState, useEffect } from "react";

export default function Home() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("both");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (title.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const fetchSuggestions = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(title)}&api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
        { signal: controller.signal }
      );
      const data = await res.json();
      setSuggestions(data.results?.slice(0, 5) || []);
    };

    fetchSuggestions();
    return () => controller.abort();
  }, [title]);

  const search = async (customTitle) => {
    const query = customTitle || title;
    if (!query) return;

    setLoading(true);
    setResults([]);
    const res = await fetch(`/api/recommend?title=${encodeURIComponent(query)}&type=${type}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setResults(data);
    } else {
      console.error("API Error:", data.error);
    }
    setLoading(false);
  };

  return (
    <div style={{
      fontFamily: "Segoe UI, sans-serif",
      padding: 40,
      backgroundColor: darkMode ? "#111" : "#f4f4f4",
      color: darkMode ? "#fff" : "#000",
      minHeight: "100vh"
    }}>
      <nav style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        <a href="/" style={{ color: darkMode ? "#fff" : "#000" }}>Home</a>
        <a href="/movies" style={{ color: darkMode ? "#fff" : "#000" }}>Movies</a>
        <a href="/series" style={{ color: darkMode ? "#fff" : "#000" }}>Series</a>
        <button onClick={() => setDarkMode(!darkMode)} style={{
          marginLeft: "auto", padding: "6px 12px", borderRadius: 6,
          border: "1px solid #ccc", background: darkMode ? "#333" : "#eee", cursor: "pointer"
        }}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </nav>

      <h1 style={{ fontSize: "2.5rem", textAlign: "center", marginBottom: 20 }}>
        🎬 Movie & Series Recommender
      </h1>

      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 10 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title you like..."
          style={{
            padding: 12,
            width: 300,
            borderRadius: 6,
            border: "1px solid #ccc",
            backgroundColor: darkMode ? "#222" : "#fff",
            color: darkMode ? "#fff" : "#000"
          }}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: 12, borderRadius: 6, border: "1px solid #ccc" }}
        >
          <option value="both">Both</option>
          <option value="movie">Movie</option>
          <option value="tv">Series</option>
        </select>
        <button
          onClick={() => search()}
          style={{
            padding: "12px 20px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Search
        </button>
      </div>

      {suggestions.length > 0 && (
        <ul style={{
          maxWidth: 500,
          margin: "0 auto",
          listStyle: "none",
          padding: 0,
          marginTop: 10,
          backgroundColor: darkMode ? "#222" : "#fff",
          borderRadius: 6,
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
        }}>
          {suggestions.map((s) => (
            <li key={s.id} style={{ padding: 10, borderBottom: "1px solid #ccc", cursor: "pointer" }}
              onClick={() => {
                setTitle(s.title || s.name);
                setSuggestions([]);
                search(s.title || s.name);
              }}>
              {s.title || s.name}
            </li>
          ))}
        </ul>
      )}

      {loading && <p style={{ textAlign: "center" }}>🔄 Loading recommendations...</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginTop: 30 }}>
        {results.map((item) => (
          <div
            key={item.id}
            style={{
              backgroundColor: darkMode ? "#222" : "white",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              overflow: "hidden",
              padding: 16
            }}
          >
            <img
              src={item.poster}
              alt={item.title}
              style={{ height: 200, borderRadius: 8, objectFit: "cover", marginBottom: 12 }}
            />
            <h3>{item.title}</h3>
            <p>{item.genres?.join(", ") || "No genres"}</p>
            <p><strong>Rating:</strong> {item.rating}</p>
            <p><strong>Available on:</strong> {item.platforms?.join(", ") || "Unknown"}</p>
            <p>{item.overview}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
