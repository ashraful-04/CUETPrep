const MockTest = require('../models/MockTest');
const User = require('../models/User');
const axios = require('axios');


// @desc    Generate a mock test using Claude via AIcredits.in
// @route   POST /api/mocktest/generate
// @access  Private
const generateMockTest = async (req, res) => {
  try {
    const { subjects, difficulty, testLength } = req.body;
    
    // Ensure we have an array of subjects
    const subjectArray = Array.isArray(subjects) ? subjects : ['math'];
    const baseQuestions = Math.floor(testLength / subjectArray.length);
    const remainder = testLength % subjectArray.length;
    const actualTestLength = testLength;

    const apiKey = process.env.AICREDITS_API_KEY;
    const apiUrl = process.env.AICREDITS_URL || 'https://api.aicredits.in/v1';

    if (!apiKey || apiKey === 'your_api_key_here') {
      return res.status(500).json({ message: 'Server configuration error: AICREDITS_API_KEY is missing in .env' });
    }

    const isHard = difficulty === 'Hard';
    const difficultyInstruction = isHard 
      ? `CRITICAL: Make the questions very challenging. You MUST include complex Statement-based questions (e.g. "Statement I: ... Statement II: ...") and Assertion-Reasoning questions which are heavily featured in the CUET PG exam.`
      : difficulty === 'Medium' 
        ? `Make the questions moderate difficulty.`
        : `Make the questions relatively straightforward.`;

    const fullNames = { math: 'Mathematics', computers: 'Computer Science', reasoning: 'Logical Reasoning' };

    // Run requests sequentially to prevent rate limiting/queueing timeouts on the API server
    const resultsArray = [];
    for (let index = 0; index < subjectArray.length; index++) {
      const sub = subjectArray[index];
      const qCount = baseQuestions + (index < remainder ? 1 : 0);
      if (qCount === 0) continue; // Safety check

      const prompt = `Generate a ${qCount}-question multiple choice test for CUET PG MCA on the subject of "${fullNames[sub]}".
      ${difficultyInstruction}
      Return ONLY a strict JSON array of objects. Do not wrap in markdown tags like \`\`\`json.
      CRITICAL: Ensure that your JSON output contains NO literal newline or tab characters inside string values. If you need a line break (e.g. for Statement I and Statement II), use the explicit escaped string "\\\\n" so it parses correctly.
      Each object must have exactly these keys:
      "questionText" (string, include the full question and any statements here),
      "options" (array of 4 strings),
      "correctAnswer" (string, exact match to one of the options),
      "explanation" (string, a brief explanation of why the correct answer is right).`;

      let response;
      try {
        response = await axios.post(`${apiUrl}/chat/completions`, {
          model: 'claude-3-haiku-20240307',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: 90000 // 90 seconds max per subject
        });
      } catch (err) {
        console.error(`API error for ${sub}:`, err.response?.data || err.message);
        throw new Error(`Failed to generate questions for ${sub}`);
      }

      const data = response.data;
      let content = data.choices[0].message.content.trim();
      
      // Strip markdown code fences if present
      content = content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      
      // Sanitize the raw string: replace any literal newlines/tabs with spaces 
      content = content.replace(/[\r\n\t]+/g, ' ');

      // Find the JSON array within the content (in case there's extra text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error(`No valid JSON array found in response for ${sub}`);
      }
      
      const parsedQuestions = JSON.parse(jsonMatch[0]);
      // Tag each question with its specific subject id
      const taggedQuestions = parsedQuestions.map(q => ({ ...q, subject: sub }));
      resultsArray.push(taggedQuestions);
    }

    // Flatten the array of arrays into a single array of questions
    const questions = resultsArray.flat();
    
    res.status(200).json({ questions, actualTestLength });
  } catch (error) {
    console.error('Error generating mock test:', error);
    res.status(500).json({ message: 'Server error during generation', details: error.message });
  }
};

// @desc    Submit mock test results
// @route   POST /api/mocktest/submit
// @access  Private
const submitMockTest = async (req, res) => {
  const { score, totalQuestions, sections, questions } = req.body;

  try {
    const mockTest = await MockTest.create({
      userId: req.user._id,
      score,
      totalQuestions,
      sections: sections || {},
      questions: questions || []
    });

    res.status(201).json(mockTest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a specific mock test by ID
// @route   GET /api/mocktest/:id
// @access  Private
const getMockTestById = async (req, res) => {
  try {
    const mockTest = await MockTest.findOne({ _id: req.params.id, userId: req.user._id });
    if (!mockTest) {
      return res.status(404).json({ message: 'Mock test not found' });
    }
    res.status(200).json(mockTest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all mock tests for the user
// @route   GET /api/mocktest/history
// @access  Private
const getMockTestHistory = async (req, res) => {
  try {
    const mockTests = await MockTest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(mockTests);
  } catch (error) {
    console.error('Error fetching mock test history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a specific mock test by ID
// @route   DELETE /api/mocktest/:id
// @access  Private
const deleteMockTest = async (req, res) => {
  try {
    const mockTest = await MockTest.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!mockTest) {
      return res.status(404).json({ message: 'Mock test not found' });
    }
    res.status(200).json({ message: 'Mock test deleted successfully' });
  } catch (error) {
    console.error('Error deleting mock test:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { generateMockTest, submitMockTest, getMockTestById, getMockTestHistory, deleteMockTest };
