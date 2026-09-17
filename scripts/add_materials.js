// Run in Railway Console: node scripts/add_materials.js
if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : { host: process.env.DB_HOST || 'localhost', port: 5432, database: process.env.DB_NAME || 'careermitra', user: process.env.DB_USER || 'postgres', password: process.env.DB_PASSWORD || '' }
)

const materials = [
  // SSC CGL
  { exam: 'SSC CGL', title: 'SSC CGL Complete Syllabus 2024', type: 'article', content: `TIER-I (Online CBT - 60 minutes, 100 marks):
• Quantitative Aptitude: 25 questions, 50 marks
• General Intelligence & Reasoning: 25 questions, 50 marks  
• English Language: 25 questions, 50 marks
• General Awareness: 25 questions, 50 marks

TIER-II (Online CBT):
• Paper-I: Mathematical Abilities + Reasoning (30+30 = 60 questions)
• Paper-II: English Language & Comprehension (100 questions)
• Paper-III: Statistics (100 questions) - Only for JSO posts
• Paper-IV: General Studies Finance & Economics - Only for AAO posts

KEY TOPICS:
Quant: Number System, HCF/LCM, Percentage, Profit/Loss, Time & Work, Speed/Distance, Algebra, Geometry, Trigonometry, Statistics
Reasoning: Analogy, Classification, Series, Coding-Decoding, Blood Relations, Direction, Puzzle, Matrix
English: Reading Comprehension, Fill in the blanks, Error Detection, Cloze Test, Para Jumbles, Synonyms/Antonyms
GK: History, Geography, Polity, Economy, Science, Current Affairs

OFFICIAL WEBSITE: https://ssc.nic.in` },

  // SSC CHSL
  { exam: 'SSC CHSL', title: 'SSC CHSL Syllabus & Strategy 2024', type: 'article', content: `TIER-I (Computer Based - 60 min, 100 marks):
• English Language: 25 questions, 50 marks
• General Intelligence: 25 questions, 50 marks
• Quantitative Aptitude: 25 questions, 50 marks
• General Awareness: 25 questions, 50 marks

TIER-II:
• Session-I: Mathematical Abilities (30q) + Reasoning (30q) + English (40q) = 2.5 hours
• Session-II: Skill Test / Typing Test

QUALIFICATION: 12th Pass from recognized board

KEY STRATEGY:
1. Focus on speed & accuracy in Tier-I
2. Practice previous year papers daily
3. Current affairs: Read newspaper daily
4. English: Focus on grammar and vocabulary

OFFICIAL WEBSITE: https://ssc.nic.in` },

  // SSC MTS
  { exam: 'SSC MTS', title: 'SSC MTS Exam Pattern & Syllabus', type: 'article', content: `PAPER-I (Computer Based - 90 min):
• Numerical & Mathematical Ability: 20 questions, 60 marks
• Reasoning Ability & Problem Solving: 20 questions, 60 marks
• General English: 20 questions, 60 marks
• General Awareness: 20 questions, 60 marks

PAPER-II (Descriptive - 30 min):
• Short Essay/Letter in English or any language in 8th Schedule

QUALIFICATION: 10th Pass (Matriculation)
AGE LIMIT: 18-27 years

SALARY: Pay Level 1 (₹18,000-₹56,900)

OFFICIAL WEBSITE: https://ssc.nic.in` },

  // UPSC CSE
  { exam: 'UPSC CSE', title: 'UPSC Civil Services Complete Guide', type: 'article', content: `THREE STAGES:
1. PRELIMINARY EXAM (Objective)
   • GS Paper-I: 100 questions, 200 marks, 2 hours
   • CSAT Paper-II: 80 questions, 200 marks, 2 hours (Qualifying - 33%)

2. MAIN EXAM (Written)
   • Essay: 250 marks
   • GS Paper I, II, III, IV: 250 marks each
   • Optional Subject Paper I & II: 250 marks each
   • Language Papers (Qualifying)

3. PERSONALITY TEST (Interview): 275 marks

TOTAL MARKS: 2025 (Mains + Interview)

GS PAPER TOPICS:
Paper-I: History, Geography, Society
Paper-II: Governance, Polity, Constitution, International Relations
Paper-III: Economy, Agriculture, Science & Technology, Environment
Paper-IV: Ethics, Integrity, Aptitude

PREPARATION STRATEGY:
• Start with NCERT books (6th to 12th)
• Read The Hindu / Indian Express daily
• Make concise notes
• Previous year questions practice
• Mock tests for CSAT

OFFICIAL WEBSITE: https://upsc.gov.in` },

  // TNPSC Group 1
  { exam: 'TNPSC Group 1', title: 'TNPSC Group 1 Syllabus & Pattern', type: 'article', content: `PRELIMINARY EXAM (200 marks):
• General Studies: 100 questions
• Aptitude & Mental Ability: 25 questions
• Total: 200 marks, 3 hours, OMR based

MAIN EXAM:
• Paper-I: General Studies (300 marks)
• Paper-II: General Studies (300 marks)  
• Paper-III: General Studies (300 marks)
• Interview: 60 marks

POSTS INCLUDED:
Deputy Collector, DSP, AO (Industries), AO (Cooperation), etc.

KEY TOPICS:
• Tamil Nadu History, Culture & Literature
• Current Events (Tamil Nadu & India)
• Geography of Tamil Nadu & India
• Indian Constitution & Polity
• Economy Development
• Science & Technology

BOOKS TO REFER:
• Samacheer Kalvi books (6th to 12th)
• TNPSC Group 1 previous papers
• Monthly current affairs magazines
• The Hindu newspaper

OFFICIAL WEBSITE: https://tnpsc.gov.in` },

  // TNPSC Group 2
  { exam: 'TNPSC Group 2', title: 'TNPSC Group 2 Complete Preparation Guide', type: 'article', content: `PRELIMINARY EXAM (300 marks, 3 hours):
• General Studies: 75 questions (150 marks)
• Aptitude & Mental Ability: 25 questions (50 marks)
• Tamil Language: 25 questions (50 marks)
• Total: 125 questions, 3 hours

MAIN EXAM (for Interview Posts):
• Paper-I: General Studies (300 marks, 3 hours)
• Oral Test: 40 marks

NON-INTERVIEW POSTS: Only Preliminary exam

POSTS:
Assistant Section Officer, Revenue Inspector, Assistant Inspector, Supervisor, etc.

SUBJECT WISE TOPICS:
General Studies:
• Unit-1: General Science (Physics, Chemistry, Biology)
• Unit-2: Current Events
• Unit-3: Geography
• Unit-4: History and Culture of India
• Unit-5: Indian Polity
• Unit-6: Indian Economy
• Unit-7: Indian National Movement
• Unit-8: Aptitude & Mental Ability

OFFICIAL WEBSITE: https://tnpsc.gov.in` },

  // TNPSC Group 4
  { exam: 'TNPSC Group 4', title: 'TNPSC Group 4 Exam Guide', type: 'article', content: `EXAM PATTERN (300 marks, 3 hours):
• General Studies: 100 questions (200 marks)
• General Tamil / General English: 50 questions (100 marks)
• Total: 150 questions, OMR based, No negative marking

POSTS:
VAO, Junior Assistant, Bill Collector, Field Surveyor, Typist, etc.

ELIGIBILITY: 12th Pass

IMPORTANT TOPICS:
General Studies:
• General Science
• Current Events (National & Tamil Nadu)
• Geography
• History & Culture
• Indian Polity
• Indian Economy

Tamil/English:
• Grammar
• Vocabulary
• Comprehension

STRATEGY:
1. Read Samacheer Kalvi books (10th, 11th, 12th)
2. Practice previous year question papers
3. Current affairs - last 6 months
4. Daily 50 questions practice

OFFICIAL WEBSITE: https://tnpsc.gov.in` },

  // SBI Clerk
  { exam: 'SBI Clerk', title: 'SBI Clerk Preparation Strategy', type: 'article', content: `PRELIMINARY EXAM (100 marks, 1 hour):
• English Language: 30 questions, 30 marks, 20 min
• Numerical Ability: 35 questions, 35 marks, 20 min
• Reasoning Ability: 35 questions, 35 marks, 20 min

MAIN EXAM (200 marks, 2 hours 40 min):
• General English: 40 questions, 40 marks, 35 min
• Quantitative Aptitude: 50 questions, 50 marks, 45 min
• Reasoning Ability & Computer Aptitude: 50 questions, 60 marks, 45 min
• General/Financial Awareness: 50 questions, 50 marks, 35 min

KEY TOPICS:
English: Reading Comprehension, Cloze Test, Error Spotting, Para Jumbles
Quant: Data Interpretation, Simplification, Number Series, Arithmetic
Reasoning: Puzzle, Seating, Coding, Syllogism, Inequality
GA: Banking Awareness, Current Affairs, Static GK

DAILY STUDY PLAN:
• 2 hours Reasoning practice
• 1 hour Quant (DI + Arithmetic)
• 1 hour English
• 30 min Banking/Current Affairs

OFFICIAL WEBSITE: https://sbi.co.in` },

  // IBPS PO
  { exam: 'IBPS PO', title: 'IBPS PO Exam Pattern & Preparation', type: 'article', content: `PRELIMINARY EXAM (100 marks, 1 hour):
• English Language: 30 questions, 30 marks
• Quantitative Aptitude: 35 questions, 35 marks
• Reasoning Ability: 35 questions, 35 marks

MAIN EXAM (200 + 25 marks):
• Reasoning & Computer Aptitude: 45 questions, 60 marks, 60 min
• English Language: 35 questions, 40 marks, 40 min
• Data Analysis & Interpretation: 35 questions, 60 marks, 45 min
• General Economy & Banking Awareness: 40 questions, 40 marks, 35 min
• English Letter Writing: 2 questions, 25 marks, 30 min

INTERVIEW: 100 marks (Final = 80% Main + 20% Interview)

BANKS COVERED: 11 nationalized banks including PNB, BOB, Canara Bank, etc.

OFFICIAL WEBSITE: https://ibps.in` },

  // CDS
  { exam: 'CDS', title: 'CDS Exam Pattern & Eligibility', type: 'article', content: `WRITTEN EXAM:
• English: 100 marks, 2 hours
• General Knowledge: 120 marks, 2 hours
• Elementary Mathematics: 100 marks, 2 hours
(Mathematics not required for OTA)

ELIGIBILITY:
• IMA/INA/AFA: Degree from recognized university
• OTA: Degree + for men; Any degree for women

AGE: 19-25 years (IMA/INA/AFA), 19-25 years (OTA)

IMPORTANT TOPICS:
English: Grammar, Vocabulary, Comprehension
GK: History, Geography, Economics, Current Events, Science
Maths: Algebra, Trigonometry, Geometry, Statistics, Calculus

SSB INTERVIEW: After written exam - 5 days assessment

OFFICIAL WEBSITE: https://upsc.gov.in` },

  // NDA
  { exam: 'NDA', title: 'NDA Exam Guide for 12th Students', type: 'article', content: `WRITTEN EXAM:
• Mathematics: 120 questions, 300 marks, 2.5 hours
• General Ability Test: 150 questions, 600 marks, 2.5 hours
  - English: 50 questions, 200 marks
  - General Knowledge: 100 questions, 400 marks

ELIGIBILITY:
• 12th Pass (PCM for Army/Navy/Air Force)
• Age: 16.5 to 19.5 years

MATHEMATICS TOPICS:
Algebra, Matrices, Trigonometry, Analytical Geometry, Differential Calculus, Integral Calculus, Statistics

GAT TOPICS:
Physics, Chemistry, General Science, History, Geography, Current Events

SSB INTERVIEW: After written exam

OFFICIAL WEBSITE: https://upsc.gov.in` },

  // RRB NTPC
  { exam: 'RRB NTPC', title: 'RRB NTPC Complete Exam Guide', type: 'article', content: `CBT STAGE-1 (100 marks, 90 min):
• Mathematics: 30 questions, 30 marks
• General Intelligence & Reasoning: 30 questions, 30 marks
• General Awareness: 40 questions, 40 marks
Negative Marking: 1/3

CBT STAGE-2 (120 marks, 90 min):
• Mathematics: 35 questions, 35 marks
• General Intelligence & Reasoning: 35 questions, 35 marks
• General Awareness: 50 questions, 50 marks

SKILL/TYPING TEST: For select posts

POSTS:
Graduate Level: Station Master, Goods Guard, Junior Account Assistant
Undergraduate Level: Junior Clerk, Accounts Clerk, Commercial Cum Ticket Clerk

SUBJECTS:
Mathematics: Number System, BODMAS, Decimals, Fractions, LCM/HCF, Ratio, Percentage, Mensuration, Time & Work, Time & Distance, Simple & Compound Interest, Profit & Loss, Algebra, Geometry, Elementary Statistics, Square Root, Age Calculations, Calendar & Clock, Pipes & Cistern

Reasoning: Analogies, Alphabetical and Number Series, Coding and Decoding, Mathematical operations, Relationships, Syllogism, Jumbling, Venn Diagram, Data Interpretation, Puzzles, Decision Making, Maps, Interpretation of Graphs

General Awareness: National & International Current events, Games & Sports, Art & Culture of India, Indian Literature, Monuments, General Science, History of India & Freedom Struggle, Physical, Social and Economic Geography, Indian Polity and Governance, Indian Economy, Environmental issues, Scientific and technological developments of India, UN & Other important World Organizations, Basic computers & Applications, General abbreviations, Transport Systems in India, Indian Languages, Books & their Authors

OFFICIAL WEBSITE: https://indianrailways.gov.in` },

  // CTET
  { exam: 'CTET', title: 'CTET Paper 1 & Paper 2 Complete Guide', type: 'article', content: `PAPER-I (Primary Level - Classes 1 to 5):
• Child Development & Pedagogy: 30 questions, 30 marks
• Language-I (compulsory): 30 questions, 30 marks
• Language-II (compulsory): 30 questions, 30 marks
• Mathematics: 30 questions, 30 marks
• Environmental Studies: 30 questions, 30 marks
Total: 150 questions, 150 marks, 2.5 hours

PAPER-II (Elementary Level - Classes 6 to 8):
• Child Development & Pedagogy: 30 questions, 30 marks
• Language-I (compulsory): 30 questions, 30 marks
• Language-II (compulsory): 30 questions, 30 marks
• Mathematics & Science OR Social Studies: 60 questions, 60 marks
Total: 150 questions, 150 marks, 2.5 hours

QUALIFYING MARKS: 60% (90/150) for General, 55% for SC/ST/OBC/PH

VALIDITY: Lifetime (as per latest notification)

KEY TOPICS - Child Development:
• Theories of development (Piaget, Vygotsky, Kohlberg)
• Learning and its processes
• Inclusive Education
• Child Psychology

OFFICIAL WEBSITE: https://ctet.nic.in` },

  // CAPF
  { exam: 'CAPF AC', title: 'CAPF AC Exam Pattern & Syllabus', type: 'article', content: `PAPER-I (250 marks, 2 hours):
• General Ability & Intelligence: 125 questions, 250 marks
  Topics: General Mental Ability, Reasoning, GK, Current Events, Polity, Economy, Science

PAPER-II (200 marks, 3 hours, Descriptive):
• Essay, Precis Writing, Comprehension, Letter Writing
• Candidates must write in English and Hindi

PHYSICAL STANDARD TEST (PST) & PHYSICAL EFFICIENCY TEST (PET)

MEDICAL STANDARDS

INTERVIEW/PERSONALITY TEST: 150 marks

FORCES: BSF, CRPF, CISF, ITBP, SSB

ELIGIBILITY: Graduation from recognized university, Age: 20-25 years

OFFICIAL WEBSITE: https://upsc.gov.in` },
]

async function run() {
  console.log('Adding study materials for all exams...')

  // Get exam IDs
  const { rows: exams } = await pool.query('SELECT id, name, short_name FROM exams WHERE is_demo = TRUE')
  const examMap = {}
  exams.forEach(e => {
    examMap[e.short_name] = e.id
    examMap[e.name] = e.id
  })

  console.log('Found exams:', Object.keys(examMap).join(', '))

  let added = 0
  for (const mat of materials) {
    const examId = examMap[mat.exam]
    if (!examId) {
      console.log(`Exam not found: ${mat.exam}`)
      continue
    }
    try {
      await pool.query(
        `INSERT INTO study_materials (exam_id, title, content_type, content_text, is_free, is_demo)
         VALUES ($1, $2, 'article', $3, TRUE, TRUE)
         ON CONFLICT DO NOTHING`,
        [examId, mat.title, mat.content]
      )
      console.log(`Added: ${mat.exam} - ${mat.title}`)
      added++
    } catch (e) {
      console.log(`Error ${mat.exam}: ${e.message.substring(0, 60)}`)
    }
  }

  console.log(`\n✅ Done! Added ${added}/${materials.length} study materials`)

  // Verify
  const { rows } = await pool.query(
    `SELECT e.name, COUNT(sm.id) as materials
     FROM exams e LEFT JOIN study_materials sm ON e.id = sm.exam_id
     WHERE e.is_demo = TRUE
     GROUP BY e.name ORDER BY e.name`
  )
  console.log('\nMaterials per exam:')
  rows.forEach(r => console.log(` - ${r.name}: ${r.materials} materials`))

  await pool.end()
}

run().catch(e => { console.error('Error:', e.message); process.exit(1) })
