import React from "react";

// PUBLIC_INTERFACE
function ResultScreen({ results, score, topic, onRestart, questions }) {
  return (
    <div className="card" aria-label="Quiz Results">
      <div className="result-summary">
        Quiz Finished: {score ? `${score.score} / ${score.total}` : ""}
      </div>
      <div style={{ marginBottom: "0.88rem" }}>
        <span style={{ color: "#475569" }}>
          Topic: <b>{topic}</b>
        </span>
      </div>
      <div className="result-box">
        {results &&
          results.map((r, idx) => (
            <div className="result-row" key={idx}>
              <span className="result-icon" aria-label={r.isCorrect ? "Correct" : "Incorrect"}>
                {r.isCorrect ? "✅" : "❌"}
              </span>
              <span>
                <b>Q{idx + 1}:</b> {r.question}
                <br />
                <span style={{ fontWeight: 400, display: "block", marginTop: "0.19rem" }}>
                  <span style={{ color: "#667085" }}>Your answer:</span>{" "}
                  <b>{typeof r.userAnswer === "number" ? r.options[r.userAnswer] : "No answer"}</b>
                  {" — "}
                  <span style={{ color: "#2563eb" }}>
                    Correct: <b>{r.options[r.correctAnswer]}</b>
                  </span>
                </span>
                <span className="explanation-box">
                  <b>Explanation:</b> {r.explanation}
                </span>
              </span>
            </div>
          ))}
      </div>
      <button className="primary-btn" onClick={onRestart} style={{ marginTop: "1.17rem" }}>
        Restart
      </button>
    </div>
  );
}

export default ResultScreen;
