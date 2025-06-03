const express = require('express');
const healthController = require('../controllers/health');
const quizController = require('../controllers/quizController');

const router = express.Router();

// Health endpoint
router.get('/', healthController.check.bind(healthController));

/**
 * @swagger
 * /api/quiz:
 *   post:
 *     summary: Generate a quiz for a given topic
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
 *                 type: string
 *                 example: "Photosynthesis"
 *               numQuestions:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Quiz questions generated for the provided topic.
 */
router.post('/api/quiz', quizController.createQuiz.bind(quizController));

/**
 * @swagger
 * /api/quiz/answer:
 *   post:
 *     summary: Submit quiz answers and get results
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quizId:
 *                 type: integer
 *                 example: 1234567890
 *               topic:
 *                 type: string
 *                 example: "Photosynthesis"
 *               answers:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [0,2,1,3,2]
 *               numQuestions:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Quiz results and explanations
 */
router.post('/api/quiz/answer', quizController.submitAnswers.bind(quizController));

module.exports = router;
