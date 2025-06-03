require('dotenv').config();
const axios = require('axios');

/**
 * QuizService handles quiz question generation via LLM API,
 * with fallback to dummy data if the API call fails.
 */
class QuizService {
  constructor() {
    this.llmApiKey = process.env.LLM_API_KEY;
    this.llmApiUrl = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
    this.llmModel = process.env.LLM_MODEL || 'gpt-3.5-turbo';
  }

  // PUBLIC_INTERFACE
  /**
   * Generates quiz questions for a given topic via LLM API (OpenAI/Gemini), fallback to dummy data.
   * @param {string} topic - The topic for the quiz.
   * @param {number} numQuestions - Number of questions to generate.
   * @returns {Promise<Array>} - Array of quiz questions.
   */
  async generateQuiz(topic, numQuestions = 5) {
    try {
      const questions = await this._generateQuizViaLLM(topic, numQuestions);
      return questions;
    } catch (err) {
      console.warn('LLM API failed, falling back to dummy questions:', err.message);
      return this._generateDummyQuestions(topic, numQuestions);
    }
  }

  /**
   * Calls the LLM API (OpenAI Chat Completion) to generate quiz questions.
   * The expected output is a JSON array of objects:
   *   [{
   *     "question": "...",
   *     "options": ["...", "...", "...", "..."],
   *     "answer": 1,
   *     "explanation": "..."
   *   }, ...]
   * @private
   */
  async _generateQuizViaLLM(topic, numQuestions = 5) {
    if (!this.llmApiKey) {
      throw new Error('LLM_API_KEY not set in environment.');
    }

    // Build prompt for a consistent, parsable response
    const systemPrompt = 'You are QuizGenie, a helpful assistant for generating multiple-choice quizzes for learners.';
    const userPrompt = `Generate a quiz with ${numQuestions} multiple-choice questions (each with exactly four options, one correct). Topic: '${topic}'. Return ONLY a JSON array of objects, each with: question (string), options (array of 4 strings), answer (index 0-3), explanation (string). Example:
[
  {
    "question": "What is the capital of France?",
    "options": ["Berlin", "London", "Paris", "Rome"],
    "answer": 2,
    "explanation": "Paris is the capital of France."
  }
]
`;

    // OpenAI Chat API format
    const data = {
      model: this.llmModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.llmApiKey}`
    };

    const response = await axios.post(this.llmApiUrl, data, { headers });

    // Parse JSON from the returned LLM message
    const content = response.data.choices?.[0]?.message?.content;
    if (!content) throw new Error('LLM response malformed.');

    // Find first [ ... ] JSON array in content
    const arrMatch = content.match(/\[([\s\S]*?)\]/);
    if (!arrMatch) throw new Error('Could not parse questions array from LLM output.');

    const questionsJson = `[${arrMatch[1]}]`;
    let questions;
    try {
      questions = JSON.parse(questionsJson);
    } catch (e) {
      throw new Error('Failed to parse JSON from LLM response.');
    }
    // Basic validation
    if (!Array.isArray(questions) || questions.length === 0 || !questions[0].question) {
      throw new Error('LLM output does not contain valid questions.');
    }
    return questions.slice(0, numQuestions);
  }

  /**
   * Provides dummy quiz questions if LLM API fails.
   * @private
   */
  _generateDummyQuestions(topic, numQuestions = 5) {
    // Could randomize or expand, but for now, static sample
    const dummies = [
      {
        question: `What is ${topic} mainly known for?`,
        options: ['Option A', 'Option B', `${topic}`, 'Option D'],
        answer: 2,
        explanation: `The correct answer is '${topic}' because it relates to the topic you specified.`,
      },
      {
        question: `Which of these is most correctly associated with ${topic}?`,
        options: ['Example A', 'Example B', 'Example C', `${topic}`],
        answer: 3,
        explanation: 'Option 4 directly states the topic.',
      },
      {
        question: `Select the correct statement about ${topic}.`,
        options: [
          `'${topic}' is an animal.`,
          `'${topic}' is a quiz topic.`,
          `'${topic}' is a programming language.`,
          `'${topic}' is a type of food.`
        ],
        answer: 1,
        explanation: `You chose '${topic}' as your topic, so Option 2 is true.`,
      },
      {
        question: `A quiz generated about '${topic}' would likely include:`,
        options: [
          'Unrelated trivia',
          `Facts about ${topic}`,
          'Cooking methods',
          'Travel destinations'
        ],
        answer: 1,
        explanation: 'Option 2 references the quiz topic.',
      },
      {
        question: 'How many answer choices does each quiz question have in QuizGenie?',
        options: ['2', '3', '4', '5'],
        answer: 2,
        explanation: 'Each question in QuizGenie offers 4 choices.',
      }
    ];
    // Repeat/rotate dummy questions if more needed
    const repeated = [];
    for (let i = 0; i < numQuestions; ++i) {
      repeated.push(dummies[i % dummies.length]);
    }
    return repeated;
  }
}

module.exports = new QuizService();
