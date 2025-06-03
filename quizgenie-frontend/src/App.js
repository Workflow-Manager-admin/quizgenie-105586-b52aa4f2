import React, { useState } from "react";
import TopicForm from "./components/TopicForm";
import QuizCard from "./components/QuizCard";
import ResultScreen from "./components/ResultScreen";
import ErrorBanner from "./components/ErrorBanner";
import "./App.css";

// Backend Express API URL (adjust port if backend is on a different port)
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

const QUIZ_LENGTH = 5;

// PUBLIC_INTERFACE
function App() {
  /** States:
   * status: "init" | "loading" | "quiz" | "finished" | "error"
   * questions: list of {id, question, options}
   * answers: index per question
   * explanations: shown after answered
   */
  const [status, setStatus] = useState("init");
  const [topic, setTopic] = useState("");
  const [quizId, setQuizId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]); // array of selected options, by index
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState(null); // contains per-question explanations, correctness, etc.
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);

  // Start quiz after entering topic
  // PUBLIC_INTERFACE
  const handleStartQuiz = async (enteredTopic) => {
    setStatus("loading");
    setTopic(enteredTopic.trim());
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/api/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: enteredTopic.trim(), numQuestions: QUIZ_LENGTH }),
      });
      if (!resp.ok) {
        throw new Error("Could not generate quiz. Try another topic or later.");
      }
      const data = await resp.json();
      setQuestions(data.questions || []);
      setQuizId(data.quizId);
      setUserAnswers([]);
      setCurrentIdx(0);
      setStatus("quiz");
    } catch (e) {
      setError("Failed to start the quiz. Please check your connection or try again later.");
      setStatus("error");
    }
  };

  // When user submits an answer for a question
  // PUBLIC_INTERFACE
  const handleAnswer = async (answerIdx) => {
    // Update answer for current question
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentIdx] = answerIdx;
    setUserAnswers(updatedAnswers);

    // Show explanation immediately after answering, or if last question, end
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // End of quiz: submit answers to backend for scoring / explanations
      setStatus("loading");
      try {
        const resp = await fetch(`${API_BASE}/api/quiz/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizId,
            answers: updatedAnswers,
            topic,
            numQuestions: QUIZ_LENGTH,
          }),
        });
        if (!resp.ok) {
          throw new Error("Failed to submit answers.");
        }
        const data = await resp.json();
        setResults(data.results || []);
        setScore({ score: data.score, total: data.total });
        setStatus("finished");
      } catch (e) {
        setError("Failed to evaluate answers. Please try again.");
        setStatus("error");
      }
    }
  };

  // Retry or go home
  // PUBLIC_INTERFACE
  const handleRestart = () => {
    setStatus("init");
    setTopic("");
    setQuestions([]);
    setUserAnswers([]);
    setCurrentIdx(0);
    setResults(null);
    setScore(null);
    setQuizId(null);
    setError(null);
  };

  // UI logic
  return (
    <div className="App">
      <main className="centered-container">
        <h1 className="brand-title">QuizGenie</h1>
        {error && <ErrorBanner message={error} />}
        {status === "init" && (
          <TopicForm onStartQuiz={handleStartQuiz} loading={status === "loading"} />
        )}
        {status === "loading" && (
          <div className="loading">Loading quiz&hellip;</div>
        )}
        {status === "quiz" && questions.length > 0 && (
          <QuizCard
            question={questions[currentIdx]}
            qNum={currentIdx + 1}
            total={questions.length}
            onAnswer={handleAnswer}
            answered={userAnswers[currentIdx]}
            disabled={typeof userAnswers[currentIdx] !== "undefined"}
            userAnswers={userAnswers}
            showExplanation={false}
            // Explanation after user answers, so only on results page
            explanation={null}
            topic={topic}
          />
        )}
        {status === "finished" && (
          <ResultScreen
            results={results}
            score={score}
            topic={topic}
            onRestart={handleRestart}
            questions={questions}
          />
        )}
        {status === "error" && (
          <div className="retry-area">
            <button className="primary-btn" onClick={handleRestart}>
              Try Again
            </button>
          </div>
        )}
        <footer className="footer">
          <span>
            <b>QuizGenie</b> &copy; {new Date().getFullYear()} — Powered by Express.js + React
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
