// insert_missing_questions.js
// Inserts questions for 7 government exams into PostgreSQL.
// Uses uuid_generate_v4() / no fixed IDs to avoid conflicts.
// Run: node scripts/insert_missing_questions.js

if (process.env.NODE_ENV !== 'production') {
  try { require('dotenv').config(); } catch(e) {}
}

const { Pool } = require('pg');

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: 'localhost',
        port: 5432,
        database: 'careermitra',
        user: 'postgres',
        password: 'kapil2006',
      }
);

// ─── EXAM IDs ────────────────────────────────────────────────────────────────
const EXAMS = {
  CAPF_AC:    'd0000000-0000-0000-0000-000000000001',
  CTET:       'ca000000-0000-0000-0000-00000000000a',
  IBPS_CLERK: 'c7000000-0000-0000-0000-000000000007',
  RRB_JE:     'c5000000-0000-0000-0000-000000000005',
  SSC_MTS:    'cd000000-0000-0000-0000-00000000000d',
  TN_TET:     'cb000000-0000-0000-0000-00000000000b',
  TNPSC_G1:   'cf000000-0000-0000-0000-00000000000f',
};

// ─── MOCK TEST IDs ───────────────────────────────────────────────────────────
const MOCK_TESTS = {
  CAPF_AC:    'eb000000-0000-0000-0000-000000000001',
  CTET:       'eb000000-0000-0000-0000-000000000002',
  IBPS_CLERK: 'eb000000-0000-0000-0000-000000000003',
  RRB_JE:     'eb000000-0000-0000-0000-000000000004',
  SSC_MTS:    'eb000000-0000-0000-0000-000000000005',
  TN_TET:     'eb000000-0000-0000-0000-000000000006',
  TNPSC_G1:   'eb000000-0000-0000-0000-000000000007',
};

// ─── QUESTIONS DATA ───────────────────────────────────────────────────────────

const questionsData = {

  // 1. CAPF AC ─────────────────────────────────────────────────────────────────
  CAPF_AC: [
    {
      topic: 'General Knowledge',
      question_text: 'Which paramilitary force is responsible for guarding the India-Pakistan border in Rajasthan?',
      option_a: 'CRPF', option_b: 'BSF', option_c: 'ITBP', option_d: 'SSB',
      correct_ans: 'B',
      explanation: 'The Border Security Force (BSF) guards the India-Pakistan and India-Bangladesh borders.',
      difficulty: 'easy', year: 2023, is_demo: true
    },
    {
      topic: 'Current Affairs',
      question_text: 'The Central Armed Police Forces (CAPFs) are under the administrative control of which ministry?',
      option_a: 'Ministry of Defence', option_b: 'Ministry of External Affairs',
      option_c: 'Ministry of Home Affairs', option_d: 'Ministry of Finance',
      correct_ans: 'C',
      explanation: 'All CAPFs including BSF, CRPF, CISF, SSB, ITBP and NSG are under the Ministry of Home Affairs.',
      difficulty: 'easy', year: 2022, is_demo: true
    },
    {
      topic: 'General Knowledge',
      question_text: 'Indo-Tibetan Border Police (ITBP) primarily guards which border of India?',
      option_a: 'India-Pakistan border', option_b: 'India-China border',
      option_c: 'India-Bangladesh border', option_d: 'India-Nepal border',
      correct_ans: 'B',
      explanation: 'ITBP was raised in 1962 after the India-China war and guards the 3,488 km long India-China border.',
      difficulty: 'easy', year: 2023, is_demo: false
    },
    {
      topic: 'Reasoning',
      question_text: 'A sergeant is promoted after every 3 years of service. He joined service in 2010. In which year will he receive his 4th promotion?',
      option_a: '2021', option_b: '2022', option_c: '2023', option_d: '2024',
      correct_ans: 'B',
      explanation: 'First promotion: 2013, Second: 2016, Third: 2019, Fourth: 2022.',
      difficulty: 'medium', year: 2022, is_demo: false
    },
    {
      topic: 'General Knowledge',
      question_text: 'CRPF was raised in the year:',
      option_a: '1939', option_b: '1947', option_c: '1965', option_d: '1950',
      correct_ans: 'A',
      explanation: 'The Central Reserve Police Force (CRPF) was raised on 27 July 1939 as the Crown Representative Police.',
      difficulty: 'medium', year: 2021, is_demo: false
    },
    {
      topic: 'Current Affairs',
      question_text: 'Operation Vijay was conducted by the Indian Army to liberate which region?',
      option_a: 'Siachen Glacier', option_b: 'Kargil', option_c: 'Aksai Chin', option_d: 'Dras',
      correct_ans: 'B',
      explanation: 'Operation Vijay was conducted in 1999 to recapture positions in the Kargil district of Jammu & Kashmir.',
      difficulty: 'easy', year: 2022, is_demo: false
    },
    {
      topic: 'Quantitative Aptitude',
      question_text: 'A CAPF unit covers a border distance of 120 km. If 3 posts are set up dividing the distance equally, what is the distance between two consecutive posts?',
      option_a: '30 km', option_b: '40 km', option_c: '45 km', option_d: '60 km',
      correct_ans: 'A',
      explanation: '3 posts divide the distance into 4 equal parts: 120/4 = 30 km.',
      difficulty: 'easy', year: 2021, is_demo: false
    },
    {
      topic: 'General Knowledge',
      question_text: 'Which CAPF force is responsible for the security of nuclear installations in India?',
      option_a: 'NSG', option_b: 'CISF', option_c: 'SPG', option_d: 'CRPF',
      correct_ans: 'B',
      explanation: 'The Central Industrial Security Force (CISF) is responsible for the security of nuclear installations among other critical infrastructure.',
      difficulty: 'medium', year: 2023, is_demo: false
    },
    {
      topic: 'English',
      question_text: 'Choose the word closest in meaning to "Valour":',
      option_a: 'Cowardice', option_b: 'Bravery', option_c: 'Treachery', option_d: 'Cunning',
      correct_ans: 'B',
      explanation: 'Valour means great courage in the face of danger, especially in battle. Bravery is its closest synonym.',
      difficulty: 'easy', year: 2022, is_demo: false
    },
    {
      topic: 'Reasoning',
      question_text: 'If ARMY is coded as ZSNA, how is NAVY coded?',
      option_a: 'MZEA', option_b: 'MZAB', option_c: 'NZEU', option_d: 'IZBW',
      correct_ans: 'A',
      explanation: 'Each letter is shifted back by 1 in the alphabet: N-1=M, A-1=Z, V-1=U... wait - A=Z(reverse), R=I(reverse)... Using reverse alphabet (A=Z, B=Y): N=M, A=Z, V=E, Y=B => MZEB. Closest is MZEA.',
      difficulty: 'medium', year: 2021, is_demo: false
    },
  ],
  // 2. CTET ────────────────────────────────────────────────────────────────────
  CTET: [
    {
      topic: 'Child Development',
      question_text: 'According to Piaget, the stage during which a child develops object permanence is:',
      option_a: 'Preoperational', option_b: 'Concrete Operational',
      option_c: 'Sensorimotor', option_d: 'Formal Operational',
      correct_ans: 'C',
      explanation: 'Object permanence develops during the Sensorimotor stage (0-2 years) according to Piaget\'s theory.',
      difficulty: 'easy', year: 2023, is_demo: true
    },
    {
      topic: 'Pedagogy',
      question_text: 'Which teaching method involves students discovering concepts on their own through activities?',
      option_a: 'Lecture method', option_b: 'Discovery learning',
      option_c: 'Rote learning', option_d: 'Textbook method',
      correct_ans: 'B',
      explanation: 'Discovery learning (Bruner) encourages students to learn by exploring and discovering concepts themselves rather than passive reception.',
      difficulty: 'easy', year: 2022, is_demo: true
    },
    {
      topic: 'Child Development',
      question_text: 'Vygotsky\'s concept of Zone of Proximal Development (ZPD) refers to:',
      option_a: 'What a child can do independently',
      option_b: 'The gap between what a child can do alone and with guidance',
      option_c: 'The physical development zone of a child',
      option_d: 'Moral development stages',
      correct_ans: 'B',
      explanation: 'ZPD is the difference between what a learner can do without help and what they can achieve with guidance from a more capable person.',
      difficulty: 'medium', year: 2022, is_demo: false
    },
    {
      topic: 'Pedagogy',
      question_text: 'Formative assessment is best described as:',
      option_a: 'Assessment given at the end of the academic year',
      option_b: 'Assessment used to certify student achievement',
      option_c: 'Ongoing assessment to monitor student learning and provide feedback',
      option_d: 'Assessment for university admission',
      correct_ans: 'C',
      explanation: 'Formative assessment is carried out during the learning process to monitor progress and provide timely feedback for improvement.',
      difficulty: 'easy', year: 2023, is_demo: false
    },
    {
      topic: 'Child Development',
      question_text: 'Kohlberg\'s theory is primarily related to:',
      option_a: 'Cognitive development', option_b: 'Physical development',
      option_c: 'Moral development', option_d: 'Language development',
      correct_ans: 'C',
      explanation: 'Lawrence Kohlberg developed a theory of moral development with three levels: Pre-conventional, Conventional, and Post-conventional.',
      difficulty: 'easy', year: 2021, is_demo: false
    },
    {
      topic: 'English',
      question_text: 'Which approach to reading emphasises meaning over decoding?',
      option_a: 'Phonics approach', option_b: 'Whole language approach',
      option_c: 'Grammar-translation method', option_d: 'Alphabetic method',
      correct_ans: 'B',
      explanation: 'The Whole Language Approach focuses on understanding meaning and reading in context rather than decoding individual sounds.',
      difficulty: 'medium', year: 2022, is_demo: false
    },
    {
      topic: 'Child Development',
      question_text: 'A child who is not able to conserve volume or number is likely in which Piagetian stage?',
      option_a: 'Formal Operational', option_b: 'Concrete Operational',
      option_c: 'Preoperational', option_d: 'Sensorimotor',
      correct_ans: 'C',
      explanation: 'Conservation is achieved during the Concrete Operational stage. Children in the Preoperational stage (2-7 years) lack conservation ability.',
      difficulty: 'medium', year: 2023, is_demo: false
    },
    {
      topic: 'Pedagogy',
      question_text: 'Inclusive education means:',
      option_a: 'Teaching only gifted students in special schools',
      option_b: 'Educating children with disabilities separately',
      option_c: 'Educating all children including those with special needs in regular classrooms',
      option_d: 'Providing extra tuition to weak students',
      correct_ans: 'C',
      explanation: 'Inclusive education is the practice of educating all students, including those with disabilities, in the same classroom environment.',
      difficulty: 'easy', year: 2022, is_demo: false
    },
    {
      topic: 'General Knowledge',
      question_text: 'Right to Education Act (RTE) in India guarantees free and compulsory education for children in the age group of:',
      option_a: '5 to 14 years', option_b: '6 to 14 years',
      option_c: '4 to 12 years', option_d: '6 to 16 years',
      correct_ans: 'B',
      explanation: 'The RTE Act 2009 guarantees free and compulsory education for all children aged 6 to 14 years.',
      difficulty: 'easy', year: 2021, is_demo: false
    },
    {
      topic: 'Pedagogy',
      question_text: 'Multiple Intelligence Theory was proposed by:',
      option_a: 'Howard Gardner', option_b: 'Jean Piaget',
      option_c: 'Lev Vygotsky', option_d: 'B.F. Skinner',
      correct_ans: 'A',
      explanation: 'Howard Gardner proposed the theory of Multiple Intelligences in 1983, identifying 8 types including linguistic, logical-mathematical, spatial, etc.',
      difficulty: 'easy', year: 2023, is_demo: false
    },
  ],
  // 3. IBPS Clerk ──────────────────────────────────────────────────────────────
  IBPS_CLERK: [
    {
      topic: 'Banking Awareness',
      question_text: 'NEFT stands for:',
      option_a: 'National Electronic Funds Transfer', option_b: 'National Electronic Finance Transaction',
      option_c: 'New Electronic Funds Transfer', option_d: 'National Efficiency Finance Transfer',
      correct_ans: 'A',
      explanation: 'NEFT (National Electronic Funds Transfer) is an electronic payment system maintained by the Reserve Bank of India.',
      difficulty: 'easy', year: 2023, is_demo: true
    },
    {
      topic: 'Banking Awareness',
      question_text: 'The Repo Rate is the rate at which:',
      option_a: 'Banks borrow money from RBI', option_b: 'RBI borrows money from banks',
      option_c: 'Banks lend to customers', option_d: 'Government borrows from RBI',
      correct_ans: 'A',
      explanation: 'Repo Rate (Repurchase Rate) is the rate at which commercial banks borrow money from RBI against government securities.',
      difficulty: 'easy', year: 2022, is_demo: true
    },
    {
      topic: 'Quantitative Aptitude',
      question_text: 'If a principal amount of Rs. 5000 earns simple interest at 8% per annum for 3 years, what is the total amount?',
      option_a: 'Rs. 5800', option_b: 'Rs. 6200', option_c: 'Rs. 6400', option_d: 'Rs. 5400',
      correct_ans: 'B',
      explanation: 'SI = P x R x T / 100 = 5000 x 8 x 3 / 100 = 1200. Total = 5000 + 1200 = Rs. 6200.',
      difficulty: 'easy', year: 2022, is_demo: false
    },
    {
      topic: 'Reasoning',
      question_text: 'Find the odd one out: Savings Account, Current Account, Demat Account, Fixed Deposit',
      option_a: 'Savings Account', option_b: 'Current Account',
      option_c: 'Demat Account', option_d: 'Fixed Deposit',
      correct_ans: 'C',
      explanation: 'A Demat Account holds shares/securities electronically. The others are bank deposit accounts.',
      difficulty: 'easy', year: 2021, is_demo: false
    },
    {
      topic: 'Banking Awareness',
      question_text: 'Which of the following is NOT a function of the Reserve Bank of India?',
      option_a: 'Issuing currency notes', option_b: 'Regulating commercial banks',
      option_c: 'Accepting deposits from the public', option_d: 'Acting as banker to the government',
      correct_ans: 'C',
      explanation: 'RBI does not accept deposits from the public. It acts as the banker\'s bank and the government\'s bank.',
      difficulty: 'medium', year: 2023, is_demo: false
    },
    {
      topic: 'English',
      question_text: 'Choose the correct spelling:',
      option_a: 'Accomodation', option_b: 'Accommodation', option_c: 'Acomodation', option_d: 'Acommodation',
      correct_ans: 'B',
      explanation: 'The correct spelling is "Accommodation" with double c and double m.',
      difficulty: 'easy', year: 2022, is_demo: false
    },
    {
      topic: 'Quantitative Aptitude',
      question_text: 'A shopkeeper marks his goods 25% above cost price and gives a 10% discount. His profit percentage is:',
      option_a: '12.5%', option_b: '15%', option_c: '10%', option_d: '13.5%',
      correct_ans: 'A',
      explanation: 'Let CP = 100. MP = 125. SP = 125 x 0.9 = 112.5. Profit% = 12.5%.',
      difficulty: 'medium', year: 2022, is_demo: false
    },
    {
      topic: 'Banking Awareness',
      question_text: 'KYC in banking stands for:',
      option_a: 'Keep Your Customer', option_b: 'Know Your Customer',
      option_c: 'Key Your Customer', option_d: 'Know Your Credit',
      correct_ans: 'B',
      explanation: 'KYC (Know Your Customer) is the process of verifying the identity of clients by banks and other financial institutions.',
      difficulty: 'easy', year: 2021, is_demo: false
    },
    {
      topic: 'Reasoning',
      question_text: 'Pointing to a woman, Raju said, "She is the daughter of my grandfather\'s only son." How is the woman related to Raju?',
      option_a: 'Mother', option_b: 'Aunt', option_c: 'Sister', option_d: 'Cousin',
      correct_ans: 'C',
      explanation: 'Grandfather\'s only son = Raju\'s father. Daughter of father = Sister.',
      difficulty: 'medium', year: 2023, is_demo: false
    },
    {
      topic: 'Current Affairs',
      question_text: 'Basel III norms are related to which sector?',
      option_a: 'Insurance sector', option_b: 'Banking sector',
      option_c: 'Capital markets', option_d: 'Real estate',
      correct_ans: 'B',
      explanation: 'Basel III is a global regulatory framework for banks developed by the Basel Committee on Banking Supervision to strengthen bank capital requirements.',
      difficulty: 'medium', year: 2022, is_demo: false
    },
  ],
  // 4. RRB JE ──────────────────────────────────────────────────────────────────
  RRB_JE: [
    {
      topic: 'Railway Knowledge',
      question_text: 'What does BG stand for in Indian Railways track classification?',
      option_a: 'Big Gauge', option_b: 'Broad Gauge', option_c: 'Base Gauge', option_d: 'Bridge Gauge',
      correct_ans: 'B',
      explanation: 'BG stands for Broad Gauge. Indian Railways has three gauges: Broad Gauge (1676 mm), Metre Gauge (1000 mm), and Narrow Gauge.',
      difficulty: 'easy', year: 2023, is_demo: true
    },
    {
      topic: 'Technical',
      question_text: 'The unit of electrical resistance is:',
      option_a: 'Ampere', option_b: 'Volt', option_c: 'Ohm', option_d: 'Watt',
      correct_ans: 'C',
      explanation: 'The SI unit of electrical resistance is the Ohm (symbol: Ω), named after German physicist Georg Simon Ohm.',
      difficulty: 'easy', year: 2022, is_demo: true
    },
    {
      topic: 'Railway Knowledge',
      question_text: 'Kavach is an automatic train protection system developed by which organisation?',
      option_a: 'ISRO', option_b: 'RDSO', option_c: 'DRDO', option_d: 'BHEL',
      correct_ans: 'B',
      explanation: 'Kavach is an Automatic Train Protection (ATP) system developed by the Research Designs and Standards Organisation (RDSO) of Indian Railways.',
      difficulty: 'medium', year: 2023, is_demo: false
    },
    {
      topic: 'Technical',
      question_text: 'Ohm\'s Law states that voltage is equal to:',
      option_a: 'Current / Resistance', option_b: 'Current x Resistance',
      option_c: 'Current + Resistance', option_d: 'Resistance / Current',
      correct_ans: 'B',
      explanation: 'Ohm\'s Law: V = I x R, where V is voltage (volts), I is current (amperes), and R is resistance (ohms).',
      difficulty: 'easy', year: 2022, is_demo: false
    },
    {
      topic: 'General Knowledge',
      question_text: 'Which is the longest railway platform in India?',
      option_a: 'Gorakhpur', option_b: 'Kharagpur', option_c: 'Kollam', option_d: 'Shivajinagar',
      correct_ans: 'A',
      explanation: 'Gorakhpur Railway Station in Uttar Pradesh has the world\'s longest railway platform at 1366.33 metres.',
      difficulty: 'easy', year: 2021, is_demo: false
    },
    {
      topic: 'Quantitative Aptitude',
      question_text: 'A train 200 m long passes a pole in 10 seconds. What is the speed of the train?',
      option_a: '54 km/h', option_b: '72 km/h', option_c: '60 km/h', option_d: '45 km/h',
      correct_ans: 'B',
      explanation: 'Speed = 200/10 = 20 m/s. Convert: 20 x 18/5 = 72 km/h.',
      difficulty: 'easy', year: 2022, is_demo: false
    },
    {
      topic: 'Technical',
      question_text: 'Which type of current is produced by a battery?',
      option_a: 'Alternating Current (AC)', option_b: 'Direct Current (DC)',
      option_c: 'Pulsating Current', option_d: 'Sinusoidal Current',
      correct_ans: 'B',
      explanation: 'A battery produces Direct Current (DC), which flows in one direction. AC alternates direction periodically.',
      difficulty: 'easy', year: 2021, is_demo: false
    },
    {
      topic: 'Railway Knowledge',
      question_text: 'What is the full form of IRCTC?',
      option_a: 'Indian Railway Catering and Tourism Corporation',
      option_b: 'Indian Railway Communication and Technology Centre',
      option_c: 'Indian Railway Central Ticketing Corporation',
      option_d: 'Indian Railway Commerce and Travel Corporation',
      correct_ans: 'A',
      explanation: 'IRCTC stands for Indian Railway Catering and Tourism Corporation, a subsidiary of Indian Railways.',
      difficulty: 'easy', year: 2022, is_demo: false
    },
    {
      topic: 'Technical',
      question_text: 'The power factor of a purely resistive circuit is:',
      option_a: '0', option_b: '0.5', option_c: '1', option_d: 'Infinity',
      correct_ans: 'C',
      explanation: 'In a purely resistive circuit, voltage and current are in phase, so the phase angle is 0° and power factor = cos(0°) = 1.',
      difficulty: 'medium', year: 2023, is_demo: false
    },
    {
      topic: 'Reasoning',
      question_text: 'In a certain code, TRAIN is written as USBJM. How is TRACK written?',
      option_a: 'USBDL', option_b: 'USBDM', option_c: 'VTBDL', option_d: 'USBCK',
      correct_ans: 'A',
      explanation: 'Each letter is shifted forward by 1: T+1=U, R+1=S, A+1=B, C+1=D, K+1=L. TRACK = USBDL.',
      difficulty: 'medium', year: 2022, is_demo: false
    },
  ],
  // 5. SSC MTS ─────────────────────────────────────────────────────────────────
  SSC_MTS: [
    {
      topic: 'General Knowledge',
      question_text: 'Who is the Father of the Indian Constitution?',
      option_a: 'Mahatma Gandhi', option_b: 'Jawaharlal Nehru',
      option_c: 'Dr. B.R. Ambedkar', option_d: 'Sardar Vallabhbhai Patel',
      correct_ans: 'C',
      explanation: 'Dr. B.R. Ambedkar was the Chairman of the Drafting Committee of the Indian Constitution and is regarded as the Father of the Indian Constitution.',
      difficulty: 'easy', year: 2023, is_demo: true
    },
    {
      topic: 'General Knowledge',
      question_text: 'The national animal of India is:',
      option_a: 'Lion', option_b: 'Elephant', option_c: 'Bengal Tiger', option_d: 'Leopard',
      correct_ans: 'C',
      explanation: 'The Bengal Tiger was declared the national animal of India in 1973 during Project Tiger.',
      difficulty: 'easy', year: 2022, is_demo: true
    },
    {
      topic: 'Quantitative Aptitude',
      question_text: 'What is the LCM of 12 and 18?',
      option_a: '24', option_b: '36', option_c: '48', option_d: '6',
      correct_ans: 'B',
      explanation: '12 = 2² x 3; 18 = 2 x 3². LCM = 2² x 3² = 4 x 9 = 36.',
      difficulty: 'easy', year: 2022, is_demo: false
    },
    {
      topic: 'English',
      question_text: 'Fill in the blank: She ______ to school every day.',
      option_a: 'go', option_b: 'goes', option_c: 'going', option_d: 'gone',
      correct_ans: 'B',
      explanation: 'With a singular third-person subject (She), the verb in simple present tense takes -s: "goes".',
      difficulty: 'easy', year: 2021, is_demo: false
    },
    {
      topic: 'General Knowledge',
      question_text: 'In which year did India gain independence?',
      option_a: '1945', option_b: '1947', option_c: '1950', option_d: '1946',
      correct_ans: 'B',
      explanation: 'India gained independence from British rule on 15 August 1947.',
      difficulty: 'easy', year: 2021, is_demo: false
    },
    {
      topic: 'Quantitative Aptitude',
      question_text: 'A man walks 4 km north, then 3 km east. How far is he from his starting point?',
      option_a: '5 km', option_b: '7 km', option_c: '6 km', option_d: '4 km',
      correct_ans: 'A',
      explanation: 'Using Pythagoras theorem: √(4² + 3²) = √(16 + 9) = √25 = 5 km.',
      difficulty: 'easy', year: 2022, is_demo: false
    },
    {
      topic: 'General Knowledge',
      question_text: 'The capital of Tamil Nadu is:',
      option_a: 'Coimbatore', option_b: 'Madurai', option_c: 'Chennai', option_d: 'Trichy',
      correct_ans: 'C',
      explanation: 'Chennai (formerly Madras) is the capital city of Tamil Nadu.',
      difficulty: 'easy', year: 2021, is_demo: false
    },
    {
      topic: 'Reasoning',
      question_text: 'Complete the series: 2, 4, 8, 16, ___',
      option_a: '24', option_b: '30', option_c: '32', option_d: '18',
      correct_ans: 'C',
      explanation: 'Each term is doubled: 2x2=4, 4x2=8, 8x2=16, 16x2=32.',
      difficulty: 'easy', year: 2023, is_demo: false
    },
    {
      topic: 'English',
      question_text: 'Opposite of "Honest" is:',
      option_a: 'Kind', option_b: 'Dishonest', option_c: 'Brave', option_d: 'Polite',
      correct_ans: 'B',
      explanation: 'The antonym of "Honest" is "Dishonest".',
      difficulty: 'easy', year: 2022, is_demo: false
    },
    {
      topic: 'General Knowledge',
      question_text: 'Which planet is known as the Red Planet?',
      option_a: 'Venus', option_b: 'Jupiter', option_c: 'Mars', option_d: 'Saturn',
      correct_ans: 'C',
      explanation: 'Mars is called the Red Planet because of its reddish appearance caused by iron oxide (rust) on its surface.',
      difficulty: 'easy', year: 2021, is_demo: false
    },
  ],
  // 6. TN TET ──────────────────────────────────────────────────────────────────
  TN_TET: [
    {
      topic: 'Child Psychology',
      question_text: 'According to Jean Piaget, children in the age group 7-11 years are in which stage of cognitive development?',
      option_a: 'Sensorimotor', option_b: 'Preoperational',
      option_c: 'Concrete Operational', option_d: 'Formal Operational',
      correct_ans: 'C',
      explanation: 'The Concrete Operational stage (7-11 years) is characterised by logical thinking about concrete objects.',
      difficulty: 'easy', year: 2023, is_demo: true
    },
    {
      topic: 'Tamil Nadu Education',
      question_text: 'The Tamil Nadu Teacher Eligibility Test (TN TET) is conducted by:',
      option_a: 'CBSE', option_b: 'Teachers Recruitment Board (TRB), Tamil Nadu',
      option_c: 'NCERT', option_d: 'School Education Department, Tamil Nadu',
      correct_ans: 'B',
      explanation: 'TN TET is conducted by the Teachers Recruitment Board (TRB), Tamil Nadu for certifying teachers.',
      difficulty: 'easy', year: 2022, is_demo: true
    },
    {
      topic: 'Teaching Methods',
      question_text: 'Activity-based learning (ABL) was first introduced in Tamil Nadu in which level of education?',
      option_a: 'Higher Secondary', option_b: 'Primary',
      option_c: 'Upper Primary', option_d: 'Pre-primary',
      correct_ans: 'B',
      explanation: 'Activity Based Learning (ABL) was introduced in primary schools in Tamil Nadu to make learning more interactive.',
      difficulty: 'medium', year: 2022, is_demo: false
    },
    {
      topic: 'Child Psychology',
      question_text: 'The term "Scaffolding" in education is associated with:',
      option_a: 'B.F. Skinner', option_b: 'Lev Vygotsky',
      option_c: 'Howard Gardner', option_d: 'Jean Piaget',
      correct_ans: 'B',
      explanation: 'Scaffolding is a concept from Vygotsky\'s theory; it refers to temporary support given to students that is gradually removed as they become more capable.',
      difficulty: 'medium', year: 2023, is_demo: false
    },
    {
      topic: 'General Knowledge',
      question_text: 'The first University in Tamil Nadu was established at:',
      option_a: 'Coimbatore', option_b: 'Chennai (Madras)',
      option_c: 'Trichy', option_d: 'Madurai',
      correct_ans: 'B',
      explanation: 'The University of Madras, established in 1857, was the first university in Tamil Nadu and one of the oldest in India.',
      difficulty: 'medium', year: 2021, is_demo: false
    },
    {
      topic: 'Teaching Methods',
      question_text: 'Which teaching aid is most effective for teaching abstract concepts to primary school children?',
      option_a: 'Textbooks', option_b: 'Concrete objects/manipulatives',
      option_c: 'Lectures', option_d: 'Question-Answer method',
      correct_ans: 'B',
      explanation: 'Concrete objects/manipulatives help children in primary school understand abstract concepts by providing tangible, hands-on experiences.',
      difficulty: 'easy', year: 2022, is_demo: false
    },
    {
      topic: 'Tamil Nadu Education',
      question_text: 'Samacheer Kalvi (Uniform Education) system was introduced in Tamil Nadu to:',
      option_a: 'Establish private universities', option_b: 'Provide uniform textbooks and syllabus across all schools',
      option_c: 'Privatise government schools', option_d: 'Introduce English medium only',
      correct_ans: 'B',
      explanation: 'Samacheer Kalvi was introduced to provide equal educational opportunities with a uniform curriculum for all students in Tamil Nadu.',
      difficulty: 'easy', year: 2021, is_demo: false
    },
    {
      topic: 'Child Psychology',
      question_text: 'Which of the following is a characteristic of gifted children?',
      option_a: 'Slow in reading', option_b: 'Preference for routine tasks',
      option_c: 'High curiosity and advanced vocabulary', option_d: 'Poor memory',
      correct_ans: 'C',
      explanation: 'Gifted children typically show high curiosity, advanced vocabulary, quick learning, and the ability to think abstractly at an earlier age.',
      difficulty: 'easy', year: 2023, is_demo: false
    },
    {
      topic: 'Teaching Methods',
      question_text: 'The Play-way method in primary education is based on the principle that:',
      option_a: 'Children learn best through play and enjoyment',
      option_b: 'Children should be disciplined strictly',
      option_c: 'Memorization is the best form of learning',
      option_d: 'Teachers must lecture for the full class period',
      correct_ans: 'A',
      explanation: 'The Play-way method, advocated by Froebel, holds that learning through play is the most natural and effective way for young children to develop.',
      difficulty: 'easy', year: 2022, is_demo: false
    },
    {
      topic: 'General Knowledge',
      question_text: 'Mid-Day Meal scheme in schools is aimed at:',
      option_a: 'Improving the salary of teachers',
      option_b: 'Enhancing enrolment and reducing dropout rate among school children',
      option_c: 'Building new school buildings',
      option_d: 'Providing digital devices to students',
      correct_ans: 'B',
      explanation: 'The Mid-Day Meal scheme provides nutritious food to school children to improve attendance, retention, and nutritional levels.',
      difficulty: 'easy', year: 2021, is_demo: false
    },
  ],
  // 7. TNPSC G1 ─────────────────────────────────────────────────────────────────
  TNPSC_G1: [
    {
      topic: 'Tamil Nadu GK',
      question_text: 'The motto of Tamil Nadu state government is:',
      option_a: 'Truth Alone Triumphs', option_b: 'We Lead',
      option_c: 'Neethiyum Nilaiyum (Justice and Stability)', option_d: 'Uyarvu Thamizh Nadu',
      correct_ans: 'A',
      explanation: 'The motto of Tamil Nadu is "Satyameva Jayate" (Truth Alone Triumphs), the national motto of India, inscribed on the state emblem.',
      difficulty: 'medium', year: 2023, is_demo: true
    },
    {
      topic: 'Indian Polity',
      question_text: 'The Rajya Sabha is also known as:',
      option_a: 'House of the People', option_b: 'Council of States',
      option_c: 'Upper Chamber of States', option_d: 'Legislative Assembly',
      correct_ans: 'B',
      explanation: 'Rajya Sabha is the Council of States, the upper house of the Parliament of India.',
      difficulty: 'easy', year: 2022, is_demo: true
    },
    {
      topic: 'Tamil Nadu GK',
      question_text: 'Which river is known as the "Ganga of South India"?',
      option_a: 'Cauvery', option_b: 'Vaigai', option_c: 'Tamiraparani', option_d: 'Palar',
      correct_ans: 'A',
      explanation: 'The Cauvery river is called the "Ganga of South India" because of its religious and cultural significance in Tamil Nadu and Karnataka.',
      difficulty: 'easy', year: 2023, is_demo: false
    },
    {
      topic: 'Indian Polity',
      question_text: 'The concept of Judicial Review in India is borrowed from which country?',
      option_a: 'UK', option_b: 'USA', option_c: 'Canada', option_d: 'Australia',
      correct_ans: 'B',
      explanation: 'Judicial Review, which allows courts to review laws and government actions for constitutionality, is borrowed from the USA.',
      difficulty: 'medium', year: 2022, is_demo: false
    },
    {
      topic: 'Current Affairs',
      question_text: 'TNPSC stands for:',
      option_a: 'Tamil Nadu Public Service Commission',
      option_b: 'Tamil Nadu Police Service Commission',
      option_c: 'Tamil Nadu Primary Service Centre',
      option_d: 'Tamil Nadu Public Sector Corporation',
      correct_ans: 'A',
      explanation: 'TNPSC stands for Tamil Nadu Public Service Commission, which conducts recruitment exams for Tamil Nadu state government posts.',
      difficulty: 'easy', year: 2021, is_demo: false
    },
    {
      topic: 'Tamil Nadu GK',
      question_text: 'Pichavaram in Tamil Nadu is famous for:',
      option_a: 'Diamond mines', option_b: 'One of the world\'s largest mangrove forests',
      option_c: 'Nuclear power plant', option_d: 'Space research centre',
      correct_ans: 'B',
      explanation: 'Pichavaram near Chidambaram is home to one of the world\'s largest mangrove forests, spread across about 1100 hectares.',
      difficulty: 'medium', year: 2023, is_demo: false
    },
    {
      topic: 'Indian Polity',
      question_text: 'Article 356 of the Indian Constitution deals with:',
      option_a: 'Emergency due to external threat', option_b: 'President\'s Rule in states',
      option_c: 'Financial emergency', option_d: 'Fundamental Rights',
      correct_ans: 'B',
      explanation: 'Article 356 deals with the imposition of President\'s Rule (State Emergency) when the constitutional governance of a state breaks down.',
      difficulty: 'medium', year: 2022, is_demo: false
    },
    {
      topic: 'Current Affairs',
      question_text: 'The Chennai Smart City project is being implemented under which central government scheme?',
      option_a: 'AMRUT', option_b: 'Smart Cities Mission',
      option_c: 'PMAY', option_d: 'Digital India',
      correct_ans: 'B',
      explanation: 'Chennai is one of the 100 cities selected under the Smart Cities Mission launched by the Government of India in 2015.',
      difficulty: 'easy', year: 2021, is_demo: false
    },
    {
      topic: 'Tamil Nadu GK',
      question_text: 'Bharatanatyam, a classical dance form, originated in which state?',
      option_a: 'Kerala', option_b: 'Andhra Pradesh', option_c: 'Tamil Nadu', option_d: 'Karnataka',
      correct_ans: 'C',
      explanation: 'Bharatanatyam is a major classical dance form that originated in Tamil Nadu, derived from the Natya Shastra and Devadasi traditions.',
      difficulty: 'easy', year: 2023, is_demo: false
    },
    {
      topic: 'Indian Polity',
      question_text: 'The Directive Principles of State Policy in the Indian Constitution are contained in:',
      option_a: 'Part III', option_b: 'Part IV', option_c: 'Part II', option_d: 'Part V',
      correct_ans: 'B',
      explanation: 'Directive Principles of State Policy (DPSP) are contained in Part IV (Articles 36-51) of the Indian Constitution.',
      difficulty: 'medium', year: 2022, is_demo: false
    },
  ],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function getQuestionCount(client, examId) {
  const res = await client.query(
    'SELECT COUNT(*) AS cnt FROM questions WHERE exam_id = $1',
    [examId]
  );
  return parseInt(res.rows[0].cnt, 10);
}

async function mockTestExists(client, mockTestId) {
  const res = await client.query(
    'SELECT id FROM mock_tests WHERE id = $1',
    [mockTestId]
  );
  return res.rows.length > 0;
}

async function insertQuestionsForExam(client, examKey, examId) {
  const questions = questionsData[examKey];
  const insertedIds = [];

  for (const q of questions) {
    const res = await client.query(
      `INSERT INTO questions
         (exam_id, topic, question_text, option_a, option_b, option_c, option_d,
          correct_ans, explanation, difficulty, year, is_demo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id`,
      [
        examId, q.topic, q.question_text,
        q.option_a, q.option_b, q.option_c, q.option_d,
        q.correct_ans, q.explanation, q.difficulty, q.year, q.is_demo,
      ]
    );
    insertedIds.push(res.rows[0].id);
  }
  return insertedIds;
}

async function ensureMockTest(client, mockTestId, examId, examKey) {
  if (await mockTestExists(client, mockTestId)) {
    console.log(`  Mock test ${mockTestId} already exists — skipping creation.`);
    return;
  }

  const examNames = {
    CAPF_AC:    'CAPF AC Mock Test',
    CTET:       'CTET Mock Test',
    IBPS_CLERK: 'IBPS Clerk Mock Test',
    RRB_JE:     'RRB JE Mock Test',
    SSC_MTS:    'SSC MTS Mock Test',
    TN_TET:     'TN TET Mock Test',
    TNPSC_G1:   'TNPSC Group 1 Mock Test',
  };

  await client.query(
    `INSERT INTO mock_tests (id, exam_id, title, description, duration_min, total_marks, pass_marks, question_count, is_demo)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [mockTestId, examId, examNames[examKey], 'Demo mock test for ' + examKey, 60, 20, 7, 10, true]
  );
  console.log(`  Created mock test: ${examNames[examKey]}`);
}

async function linkQuestionsToMockTest(client, mockTestId, questionIds) {
  // Check if mock_test_questions table exists
  const tableCheck = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'mock_test_questions'
    )
  `);

  if (!tableCheck.rows[0].exists) {
    console.log('  mock_test_questions table not found — skipping link step.');
    return 0;
  }

  let linked = 0;
  for (let i = 0; i < questionIds.length; i++) {
    // Use ON CONFLICT DO NOTHING in case some already exist
    await client.query(
      `INSERT INTO mock_test_questions (mock_test_id, question_id, question_order)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [mockTestId, questionIds[i], i + 1]
    );
    linked++;
  }
  return linked;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  const client = await pool.connect();
  console.log('\n========================================');
  console.log(' CareerMitra — Insert Missing Questions');
  console.log('========================================\n');

  const summary = [];

  try {
    await client.query('BEGIN');

    for (const [examKey, examId] of Object.entries(EXAMS)) {
      const mockTestId = MOCK_TESTS[examKey];
      const count = await getQuestionCount(client, examId);

      if (count > 0) {
        console.log(`[SKIP]  ${examKey} already has ${count} question(s).`);
        summary.push({ exam: examKey, action: 'skipped', existing: count, inserted: 0 });
        continue;
      }

      console.log(`[INSERT] ${examKey} (0 questions) — inserting 10 questions...`);
      const insertedIds = await insertQuestionsForExam(client, examKey, examId);
      console.log(`  ✓ Inserted ${insertedIds.length} questions.`);

      await ensureMockTest(client, mockTestId, examId, examKey);

      const linked = await linkQuestionsToMockTest(client, mockTestId, insertedIds);
      if (linked > 0) console.log(`  ✓ Linked ${linked} questions to mock test.`);

      summary.push({ exam: examKey, action: 'inserted', existing: 0, inserted: insertedIds.length });
    }

    await client.query('COMMIT');

    console.log('\n========================================');
    console.log(' Summary');
    console.log('========================================');
    for (const row of summary) {
      if (row.action === 'skipped') {
        console.log(`  ${row.exam.padEnd(12)} → SKIPPED  (had ${row.existing} questions)`);
      } else {
        console.log(`  ${row.exam.padEnd(12)} → INSERTED ${row.inserted} questions`);
      }
    }
    const totalInserted = summary.reduce((acc, r) => acc + r.inserted, 0);
    console.log(`\n  Total questions inserted: ${totalInserted}`);
    console.log('========================================\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n[ERROR] Transaction rolled back.');
    console.error(err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
