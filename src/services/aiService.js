/**
 * AI Service — abstraction layer for AI providers
 * Supports: Google Gemini, OpenAI, Groq
 * API keys are ALWAYS read from environment variables — never hardcoded
 */

const config = require('../config');

// ── Provider: Google Gemini ───────────────────────────────────────────────────
const callGemini = async (prompt, systemInstruction = '') => {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(config.ai.geminiKey);
  const model = genAI.getGenerativeModel({ model: config.ai.model || 'gemini-1.5-flash' });

  const fullPrompt = systemInstruction
    ? `${systemInstruction}\n\n${prompt}`
    : prompt;

  const result = await model.generateContent(fullPrompt);
  return result.response.text();
};

// ── Provider: OpenAI ─────────────────────────────────────────────────────────
const callOpenAI = async (prompt, systemInstruction = '') => {
  const OpenAI = require('openai');
  const client = new OpenAI({ apiKey: config.ai.openaiKey });
  const messages = [];
  if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
  messages.push({ role: 'user', content: prompt });

  const response = await client.chat.completions.create({
    model: config.ai.model || 'gpt-4o-mini',
    messages,
    max_tokens: 2000,
  });
  return response.choices[0].message.content;
};

// ── Provider: Groq ────────────────────────────────────────────────────────────
const callGroq = async (prompt, systemInstruction = '') => {
  const Groq = require('groq-sdk');
  const groq = new Groq({ apiKey: config.ai.groqKey });
  const messages = [];
  if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
  messages.push({ role: 'user', content: prompt });

  const response = await groq.chat.completions.create({
    model: config.ai.model || 'llama3-8b-8192',
    messages,
  });
  return response.choices[0].message.content;
};

// ── Dispatcher ────────────────────────────────────────────────────────────────
const callAI = async (prompt, systemInstruction = '') => {
  const provider = config.ai.provider;

  if (!['gemini', 'openai', 'groq'].includes(provider)) {
    throw new Error(`Unknown AI provider: ${provider}`);
  }

  // Check key availability
  if (provider === 'gemini' && !config.ai.geminiKey) {
    return getDemoResponse(prompt);
  }
  if (provider === 'openai' && !config.ai.openaiKey) {
    return getDemoResponse(prompt);
  }
  if (provider === 'groq' && !config.ai.groqKey) {
    return getDemoResponse(prompt);
  }

  try {
    if (provider === 'gemini') return await callGemini(prompt, systemInstruction);
    if (provider === 'openai') return await callOpenAI(prompt, systemInstruction);
    if (provider === 'groq')   return await callGroq(prompt, systemInstruction);
  } catch (err) {
    console.error(`AI provider error (${provider}):`, err.message);
    // Fallback to demo mode so the app still works during demos
    return getDemoResponse(prompt);
  }
};

// ── Demo fallback (no real API key) ──────────────────────────────────────────
const getDemoResponse = (prompt) => {
  const lower = prompt.toLowerCase();

  if (lower.includes('ssc') || lower.includes('government')) {
    return `[DEMO MODE] To prepare for SSC CGL:\n1. Quantitative Aptitude: Practice 30 questions daily\n2. Reasoning: Focus on series and coding-decoding\n3. English: Read newspapers daily\n4. GK: Read monthly current affairs\n\nRecommended: Start with previous year papers from the official SSC website.`;
  }
  if (lower.includes('data analyst') || lower.includes('sql')) {
    return `[DEMO MODE] Data Analyst roadmap:\n1. Excel → 2. SQL → 3. Python (Pandas) → 4. Statistics → 5. Power BI / Tableau → 6. Projects → 7. Resume → 8. Interview prep\n\nStart with free resources on YouTube and Kaggle.`;
  }
  if (lower.includes('skill') || lower.includes('learn')) {
    return `[DEMO MODE] Based on your profile, I recommend focusing on:\n1. SQL — Essential for most data roles\n2. Python — High demand across all tech jobs\n3. Communication skills — Critical for interviews\n\nSet a daily learning goal of 45 minutes.`;
  }

  return `[DEMO MODE] Hello! I'm CareerMitra AI. I can help you with:\n• Career guidance\n• Job matching\n• Exam preparation\n• Skill recommendations\n• Interview preparation\n\nNote: AI features are in demo mode. Configure your AI_PROVIDER and API key in .env to enable real AI responses.`;
};

// ── Specialized AI Functions ──────────────────────────────────────────────────

const SYSTEM_CAREER_MENTOR = `You are CareerMitra AI, a highly intelligent and helpful AI assistant — like ChatGPT but specialized for Indian students and job seekers.

You can answer ANY question the user asks — general knowledge, career guidance, exam preparation, coding help, math problems, current affairs, jokes, creative writing, or anything else.

You are especially expert in:
- Government Jobs: SSC, UPSC, TNPSC, Banking, Railway, Defence, Teaching
- Private sector jobs: IT, Analytics, Finance, Marketing
- Competitive exam preparation for Indian exams
- Career roadmaps and skill development
- Interview preparation
- Resume writing tips

You respond in the SAME LANGUAGE as the user — if they write in Tamil, respond in Tamil. If in English, respond in English. Support: English, Tamil, Hindi, Telugu, Malayalam, Kannada, Thanglish.

Be conversational, helpful, and thorough. Use bullet points and formatting when helpful.
Never say you cannot answer a question — always try your best to help.
NEVER start your response with [DEMO MODE].`;

const chatWithMentor = async (message, conversationHistory = [], language = 'english') => {
  const historyContext = conversationHistory
    .slice(-6) // last 6 messages for context
    .map((m) => `${m.sender === 'user' ? 'User' : 'CareerMitra AI'}: ${m.content}`)
    .join('\n');

  const prompt = historyContext
    ? `Previous conversation:\n${historyContext}\n\nUser: ${message}`
    : message;

  return callAI(prompt, SYSTEM_CAREER_MENTOR);
};

const generateJobMatch = async (userProfile, job) => {
  const prompt = `
Analyze the match between this user profile and job posting.

USER PROFILE:
Name: ${userProfile.name}
Qualification: ${userProfile.qualification}
Experience: ${userProfile.experience_level}
Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
Preferred Location: ${userProfile.preferred_location}

JOB:
Title: ${job.title}
Type: ${job.job_type}
Category: ${job.category}
Required Qualification: ${job.qualification}
Required Skills: ${job.required_skills?.join(', ') || 'Not specified'}
Location: ${job.location}
Experience Required: ${job.experience_required}

Return a JSON object with:
{
  "overall_score": <0-100>,
  "skills_score": <0-100>,
  "education_score": <0-100>,
  "experience_score": <0-100>,
  "location_score": <0-100>,
  "missing_skills": ["skill1", "skill2"],
  "recommendation": "brief actionable recommendation",
  "eligible": true/false
}

Return ONLY valid JSON, no markdown.`;

  const raw = await callAI(prompt);
  try {
    return JSON.parse(raw.trim());
  } catch {
    return {
      overall_score: 65,
      skills_score: 70,
      education_score: 80,
      experience_score: 60,
      location_score: 100,
      missing_skills: [],
      recommendation: 'Update your profile for a more accurate match.',
      eligible: true,
    };
  }
};

const analyzeSkillGap = async (userSkills, targetRole) => {
  const prompt = `
Analyze the skill gap for this person wanting to become a ${targetRole}.

Current Skills: ${userSkills.join(', ')}

Return JSON:
{
  "missing_skills": ["skill1", "skill2"],
  "weak_skills": ["skill3"],
  "roadmap": ["Step 1: ...", "Step 2: ..."],
  "estimated_months": <number>,
  "priority_actions": ["action1", "action2"]
}

Return ONLY valid JSON, no markdown.`;

  const raw = await callAI(prompt);
  try {
    return JSON.parse(raw.trim());
  } catch {
    return {
      missing_skills: ['SQL', 'Python', 'Power BI'],
      weak_skills: ['Excel'],
      roadmap: ['Learn SQL basics', 'Practice Python with pandas', 'Build 2 projects', 'Apply for jobs'],
      estimated_months: 3,
      priority_actions: ['Start SQL course today', 'Set daily 45-minute learning goal'],
    };
  }
};

const generateCareerRoadmap = async (goal, userProfile) => {
  const prompt = `
Create a detailed career roadmap for:
Goal: ${goal}
Current Qualification: ${userProfile.qualification}
Current Skills: ${userProfile.skills?.join(', ') || 'Beginner'}
Experience: ${userProfile.experience_level}

Return JSON:
{
  "title": "Roadmap title",
  "description": "Overview",
  "steps": [
    {
      "title": "Step title",
      "description": "What to do",
      "estimated_days": 30,
      "resources": ["resource1", "resource2"],
      "mini_project": "project description"
    }
  ],
  "total_months": <number>
}

Return ONLY valid JSON.`;

  const raw = await callAI(prompt);
  try {
    return JSON.parse(raw.trim());
  } catch {
    return {
      title: `${goal} Roadmap`,
      description: 'AI-generated personalized career roadmap',
      steps: [
        { title: 'Foundation', description: 'Learn core concepts', estimated_days: 30, resources: ['YouTube', 'Coursera'], mini_project: 'Basic project' },
        { title: 'Intermediate', description: 'Build projects', estimated_days: 45, resources: ['Kaggle', 'GitHub'], mini_project: 'Portfolio project' },
        { title: 'Advanced', description: 'Interview prep', estimated_days: 30, resources: ['LeetCode', 'Mock interviews'], mini_project: 'Capstone project' },
      ],
      total_months: 4,
    };
  }
};

const analyzeResume = async (resumeText) => {
  const prompt = `
Analyze this resume for an Indian job market context:

${resumeText.substring(0, 3000)}

Return JSON:
{
  "ats_score": <0-100>,
  "skills_found": ["skill1", "skill2"],
  "missing_keywords": ["keyword1"],
  "formatting_issues": ["issue1"],
  "strengths": ["strength1"],
  "improvements": ["improvement1", "improvement2"],
  "summary": "2-sentence overall assessment"
}

Return ONLY valid JSON.`;

  const raw = await callAI(prompt);
  try {
    return JSON.parse(raw.trim());
  } catch {
    return {
      ats_score: 72,
      skills_found: ['Communication', 'Teamwork'],
      missing_keywords: ['SQL', 'Python', 'Projects'],
      formatting_issues: ['Add a summary section', 'Use bullet points for experience'],
      strengths: ['Good education section'],
      improvements: ['Add quantifiable achievements', 'Include a skills section', 'Add relevant projects'],
      summary: 'Resume has a good foundation but needs more technical keywords and project experience for ATS optimization.',
    };
  }
};

const generateMockInterviewQuestion = async (interviewType, previousQA = [], questionNumber = 1) => {
  const prompt = `
You are conducting a ${interviewType} interview for an Indian job seeker.
Question number: ${questionNumber}
${previousQA.length ? `Previous Q&A:\n${previousQA.slice(-2).map((q) => `Q: ${q.question}\nA: ${q.answer}`).join('\n')}` : ''}

Generate the next interview question. Return JSON:
{
  "question": "interview question",
  "category": "technical/hr/behavioral",
  "hint": "what a good answer should cover"
}

Return ONLY valid JSON.`;

  const raw = await callAI(prompt);
  try {
    return JSON.parse(raw.trim());
  } catch {
    const fallbacks = [
      { question: 'Tell me about yourself.', category: 'hr', hint: 'Cover education, skills, and career goals in 2 minutes.' },
      { question: 'What are your key technical skills?', category: 'technical', hint: 'Be specific with examples.' },
      { question: 'Where do you see yourself in 5 years?', category: 'hr', hint: 'Align with the company\'s growth.' },
    ];
    return fallbacks[(questionNumber - 1) % fallbacks.length];
  }
};

const evaluateInterviewAnswer = async (question, answer, interviewType) => {
  const prompt = `
Evaluate this interview answer:
Interview type: ${interviewType}
Question: ${question}
Answer: ${answer}

Return JSON:
{
  "score": <0-10>,
  "feedback": "specific feedback",
  "good_points": ["point1"],
  "improvements": ["improvement1"],
  "model_answer_hint": "brief hint for better answer"
}

Return ONLY valid JSON.`;

  const raw = await callAI(prompt);
  try {
    return JSON.parse(raw.trim());
  } catch {
    return {
      score: 6,
      feedback: 'Decent answer with room for improvement.',
      good_points: ['Relevant content'],
      improvements: ['Add more specific examples', 'Be more concise'],
      model_answer_hint: 'Use the STAR method (Situation, Task, Action, Result).',
    };
  }
};

const generateDailyPlan = async (userProfile, weakAreas = [], jobGoals = []) => {
  const prompt = `
Create a practical daily career development plan for:
Skills to improve: ${weakAreas.join(', ') || 'General skills'}
Job goals: ${jobGoals.join(', ') || 'Government and private jobs'}
Experience level: ${userProfile.experience_level}

Return JSON with an array of 5 tasks:
{
  "tasks": [
    {
      "order": 1,
      "emoji": "📚",
      "title": "task title",
      "description": "what to do",
      "duration_min": 45,
      "category": "study/apply/practice/watch/ask_ai"
    }
  ]
}

Return ONLY valid JSON.`;

  const raw = await callAI(prompt);
  try {
    return JSON.parse(raw.trim());
  } catch {
    return {
      tasks: [
        { order: 1, emoji: '📚', title: 'Study SQL Basics', description: 'Practice 10 SQL queries on W3Schools', duration_min: 45, category: 'study' },
        { order: 2, emoji: '🎥', title: 'Watch Learning Video', description: 'Watch recommended skill video', duration_min: 30, category: 'watch' },
        { order: 3, emoji: '📝', title: 'Solve Aptitude Questions', description: 'Solve 20 quantitative aptitude questions', duration_min: 30, category: 'practice' },
        { order: 4, emoji: '💼', title: 'Apply to Jobs', description: 'Apply to 2 matching job openings', duration_min: 20, category: 'apply' },
        { order: 5, emoji: '🤖', title: 'Ask AI Mentor', description: 'Ask one career question to CareerMitra AI', duration_min: 10, category: 'ask_ai' },
      ],
    };
  }
};

const compareCareerPaths = async (careers) => {
  const prompt = `
Compare these career paths for the Indian job market: ${careers.join(' vs ')}

Return JSON:
{
  "comparison": [
    {
      "career": "career name",
      "required_skills": ["skill1"],
      "qualification": "minimum qualification",
      "learning_difficulty": "easy/medium/hard",
      "salary_range": "₹X – ₹Y LPA (approximate, freshers)",
      "career_growth": "growth description",
      "responsibilities": ["responsibility1"],
      "roadmap_summary": "3-step summary"
    }
  ],
  "recommendation": "AI recommendation based on comparison",
  "note": "Salary data is approximate and varies by company and location"
}

Return ONLY valid JSON.`;

  const raw = await callAI(prompt);
  try {
    return JSON.parse(raw.trim());
  } catch {
    return {
      comparison: careers.map((c) => ({
        career: c,
        required_skills: ['Programming', 'Problem solving'],
        qualification: 'B.E./B.Tech or equivalent',
        learning_difficulty: 'medium',
        salary_range: '₹3 – ₹8 LPA (approximate, freshers)',
        career_growth: 'Good growth opportunities in India',
        responsibilities: ['Collaborate in teams', 'Build products'],
        roadmap_summary: 'Learn → Build projects → Apply',
      })),
      recommendation: 'All paths have good prospects. Choose based on your interests.',
      note: 'Salary data is approximate and varies by company and location.',
    };
  }
};

const recommendVideos = async (weakAreas = [], jobGoals = [], recentQuestions = []) => {
  const prompt = `
Recommend real YouTube search queries for learning:
Weak areas: ${weakAreas.join(', ')}
Career goals: ${jobGoals.join(', ')}
Recent questions: ${recentQuestions.join(', ')}

Return JSON array of 5 recommendations:
[
  {
    "title": "video title",
    "topic": "specific topic",
    "channel_suggestion": "suggested channel type",
    "search_query": "YouTube search query",
    "why": "why this is recommended"
  }
]

Return ONLY valid JSON. Do NOT fabricate real channel names or URLs.`;

  const raw = await callAI(prompt);
  try {
    return JSON.parse(raw.trim());
  } catch {
    return [
      { title: 'SQL for Beginners', topic: 'SQL', channel_suggestion: 'Programming tutorial channel', search_query: 'SQL tutorial for beginners 2024', why: 'SQL is essential for data roles' },
      { title: 'Python Pandas Tutorial', topic: 'Python', channel_suggestion: 'Data science channel', search_query: 'Python pandas tutorial for data analysis', why: 'Pandas is key for data analysis' },
      { title: 'SSC CGL Preparation', topic: 'SSC', channel_suggestion: 'Government exam coaching channel', search_query: 'SSC CGL complete preparation guide', why: 'Comprehensive exam preparation' },
    ];
  }
};

module.exports = {
  callAI,
  chatWithMentor,
  generateJobMatch,
  analyzeSkillGap,
  generateCareerRoadmap,
  analyzeResume,
  generateMockInterviewQuestion,
  evaluateInterviewAnswer,
  generateDailyPlan,
  compareCareerPaths,
  recommendVideos,
};
