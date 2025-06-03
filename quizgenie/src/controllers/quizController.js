const quizService = require('../services/quizService');

/**
 * QuizController: express-style controller for quiz operations.
 * Handles quiz generation and answer checking.
 */
class QuizController {
  // PUBLIC_INTERFACE
  /**
   * POST /api/quiz
   * Request body: { topic: string, numQuestions?: number }
   * Generates a set of quiz questions for the requested topic.
   */
  async createQuiz(req, res) {
    const { topic, numQuestions } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Topic is required and must be a non-empty string.' });
    }

    const nQuestions = typeof numQuestions === 'number' && numQuestions > 0 ? numQuestions : 5;
    try {
      const questions = await quizService.generateQuiz(topic.trim(), nQuestions);
      // DO NOT send correct answers or explanations directly, only send index/ID for client to use when answering.
      const publicQuestions = questions.map((q, idx) => ({
        id: idx,
        question: q.question,
        options: q.options
      }));
      // For client-side answer checking, send a quizId (could also store in database/session for production)
      res.status(200).json({
        quizId: Date.now() + Math.floor(Math.random() * 10000), // Simple unique ID
        questions: publicQuestions
      });
    } catch (err) {
      console.error('Quiz generation failed:', err.message);
      res.status(500).json({ error: 'Failed to generate quiz questions.' });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * POST /api/quiz/answer
   * Request body: { quizId, answers: [int,...], topic, numQuestions }
   * Returns evaluation: per-question correct/wrong, explanations, score.
   */
  async submitAnswers(req, res) {
    const { quizId, answers, topic, numQuestions } = req.body;
    // For this stateless implementation, generate the questions again (production app should use persisted quizzes)
    if (!topic || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Invalid request: topic and answer array are required.' });
    }
    try {
      const nQ = typeof numQuestions === 'number' && numQuestions > 0 ? numQuestions : answers.length;
      const questions = await quizService.generateQuiz(topic, nQ); // Always returns order-deterministic (dummy or API)
      // Compare answers
      let score = 0;
      const results = questions.map((q, idx) => {
        const isCorrect = answers[idx] === q.answer;
        if (isCorrect) score += 1;
        return {
          id: idx,
          question: q.question,
          options: q.options,
          userAnswer: answers[idx],
          correctAnswer: q.answer,
          isCorrect,
          explanation: q.explanation
        };
      });
      res.status(200).json({
        quizId,
        topic,
        results,
        score,
        total: questions.length
      });
    } catch (err) {
      console.error('Quiz answer evaluation failed:', err.message);
      res.status(500).json({ error: 'Failed to evaluate quiz answers.' });
    }
  }
}

module.exports = new QuizController();
