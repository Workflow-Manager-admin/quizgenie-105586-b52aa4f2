import React, { useState } from "react";

// PUBLIC_INTERFACE
function QuizCard({
  question,
  qNum,
  total,
  onAnswer,
  answered,
  disabled,
  userAnswers,
  explanation,
  showExplanation,
  topic,
}) {
  // We show radio options with 4 answers, and optionally explanation if applicable.
  const [selected, setSelected] = useState(answered);

  const handleChange = (idx) => {
    if (disabled) return;
    setSelected(idx);
    onAnswer(idx); // parent manages move to next question or finish
  };

  return (
    <div className="card" aria-label="Quiz Question Card">
      <div className="quiz-progress">
        Question {qNum}/{total}
      </div>
      <div className="question-title" style={{ marginBottom: "1.09rem" }}>
        {question.question}
      </div>
      <div className="option-list">
        {question.options.map((opt, idx) => (
          <label
            key={idx}
            className={
              "option-radio" +
              (typeof selected === "number" && selected === idx ? " selected" : "")
            }
            style={{ cursor: disabled ? "default" : "pointer" }}
          >
            <input
              type="radio"
              name={`option-q${question.id}`}
              checked={typeof selected === "number" && selected === idx}
              disabled={!!disabled}
              onChange={() => handleChange(idx)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      <div className="answer-row">
        {typeof selected === "number" && !disabled && (
          <span style={{ color: "#64748b", fontSize: "1rem" }}>
            You selected: <b>{question.options[selected]}</b>
          </span>
        )}
      </div>
      {showExplanation && explanation && (
        <div className="explanation-box">
          <b>Explanation:</b> {explanation}
        </div>
      )}
    </div>
  );
}

export default QuizCard;
