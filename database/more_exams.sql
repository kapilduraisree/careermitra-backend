-- ============================================================
-- CareerMitra AI — Additional Government Exams
-- Run: node -e "require('./scripts/add_exams')" in Railway Console
-- ============================================================

-- ── More Exams ────────────────────────────────────────────────────────────────
INSERT INTO exams (id, name, short_name, category, conducting_body, description, official_url, is_demo) VALUES
(
  'c5000000-0000-0000-0000-000000000005',
  'RRB JE — Railway Junior Engineer', 'RRB JE', 'Railway',
  'Railway Recruitment Board',
  '[DEMO] RRB JE is conducted for recruitment of Junior Engineers in various departments of Indian Railways. Requires B.E./B.Tech in relevant engineering discipline.',
  'https://indianrailways.gov.in', TRUE
),
(
  'c6000000-0000-0000-0000-000000000006',
  'IBPS PO — Probationary Officer', 'IBPS PO', 'Banking',
  'Institute of Banking Personnel Selection',
  '[DEMO] IBPS PO recruitment for Probationary Officers in various public sector banks across India. One of the most popular banking exams.',
  'https://ibps.in', TRUE
),
(
  'c7000000-0000-0000-0000-000000000007',
  'IBPS Clerk', 'IBPS Clerk', 'Banking',
  'Institute of Banking Personnel Selection',
  '[DEMO] IBPS Clerk exam for recruitment of clerks in participating public sector banks. Includes Preliminary and Main examinations.',
  'https://ibps.in', TRUE
),
(
  'c8000000-0000-0000-0000-000000000008',
  'CDS — Combined Defence Services', 'CDS', 'Defence',
  'Union Public Service Commission',
  '[DEMO] UPSC CDS exam for recruitment into Indian Military Academy, Naval Academy, Air Force Academy, and Officers Training Academy.',
  'https://upsc.gov.in', TRUE
),
(
  'c9000000-0000-0000-0000-000000000009',
  'NDA — National Defence Academy', 'NDA', 'Defence',
  'Union Public Service Commission',
  '[DEMO] UPSC NDA exam for admission to Army, Navy and Air Force wings of National Defence Academy. For 12th passed students.',
  'https://upsc.gov.in', TRUE
),
(
  'ca000000-0000-0000-0000-00000000000a',
  'CTET — Central Teacher Eligibility Test', 'CTET', 'Teaching',
  'Central Board of Secondary Education',
  '[DEMO] CTET is mandatory for teaching positions in Central Government schools (KVS, NVS). Paper 1 for Classes 1-5, Paper 2 for Classes 6-8.',
  'https://ctet.nic.in', TRUE
),
(
  'cb000000-0000-0000-0000-00000000000b',
  'TET Tamil Nadu — Teacher Eligibility Test', 'TN TET', 'Teaching',
  'Teachers Recruitment Board Tamil Nadu',
  '[DEMO] Tamil Nadu TET is required for teaching positions in Tamil Nadu government schools. Conducted by Teachers Recruitment Board.',
  'https://trb.tn.gov.in', TRUE
),
(
  'cc000000-0000-0000-0000-00000000000c',
  'SSC CHSL — Combined Higher Secondary Level', 'SSC CHSL', 'SSC',
  'Staff Selection Commission',
  '[DEMO] SSC CHSL for recruitment to posts like LDC, JSA, PA, SA in various Central Government departments. Requires 12th pass qualification.',
  'https://ssc.nic.in', TRUE
),
(
  'cd000000-0000-0000-0000-00000000000d',
  'SSC MTS — Multi Tasking Staff', 'SSC MTS', 'SSC',
  'Staff Selection Commission',
  '[DEMO] SSC MTS for recruitment of Multi Tasking Staff (Non-Technical) in various government offices. 10th pass qualification required.',
  'https://ssc.nic.in', TRUE
),
(
  'ce000000-0000-0000-0000-00000000000e',
  'TNPSC Group 4', 'TNPSC G4', 'TNPSC',
  'Tamil Nadu Public Service Commission',
  '[DEMO] TNPSC Group 4 for various clerical posts in Tamil Nadu government departments. Large number of vacancies announced regularly.',
  'https://tnpsc.gov.in', TRUE
),
(
  'cf000000-0000-0000-0000-00000000000f',
  'TNPSC Group 1', 'TNPSC G1', 'TNPSC',
  'Tamil Nadu Public Service Commission',
  '[DEMO] TNPSC Group 1 for Deputy Collector, DSP, AO and other prestigious posts in Tamil Nadu. Highly competitive exam.',
  'https://tnpsc.gov.in', TRUE
),
(
  'd0000000-0000-0000-0000-000000000001',
  'CAPF AC — Central Armed Police Forces', 'CAPF AC', 'Defence',
  'Union Public Service Commission',
  '[DEMO] UPSC CAPF for Assistant Commandant in BSF, CRPF, CISF, ITBP and SSB. Graduation required.',
  'https://upsc.gov.in', TRUE
)
ON CONFLICT DO NOTHING;

-- ── Subjects for new exams ────────────────────────────────────────────────────
INSERT INTO subjects (exam_id, name, weightage, order_index) VALUES
-- RRB JE
('c5000000-0000-0000-0000-000000000005', 'Mathematics',          25, 1),
('c5000000-0000-0000-0000-000000000005', 'General Intelligence', 25, 2),
('c5000000-0000-0000-0000-000000000005', 'General Awareness',    15, 3),
('c5000000-0000-0000-0000-000000000005', 'General Science',      30, 4),
('c5000000-0000-0000-0000-000000000005', 'Technical Subjects',   NULL, 5),
-- IBPS PO
('c6000000-0000-0000-0000-000000000006', 'English Language',        20, 1),
('c6000000-0000-0000-0000-000000000006', 'Quantitative Aptitude',   20, 2),
('c6000000-0000-0000-0000-000000000006', 'Reasoning Ability',       20, 3),
('c6000000-0000-0000-0000-000000000006', 'General/Economy/Banking Awareness', 40, 4),
-- CDS
('c8000000-0000-0000-0000-000000000008', 'English',        100, 1),
('c8000000-0000-0000-0000-000000000008', 'General Knowledge', 120, 2),
('c8000000-0000-0000-0000-000000000008', 'Elementary Mathematics', 100, 3),
-- CTET
('ca000000-0000-0000-0000-00000000000a', 'Child Development & Pedagogy', 30, 1),
('ca000000-0000-0000-0000-00000000000a', 'Language I',         30, 2),
('ca000000-0000-0000-0000-00000000000a', 'Language II',        30, 3),
('ca000000-0000-0000-0000-00000000000a', 'Mathematics',        30, 4),
('ca000000-0000-0000-0000-00000000000a', 'Environmental Studies', 30, 5),
-- SSC CHSL
('cc000000-0000-0000-0000-00000000000c', 'Quantitative Aptitude', 25, 1),
('cc000000-0000-0000-0000-00000000000c', 'English Language',      25, 2),
('cc000000-0000-0000-0000-00000000000c', 'General Intelligence',  25, 3),
('cc000000-0000-0000-0000-00000000000c', 'General Awareness',     25, 4),
-- TNPSC Group 4
('ce000000-0000-0000-0000-00000000000e', 'General Tamil/English', 40, 1),
('ce000000-0000-0000-0000-00000000000e', 'General Studies',       100, 2),
('ce000000-0000-0000-0000-00000000000e', 'Aptitude & Mental Ability', 10, 3)
ON CONFLICT DO NOTHING;

-- ── Study materials for new exams ─────────────────────────────────────────────
INSERT INTO study_materials (exam_id, title, content_type, content_text, is_demo)
VALUES
(
  'c6000000-0000-0000-0000-000000000006',
  'IBPS PO Complete Preparation Guide',
  'article',
  '[DEMO] Prelims (100 marks, 60 min): English 30q, Reasoning 35q, Quant 35q. Main (200 marks): Reasoning+CS 45q, English 35q, Data Analysis 35q, GK 40q, English Letter Writing 2q. Key: Practice speed and accuracy daily.',
  TRUE
),
(
  'cc000000-0000-0000-0000-00000000000c',
  'SSC CHSL Strategy — Tier 1 & Tier 2',
  'article',
  '[DEMO] Tier-1 (Online CBT, 60 min, 100 marks): 4 sections 25 marks each. Tier-2 (Paper 1 + Paper 2): Writing skills tested. Focus: English grammar, Reasoning puzzles, Basic Maths, Current Affairs. Previous papers are key!',
  TRUE
),
(
  'ca000000-0000-0000-0000-00000000000a',
  'CTET Paper 1 & Paper 2 — Preparation Tips',
  'article',
  '[DEMO] CTET validity is lifetime. Paper 1 (Primary): CDP, Language 1&2, Maths, EVS. Paper 2 (Upper Primary): CDP, Language 1&2, Maths+Science OR Social Studies. Focus on NCF 2005 and child psychology concepts.',
  TRUE
)
ON CONFLICT DO NOTHING;

SELECT COUNT(*) AS total_exams FROM exams;
SELECT name, category FROM exams ORDER BY category, name;
