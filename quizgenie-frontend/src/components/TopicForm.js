import React, { useState } from "react";

// PUBLIC_INTERFACE
function TopicForm({ onStartQuiz, loading }) {
  const [topic, setTopic] = useState("");
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setTopic(e.target.value);
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Please enter a quiz topic to continue.");
      return;
    }
    onStartQuiz(topic);
  };

  return (
    <form className="card" onSubmit={handleSubmit} aria-label="Quiz topic form">
      <label htmlFor="topic" style={{ fontWeight: 600, marginBottom: "0.6rem" }}>
        Enter a quiz topic
      </label>
      <input
        type="text"
        id="topic"
        name="topic"
        className="topic-input"
        autoFocus
        placeholder="e.g. Photosynthesis, Calculus, World War II..."
        value={topic}
        onChange={handleChange}
        disabled={!!loading}
        autoComplete="off"
      />
      <button
        className="primary-btn"
        type="submit"
        disabled={!!loading || !topic.trim()}
        style={{ marginTop: "0.45rem", width: "100%" }}
      >
        {loading ? "Starting..." : "Start Quiz"}
      </button>
      {error && <div style={{ color: "#b91c1c", marginTop: "1.1rem", fontSize: "1.05rem" }}>{error}</div>}
    </form>
  );
}

export default TopicForm;
