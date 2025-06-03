# QuizGenie

Backend API for QuizGenie: A quiz app that uses LLM API for dynamic quiz generation.

## Getting Started

1. Install dependencies

```bash
cd quizgenie
npm install
```

2. Set environment variables

Create a `.env` file in `quizgenie/` directory:

```
LLM_API_KEY=your-openai-or-gemini-api-key
LLM_API_URL=https://api.openai.com/v1/chat/completions  # Or Gemini/other provider
LLM_MODEL=gpt-3.5-turbo                                  # Optional, defaults to OpenAI
```

3. Run the app

```bash
npm run dev
```
or
```bash
npm start
```

## API Endpoints

### Health

- `GET /`  
    Returns API health status.

### Quiz Operations

- `POST /api/quiz`
    - Request Body: `{ "topic": "Photosynthesis", "numQuestions": 5 }`
    - Response: `{ quizId, questions: [ { id, question, options } ] }`

- `POST /api/quiz/answer`
    - Request Body: `{ quizId, topic, answers: [0,2,1,3,2], numQuestions }`
    - Response: `{ quizId, topic, results: [{...}], score, total }`

## Features

- Topic-based question generation using LLM API, with fallback to dummy questions if API fails
- Multiple-choice questions (4 options), explanations, and scoring
- Secure API key handling using dotenv `.env`
- No quiz/answer state is persisted [stateless demo]
- Swagger docs at `/docs`
