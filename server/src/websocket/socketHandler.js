import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { InterviewSession } from '../models/index.js';
import { geminiService } from '../services/ai/index.js';
import { speechService } from '../services/speech/index.js';
import { analyticsService } from '../services/analytics/index.js';

/**
 * Initialize WebSocket handlers
 */
export function initializeSocket(io) {
    // Authentication middleware for Socket.io
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = jwt.verify(token, config.jwt.secret);
            socket.userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id} (User: ${socket.userId})`);

        // Join user-specific room
        socket.join(`user:${socket.userId}`);

        /**
         * Join an interview session room
         */
        socket.on('join-interview', async ({ sessionId }) => {
            try {
                // First try to find any session with this ID for this user
                const session = await InterviewSession.findOne({
                    sessionId,
                    user: socket.userId
                });

                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                // Handle different session states
                if (session.status === 'completed') {
                    socket.emit('interview-already-complete', {
                        sessionId: session.sessionId,
                        status: 'completed',
                        overallScores: session.overallScores,
                        completedAt: session.completedAt,
                        analytics: session.analytics
                    });
                    return;
                }

                if (session.status === 'abandoned') {
                    socket.emit('error', { message: 'Session was abandoned' });
                    return;
                }

                // For in-progress or paused sessions, allow joining
                socket.join(`interview:${sessionId}`);
                socket.currentSessionId = sessionId;

                socket.emit('interview-joined', {
                    sessionId: session.sessionId,
                    status: session.status,
                    interviewType: session.interviewType,
                    difficulty: session.difficulty?.current || session.difficulty,
                    voiceEnabled: session.voiceEnabled,
                    currentQuestion: session.responses[session.currentQuestionIndex]?.question,
                    progress: {
                        current: session.currentQuestionIndex + 1,
                        total: session.totalQuestions
                    }
                });

                logger.info(`User ${socket.userId} joined interview ${sessionId}`);
            } catch (error) {
                logger.error('Error joining interview:', error);
                socket.emit('error', { message: 'Failed to join interview' });
            }
        });

        /**
         * Handle real-time audio streaming for voice analysis
         */
        socket.on('audio-stream', async ({ sessionId, audioChunk }) => {
            try {
                if (!socket.audioBuffer) {
                    socket.audioBuffer = [];
                }

                // Accumulate audio chunks
                socket.audioBuffer.push(audioChunk);

                // Emit acknowledgment
                socket.emit('audio-received', {
                    chunksReceived: socket.audioBuffer.length
                });
            } catch (error) {
                logger.error('Audio stream error:', error);
                socket.emit('error', { message: 'Audio processing failed' });
            }
        });

        /**
         * Process accumulated audio and get transcription
         */
        socket.on('audio-complete', async ({ sessionId }) => {
            try {
                if (!socket.audioBuffer || socket.audioBuffer.length === 0) {
                    socket.emit('transcription-error', { message: 'No audio data received' });
                    return;
                }

                // Combine audio chunks
                const audioData = Buffer.concat(
                    socket.audioBuffer.map(chunk => Buffer.from(chunk, 'base64'))
                );

                // Analyze audio
                const analysis = await speechService.transcribeAndAnalyze(audioData);

                socket.emit('transcription-complete', {
                    transcription: analysis.transcription,
                    confidence: analysis.confidence,
                    clarityScore: analysis.clarityScore,
                    hesitationCount: analysis.hesitationCount,
                    fillerWords: analysis.fillerWords,
                    wordsPerMinute: analysis.wordsPerMinute
                });

                // Store analysis for this response
                socket.lastVoiceAnalysis = analysis;

                // Clear audio buffer
                socket.audioBuffer = [];

                logger.info(`Audio processed for session ${sessionId}`);
            } catch (error) {
                logger.error('Audio processing error:', error);
                socket.emit('transcription-error', { message: 'Failed to process audio' });
            }
        });

        /**
         * Real-time answer submission with streaming response
         */
        socket.on('submit-answer', async ({ sessionId, answer, bodyLanguageAnalysis }) => {
            try {
                const session = await InterviewSession.findOne({
                    sessionId,
                    user: socket.userId,
                    status: 'in-progress'
                });

                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                // Emit processing status
                socket.emit('answer-processing', { status: 'evaluating' });

                const currentResponse = session.responses[session.currentQuestionIndex];
                const voiceAnalysis = socket.lastVoiceAnalysis || null;

                // Safety check: if currentQuestionIndex is out of bounds, the interview is already complete
                if (!currentResponse) {
                    logger.warn(`Session ${sessionId}: currentQuestionIndex (${session.currentQuestionIndex}) is out of bounds (responses: ${session.responses.length}). Auto-completing.`);
                    session.status = 'completed';
                    session.completedAt = new Date();
                    try { session.calculateOverallScores(); } catch (e) { /* ignore */ }
                    try { session.analytics = analyticsService.calculateSessionAnalytics(session); } catch (e) { /* ignore */ }
                    await session.save();

                    socket.emit('interview-complete', {
                        sessionId: session.sessionId,
                        overallScores: session.overallScores,
                        analytics: session.analytics
                    });

                    geminiService.clearSession(sessionId);
                    socket.lastVoiceAnalysis = null;
                    return;
                }

                let evaluation;
                let scores;

                // Check if this is a timed-out/skipped answer
                const isSkipped = answer === '[TIME_EXPIRED_NO_ANSWER]' || !answer?.trim();

                if (isSkipped) {
                    // No answer provided - assign 0 scores
                    evaluation = {
                        correctness: 0,
                        reasoning: 0,
                        communication: 0,
                        confidence: 0,
                        structure: 0,
                        overall: 0,
                        strengths: [],
                        weaknesses: ['No answer was provided for this question.'],
                        suggestions: ['Make sure to provide an answer within the time limit.'],
                        keyTopicsCovered: [],
                        keyTopicsMissed: currentResponse.question?.expectedTopics || []
                    };
                    scores = {
                        correctness: { score: 0, maxScore: 100, feedback: 'No answer provided' },
                        reasoning: { score: 0, maxScore: 100, feedback: 'No answer provided' },
                        communication: { score: 0, maxScore: 100, feedback: 'No answer provided' },
                        confidence: { score: 0, maxScore: 100, feedback: 'No answer provided' },
                        structure: { score: 0, maxScore: 100, feedback: 'No answer provided' },
                        overall: 0  // overall is a Number, not an object
                    };
                } else {
                    // Evaluate answer with AI (with fallback)
                    try {
                        evaluation = await geminiService.evaluateAnswer(
                            sessionId,
                            currentResponse.question,
                            answer,
                            voiceAnalysis
                        );
                    } catch (aiError) {
                        logger.warn(`AI evaluation failed in socket for session ${sessionId}, using fallback:`, aiError.message);
                        evaluation = {
                            scores: {
                                correctness: { score: 65, feedback: 'AI evaluation temporarily unavailable. Default score assigned.' },
                                reasoning: { score: 65, feedback: 'Reasoning evaluation pending.' },
                                communication: { score: 70, feedback: 'Communication evaluation pending.' },
                                structure: { score: 65, feedback: 'Structure evaluation pending.' },
                                confidence: { score: 70, feedback: 'Confidence evaluation pending.' }
                            },
                            overall: 65,
                            strengths: ['Answer was provided'],
                            weaknesses: ['AI evaluation was temporarily unavailable'],
                            suggestions: ['Try again when AI service is available for detailed feedback'],
                            keyTopicsCovered: [],
                            keyTopicsMissed: [],
                            shouldGenerateFollowUp: false,
                            adjustDifficulty: 'maintain'
                        };
                    }
                    // Calculate scores
                    scores = analyticsService.calculateResponseScore(evaluation, voiceAnalysis);

                    // Incorporate posture and presence score
                    if (bodyLanguageAnalysis) {
                        const ppScore = Math.floor((bodyLanguageAnalysis.eyeContactScore + bodyLanguageAnalysis.postureScore) / 2);
                        scores.postureAndPresence = {
                            score: ppScore,
                            maxScore: 100,
                            feedback: ppScore > 80 ? 'Excellent presence and eye contact.' :
                                ppScore > 60 ? 'Good presence, but try to maintain more consistent eye contact.' :
                                    'Try to maintain better posture and look directly into the camera more often.'
                        };
                    } else {
                        scores.postureAndPresence = {
                            score: 0,
                            maxScore: 100,
                            feedback: 'No camera data available'
                        };
                    }
                }

                // Update session
                currentResponse.answer = {
                    text: isSkipped ? '' : answer,
                    duration: 0,
                    skipped: isSkipped
                };
                currentResponse.voiceAnalysis = voiceAnalysis || {};
                if (bodyLanguageAnalysis) {
                    currentResponse.bodyLanguageAnalysis = bodyLanguageAnalysis;
                }
                currentResponse.scores = scores;
                currentResponse.aiAnalysis = {
                    strengths: evaluation.strengths || [],
                    weaknesses: evaluation.weaknesses || [],
                    suggestions: evaluation.suggestions || [],
                    keyTopicsCovered: evaluation.keyTopicsCovered || [],
                    keyTopicsMissed: evaluation.keyTopicsMissed || []
                };
                currentResponse.completedAt = new Date();

                // Emit evaluation result
                socket.emit('answer-evaluated', {
                    scores,
                    skipped: isSkipped,
                    feedback: {
                        strengths: evaluation.strengths,
                        weaknesses: evaluation.weaknesses,
                        suggestions: evaluation.suggestions
                    }
                });

                // Check difficulty adjustment
                const recentScores = session.responses
                    .slice(-3)
                    .map(r => r.scores?.overall || 0)
                    .filter(s => s > 0);

                const difficultyAdjustment = analyticsService.shouldAdjustDifficulty(
                    recentScores,
                    session.difficulty.current
                );

                if (difficultyAdjustment.adjust) {
                    session.adjustDifficulty(difficultyAdjustment.direction);
                    socket.emit('difficulty-adjusted', {
                        newDifficulty: session.difficulty.current,
                        reason: difficultyAdjustment.reason
                    });
                }

                // Update progress
                session.questionsAnswered += 1;
                session.currentQuestionIndex += 1;
                session.lastActivityAt = new Date();

                const isComplete = session.questionsAnswered >= session.totalQuestions;

                if (isComplete) {
                    session.status = 'completed';
                    session.completedAt = new Date();
                    session.calculateOverallScores();
                    session.analytics = analyticsService.calculateSessionAnalytics(session);

                    await session.save();

                    socket.emit('interview-complete', {
                        sessionId: session.sessionId,
                        overallScores: session.overallScores,
                        analytics: session.analytics
                    });

                    // Clear session from Gemini
                    geminiService.clearSession(sessionId);

                    // Clear voice analysis
                    socket.lastVoiceAnalysis = null;

                    logger.info(`Interview completed via socket: ${sessionId}`);
                } else {
                    // Generate next question
                    socket.emit('answer-processing', { status: 'generating-question' });

                    const aiContext = {
                        interviewType: session.interviewType,
                        personality: session.personality,
                        difficulty: session.difficulty.current,
                        targetCompany: session.targetCompany,
                        targetRole: session.targetRole
                    };

                    let newQuestion;
                    try {
                        newQuestion = await geminiService.generateQuestion(
                            sessionId,
                            aiContext,
                            session.responses
                        );
                    } catch (aiError) {
                        logger.warn(`AI question generation failed in socket for session ${sessionId}, using fallback:`, aiError.message);
                        const fallbackPool = {
                            technical: [
                                'Explain the concept of time and space complexity. How do you analyze an algorithm\'s efficiency?',
                                'What are the key differences between SQL and NoSQL databases? When would you choose one over the other?',
                                'Explain how HTTP works. What happens when you type a URL into a browser?',
                                'What is the difference between processes and threads? When would you use each?',
                                'Explain the concept of closures in JavaScript. Provide an example.'
                            ],
                            behavioral: [
                                'Describe a situation where you had to learn a new technology quickly. How did you approach it?',
                                'Tell me about a project you are most proud of. What made it special?',
                                'How do you handle tight deadlines and competing priorities?',
                                'Describe a time you received critical feedback. How did you respond?',
                                'Tell me about a time you disagreed with your manager. What happened?'
                            ],
                            hr: [
                                'Where do you see yourself in five years?',
                                'What motivates you in your work?',
                                'How do you handle feedback from your manager or peers?',
                                'Why are you interested in this role?',
                                'What is your greatest professional strength?'
                            ],
                            'system-design': [
                                'How would you design a chat application like WhatsApp?',
                                'Design a caching system. What strategies would you use?',
                                'How would you design a notification service for a large-scale application?',
                                'Design a rate limiter. How would you handle distributed rate limiting?',
                                'How would you design an online file storage service like Google Drive?'
                            ]
                        };
                        const pool = fallbackPool[session.interviewType] || fallbackPool.hr;
                        const questionText = pool[Math.floor(Math.random() * pool.length)];
                        newQuestion = {
                            questionText,
                            questionType: session.interviewType === 'technical' ? 'technical' : 'open-ended',
                            expectedTopics: []
                        };
                    }

                    // Extract and validate question properties
                    const newQuestionText = newQuestion.questionText || newQuestion.content || newQuestion.question || 'Tell me more about your experience.';
                    const newQuestionType = newQuestion.questionType || newQuestion.type || 'open-ended';
                    const validTypes = ['open-ended', 'technical', 'coding', 'scenario', 'follow-up'];
                    const safeNewQuestionType = validTypes.includes(newQuestionType) ? newQuestionType : 'open-ended';

                    // Add to session
                    session.responses.push({
                        questionIndex: session.currentQuestionIndex,
                        question: {
                            questionText: newQuestionText,
                            questionType: safeNewQuestionType,
                            difficulty: session.difficulty.current,
                            timeAllowed: 120,
                            expectedTopics: newQuestion.expectedTopics || []
                        },
                        startedAt: new Date()
                    });

                    await session.save();

                    socket.emit('next-question', {
                        index: session.currentQuestionIndex,
                        question: newQuestionText,
                        type: safeNewQuestionType,
                        difficulty: session.difficulty.current,
                        expectedTopics: newQuestion.expectedTopics || [],
                        progress: {
                            current: session.currentQuestionIndex + 1,
                            total: session.totalQuestions
                        }
                    });
                }

                // Clear voice analysis for next question
                socket.lastVoiceAnalysis = null;

            } catch (error) {
                logger.error('Answer submission error:', error);

                // Check if this is a rate limit error
                const isRateLimitError = error.status === 429 ||
                    error.message?.includes('429') ||
                    error.message?.includes('quota') ||
                    error.message?.includes('RESOURCE_EXHAUSTED') ||
                    error.message?.includes('rate limit');

                if (isRateLimitError) {
                    // Extract retry delay if available
                    const retryMatch = error.message?.match(/retry in (\d+(?:\.\d+)?)/i);
                    const retryDelay = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;

                    socket.emit('error', {
                        message: `AI service is temporarily busy. Please wait ${retryDelay} seconds and try again.`,
                        type: 'rate_limit',
                        retryAfter: retryDelay
                    });
                } else {
                    socket.emit('error', { message: 'Failed to process answer. Please try again.' });
                }
            }
        });

        /**
         * Pause interview
         */
        socket.on('pause-interview', async ({ sessionId }) => {
            try {
                await InterviewSession.findOneAndUpdate(
                    { sessionId, user: socket.userId },
                    { status: 'paused', pausedAt: new Date() }
                );

                socket.emit('interview-paused', { sessionId });
                logger.info(`Interview paused: ${sessionId}`);
            } catch (error) {
                logger.error('Pause error:', error);
                socket.emit('error', { message: 'Failed to pause interview' });
            }
        });

        /**
         * Resume interview
         */
        socket.on('resume-interview', async ({ sessionId }) => {
            try {
                const session = await InterviewSession.findOneAndUpdate(
                    { sessionId, user: socket.userId, status: 'paused' },
                    { status: 'in-progress', $unset: { pausedAt: 1 } },
                    { new: true }
                );

                if (!session) {
                    socket.emit('error', { message: 'No paused session found' });
                    return;
                }

                socket.emit('interview-resumed', {
                    sessionId,
                    currentQuestion: session.responses[session.currentQuestionIndex]?.question,
                    progress: {
                        current: session.currentQuestionIndex + 1,
                        total: session.totalQuestions
                    }
                });

                logger.info(`Interview resumed: ${sessionId}`);
            } catch (error) {
                logger.error('Resume error:', error);
                socket.emit('error', { message: 'Failed to resume interview' });
            }
        });

        /**
         * Leave interview session
         */
        socket.on('leave-interview', ({ sessionId }) => {
            socket.leave(`interview:${sessionId}`);
            socket.currentSessionId = null;
            socket.audioBuffer = [];
            socket.lastVoiceAnalysis = null;
            logger.info(`User ${socket.userId} left interview ${sessionId}`);
        });

        /**
         * Handle disconnection
         */
        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);

            // Clean up
            socket.audioBuffer = [];
            socket.lastVoiceAnalysis = null;
        });

        /**
         * Handle errors
         */
        socket.on('error', (error) => {
            logger.error(`Socket error for ${socket.id}:`, error);
        });
    });

    return io;
}

export default { initializeSocket };
