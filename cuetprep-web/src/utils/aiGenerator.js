export const generateMockTestQuestions = async (subjects, difficulty, testLength) => {
  const subjectArray = Array.isArray(subjects) ? subjects : ['math'];
  const baseQuestions = Math.floor(testLength / subjectArray.length);
  const remainder = testLength % subjectArray.length;

  const apiKey = import.meta.env.VITE_AICREDITS_API_KEY;
  const apiUrl = 'https://api.aicredits.in/v1';

  if (!apiKey) {
    throw new Error('VITE_AICREDITS_API_KEY is missing in your Vercel Environment Variables. Please add it and redeploy.');
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
      response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`API returned HTTP ${response.status}`);
      }
    } catch (err) {
      console.error(`API error for ${sub}:`, err);
      throw new Error(`Failed to connect to AI for ${sub}. Check your network or API key.`);
    }

    const data = await response.json();
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
  return resultsArray.flat();
};
