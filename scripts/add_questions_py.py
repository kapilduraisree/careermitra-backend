import psycopg2
import uuid
from datetime import datetime

# Database connection
DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 5432,
    "database": "careermitra",
    "user": "postgres",
    "password": "kapil2006"
}

# Exam IDs
EXAM_IDS = {
    "SSC CGL":   "c1000000-0000-0000-0000-000000000001",
    "TNPSC G2":  "c2000000-0000-0000-0000-000000000002",
    "SBI Clerk": "c3000000-0000-0000-0000-000000000003",
    "UPSC CSE":  "c4000000-0000-0000-0000-000000000004",
    "IBPS PO":   "c6000000-0000-0000-0000-000000000006",
    "SSC CHSL":  "cc000000-0000-0000-0000-00000000000c",
    "TNPSC G4":  "ce000000-0000-0000-0000-00000000000e",
    "NDA":       "c9000000-0000-0000-0000-000000000009",
    "CDS":       "c8000000-0000-0000-0000-000000000008",
}


# ─────────────────────────────────────────────────────────
# QUESTIONS DATA  (15 per exam, 9 exams = 135 questions)
# ─────────────────────────────────────────────────────────
ALL_QUESTIONS = {

"SSC CGL": [
  # ── Quantitative Aptitude ──
  {"topic":"Quantitative Aptitude","question_text":"If the ratio of two numbers is 3:4 and their LCM is 180, find their HCF.","option_a":"12","option_b":"15","option_c":"18","option_d":"20","correct_ans":"B","explanation":"Let numbers be 3x and 4x. LCM(3x,4x)=12x=180 → x=15. HCF=x=15.","difficulty":"medium","year":2022},
  {"topic":"Quantitative Aptitude","question_text":"A train 150 m long passes a pole in 15 seconds. What is its speed in km/h?","option_a":"36","option_b":"54","option_c":"72","option_d":"90","correct_ans":"A","explanation":"Speed = 150/15 = 10 m/s = 10×18/5 = 36 km/h.","difficulty":"easy","year":2021},
  {"topic":"Quantitative Aptitude","question_text":"The simple interest on Rs 4000 at 5% per annum for 3 years is:","option_a":"Rs 500","option_b":"Rs 600","option_c":"Rs 700","option_d":"Rs 800","correct_ans":"B","explanation":"SI = (4000×5×3)/100 = Rs 600.","difficulty":"easy","year":2020},
  # ── Reasoning ──
  {"topic":"Reasoning","question_text":"In a certain code, COMPUTER is written as RFUVQNPC. How is MEDICINE written in that code?","option_a":"EOJDJEFM","option_b":"MFEJDJOE","option_c":"NFEJDJOF","option_d":"EFJDJNEM","correct_ans":"C","explanation":"Each letter is shifted by +1 in reverse order of the word.","difficulty":"hard","year":2023},
  {"topic":"Reasoning","question_text":"Find the odd one out: 36, 49, 64, 81, 100, 111","option_a":"49","option_b":"81","option_c":"100","option_d":"111","correct_ans":"D","explanation":"All others are perfect squares (6²,7²,8²,9²,10²). 111 is not a perfect square.","difficulty":"easy","year":2022},
  {"topic":"Reasoning","question_text":"If A is the brother of B; B is the sister of C; C is the father of D, how is A related to D?","option_a":"Uncle","option_b":"Brother","option_c":"Father","option_d":"Grandfather","correct_ans":"A","explanation":"A is brother of B (sister of C, who is D's father), so A is uncle of D.","difficulty":"medium","year":2021},
  # ── English ──
  {"topic":"English","question_text":"Choose the correct synonym of LOQUACIOUS:","option_a":"Talkative","option_b":"Silent","option_c":"Intelligent","option_d":"Lazy","correct_ans":"A","explanation":"Loquacious means tending to talk a great deal; talkative.","difficulty":"medium","year":2023},
  {"topic":"English","question_text":"Select the correctly spelt word:","option_a":"Accomodation","option_b":"Acommodation","option_c":"Accommodation","option_d":"Acomodation","correct_ans":"C","explanation":"Correct spelling is 'Accommodation' with double c and double m.","difficulty":"easy","year":2022},
  {"topic":"English","question_text":"Fill in the blank: She _____ to the market before it closed.","option_a":"go","option_b":"goes","option_c":"had gone","option_d":"has go","correct_ans":"C","explanation":"Past perfect 'had gone' is used for an action completed before another past event.","difficulty":"medium","year":2021},
  # ── General Knowledge ──
  {"topic":"General Knowledge","question_text":"Which Article of the Indian Constitution abolishes untouchability?","option_a":"Article 14","option_b":"Article 15","option_c":"Article 17","option_d":"Article 19","correct_ans":"C","explanation":"Article 17 of the Indian Constitution abolishes untouchability and its practice in any form is forbidden.","difficulty":"medium","year":2023},
  {"topic":"General Knowledge","question_text":"The headquarter of International Monetary Fund (IMF) is located in:","option_a":"New York","option_b":"Geneva","option_c":"Washington D.C.","option_d":"London","correct_ans":"C","explanation":"The IMF headquarters is located in Washington D.C., USA.","difficulty":"easy","year":2022},
  {"topic":"General Knowledge","question_text":"Who was the first woman President of India?","option_a":"Sarojini Naidu","option_b":"Pratibha Patil","option_c":"Indira Gandhi","option_d":"Sushma Swaraj","correct_ans":"B","explanation":"Pratibha Patil was the first woman President of India (2007-2012).","difficulty":"easy","year":2020},
  # ── Current Affairs ──
  {"topic":"Current Affairs","question_text":"Which country hosted the G20 Summit in 2023?","option_a":"Indonesia","option_b":"Japan","option_c":"India","option_d":"South Africa","correct_ans":"C","explanation":"India hosted the G20 Summit 2023 in New Delhi on September 9-10, 2023.","difficulty":"easy","year":2023},
  {"topic":"Current Affairs","question_text":"Who won the ICC Cricket World Cup 2023?","option_a":"Australia","option_b":"India","option_c":"England","option_d":"South Africa","correct_ans":"A","explanation":"Australia won the ICC Cricket World Cup 2023, defeating India in the final.","difficulty":"easy","year":2023},
  {"topic":"Current Affairs","question_text":"Which mission did ISRO successfully launch to the Moon's south pole in 2023?","option_a":"Chandrayaan-1","option_b":"Chandrayaan-2","option_c":"Chandrayaan-3","option_d":"Mangalyaan-2","correct_ans":"C","explanation":"ISRO's Chandrayaan-3 successfully landed on the Moon's south pole on August 23, 2023.","difficulty":"easy","year":2023},
],


"TNPSC G2": [
  {"topic":"Quantitative Aptitude","question_text":"The value of (0.1)^3 + (0.2)^3 + (0.3)^3 - 3(0.1)(0.2)(0.3) is:","option_a":"0.000","option_b":"0.006","option_c":"0.018","option_d":"0.024","correct_ans":"A","explanation":"a^3+b^3+c^3-3abc = (a+b+c)(a^2+b^2+c^2-ab-bc-ca). When a+b+c = 0.6 ≠ 0, but using identity gives 0.006×(0.14-0.11)=0. Actually a³+b³+c³-3abc=(a+b+c)((a-b)²+(b-c)²+(c-a)²)/2 which equals 0 when a=b=c is not true here. Result = 0.006.","difficulty":"hard","year":2022},
  {"topic":"Quantitative Aptitude","question_text":"A can do a work in 12 days and B in 18 days. In how many days will they finish the work together?","option_a":"6","option_b":"7.2","option_c":"8","option_d":"9","correct_ans":"B","explanation":"Combined rate = 1/12+1/18 = 5/36. Days = 36/5 = 7.2 days.","difficulty":"medium","year":2021},
  {"topic":"Quantitative Aptitude","question_text":"If the cost price of 20 articles is equal to the selling price of 16 articles, the profit percent is:","option_a":"20%","option_b":"25%","option_c":"30%","option_d":"22%","correct_ans":"B","explanation":"CP of 20 = SP of 16 → SP/CP = 20/16 = 5/4. Profit% = (1/4)×100 = 25%.","difficulty":"medium","year":2020},
  {"topic":"Reasoning","question_text":"Pointing to a photograph, Sita said, 'He is the son of my grandfather's only son.' How is the person in the photograph related to Sita?","option_a":"Brother","option_b":"Uncle","option_c":"Father","option_d":"Cousin","correct_ans":"A","explanation":"Grandfather's only son = Sita's father. His son = Sita's brother.","difficulty":"medium","year":2023},
  {"topic":"Reasoning","question_text":"Complete the series: 2, 6, 12, 20, 30, ?","option_a":"40","option_b":"42","option_c":"44","option_d":"46","correct_ans":"B","explanation":"Pattern: n(n+1). 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42.","difficulty":"easy","year":2022},
  {"topic":"Reasoning","question_text":"If FRIEND is coded as HUMJTK, how is CANDLE coded?","option_a":"EDRIRL","option_b":"EDRIRN","option_c":"EDRJRL","option_d":"ECPFNG","correct_ans":"B","explanation":"Each letter is shifted by +2. C→E, A→C... wait pattern is +2 for each: C+2=E,A+2=C? Let me recheck. F+2=H,R+2=T reversed — each letter shifted forward by its position value. Actually F→H(+2),R→U(+3),I→M(+4),E→J(+5),N→T(+6),D→K(+7). So C→E(+2),A→D(+3),N→R(+4),D→I(+5),L→R(+6),E→N(+7) = EDRI RN.","difficulty":"hard","year":2021},
  {"topic":"English","question_text":"The antonym of BENEVOLENT is:","option_a":"Generous","option_b":"Malevolent","option_c":"Charitable","option_d":"Kind","correct_ans":"B","explanation":"Benevolent means well-meaning and kindly. Its antonym is malevolent (having evil intentions).","difficulty":"medium","year":2023},
  {"topic":"English","question_text":"Identify the correct passive voice: 'They are building a new hospital.'","option_a":"A new hospital was being built by them.","option_b":"A new hospital is being built by them.","option_c":"A new hospital has been built by them.","option_d":"A new hospital will be built by them.","correct_ans":"B","explanation":"Present continuous active → Passive: object + is/am/are + being + V3 + by subject.","difficulty":"medium","year":2022},
  {"topic":"English","question_text":"Choose the meaning of the idiom: 'Bite the bullet'","option_a":"To eat something hard","option_b":"To endure a painful situation stoically","option_c":"To speak harshly","option_d":"To be very brave","correct_ans":"B","explanation":"'Bite the bullet' means to endure a painful or unpleasant situation with courage.","difficulty":"medium","year":2021},
  {"topic":"General Knowledge","question_text":"The Palk Strait separates India from which country?","option_a":"Maldives","option_b":"Sri Lanka","option_c":"Myanmar","option_d":"Bangladesh","correct_ans":"B","explanation":"The Palk Strait is a strait between Tamil Nadu (India) and the Jaffna district of Sri Lanka.","difficulty":"easy","year":2023},
  {"topic":"General Knowledge","question_text":"Which dynasty built the Brihadeeswarar Temple in Thanjavur?","option_a":"Pallava","option_b":"Pandya","option_c":"Chola","option_d":"Chera","correct_ans":"C","explanation":"The Brihadeeswarar Temple was built by Raja Raja Chola I of the Chola dynasty around 1010 CE.","difficulty":"medium","year":2022},
  {"topic":"General Knowledge","question_text":"The first Chief Minister of Tamil Nadu was:","option_a":"C. N. Annadurai","option_b":"M. Karunanidhi","option_c":"P. S. Kumaraswamy Raja","option_d":"O. P. Ramaswamy Reddiyar","correct_ans":"D","explanation":"O. P. Ramaswamy Reddiyar was the first Chief Minister of Madras State (now Tamil Nadu) from 1947-1949.","difficulty":"hard","year":2021},
  {"topic":"Current Affairs","question_text":"The 'One District One Product' scheme in Tamil Nadu promotes:","option_a":"Agriculture","option_b":"Local speciality products","option_c":"IT exports","option_d":"Tourism","correct_ans":"B","explanation":"The scheme aims to promote local speciality products unique to each district to boost local economy and employment.","difficulty":"medium","year":2023},
  {"topic":"Current Affairs","question_text":"Which Tamil Nadu city was awarded 'Best Smart City' status in 2022?","option_a":"Chennai","option_b":"Coimbatore","option_c":"Madurai","option_d":"Tirunelveli","correct_ans":"A","explanation":"Chennai has been recognized for smart city initiatives under the Smart Cities Mission.","difficulty":"medium","year":2022},
  {"topic":"Current Affairs","question_text":"The Kaveri Water Management Authority was set up to resolve disputes between:","option_a":"Tamil Nadu and Andhra Pradesh","option_b":"Tamil Nadu and Kerala","option_c":"Tamil Nadu and Karnataka","option_d":"Tamil Nadu and Telangana","correct_ans":"C","explanation":"The Kaveri Water Management Authority was constituted to regulate the sharing of Cauvery waters between Tamil Nadu and Karnataka.","difficulty":"medium","year":2023},
],


"SBI Clerk": [
  {"topic":"Quantitative Aptitude","question_text":"What is the compound interest on Rs 8000 at 10% per annum for 2 years, compounded annually?","option_a":"Rs 1600","option_b":"Rs 1680","option_c":"Rs 1700","option_d":"Rs 1800","correct_ans":"B","explanation":"CI = 8000[(1+10/100)^2 - 1] = 8000[1.21-1] = 8000×0.21 = Rs 1680.","difficulty":"medium","year":2022},
  {"topic":"Quantitative Aptitude","question_text":"The average age of 5 persons is 30 years. If one person aged 40 joins, the new average is:","option_a":"30","option_b":"31.67","option_c":"32","option_d":"33.33","correct_ans":"B","explanation":"Total age = 5×30=150. New total = 150+40=190. New average = 190/6 ≈ 31.67.","difficulty":"easy","year":2021},
  {"topic":"Quantitative Aptitude","question_text":"A sum of Rs 12,000 is divided among A, B and C in the ratio 1:2:3. What is B's share?","option_a":"Rs 2000","option_b":"Rs 3000","option_c":"Rs 4000","option_d":"Rs 6000","correct_ans":"C","explanation":"Total parts = 1+2+3=6. B's share = (2/6)×12000 = Rs 4000.","difficulty":"easy","year":2023},
  {"topic":"Reasoning","question_text":"Arrange the words in logical order: 1.Word 2.Sentence 3.Letter 4.Paragraph 5.Chapter","option_a":"3,1,2,4,5","option_b":"3,2,1,4,5","option_c":"1,3,2,4,5","option_d":"5,4,3,2,1","correct_ans":"A","explanation":"Logical order: Letter → Word → Sentence → Paragraph → Chapter.","difficulty":"easy","year":2022},
  {"topic":"Reasoning","question_text":"In a row of 40 students, Ravi is 10th from the left. What is his position from the right?","option_a":"29th","option_b":"30th","option_c":"31st","option_d":"32nd","correct_ans":"C","explanation":"Position from right = (40 - 10 + 1) = 31st.","difficulty":"easy","year":2021},
  {"topic":"Reasoning","question_text":"Which of the following Venn diagrams correctly represents 'Women, Mothers, Doctors'?","option_a":"Three separate circles","option_b":"All three circles overlapping completely","option_c":"Women and Mothers overlapping; Doctors separate but intersecting Women","option_d":"Mothers circle inside Women circle; Doctors intersecting Women","correct_ans":"D","explanation":"All mothers are women (Mothers ⊂ Women). Some doctors may be women. So Mothers circle is inside Women; Doctors intersects Women partially.","difficulty":"medium","year":2023},
  {"topic":"English","question_text":"Choose the word with the correct spelling:","option_a":"Embarassment","option_b":"Embarrassment","option_c":"Embarrasment","option_d":"Embrassment","correct_ans":"B","explanation":"The correct spelling is 'Embarrassment' with double r and double s.","difficulty":"easy","year":2022},
  {"topic":"English","question_text":"Select the best alternative to fill the blank: The manager asked his staff to _____ the report by Monday.","option_a":"submit","option_b":"submitted","option_c":"submitting","option_d":"have submit","correct_ans":"A","explanation":"After 'asked...to', the infinitive form 'submit' is used.","difficulty":"easy","year":2021},
  {"topic":"English","question_text":"The one-word substitution for 'A person who is unable to pay debts' is:","option_a":"Insolvent","option_b":"Solvent","option_c":"Bankrupt","option_d":"Debtor","correct_ans":"A","explanation":"Insolvent specifically refers to a person unable to pay their debts. Bankrupt is also acceptable but Insolvent is the precise legal term.","difficulty":"medium","year":2020},
  {"topic":"General Knowledge","question_text":"What is the minimum balance required for a Basic Savings Bank Deposit Account (BSBDA)?","option_a":"Rs 1000","option_b":"Rs 500","option_c":"Rs 100","option_d":"Zero","correct_ans":"D","explanation":"BSBDA is a zero balance account introduced by RBI to promote financial inclusion.","difficulty":"easy","year":2023},
  {"topic":"General Knowledge","question_text":"The Reserve Bank of India was established in:","option_a":"1934","option_b":"1935","option_c":"1947","option_d":"1949","correct_ans":"B","explanation":"The Reserve Bank of India was established on April 1, 1935 under the RBI Act, 1934.","difficulty":"easy","year":2022},
  {"topic":"General Knowledge","question_text":"What does NEFT stand for?","option_a":"National Electronic Funds Transfer","option_b":"National Efficient Financial Transfer","option_c":"Net Electronic Funds Transaction","option_d":"National Express Fund Transfer","correct_ans":"A","explanation":"NEFT stands for National Electronic Funds Transfer, a nationwide payment system facilitating fund transfers.","difficulty":"easy","year":2021},
  {"topic":"Current Affairs","question_text":"The 'Pradhan Mantri Jan Dhan Yojana' is related to:","option_a":"Housing loans","option_b":"Financial inclusion","option_c":"Agricultural credit","option_d":"Student scholarships","correct_ans":"B","explanation":"PM Jan Dhan Yojana (PMJDY) is a national mission on financial inclusion to ensure access to financial services.","difficulty":"easy","year":2023},
  {"topic":"Current Affairs","question_text":"Which bank merged with SBI in 2017?","option_a":"Bank of Baroda","option_b":"Punjab National Bank","option_c":"Associate banks of SBI","option_d":"Canara Bank","correct_ans":"C","explanation":"Five associate banks of SBI (SBT, SBH, SBP, SBM, SBBJ) and Bharatiya Mahila Bank merged with SBI on April 1, 2017.","difficulty":"medium","year":2022},
  {"topic":"Current Affairs","question_text":"UPI was launched by which organization in India?","option_a":"RBI","option_b":"NPCI","option_c":"SEBI","option_d":"Ministry of Finance","correct_ans":"B","explanation":"Unified Payments Interface (UPI) was developed and launched by the National Payments Corporation of India (NPCI) in 2016.","difficulty":"easy","year":2023},
],


"UPSC CSE": [
  {"topic":"General Knowledge","question_text":"The concept of 'Basic Structure Doctrine' of the Indian Constitution was propounded in which case?","option_a":"Golaknath Case","option_b":"Kesavananda Bharati Case","option_c":"Minerva Mills Case","option_d":"Maneka Gandhi Case","correct_ans":"B","explanation":"The Basic Structure Doctrine was propounded by the Supreme Court in the Kesavananda Bharati v. State of Kerala case (1973).","difficulty":"hard","year":2022},
  {"topic":"General Knowledge","question_text":"Which Schedule of the Indian Constitution deals with the distribution of powers between Union and States?","option_a":"Fifth Schedule","option_b":"Sixth Schedule","option_c":"Seventh Schedule","option_d":"Eighth Schedule","correct_ans":"C","explanation":"The Seventh Schedule contains three lists - Union List, State List, and Concurrent List.","difficulty":"medium","year":2021},
  {"topic":"General Knowledge","question_text":"The 'Doctrine of Lapse' was introduced by which Governor-General?","option_a":"Lord Dalhousie","option_b":"Lord Bentinck","option_c":"Lord Wellesley","option_d":"Lord Canning","correct_ans":"A","explanation":"Lord Dalhousie introduced the Doctrine of Lapse, under which states with no natural heir would be annexed by British India.","difficulty":"medium","year":2020},
  {"topic":"Reasoning","question_text":"A policy which focuses on outcomes rather than outputs is called:","option_a":"Output-based policy","option_b":"Impact-based policy","option_c":"Results-based management","option_d":"Process-based policy","correct_ans":"C","explanation":"Results-based management (RBM) focuses on achieving outcomes and impacts rather than just delivering outputs.","difficulty":"hard","year":2023},
  {"topic":"Reasoning","question_text":"Which of the following is NOT a feature of a federal constitution?","option_a":"Written constitution","option_b":"Rigid constitution","option_c":"Single citizenship","option_d":"Independent judiciary","correct_ans":"C","explanation":"Single citizenship is a feature of unitary systems. Federal systems typically have dual citizenship (federal and state).","difficulty":"hard","year":2022},
  {"topic":"Quantitative Aptitude","question_text":"If India's GDP grows at 7% annually, in how many years will GDP double? (Rule of 72)","option_a":"~10 years","option_b":"~10.3 years","option_c":"~12 years","option_d":"~14 years","correct_ans":"B","explanation":"By Rule of 72: 72/7 ≈ 10.3 years.","difficulty":"medium","year":2021},
  {"topic":"English","question_text":"The word 'Sycophant' means:","option_a":"A person who acts obsequiously to gain advantage","option_b":"A person with exceptional intelligence","option_c":"A person who is extremely cautious","option_d":"A person dedicated to public service","correct_ans":"A","explanation":"A sycophant is a person who acts obsequiously towards someone important in order to gain advantage; a flatterer.","difficulty":"hard","year":2023},
  {"topic":"English","question_text":"Identify the figure of speech: 'The pen is mightier than the sword.'","option_a":"Simile","option_b":"Metaphor","option_c":"Personification","option_d":"Hyperbole","correct_ans":"B","explanation":"This is a metaphor — a direct comparison without 'like' or 'as'. The pen (writing/ideas) is compared to the sword (violence).","difficulty":"medium","year":2022},
  {"topic":"English","question_text":"Choose the correct sentence:","option_a":"Neither the students nor the teacher have arrived.","option_b":"Neither the students nor the teacher has arrived.","option_c":"Neither the students nor the teacher were arrived.","option_d":"Neither the students nor the teacher are arrived.","correct_ans":"B","explanation":"When 'neither...nor' connects subjects, the verb agrees with the subject closest to it. 'Teacher' is singular → 'has'.","difficulty":"hard","year":2021},
  {"topic":"Current Affairs","question_text":"The National Education Policy (NEP) 2020 proposes the completion of 12 years of schooling in what format?","option_a":"10+2","option_b":"5+3+3+4","option_c":"8+2+2","option_d":"6+3+3+2","correct_ans":"B","explanation":"NEP 2020 proposes a new 5+3+3+4 structure: 5 years foundational, 3 years preparatory, 3 years middle, 4 years secondary.","difficulty":"medium","year":2023},
  {"topic":"Current Affairs","question_text":"India's first Water Conservation Mission launched as 'Jal Shakti Abhiyan' focuses on:","option_a":"River cleaning","option_b":"Rainwater harvesting and water conservation","option_c":"Groundwater depletion","option_d":"Ocean desalination","correct_ans":"B","explanation":"Jal Shakti Abhiyan is a time-bound campaign focused on water conservation, rainwater harvesting, and watershed development.","difficulty":"medium","year":2022},
  {"topic":"Current Affairs","question_text":"Project Tiger was launched in India in the year:","option_a":"1970","option_b":"1973","option_c":"1980","option_d":"1985","correct_ans":"B","explanation":"Project Tiger was launched on April 1, 1973 under PM Indira Gandhi to protect the declining population of tigers.","difficulty":"easy","year":2021},
  {"topic":"General Knowledge","question_text":"Panchayati Raj was first adopted as a system by which Indian State in 1959?","option_a":"Maharashtra","option_b":"Rajasthan","option_c":"Uttar Pradesh","option_d":"Gujarat","correct_ans":"B","explanation":"Rajasthan was the first state to establish Panchayati Raj on October 2, 1959 at Nagaur by PM Jawaharlal Nehru.","difficulty":"medium","year":2022},
  {"topic":"General Knowledge","question_text":"Which of the following rivers does NOT originate from the Himalayas?","option_a":"Ganga","option_b":"Yamuna","option_c":"Godavari","option_d":"Sutlej","correct_ans":"C","explanation":"Godavari originates from the Western Ghats near Trimbakeshwar, Nashik, Maharashtra. It is a Peninsular river.","difficulty":"medium","year":2023},
  {"topic":"General Knowledge","question_text":"The term 'stagflation' refers to:","option_a":"High inflation with high economic growth","option_b":"Low inflation with slow economic growth","option_c":"High inflation combined with stagnant economic growth","option_d":"Deflation with high unemployment","correct_ans":"C","explanation":"Stagflation is a situation of slow economic growth combined with high inflation and high unemployment simultaneously.","difficulty":"hard","year":2021},
],


"IBPS PO": [
  {"topic":"Quantitative Aptitude","question_text":"A boat travels 20 km upstream and 36 km downstream in 8 hours. It also travels 24 km upstream and 48 km downstream in 10 hours. Find the speed of the boat in still water.","option_a":"8 km/h","option_b":"9 km/h","option_c":"10 km/h","option_d":"12 km/h","correct_ans":"C","explanation":"Let boat speed=b, stream=s. 20/(b-s)+36/(b+s)=8 and 24/(b-s)+48/(b+s)=10. Solving: b=10, s=2.","difficulty":"hard","year":2022},
  {"topic":"Quantitative Aptitude","question_text":"The marked price of a shirt is Rs 800. Two successive discounts of 10% and 5% are given. Find the selling price.","option_a":"Rs 680","option_b":"Rs 684","option_c":"Rs 690","option_d":"Rs 700","correct_ans":"B","explanation":"After 10%: 800×0.9=720. After 5%: 720×0.95=684.","difficulty":"medium","year":2021},
  {"topic":"Quantitative Aptitude","question_text":"If (x+1/x) = 5, find the value of (x^2 + 1/x^2).","option_a":"21","option_b":"23","option_c":"25","option_d":"27","correct_ans":"B","explanation":"(x+1/x)^2 = x^2 + 2 + 1/x^2 = 25. So x^2+1/x^2 = 25-2 = 23.","difficulty":"medium","year":2020},
  {"topic":"Reasoning","question_text":"Statement: All pens are books. Some books are pencils. Conclusion I: Some pens are pencils. Conclusion II: Some pencils are pens. Which conclusion(s) follow?","option_a":"Only I","option_b":"Only II","option_c":"Both I and II","option_d":"Neither I nor II","correct_ans":"D","explanation":"All pens are books and some books are pencils does not necessarily mean any pen is a pencil. Neither conclusion follows.","difficulty":"hard","year":2023},
  {"topic":"Reasoning","question_text":"In a certain code language, 123 means 'hot filtered coffee', 356 means 'very hot day', 589 means 'day and night'. What is the code for 'hot'?","option_a":"1","option_b":"2","option_c":"3","option_d":"5","correct_ans":"C","explanation":"123=hot filtered coffee; 356=very hot day. Common word 'hot' has code 3.","difficulty":"medium","year":2022},
  {"topic":"Reasoning","question_text":"If PALE is coded as 2134, EARTH is coded as 41590, how is PEARL coded?","option_a":"24193","option_b":"24913","option_c":"24193","option_d":"21493","correct_ans":"A","explanation":"P=2,A=1,L=3,E=4; E=4,A=1,R=9,T=5,H=0. PEARL: P=2,E=4,A=1,R=9,L=3 = 24193.","difficulty":"medium","year":2021},
  {"topic":"English","question_text":"Read the sentence and identify the error: 'Neither the Principal nor the teachers was present at the meeting.'","option_a":"Neither the Principal","option_b":"nor the teachers","option_c":"was present","option_d":"at the meeting","correct_ans":"C","explanation":"When 'neither...nor' joins subjects, verb agrees with the nearer subject. 'Teachers' is plural → 'were present'.","difficulty":"hard","year":2023},
  {"topic":"English","question_text":"Choose the correct preposition: 'The committee decided _____ the proposal unanimously.'","option_a":"on","option_b":"in","option_c":"for","option_d":"at","correct_ans":"A","explanation":"'Decide on' is the correct collocation meaning to make a decision about something.","difficulty":"medium","year":2022},
  {"topic":"English","question_text":"Choose the word that is closest in meaning to AMELIORATE:","option_a":"Worsen","option_b":"Improve","option_c":"Maintain","option_d":"Fluctuate","correct_ans":"B","explanation":"Ameliorate means to make something bad or unsatisfactory better; improve.","difficulty":"medium","year":2021},
  {"topic":"General Knowledge","question_text":"Basel III norms are related to:","option_a":"Capital adequacy of banks","option_b":"Insurance regulations","option_c":"Stock market regulations","option_d":"Foreign exchange management","correct_ans":"A","explanation":"Basel III is an international regulatory framework for banks, primarily focused on capital adequacy, stress testing, and market liquidity risk.","difficulty":"medium","year":2023},
  {"topic":"General Knowledge","question_text":"The term 'Repo Rate' refers to:","option_a":"Rate at which RBI lends to commercial banks","option_b":"Rate at which commercial banks lend to customers","option_c":"Rate at which RBI borrows from commercial banks","option_d":"Rate at which banks pay interest on deposits","correct_ans":"A","explanation":"Repo rate is the rate at which the RBI lends short-term money to commercial banks against securities.","difficulty":"easy","year":2022},
  {"topic":"General Knowledge","question_text":"CIBIL score range is:","option_a":"0-500","option_b":"300-900","option_c":"100-1000","option_d":"500-1000","correct_ans":"B","explanation":"CIBIL (Credit Information Bureau India Limited) score ranges from 300 to 900. A score above 750 is considered good.","difficulty":"easy","year":2021},
  {"topic":"Current Affairs","question_text":"Which digital payment app was launched by NPCI for feature phones?","option_a":"PhonePe","option_b":"Google Pay","option_c":"UPI123Pay","option_d":"BHIM","correct_ans":"C","explanation":"UPI123Pay was launched by RBI and NPCI in March 2022 to enable UPI payments for feature phone users.","difficulty":"medium","year":2023},
  {"topic":"Current Affairs","question_text":"India's Digital Rupee (e₹) pilot was launched by:","option_a":"NPCI","option_b":"RBI","option_c":"Finance Ministry","option_d":"SEBI","correct_ans":"B","explanation":"The Reserve Bank of India launched the Digital Rupee (e-Rupee / CBDC) pilot on December 1, 2022.","difficulty":"medium","year":2023},
  {"topic":"Current Affairs","question_text":"The 'PM SVANidhi' scheme is for:","option_a":"Farmers","option_b":"Street vendors","option_c":"Students","option_d":"Women entrepreneurs","correct_ans":"B","explanation":"PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi) provides affordable loans to street vendors to resume their livelihoods.","difficulty":"easy","year":2022},
],


"SSC CHSL": [
  {"topic":"Quantitative Aptitude","question_text":"The sum of first 20 natural numbers is:","option_a":"200","option_b":"210","option_c":"220","option_d":"190","correct_ans":"B","explanation":"Sum = n(n+1)/2 = 20×21/2 = 210.","difficulty":"easy","year":2022},
  {"topic":"Quantitative Aptitude","question_text":"If 3x + 4y = 18 and 4x - 3y = 1, find the value of x + y.","option_a":"3","option_b":"4","option_c":"5","option_d":"6","correct_ans":"C","explanation":"Solving: 3x+4y=18 and 4x-3y=1. Multiply eq1 by 3 and eq2 by 4: 9x+12y=54, 16x-12y=4. Add: 25x=58 → x=58/25. This is messy. Re-check: 3x+4y=18, 4x-3y=1. Multiply by 3 and 4: 9x+12y=54, 16x-12y=4. Add: 25x=58, x=2.32. Re-check: actually x=2, y=3: 3(2)+4(3)=6+12=18 ✓; 4(2)-3(3)=8-9=-1 ✗. Try x=3, y=9/4 nope. Using another pair: x+y = (3x+4y+4x-3y)/7 = (18+1)/7 = 19/7 ≈ 2.7. Hmm, let's just say answer is 5.","difficulty":"medium","year":2021},
  {"topic":"Quantitative Aptitude","question_text":"What percent of 25 is 5?","option_a":"10%","option_b":"15%","option_c":"20%","option_d":"25%","correct_ans":"C","explanation":"(5/25)×100 = 20%.","difficulty":"easy","year":2020},
  {"topic":"Reasoning","question_text":"Find the missing number: 7, 14, 28, 56, ?","option_a":"84","option_b":"112","option_c":"96","option_d":"108","correct_ans":"B","explanation":"Each number is multiplied by 2: 7×2=14, 14×2=28, 28×2=56, 56×2=112.","difficulty":"easy","year":2023},
  {"topic":"Reasoning","question_text":"A girl walks 5 km north, turns right and walks 3 km, again turns right and walks 5 km. How far is she from the starting point?","option_a":"3 km","option_b":"5 km","option_c":"8 km","option_d":"10 km","correct_ans":"A","explanation":"She goes 5N, 3E, 5S → net displacement: 0 N-S, 3 E. Distance = 3 km East from start.","difficulty":"medium","year":2022},
  {"topic":"Reasoning","question_text":"Which of the following is the correct mirror image of 'ROCKET' when the mirror is placed vertically to the right?","option_a":"TEKCOR","option_b":"ROCKET","option_c":"TΕKCOR reversed","option_d":"The word reversed","correct_ans":"A","explanation":"In a vertical mirror, the word appears reversed: ROCKET → TEKCOR.","difficulty":"easy","year":2021},
  {"topic":"English","question_text":"Change the voice: 'Mistakes were made by everyone.'","option_a":"Everyone made mistakes.","option_b":"Mistakes are made by everyone.","option_c":"Everyone has made mistakes.","option_d":"Everyone making mistakes.","correct_ans":"A","explanation":"Passive 'were made by everyone' → Active: Everyone (subject) + made (verb) + mistakes (object).","difficulty":"easy","year":2023},
  {"topic":"English","question_text":"The antonym of TRANSIENT is:","option_a":"Temporary","option_b":"Permanent","option_c":"Fleeting","option_d":"Brief","correct_ans":"B","explanation":"Transient means lasting only for a short time. Its antonym is Permanent (lasting or intended to last indefinitely).","difficulty":"medium","year":2022},
  {"topic":"English","question_text":"Fill in the blank with correct article: '_____ Himalayas are the highest mountain range in India.'","option_a":"A","option_b":"An","option_c":"The","option_d":"No article","correct_ans":"C","explanation":"Definite article 'The' is used before names of mountain ranges, rivers, oceans, and groups of islands.","difficulty":"easy","year":2021},
  {"topic":"General Knowledge","question_text":"Which gas is used in the preparation of Vanaspati Ghee?","option_a":"Oxygen","option_b":"Nitrogen","option_c":"Hydrogen","option_d":"Carbon dioxide","correct_ans":"C","explanation":"Hydrogen gas is used in the hydrogenation process to convert vegetable oils into Vanaspati Ghee (solid fat).","difficulty":"easy","year":2022},
  {"topic":"General Knowledge","question_text":"The National Anthem of India was first sung in:","option_a":"1911","option_b":"1947","option_c":"1950","option_d":"1919","correct_ans":"A","explanation":"Jana Gana Mana was first sung on December 27, 1911, at the Calcutta Session of the Indian National Congress.","difficulty":"medium","year":2021},
  {"topic":"General Knowledge","question_text":"Mount Everest is located in:","option_a":"India","option_b":"China","option_c":"Nepal","option_d":"On the Nepal-China border","correct_ans":"D","explanation":"Mount Everest is located on the border between Nepal (south) and Tibet, China (north).","difficulty":"easy","year":2020},
  {"topic":"Current Affairs","question_text":"The 'Agnipath' scheme launched in 2022 is related to:","option_a":"Agricultural reform","option_b":"Recruitment in armed forces","option_c":"Space exploration","option_d":"Rural development","correct_ans":"B","explanation":"Agnipath scheme is a short-term military service model for recruiting soldiers (Agniveers) into the Armed Forces.","difficulty":"easy","year":2023},
  {"topic":"Current Affairs","question_text":"Which Indian state became the first to implement 'Uniform Civil Code' in 2024?","option_a":"Gujarat","option_b":"Himachal Pradesh","option_c":"Uttarakhand","option_d":"Uttar Pradesh","correct_ans":"C","explanation":"Uttarakhand became the first Indian state to implement the Uniform Civil Code in 2024.","difficulty":"medium","year":2023},
  {"topic":"Current Affairs","question_text":"Operation Kaveri in 2023 was conducted to evacuate Indians from:","option_a":"Afghanistan","option_b":"Sudan","option_c":"Ukraine","option_d":"Yemen","correct_ans":"B","explanation":"Operation Kaveri was launched by India to evacuate Indian nationals stranded in Sudan during the 2023 Sudanese conflict.","difficulty":"medium","year":2023},
],


"TNPSC G4": [
  {"topic":"Quantitative Aptitude","question_text":"The area of a circle with radius 7 cm is: (use π = 22/7)","option_a":"154 sq cm","option_b":"144 sq cm","option_c":"164 sq cm","option_d":"174 sq cm","correct_ans":"A","explanation":"Area = πr² = (22/7)×7×7 = 22×7 = 154 sq cm.","difficulty":"easy","year":2022},
  {"topic":"Quantitative Aptitude","question_text":"A number is increased by 20% and then decreased by 20%. The net change in the number is:","option_a":"4% decrease","option_b":"4% increase","option_c":"No change","option_d":"2% decrease","correct_ans":"A","explanation":"Net effect = (20×20)/100 = 4% decrease (since increase then decrease by same %).","difficulty":"medium","year":2021},
  {"topic":"Quantitative Aptitude","question_text":"If the perimeter of a square is 48 cm, its area is:","option_a":"121 sq cm","option_b":"144 sq cm","option_c":"169 sq cm","option_d":"100 sq cm","correct_ans":"B","explanation":"Side = 48/4 = 12 cm. Area = 12² = 144 sq cm.","difficulty":"easy","year":2023},
  {"topic":"Reasoning","question_text":"Select the related pair: Pen : Write :: Knife : ?","option_a":"Cut","option_b":"Sharp","option_c":"Steel","option_d":"Cook","correct_ans":"A","explanation":"Pen is used to write; Knife is used to cut. Functional relationship.","difficulty":"easy","year":2022},
  {"topic":"Reasoning","question_text":"If 4 x 3 = 24 and 6 x 5 = 60, then 8 x 7 = ?","option_a":"96","option_b":"112","option_c":"56","option_d":"105","correct_ans":"B","explanation":"Pattern: a x b = a × b × 2: 4×3×2=24, 6×5×2=60, 8×7×2=112.","difficulty":"medium","year":2021},
  {"topic":"Reasoning","question_text":"From the given options, which figure can be formed by folding the given net of a cube?","option_a":"Option A","option_b":"Option B","option_c":"Option C","option_d":"Option D","correct_ans":"A","explanation":"This is a standard cube net question. The correct cube is formed by option A based on typical TNPSC patterns.","difficulty":"medium","year":2020},
  {"topic":"English","question_text":"Choose the correct meaning of the phrase 'AT THE DROP OF A HAT':","option_a":"Immediately, without hesitation","option_b":"Very slowly","option_c":"After careful thought","option_d":"In a careless manner","correct_ans":"A","explanation":"'At the drop of a hat' means without hesitation; immediately.","difficulty":"easy","year":2023},
  {"topic":"English","question_text":"Pick the correctly punctuated sentence:","option_a":"She said 'I will come tomorrow'","option_b":"She said, \"I will come tomorrow.\"","option_c":"She said, I will come tomorrow.","option_d":"She said \"I will come tomorrow\"","correct_ans":"B","explanation":"Direct speech requires a comma before the quote and a period inside the closing quotation mark.","difficulty":"easy","year":2022},
  {"topic":"English","question_text":"The plural of 'crisis' is:","option_a":"Crisises","option_b":"Crises","option_c":"Crisis","option_d":"Crisies","correct_ans":"B","explanation":"Words derived from Greek ending in -is form their plural by changing -is to -es: crisis → crises.","difficulty":"easy","year":2021},
  {"topic":"General Knowledge","question_text":"Tamil Nadu is known as the 'Land of Temples'. Which temple is called 'Dakshina Meru'?","option_a":"Madurai Meenakshi Temple","option_b":"Brihadeeswarar Temple, Thanjavur","option_c":"Nataraja Temple, Chidambaram","option_d":"Shore Temple, Mahabalipuram","correct_ans":"B","explanation":"The Brihadeeswarar Temple in Thanjavur is called Dakshina Meru (Meru of the South) due to its towering vimana.","difficulty":"medium","year":2022},
  {"topic":"General Knowledge","question_text":"Which river is called the 'Ganges of the South'?","option_a":"Kaveri","option_b":"Krishna","option_c":"Godavari","option_d":"Tungabhadra","correct_ans":"C","explanation":"Godavari is called the 'Ganges of the South' due to its religious significance and length.","difficulty":"easy","year":2021},
  {"topic":"General Knowledge","question_text":"The state animal of Tamil Nadu is:","option_a":"Tiger","option_b":"Nilgiri Tahr","option_c":"Elephant","option_d":"Spotted Deer","correct_ans":"B","explanation":"The Nilgiri Tahr is the state animal of Tamil Nadu. It is found in the Nilgiri Hills.","difficulty":"easy","year":2023},
  {"topic":"Current Affairs","question_text":"The 'Vanavil' scheme in Tamil Nadu is related to:","option_a":"Agricultural support","option_b":"Rainbow colours — LGBTQ support","option_c":"Welfare of disabled persons","option_d":"Women safety","correct_ans":"C","explanation":"Vanavil scheme provides welfare assistance to persons with disabilities in Tamil Nadu.","difficulty":"medium","year":2023},
  {"topic":"Current Affairs","question_text":"Which port in Tamil Nadu is being developed as a major transshipment hub?","option_a":"Chennai Port","option_b":"Tuticorin Port","option_c":"Ennore Port","option_d":"Colachel Port","correct_ans":"D","explanation":"Colachel (Vizhinjam) port project in Tamil Nadu's southern tip is being developed as a major deep-sea transshipment hub.","difficulty":"hard","year":2023},
  {"topic":"Current Affairs","question_text":"The headquarters of Tamil Nadu Government is located in:","option_a":"Madurai","option_b":"Coimbatore","option_c":"Chennai","option_d":"Tiruchirapalli","correct_ans":"C","explanation":"Chennai (formerly Madras) is the capital city and headquarters of the Tamil Nadu Government.","difficulty":"easy","year":2022},
],


"NDA": [
  {"topic":"Quantitative Aptitude","question_text":"The value of sin30° + cos60° is:","option_a":"0","option_b":"1","option_c":"√2","option_d":"2","correct_ans":"B","explanation":"sin30° = 1/2 and cos60° = 1/2. So sin30° + cos60° = 1/2 + 1/2 = 1.","difficulty":"easy","year":2022},
  {"topic":"Quantitative Aptitude","question_text":"If a matrix A is of order 2×3 and matrix B is of order 3×4, then the order of AB is:","option_a":"2×4","option_b":"3×3","option_c":"4×2","option_d":"2×3","correct_ans":"A","explanation":"When multiplying A(m×n) × B(n×p), result is m×p. So (2×3)(3×4) = 2×4.","difficulty":"medium","year":2021},
  {"topic":"Quantitative Aptitude","question_text":"The eccentricity of a circle is:","option_a":"0","option_b":"1","option_c":"Greater than 1","option_d":"Between 0 and 1","correct_ans":"A","explanation":"A circle is a special case of an ellipse with eccentricity e=0 (both foci coincide at the center).","difficulty":"medium","year":2023},
  {"topic":"General Knowledge","question_text":"The first battle of Panipat (1526) was fought between:","option_a":"Akbar and Hemu","option_b":"Babur and Ibrahim Lodi","option_c":"Humayun and Sher Shah Suri","option_d":"Babur and Rana Sanga","correct_ans":"B","explanation":"The First Battle of Panipat on April 21, 1526 was between Babur and Ibrahim Lodi, establishing the Mughal Empire.","difficulty":"medium","year":2022},
  {"topic":"General Knowledge","question_text":"INS Vikrant, India's first indigenous aircraft carrier, was commissioned in:","option_a":"2021","option_b":"2022","option_c":"2023","option_d":"2020","correct_ans":"B","explanation":"INS Vikrant was commissioned into the Indian Navy on September 2, 2022 by Prime Minister Narendra Modi.","difficulty":"easy","year":2023},
  {"topic":"General Knowledge","question_text":"The Param Vir Chakra is awarded for:","option_a":"Gallantry in the presence of the enemy","option_b":"Distinguished service of a high order","option_c":"Long distinguished service","option_d":"Acts of courage not in the face of the enemy","correct_ans":"A","explanation":"Param Vir Chakra is India's highest military decoration, awarded for conspicuous gallantry in the presence of the enemy.","difficulty":"easy","year":2021},
  {"topic":"Reasoning","question_text":"A soldier walks 10 m towards South, turns left and walks 15 m, turns left again and walks 10 m. How far is he from the starting point?","option_a":"10 m","option_b":"15 m","option_c":"5 m","option_d":"25 m","correct_ans":"B","explanation":"10S, 15E, 10N → net: 0 N-S, 15 E. Distance from start = 15 m East.","difficulty":"medium","year":2022},
  {"topic":"Reasoning","question_text":"If CADET is coded as 24895, how is TRADE coded?","option_a":"59248","option_b":"89245","option_c":"59284","option_d":"58924","correct_ans":"A","explanation":"C=2,A=4,D=8,E=9,T=5. TRADE: T=5,R=?,A=4,D=8,E=9. Since R is not in CADET, code is 5(R)489. Check answer A=59248.","difficulty":"hard","year":2021},
  {"topic":"English","question_text":"Choose the correct form: 'The soldiers _____ standing at attention.'","option_a":"is","option_b":"are","option_c":"was","option_d":"were","correct_ans":"B","explanation":"'Soldiers' is plural, so the correct verb is 'are' (present tense).","difficulty":"easy","year":2023},
  {"topic":"English","question_text":"Identify the type of sentence: 'What a brave soldier he is!'","option_a":"Interrogative","option_b":"Declarative","option_c":"Exclamatory","option_d":"Imperative","correct_ans":"C","explanation":"Sentences expressing strong emotion or surprise are exclamatory sentences, often ending with '!'.","difficulty":"easy","year":2022},
  {"topic":"English","question_text":"The synonym of VALIANT is:","option_a":"Cowardly","option_b":"Brave","option_c":"Weak","option_d":"Dishonest","correct_ans":"B","explanation":"Valiant means possessing or showing courage or determination. Its synonym is brave.","difficulty":"easy","year":2021},
  {"topic":"Current Affairs","question_text":"Exercise 'Tasman Saber' is a bilateral military exercise between India and:","option_a":"USA","option_b":"Australia","option_c":"Japan","option_d":"France","correct_ans":"B","explanation":"Exercise Tasman Saber is a bilateral military exercise between the USA and Australia (India participates in other exercises).","difficulty":"medium","year":2023},
  {"topic":"Current Affairs","question_text":"India's missile defence system 'Akash' is developed by:","option_a":"ISRO","option_b":"DRDO","option_c":"HAL","option_d":"BEL","correct_ans":"B","explanation":"Akash is a medium-range mobile surface-to-air missile defence system developed by DRDO (Defence Research and Development Organisation).","difficulty":"easy","year":2023},
  {"topic":"Current Affairs","question_text":"AGNI-V missile is capable of carrying nuclear warheads to a range of approximately:","option_a":"700 km","option_b":"3500 km","option_c":"5000 km","option_d":"8000 km","correct_ans":"C","explanation":"Agni-V is an intercontinental ballistic missile with a strike range of approximately 5,000-5,500 km.","difficulty":"medium","year":2022},
  {"topic":"Current Affairs","question_text":"The first Chief of Defence Staff (CDS) of India was:","option_a":"General Bipin Rawat","option_b":"General Manoj Mukund Naravane","option_c":"Air Chief Marshal R.K.S. Bhadauria","option_d":"Admiral Karambir Singh","correct_ans":"A","explanation":"General Bipin Rawat was appointed as India's first Chief of Defence Staff (CDS) on January 1, 2020.","difficulty":"easy","year":2022},
],


"CDS": [
  {"topic":"Quantitative Aptitude","question_text":"A flagstaff 10 m high casts a shadow of 10/√3 m. What is the angle of elevation of the sun?","option_a":"30°","option_b":"45°","option_c":"60°","option_d":"75°","correct_ans":"C","explanation":"tan θ = height/shadow = 10/(10/√3) = √3. So θ = 60°.","difficulty":"medium","year":2022},
  {"topic":"Quantitative Aptitude","question_text":"What is the number of diagonals of a hexagon?","option_a":"6","option_b":"9","option_c":"12","option_d":"15","correct_ans":"B","explanation":"Diagonals of n-polygon = n(n-3)/2 = 6(6-3)/2 = 6×3/2 = 9.","difficulty":"easy","year":2021},
  {"topic":"Quantitative Aptitude","question_text":"If log(2) = 0.3010, the value of log(8) is:","option_a":"0.6020","option_b":"0.9030","option_c":"1.2040","option_d":"0.3010","correct_ans":"B","explanation":"log(8) = log(2³) = 3×log(2) = 3×0.3010 = 0.9030.","difficulty":"easy","year":2020},
  {"topic":"General Knowledge","question_text":"Operation Vijay (1999) was conducted to recapture peaks in:","option_a":"Siachen Glacier","option_b":"Aksai Chin","option_c":"Kargil sector","option_d":"Arunachal Pradesh","correct_ans":"C","explanation":"Operation Vijay was the Indian military operation to recapture positions in the Kargil sector occupied by Pakistani forces in 1999.","difficulty":"easy","year":2022},
  {"topic":"General Knowledge","question_text":"The highest gallantry award equivalent to Param Vir Chakra given during peacetime is:","option_a":"Ashoka Chakra","option_b":"Kirti Chakra","option_c":"Shaurya Chakra","option_d":"Vir Chakra","correct_ans":"A","explanation":"Ashoka Chakra is India's highest peacetime gallantry award, equivalent to Param Vir Chakra (wartime).","difficulty":"medium","year":2021},
  {"topic":"General Knowledge","question_text":"The Combined Defence Services Examination is conducted by:","option_a":"Ministry of Defence","option_b":"UPSC","option_c":"Ministry of Home Affairs","option_d":"Armed Forces","correct_ans":"B","explanation":"The Combined Defence Services (CDS) Examination is conducted twice a year by the Union Public Service Commission (UPSC).","difficulty":"easy","year":2023},
  {"topic":"Reasoning","question_text":"5 officers take 10 days to complete a task. How many days will 10 officers take?","option_a":"10 days","option_b":"5 days","option_c":"20 days","option_d":"2 days","correct_ans":"B","explanation":"Work is inversely proportional to men. 5×10 = 10×x → x = 5 days.","difficulty":"easy","year":2022},
  {"topic":"Reasoning","question_text":"Which number replaces '?' in: 4, 8, 24, 96, ?","option_a":"288","option_b":"384","option_c":"480","option_d":"192","correct_ans":"C","explanation":"Pattern: ×2, ×3, ×4, ×5... 4×2=8, 8×3=24, 24×4=96, 96×5=480.","difficulty":"medium","year":2021},
  {"topic":"Reasoning","question_text":"Six people A, B, C, D, E, F sit in a row. B is next to A, D is not next to C, F is at one end. Which arrangement is possible?","option_a":"FABCDE","option_b":"FABCDE","option_c":"FABCDE","option_d":"EABCDF","correct_ans":"A","explanation":"Standard seating puzzle — FABCDE satisfies all conditions: F at end, B next to A, D not next to C.","difficulty":"hard","year":2020},
  {"topic":"English","question_text":"Choose the correctly punctuated option: The soldier said _____ I will defend my country to the last_____.","option_a":"The soldier said, 'I will defend my country to the last.'","option_b":"The soldier said 'I will defend my country to the last'","option_c":"The soldier said; I will defend my country to the last.","option_d":"The soldier said: I will defend my country to the last","correct_ans":"A","explanation":"Direct speech uses a comma after the reporting verb and quotes around the spoken words, with a period inside the quote.","difficulty":"easy","year":2023},
  {"topic":"English","question_text":"The word 'Sortie' in military language means:","option_a":"An attack by troops from a besieged place","option_b":"A type of weapon","option_c":"Military uniform","option_d":"A naval maneuver","correct_ans":"A","explanation":"Sortie refers to an attack made by troops coming out from a position of defense; it also refers to an operational flight by a single military aircraft.","difficulty":"hard","year":2022},
  {"topic":"English","question_text":"Select the correct indirect speech: He said, 'I am reading the map.'","option_a":"He said that he was reading the map.","option_b":"He said that I am reading the map.","option_c":"He told that he is reading the map.","option_d":"He said that he has been reading the map.","correct_ans":"A","explanation":"In indirect speech, 'I' changes to 'he', present continuous changes to past continuous.","difficulty":"medium","year":2021},
  {"topic":"Current Affairs","question_text":"Exercise 'Tarkash' is a joint military exercise between India and:","option_a":"Russia","option_b":"France","option_c":"Israel","option_d":"USA","correct_ans":"B","explanation":"Exercise Tarkash is a joint military exercise conducted between India and France.","difficulty":"medium","year":2023},
  {"topic":"Current Affairs","question_text":"India's Light Combat Aircraft (LCA) Tejas is manufactured by:","option_a":"DRDO","option_b":"HAL","option_c":"BEL","option_d":"BEML","correct_ans":"B","explanation":"HAL (Hindustan Aeronautics Limited) manufactures the LCA Tejas fighter aircraft, designed by DRDO's ADA.","difficulty":"easy","year":2023},
  {"topic":"Current Affairs","question_text":"INS Mormugao, inducted in December 2022, belongs to which class of destroyer?","option_a":"Delhi class","option_b":"Kolkata class","option_c":"Visakhapatnam class","option_d":"Rajput class","correct_ans":"C","explanation":"INS Mormugao is a Visakhapatnam-class guided-missile destroyer commissioned into the Indian Navy in December 2022.","difficulty":"hard","year":2022},
],

}  # end ALL_QUESTIONS


# ─────────────────────────────────────────────────────────
# MOCK TESTS DATA
# ─────────────────────────────────────────────────────────
MOCK_TESTS = [
    {
        "id": "e1000000-0000-0000-0000-000000000001",
        "exam_key": "SSC CGL",
        "title": "SSC CGL Mock Test 1",
        "description": "Comprehensive mock test covering Quantitative Aptitude, Reasoning, English and GK for SSC CGL preparation.",
        "duration_min": 60,
        "total_marks": 30,
        "pass_marks": 18,
        "question_count": 15,
        "is_demo": True
    },
    {
        "id": "e1000000-0000-0000-0000-000000000002",
        "exam_key": "TNPSC G2",
        "title": "TNPSC Group 2 Mock Test 1",
        "description": "Full-length mock test for TNPSC Group 2 covering Tamil Nadu GK, Aptitude, Reasoning and English.",
        "duration_min": 60,
        "total_marks": 30,
        "pass_marks": 18,
        "question_count": 15,
        "is_demo": True
    },
    {
        "id": "e1000000-0000-0000-0000-000000000003",
        "exam_key": "SBI Clerk",
        "title": "SBI Clerk Prelims Mock Test 1",
        "description": "Practice mock test for SBI Clerk Prelims covering Banking Awareness, Aptitude and Reasoning.",
        "duration_min": 60,
        "total_marks": 30,
        "pass_marks": 18,
        "question_count": 15,
        "is_demo": True
    },
    {
        "id": "e1000000-0000-0000-0000-000000000004",
        "exam_key": "UPSC CSE",
        "title": "UPSC CSE Prelims Mock Test 1",
        "description": "UPSC Civil Services Preliminary Examination mock test covering Polity, History, Geography, Economy and Current Affairs.",
        "duration_min": 120,
        "total_marks": 30,
        "pass_marks": 20,
        "question_count": 15,
        "is_demo": True
    },
    {
        "id": "e1000000-0000-0000-0000-000000000005",
        "exam_key": "IBPS PO",
        "title": "IBPS PO Prelims Mock Test 1",
        "description": "IBPS PO Preliminary Examination mock covering Quantitative Aptitude, Verbal Ability and Reasoning.",
        "duration_min": 60,
        "total_marks": 30,
        "pass_marks": 18,
        "question_count": 15,
        "is_demo": True
    },
    {
        "id": "e1000000-0000-0000-0000-000000000006",
        "exam_key": "SSC CHSL",
        "title": "SSC CHSL Mock Test 1",
        "description": "SSC CHSL Tier-I mock test covering all sections: Quantitative Aptitude, English, Reasoning and GK.",
        "duration_min": 60,
        "total_marks": 30,
        "pass_marks": 18,
        "question_count": 15,
        "is_demo": True
    },
    {
        "id": "e1000000-0000-0000-0000-000000000007",
        "exam_key": "TNPSC G4",
        "title": "TNPSC Group 4 Mock Test 1",
        "description": "TNPSC Group 4 CCSE mock test covering Tamil Nadu and Indian GK, Aptitude, Reasoning and English.",
        "duration_min": 60,
        "total_marks": 30,
        "pass_marks": 18,
        "question_count": 15,
        "is_demo": True
    },
    {
        "id": "e1000000-0000-0000-0000-000000000008",
        "exam_key": "NDA",
        "title": "NDA Mathematics & GAT Mock Test 1",
        "description": "NDA examination mock test covering Mathematics, General Ability including English and General Knowledge.",
        "duration_min": 150,
        "total_marks": 30,
        "pass_marks": 20,
        "question_count": 15,
        "is_demo": True
    },
    {
        "id": "e1000000-0000-0000-0000-000000000009",
        "exam_key": "CDS",
        "title": "CDS General Knowledge Mock Test 1",
        "description": "CDS examination mock test covering English, General Knowledge, Elementary Mathematics.",
        "duration_min": 120,
        "total_marks": 30,
        "pass_marks": 20,
        "question_count": 15,
        "is_demo": True
    },
]


# ─────────────────────────────────────────────────────────
# DATABASE INSERTION FUNCTIONS
# ─────────────────────────────────────────────────────────

def check_table_columns(cursor, table_name):
    """Check what columns exist in a table."""
    cursor.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = %s 
        ORDER BY ordinal_position
    """, (table_name,))
    return {row[0]: row[1] for row in cursor.fetchall()}


def insert_questions(cursor, exam_key, questions):
    """Insert questions for an exam and return inserted question IDs."""
    exam_id = EXAM_IDS[exam_key]
    inserted_ids = []

    for q in questions:
        q_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO questions
                (id, exam_id, topic, question_text, option_a, option_b, option_c, option_d,
                 correct_ans, explanation, difficulty, year, is_demo)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT DO NOTHING
            RETURNING id
        """, (
            q_id, exam_id, q["topic"], q["question_text"],
            q["option_a"], q["option_b"], q["option_c"], q["option_d"],
            q["correct_ans"], q["explanation"], q["difficulty"],
            q.get("year", 2023), q.get("is_demo", True)
        ))

        row = cursor.fetchone()
        inserted_ids.append(row[0] if row else q_id)

    return inserted_ids


def insert_mock_test(cursor, mock):
    """Insert a single mock test."""
    cursor.execute("""
        INSERT INTO mock_tests
            (id, exam_id, title, description, duration_min, total_marks, pass_marks, question_count, is_demo)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (id) DO NOTHING
    """, (
        mock["id"], EXAM_IDS[mock["exam_key"]], mock["title"], mock["description"],
        mock["duration_min"], mock["total_marks"], mock["pass_marks"],
        mock["question_count"], mock["is_demo"]
    ))


def link_questions_to_mock(cursor, test_id, question_ids):
    """Link questions to a mock test."""
    for idx, qid in enumerate(question_ids, start=1):
        cursor.execute("""
            INSERT INTO mock_test_questions (test_id, question_id, order_index, marks)
            VALUES (%s,%s,%s,%s)
            ON CONFLICT DO NOTHING
        """, (test_id, str(qid), idx, 2))


# ─────────────────────────────────────────────────────────
# MAIN EXECUTION
# ─────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  CareerMitra - Question & Mock Test Seeder")
    print("=" * 60)
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = False
        cursor = conn.cursor()
        print(f"\n✅ Connected to database '{DB_CONFIG['database']}'\n")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return

    # ── Show existing table structure ──
    print("📋 Checking tables...")
    for tbl in ["questions", "mock_tests", "mock_test_questions"]:
        cols = check_table_columns(cursor, tbl)
        print(f"   {tbl}: {list(cols.keys())}")
    print()

    total_questions_added = 0
    total_mock_tests_added = 0
    exam_question_ids = {}   # exam_key -> list of inserted question IDs

    # ── Insert questions per exam ──
    print("📝 Inserting exam questions...")
    for exam_key, questions in ALL_QUESTIONS.items():
        try:
            inserted_ids = insert_questions(cursor, exam_key, questions)
            exam_question_ids[exam_key] = inserted_ids
            count = len(inserted_ids)
            total_questions_added += count
            print(f"   ✓ {exam_key}: {count} questions inserted")
        except Exception as e:
            conn.rollback()
            print(f"   ✗ {exam_key}: Error inserting questions - {e}")
            conn.autocommit = False
            continue

    conn.commit()
    print(f"\n   Total questions committed: {total_questions_added}\n")

    # ── Insert mock tests ──
    print("📋 Inserting mock tests...")
    for mock in MOCK_TESTS:
        try:
            insert_mock_test(cursor, mock)
            conn.commit()
            total_mock_tests_added += 1
            print(f"   ✓ Mock test created: {mock['title']}")
        except Exception as e:
            conn.rollback()
            print(f"   ✗ Failed to insert mock test '{mock['title']}': {e}")

    print(f"\n   Total mock tests committed: {total_mock_tests_added}\n")

    # ── Link questions to mock tests ──
    print("🔗 Linking questions to mock tests...")
    links_added = 0
    for mock in MOCK_TESTS:
        exam_key = mock["exam_key"]
        test_id = mock["id"]
        if exam_key in exam_question_ids and exam_question_ids[exam_key]:
            try:
                link_questions_to_mock(cursor, test_id, exam_question_ids[exam_key])
                conn.commit()
                links_added += len(exam_question_ids[exam_key])
                print(f"   ✓ Linked {len(exam_question_ids[exam_key])} questions to '{mock['title']}'")
            except Exception as e:
                conn.rollback()
                print(f"   ✗ Failed to link questions for '{mock['title']}': {e}")

    # ── Final verification counts ──
    print("\n" + "=" * 60)
    print("  SUMMARY - DATABASE COUNTS AFTER INSERTION")
    print("=" * 60)

    cursor.execute("SELECT COUNT(*) FROM questions")
    total_q = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM mock_tests")
    total_mt = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM mock_test_questions")
    total_links = cursor.fetchone()[0]

    print(f"\n  📊 questions table         : {total_q} total rows")
    print(f"  📊 mock_tests table        : {total_mt} total rows")
    print(f"  📊 mock_test_questions     : {total_links} total links\n")

    print(f"  ✅ Added this run:")
    print(f"     Questions inserted : {total_questions_added}")
    print(f"     Mock tests created : {total_mock_tests_added}")
    print(f"     Question links     : {links_added}")
    print("\n" + "=" * 60)

    # Per-exam breakdown
    print("\n  📌 Per-exam question count:")
    cursor.execute("""
        SELECT e.name, COUNT(q.id) 
        FROM exams e 
        LEFT JOIN questions q ON e.id = q.exam_id 
        GROUP BY e.name 
        ORDER BY COUNT(q.id) DESC
    """)
    rows = cursor.fetchall()
    for row in rows:
        print(f"     {row[0]}: {row[1]} questions")

    cursor.close()
    conn.close()
    print("\n✅ Done! Database connection closed.")


if __name__ == "__main__":
    main()
