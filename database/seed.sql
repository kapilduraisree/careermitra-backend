-- ============================================================
-- CareerMitra AI — Demo / Sample Seed Data
-- All records marked is_demo = TRUE
-- Run AFTER schema.sql
-- ============================================================

-- ── Skills ────────────────────────────────────────────────────────────────────
INSERT INTO skills (name, category) VALUES
  ('SQL',                   'analytics'),
  ('Python',                'programming'),
  ('Excel',                 'analytics'),
  ('Power BI',              'analytics'),
  ('Tableau',               'analytics'),
  ('Java',                  'programming'),
  ('JavaScript',            'programming'),
  ('React',                 'programming'),
  ('Node.js',               'programming'),
  ('Machine Learning',      'ai_ml'),
  ('Data Analysis',         'analytics'),
  ('Communication',         'soft_skill'),
  ('Problem Solving',       'soft_skill'),
  ('C',                     'programming'),
  ('C++',                   'programming'),
  ('General Knowledge',     'exam'),
  ('Quantitative Aptitude', 'exam'),
  ('Reasoning',             'exam'),
  ('English',               'exam')
ON CONFLICT (name) DO NOTHING;

-- ── Companies (Demo) ─────────────────────────────────────────────────────────
INSERT INTO companies (id, name, industry, size, website, is_verified) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Staff Selection Commission',    'Government',           'large',    'https://ssc.nic.in',              TRUE),
  ('a2000000-0000-0000-0000-000000000002', 'UPSC',                          'Government',           'large',    'https://upsc.gov.in',             TRUE),
  ('a3000000-0000-0000-0000-000000000003', 'TNPSC',                         'Government',           'large',    'https://tnpsc.gov.in',            TRUE),
  ('a4000000-0000-0000-0000-000000000004', 'State Bank of India',           'Banking',              'large',    'https://sbi.co.in',               TRUE),
  ('a5000000-0000-0000-0000-000000000005', 'Indian Railways',               'Transport',            'large',    'https://indianrailways.gov.in',   TRUE),
  ('a6000000-0000-0000-0000-000000000006', 'Infosys',                       'Information Technology','large',   'https://infosys.com',             TRUE),
  ('a7000000-0000-0000-0000-000000000007', 'TCS',                           'Information Technology','large',   'https://tcs.com',                 TRUE),
  ('a8000000-0000-0000-0000-000000000008', 'Wipro',                         'Information Technology','large',   'https://wipro.com',               TRUE),
  ('a9000000-0000-0000-0000-000000000009', 'ABC Technologies (Demo)',       'Information Technology','mid-size','https://example.com',             FALSE),
  ('aa000000-0000-0000-0000-00000000000a', 'XYZ Analytics (Demo)',          'Analytics',            'startup',  'https://example.com',             FALSE)
ON CONFLICT DO NOTHING;

-- ── Government Jobs (Demo) ────────────────────────────────────────────────────
INSERT INTO jobs (
  id, title, company_id, job_type, category, description,
  qualification, experience_required, age_limit_min, age_limit_max,
  salary_display, location, vacancy_count, application_fee,
  selection_process, application_start, application_end,
  notification_url, apply_url, is_demo, is_active
) VALUES
(
  'b1000000-0000-0000-0000-000000000001',
  'SSC CGL 2024 — Combined Graduate Level',
  'a1000000-0000-0000-0000-000000000001',
  'government', 'SSC',
  '[DEMO] Staff Selection Commission CGL 2024. Posts: Assistant Audit Officer, Income Tax Inspector, Sub Inspector CBI, etc. This is sample data for demonstration.',
  'Bachelor''s Degree in any discipline from a recognized university',
  'fresher', 18, 32,
  '₹25,500 – ₹1,51,100', 'Pan India', 17727,
  '₹100 (General) | Free for SC/ST/Women/ESM',
  'Tier-I (Online CBT) → Tier-II (Online CBT) → Document Verification',
  '2024-09-14', '2024-10-14',
  'https://ssc.nic.in', 'https://ssc.nic.in',
  TRUE, TRUE
),
(
  'b2000000-0000-0000-0000-000000000002',
  'SBI Clerk (Junior Associates) 2024',
  'a4000000-0000-0000-0000-000000000004',
  'government', 'Banking',
  '[DEMO] State Bank of India — Junior Associates (Customer Support & Sales). Sample data for demonstration.',
  'Graduation in any discipline from a recognised university',
  'fresher', 20, 28,
  '₹17,900 – ₹47,920', 'All India', 13735,
  '₹750 (General/OBC/EWS) | Free for SC/ST/PWD/XS',
  'Preliminary Exam → Main Exam → Local Language Test',
  '2024-11-01', '2024-11-21',
  'https://sbi.co.in', 'https://sbi.co.in',
  TRUE, TRUE
),
(
  'b3000000-0000-0000-0000-000000000003',
  'TNPSC Group 2 2024 — Combined Civil Services',
  'a3000000-0000-0000-0000-000000000003',
  'government', 'TNPSC',
  '[DEMO] Tamil Nadu Public Service Commission - Group II Services. Posts: Assistant Section Officer, Revenue Inspector, etc. Sample data.',
  'Graduation from a recognized university',
  'fresher', 18, 37,
  '₹36,900 – ₹1,16,600', 'Tamil Nadu', 5529,
  '₹150 (BC/MBC/DNC/SC/SCA/ST: ₹75)',
  'Preliminary Exam (OMR) → Main Exam (Written) → Interview',
  '2024-10-01', '2024-10-31',
  'https://tnpsc.gov.in', 'https://tnpsc.gov.in',
  TRUE, TRUE
),
(
  'b4000000-0000-0000-0000-000000000004',
  'RRB NTPC 2024 — Non-Technical Popular Categories',
  'a5000000-0000-0000-0000-000000000005',
  'government', 'Railway',
  '[DEMO] Railway Recruitment Board — NTPC posts: Junior Clerk, Accounts Clerk, Station Master. Sample data for demonstration.',
  'Graduation for Graduate posts | 12th Pass for Undergraduate posts',
  'fresher', 18, 36,
  '₹19,900 – ₹35,400', 'Pan India', 11558,
  '₹500 (General/OBC/EWS) | ₹250 (SC/ST/EBC/Female/Trans)',
  'CBT Stage-1 → CBT Stage-2 → Skill/Typing Test → Document Verification',
  '2024-09-01', '2024-09-30',
  'https://indianrailways.gov.in', 'https://indianrailways.gov.in',
  TRUE, TRUE
)
ON CONFLICT DO NOTHING;

-- ── Private Jobs (Demo) ───────────────────────────────────────────────────────
INSERT INTO jobs (
  id, title, company_id, job_type, category, description,
  qualification, experience_required, salary_display, location,
  notification_url, apply_url, is_demo, is_active
) VALUES
(
  'b5000000-0000-0000-0000-000000000005',
  'Data Analyst',
  'aa000000-0000-0000-0000-00000000000a',
  'private', 'Analytics',
  '[DEMO] XYZ Analytics — Data Analyst role. Responsibilities: analyze datasets, build Power BI dashboards, write SQL queries, collaborate with business stakeholders.',
  'B.E./B.Tech/BCA/B.Sc (CS/IT/Math/Statistics)',
  'fresher',
  '₹3.5 – ₹6 LPA', 'Chennai / Hybrid',
  'https://example.com/careers', 'https://example.com/apply',
  TRUE, TRUE
),
(
  'b6000000-0000-0000-0000-000000000006',
  'Software Developer — Java Backend',
  'a7000000-0000-0000-0000-000000000007',
  'private', 'IT',
  '[DEMO] TCS — Java backend developer role for Chennai and Hyderabad centers. Sample data for demonstration.',
  'B.E./B.Tech in CS/IT/ECE or MCA',
  'fresher',
  '₹3.36 – ₹7 LPA', 'Chennai / Hyderabad / Bangalore',
  'https://tcs.com/careers', 'https://tcs.com/careers',
  TRUE, TRUE
),
(
  'b7000000-0000-0000-0000-000000000007',
  'AI/ML Engineer',
  'a6000000-0000-0000-0000-000000000006',
  'private', 'AI/ML',
  '[DEMO] Infosys — AI/ML Engineer for cutting-edge machine learning projects. Sample data.',
  'B.E./B.Tech/M.Tech in CS/IT with ML knowledge',
  '1-2 years',
  '₹6 – ₹12 LPA', 'Bangalore / Pune / Hybrid',
  'https://infosys.com/careers', 'https://infosys.com/careers',
  TRUE, TRUE
)
ON CONFLICT DO NOTHING;

-- ── Internships (Demo) ────────────────────────────────────────────────────────
INSERT INTO jobs (
  id, title, company_id, job_type, category, description,
  qualification, experience_required, salary_display, location,
  application_end, notification_url, apply_url, is_demo, is_active
) VALUES
(
  'b8000000-0000-0000-0000-000000000008',
  'Data Science Intern',
  'a9000000-0000-0000-0000-000000000009',
  'internship', 'Analytics',
  '[DEMO] ABC Technologies — 3-month Data Science internship. Work on real datasets, build ML models under mentorship.',
  '3rd or 4th year B.Tech/BCA/B.Sc students',
  'fresher',
  '₹10,000 – ₹15,000/month', 'Chennai / Remote',
  '2024-12-31',
  'https://example.com', 'https://example.com',
  TRUE, TRUE
),
(
  'b9000000-0000-0000-0000-000000000009',
  'Frontend Developer Intern',
  'a9000000-0000-0000-0000-000000000009',
  'internship', 'IT',
  '[DEMO] 6-month frontend development internship. Work with React, build production-ready UI components.',
  'Any CS/IT undergraduate student',
  'fresher',
  '₹8,000 – ₹12,000/month', 'Bangalore / Remote',
  '2024-12-31',
  'https://example.com', 'https://example.com',
  TRUE, TRUE
)
ON CONFLICT DO NOTHING;

-- ── Job Skills mapping ────────────────────────────────────────────────────────
INSERT INTO job_skills (job_id, skill_id, is_must)
SELECT 'b5000000-0000-0000-0000-000000000005', id, TRUE
FROM skills WHERE name IN ('SQL','Python','Excel','Power BI')
ON CONFLICT DO NOTHING;

INSERT INTO job_skills (job_id, skill_id, is_must)
SELECT 'b5000000-0000-0000-0000-000000000005', id, FALSE
FROM skills WHERE name = 'Tableau'
ON CONFLICT DO NOTHING;

INSERT INTO job_skills (job_id, skill_id, is_must)
SELECT 'b6000000-0000-0000-0000-000000000006', id, TRUE
FROM skills WHERE name IN ('Java','Problem Solving')
ON CONFLICT DO NOTHING;

INSERT INTO job_skills (job_id, skill_id, is_must)
SELECT 'b7000000-0000-0000-0000-000000000007', id, TRUE
FROM skills WHERE name IN ('Python','Machine Learning')
ON CONFLICT DO NOTHING;

INSERT INTO job_skills (job_id, skill_id, is_must)
SELECT 'b8000000-0000-0000-0000-000000000008', id, TRUE
FROM skills WHERE name IN ('Python','SQL','Machine Learning')
ON CONFLICT DO NOTHING;

-- ── Exams (Demo) ──────────────────────────────────────────────────────────────
INSERT INTO exams (id, name, short_name, category, conducting_body, description, official_url, is_demo) VALUES
(
  'c1000000-0000-0000-0000-000000000001',
  'SSC CGL — Combined Graduate Level', 'SSC CGL', 'SSC',
  'Staff Selection Commission',
  '[DEMO] SSC CGL — recruitment to Group B and Group C posts in various Ministries/Departments of the Government of India. Sample data.',
  'https://ssc.nic.in', TRUE
),
(
  'c2000000-0000-0000-0000-000000000002',
  'TNPSC Group 2 — Combined Civil Services', 'TNPSC G2', 'TNPSC',
  'Tamil Nadu Public Service Commission',
  '[DEMO] TNPSC Group 2 — most sought-after government exam in Tamil Nadu. Includes interview and non-interview posts. Sample data.',
  'https://tnpsc.gov.in', TRUE
),
(
  'c3000000-0000-0000-0000-000000000003',
  'SBI Clerk — Junior Associates', 'SBI Clerk', 'Banking',
  'State Bank of India',
  '[DEMO] SBI Clerk recruitment — Preliminary and Main examinations. Sample data for demonstration.',
  'https://sbi.co.in', TRUE
),
(
  'c4000000-0000-0000-0000-000000000004',
  'UPSC Civil Services Examination', 'UPSC CSE', 'UPSC',
  'Union Public Service Commission',
  '[DEMO] UPSC CSE — IAS, IPS, IFS and All India Services recruitment. Most prestigious exam in India. Sample data.',
  'https://upsc.gov.in', TRUE
)
ON CONFLICT DO NOTHING;

-- ── Subjects ──────────────────────────────────────────────────────────────────
INSERT INTO subjects (exam_id, name, weightage, order_index) VALUES
('c1000000-0000-0000-0000-000000000001', 'Quantitative Aptitude',              25, 1),
('c1000000-0000-0000-0000-000000000001', 'General Intelligence & Reasoning',   25, 2),
('c1000000-0000-0000-0000-000000000001', 'English Language',                   25, 3),
('c1000000-0000-0000-0000-000000000001', 'General Awareness',                  25, 4),
('c2000000-0000-0000-0000-000000000002', 'General Studies',                    60, 1),
('c2000000-0000-0000-0000-000000000002', 'Aptitude & Mental Ability',          20, 2),
('c2000000-0000-0000-0000-000000000002', 'Tamil/English',                      20, 3),
('c3000000-0000-0000-0000-000000000003', 'English Language',                   30, 1),
('c3000000-0000-0000-0000-000000000003', 'Reasoning Ability',                  35, 2),
('c3000000-0000-0000-0000-000000000003', 'Numerical Ability',                  35, 3),
('c4000000-0000-0000-0000-000000000004', 'General Studies Paper I',           NULL, 1),
('c4000000-0000-0000-0000-000000000004', 'General Studies Paper II (CSAT)',   NULL, 2),
('c4000000-0000-0000-0000-000000000004', 'General Studies Paper III',         NULL, 3),
('c4000000-0000-0000-0000-000000000004', 'General Studies Paper IV (Ethics)', NULL, 4)
ON CONFLICT DO NOTHING;

-- ── Study Materials (Demo) ────────────────────────────────────────────────────
INSERT INTO study_materials (exam_id, title, content_type, content_text, is_demo)
SELECT id,
  'SSC CGL Complete Syllabus Overview',
  'article',
  '[DEMO CONTENT] Tier-I (60 min, 100 marks): QA 25q, Reasoning 25q, English 25q, GK 25q. Tier-II: Paper I Math+Reasoning, Paper II English. Always verify at ssc.nic.in.',
  TRUE
FROM exams WHERE id = 'c1000000-0000-0000-0000-000000000001';

INSERT INTO study_materials (exam_id, title, content_type, content_text, is_demo)
SELECT id,
  'TNPSC Group 2 — 3-Month Study Plan',
  'article',
  '[DEMO CONTENT] Month 1: Tamil/History/Geography. Month 2: Science/Economics/Polity. Month 3: Current Affairs + PYQ. Resources: Samacheer Kalvi books, monthly GK magazine.',
  TRUE
FROM exams WHERE id = 'c2000000-0000-0000-0000-000000000002';

INSERT INTO study_materials (exam_id, title, content_type, content_text, is_demo)
SELECT id,
  'SBI Clerk Prelims — Quick Strategy',
  'article',
  '[DEMO CONTENT] English (30q/20min): Focus on RC, Cloze Test. Reasoning (35q/20min): Puzzle, Seating. Numerical (35q/20min): Simplification, Number Series.',
  TRUE
FROM exams WHERE id = 'c3000000-0000-0000-0000-000000000003';

-- ── Questions (Demo — SSC CGL) ─────────────────────────────────────────────
INSERT INTO questions
  (exam_id, topic, question_text, option_a, option_b, option_c, option_d, correct_ans, explanation, difficulty, is_demo)
VALUES
(
  'c1000000-0000-0000-0000-000000000001',
  'Number System',
  '[DEMO] What is the LCM of 12, 15, and 20?',
  '30','60','120','180','B',
  'LCM(12,15,20): 12=2²×3, 15=3×5, 20=2²×5. LCM = 2²×3×5 = 60.',
  'easy', TRUE
),
(
  'c1000000-0000-0000-0000-000000000001',
  'Percentage',
  '[DEMO] A product is sold at 20% profit. Cost price is ₹250. Find the selling price.',
  '₹270','₹280','₹290','₹300','D',
  'SP = CP × (1 + 0.20) = 250 × 1.20 = ₹300.',
  'easy', TRUE
),
(
  'c1000000-0000-0000-0000-000000000001',
  'Algebra',
  '[DEMO] If x + y = 10 and xy = 21, what is (x – y)?',
  '2','4','6','8','B',
  '(x-y)² = (x+y)² - 4xy = 100 - 84 = 16. (x-y) = 4.',
  'medium', TRUE
),
(
  'c1000000-0000-0000-0000-000000000001',
  'Reasoning',
  '[DEMO] Odd one out: 2, 3, 5, 7, 9, 11',
  '9','7','11','3','A',
  '9 = 3×3 is composite. All others (2,3,5,7,11) are prime numbers.',
  'easy', TRUE
),
(
  'c1000000-0000-0000-0000-000000000001',
  'General Awareness',
  '[DEMO] Which Article of the Indian Constitution abolishes untouchability?',
  'Article 14','Article 15','Article 17','Article 19','C',
  'Article 17 abolishes untouchability and forbids its practice in any form.',
  'easy', TRUE
),
(
  'c1000000-0000-0000-0000-000000000001',
  'English',
  '[DEMO] Choose the correct synonym of "Benevolent".',
  'Cruel','Generous','Strict','Indifferent','B',
  'Benevolent means well-meaning and kindly. Generous is the closest synonym.',
  'easy', TRUE
),
(
  'c1000000-0000-0000-0000-000000000001',
  'Number System',
  '[DEMO] Average of 5 consecutive even numbers is 14. Find the largest.',
  '16','18','20','22','B',
  'Middle number = 14. Consecutive even: 10,12,14,16,18. Largest = 18.',
  'medium', TRUE
),
(
  'c1000000-0000-0000-0000-000000000001',
  'General Awareness',
  '[DEMO] Which planet is known as the Red Planet?',
  'Venus','Jupiter','Mars','Saturn','C',
  'Mars appears red due to iron oxide (rust) on its surface.',
  'easy', TRUE
),
(
  'c1000000-0000-0000-0000-000000000001',
  'Percentage',
  '[DEMO] A number increased by 25% then decreased by 20%. Net change?',
  '0%','+5%','-5%','+10%','A',
  '1.25 × 0.80 = 1.00. Net change = 0%.',
  'medium', TRUE
),
(
  'c1000000-0000-0000-0000-000000000001',
  'Reasoning',
  '[DEMO] ABCD is coded as BCDE. How is MNOP coded?',
  'NOPQ','LMNO','MNOP','OPQR','A',
  'Each letter is shifted forward by 1. M→N, N→O, O→P, P→Q = NOPQ.',
  'easy', TRUE
);

-- ── Mock Test (Demo) ──────────────────────────────────────────────────────────
INSERT INTO mock_tests (id, exam_id, title, description, duration_min, total_marks, pass_marks, question_count, is_demo)
VALUES (
  'd1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000001',
  'SSC CGL Demo Test — Tier I (10 Questions)',
  '[DEMO] A short 10-question practice test. Real SSC CGL Tier I has 100 questions in 60 minutes.',
  15, 20, 7, 10, TRUE
)
ON CONFLICT DO NOTHING;

-- Link all demo questions to the mock test
INSERT INTO mock_test_questions (test_id, question_id, order_index, marks)
SELECT
  'd1000000-0000-0000-0000-000000000001',
  id,
  (ROW_NUMBER() OVER (ORDER BY created_at))::int - 1,
  2
FROM questions
WHERE exam_id = 'c1000000-0000-0000-0000-000000000001'
  AND is_demo = TRUE
ON CONFLICT DO NOTHING;

-- ── Achievements ──────────────────────────────────────────────────────────────
INSERT INTO achievements (key, title, description, icon, xp_value, category) VALUES
('first_login',         'Welcome to CareerMitra!',    'Logged in for the first time',          '🎉', 10,  'onboarding'),
('profile_complete',    'Profile Complete',            'Filled all profile sections',           '👤', 25,  'onboarding'),
('first_job_saved',     'Job Hunter',                  'Saved your first job',                  '🔖', 15,  'jobs'),
('first_application',   'First Application',           'Applied to your first job',             '💼', 30,  'jobs'),
('first_test',          'Test Taker',                  'Completed your first mock test',        '📝', 20,  'exams'),
('hundred_questions',   '100 Questions Solved',        'Answered 100 practice questions',       '🏆', 50,  'exams'),
('perfect_score',       'Perfect Score!',              'Scored 100% in a mock test',            '⭐', 100, 'exams'),
('first_ai_chat',       'AI Conversation Started',     'First chat with AI Mentor',             '🤖', 10,  'ai'),
('roadmap_created',     'Roadmap Set',                 'Created your first career roadmap',     '🗺', 25,  'ai'),
('streak_7',            '7-Day Streak',                '7 consecutive days of learning',        '🔥', 50,  'streak'),
('streak_30',           '30-Day Streak',               '30 consecutive days of learning',       '🔥', 200, 'streak'),
('resume_uploaded',     'Resume Ready',                'Uploaded and analyzed your resume',     '📄', 30,  'profile'),
('first_interview',     'Interview Brave',             'Completed your first mock interview',   '🎤', 40,  'ai'),
('skills_5',            '5 Skills Added',              'Added 5 skills to your profile',        '🛠', 20,  'profile'),
('skill_roadmap_done',  'Roadmap Complete',            'Completed all steps in a roadmap',      '🎯', 100, 'ai')
ON CONFLICT (key) DO NOTHING;

-- ── Videos (Demo — YouTube search queries, NOT fabricated direct URLs) ────────
INSERT INTO videos (title, channel, platform, url, topic, description, is_verified, is_demo) VALUES
(
  'SQL Tutorial for Beginners — Full Course',
  'Programming with Mosh', 'youtube',
  'https://www.youtube.com/results?search_query=SQL+tutorial+beginners+full+course',
  'SQL',
  '[DEMO] Search on YouTube. SQL from basics to advanced — JOINs, subqueries, indexes.',
  FALSE, TRUE
),
(
  'Python Pandas for Data Analysis',
  'Data School', 'youtube',
  'https://www.youtube.com/results?search_query=python+pandas+data+analysis+tutorial',
  'Python',
  '[DEMO] Pandas — Series, DataFrames, data cleaning, groupby operations.',
  FALSE, TRUE
),
(
  'SSC CGL 2024 Complete Preparation Strategy',
  'Coaching Channel', 'youtube',
  'https://www.youtube.com/results?search_query=SSC+CGL+2024+preparation+strategy+complete',
  'SSC',
  '[DEMO] Study plan, time management, topic-wise strategy for SSC CGL.',
  FALSE, TRUE
),
(
  'Power BI Full Course for Beginners',
  'BI Tutorial', 'youtube',
  'https://www.youtube.com/results?search_query=power+bi+full+course+beginners+2024',
  'Power BI',
  '[DEMO] Create interactive dashboards and reports in Power BI.',
  FALSE, TRUE
),
(
  'How to Crack a Technical Interview',
  'Tech Career Guide', 'youtube',
  'https://www.youtube.com/results?search_query=how+to+crack+technical+interview+tips+2024',
  'Interview Prep',
  '[DEMO] Preparation tips, common questions, and coding round strategies.',
  FALSE, TRUE
)
ON CONFLICT DO NOTHING;

-- ── Demo Admin User ────────────────────────────────────────────────────────────
-- Password: Admin@1234
-- Hash generated with bcryptjs (12 rounds)
INSERT INTO users (id, name, email, password_hash, role, is_active)
VALUES (
  'e1000000-0000-0000-0000-000000000001',
  'CareerMitra Admin',
  'admin@careermitra.demo',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGya.Nd6/PFE1S0hKiHqzZ.WcRe',
  'admin',
  TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO profiles (user_id, qualification, experience_level)
VALUES ('e1000000-0000-0000-0000-000000000001', 'Admin', '5+ years')
ON CONFLICT DO NOTHING;

INSERT INTO user_stats (user_id)
VALUES ('e1000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO notification_preferences (user_id)
VALUES ('e1000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- ── Final summary ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  RAISE NOTICE '=============================================';
  RAISE NOTICE '  CareerMitra AI — Demo Seed Complete';
  RAISE NOTICE '=============================================';
  RAISE NOTICE 'Jobs        : 9 (4 Govt + 3 Private + 2 Intern)';
  RAISE NOTICE 'Exams       : 4 (SSC, TNPSC, Banking, UPSC)';
  RAISE NOTICE 'Questions   : 10 (SSC CGL style)';
  RAISE NOTICE 'Mock Tests  : 1';
  RAISE NOTICE 'Skills      : 19';
  RAISE NOTICE 'Videos      : 5 (YouTube search queries)';
  RAISE NOTICE 'Achievements: 15';
  RAISE NOTICE 'Admin login : admin@careermitra.demo / Admin@1234';
  RAISE NOTICE 'ALL records : is_demo = TRUE';
  RAISE NOTICE 'WARNING     : Change admin password before deploying!';
  RAISE NOTICE '=============================================';
END;
$$;
