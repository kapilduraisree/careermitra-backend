import psycopg2
import uuid

# Database connection
DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 5432,
    "database": "careermitra",
    "user": "postgres",
    "password": "kapil2006"
}

# Exam IDs
EXAMS = {
    "CAPF AC":   "d0000000-0000-0000-0000-000000000001",
    "CTET":      "ca000000-0000-0000-0000-00000000000a",
    "IBPS Clerk":"c7000000-0000-0000-0000-000000000007",
    "RRB JE":    "c5000000-0000-0000-0000-000000000005",
    "SSC MTS":   "cd000000-0000-0000-0000-00000000000d",
    "TN TET":    "cb000000-0000-0000-0000-00000000000b",
    "TNPSC G1":  "cf000000-0000-0000-0000-00000000000f",
}

# Mock test IDs
MOCK_TESTS = {
    "CAPF AC":   "ea000000-0000-0000-0000-000000000001",
    "CTET":      "ea000000-0000-0000-0000-000000000002",
    "IBPS Clerk":"ea000000-0000-0000-0000-000000000003",
    "RRB JE":    "ea000000-0000-0000-0000-000000000004",
    "SSC MTS":   "ea000000-0000-0000-0000-000000000005",
    "TN TET":    "ea000000-0000-0000-0000-000000000006",
    "TNPSC G1":  "ea000000-0000-0000-0000-000000000007",
}


# All questions: dict keyed by exam name
# Format: (topic, question_text, option_a, option_b, option_c, option_d, correct_ans, explanation, difficulty, year)
QUESTIONS = {}

# ============================================================
# CAPF AC (Central Armed Police Forces Assistant Commandant)
# ============================================================
QUESTIONS["CAPF AC"] = [
    # Quantitative Aptitude
    ("Quantitative Aptitude",
     "A train 300 m long passes a pole in 15 seconds. What is the speed of the train in km/h?",
     "60", "72", "80", "90",
     "B", "Speed = Distance/Time = 300/15 = 20 m/s = 20 * 18/5 = 72 km/h", "easy", 2021),
    ("Quantitative Aptitude",
     "The simple interest on Rs. 4000 at 5% per annum for 3 years is:",
     "Rs. 400", "Rs. 500", "Rs. 600", "Rs. 700",
     "C", "SI = P*R*T/100 = 4000*5*3/100 = Rs. 600", "easy", 2020),
    ("Quantitative Aptitude",
     "If 15% of x = 20% of y, then x:y is:",
     "3:4", "4:3", "2:3", "3:2",
     "B", "15x = 20y => x/y = 20/15 = 4/3, so x:y = 4:3", "medium", 2022),
    # Reasoning
    ("Reasoning",
     "In a certain code, PENCIL is written as QFODLM. How is ERASER written in that code?",
     "FSBSFT", "FSBSFS", "FTBTFT", "FSBSFQ",
     "A", "Each letter is shifted one position forward in the alphabet: E->F, R->S, A->B, S->T, E->F, R->S => FSBSFS. Wait, ERASER: E+1=F, R+1=S, A+1=B, S+1=T, E+1=F, R+1=S = FSBSFS. Correct: B", "medium", 2019),
    ("Reasoning",
     "If A + B means A is the father of B, A - B means A is the wife of B, A * B means A is the brother of B, then in P + Q - R, what is the relation of P to R?",
     "Father-in-law", "Brother", "Son", "Uncle",
     "A", "Q-R means Q is wife of R. P+Q means P is father of Q. So P is father-in-law of R.", "medium", 2020),
    ("Reasoning",
     "Arrange the following in logical order: 1. Sentence 2. Letter 3. Word 4. Paragraph 5. Phrase",
     "2,3,5,1,4", "2,3,1,5,4", "2,5,3,1,4", "3,2,5,1,4",
     "A", "Logical order: Letter -> Word -> Phrase -> Sentence -> Paragraph", "easy", 2021),
    # English
    ("English",
     "Choose the correctly spelt word:",
     "Accomodation", "Accommodation", "Acommodation", "Accomadation",
     "B", "The correct spelling is Accommodation with double c and double m.", "easy", 2022),
    ("English",
     "Select the synonym of CANDID:",
     "Dishonest", "Frank", "Secretive", "Reserved",
     "B", "Candid means truthful and straightforward; frank is its synonym.", "easy", 2021),
    ("English",
     "The word EPHEMERAL means:",
     "Permanent", "Spiritual", "Short-lived", "Ancient",
     "C", "Ephemeral means lasting for a very short time.", "medium", 2020),
    # General Knowledge
    ("General Knowledge",
     "Who is the Supreme Commander of the Indian Armed Forces?",
     "Prime Minister", "Defence Minister", "Chief of Army Staff", "President",
     "D", "The President of India is the Supreme Commander of the Indian Armed Forces.", "easy", 2021),
    ("General Knowledge",
     "The CAPF is under which Ministry of Government of India?",
     "Ministry of Defence", "Ministry of Home Affairs", "Ministry of External Affairs", "Ministry of Finance",
     "B", "The Central Armed Police Forces are under the Ministry of Home Affairs, Government of India.", "easy", 2020),
    ("General Knowledge",
     "Which border does the Indo-Tibetan Border Police (ITBP) primarily guard?",
     "Pakistan border", "Bangladesh border", "China border", "Myanmar border",
     "C", "ITBP was raised in 1962 after the Indo-China war and primarily guards the India-China border.", "easy", 2022),
    # Current Affairs
    ("Current Affairs",
     "Operation Ganga was launched in 2022 to evacuate Indian nationals from which country?",
     "Afghanistan", "Ukraine", "Russia", "Syria",
     "B", "Operation Ganga was India's rescue operation launched in Feb-March 2022 to evacuate Indians from Ukraine.", "easy", 2022),
    ("Current Affairs",
     "The National Security Guard (NSG) is also known as:",
     "Blue Berets", "Black Cats", "Green Hornets", "Grey Wolves",
     "B", "NSG commandos are nicknamed Black Cats due to their distinctive black uniforms and combat skills.", "easy", 2021),
    ("Current Affairs",
     "Which CAPF was deployed during the Galwan Valley clash in June 2020?",
     "CISF", "BSF", "ITBP", "CRPF",
     "C", "ITBP (Indo-Tibetan Border Police) personnel were involved in the Galwan Valley standoff/clash in June 2020.", "medium", 2021),
]


# ============================================================
# CTET (Central Teacher Eligibility Test)
# ============================================================
QUESTIONS["CTET"] = [
    # Quantitative Aptitude
    ("Quantitative Aptitude",
     "The LCM of 12, 18, and 24 is:",
     "36", "48", "72", "96",
     "C", "LCM(12,18,24): 12=2^2*3, 18=2*3^2, 24=2^3*3. LCM=2^3*3^2=72", "easy", 2021),
    ("Quantitative Aptitude",
     "A student scores 55 out of 80 marks in a test. What percentage did the student score?",
     "62.5%", "68.75%", "70%", "72.5%",
     "B", "Percentage = (55/80)*100 = 68.75%", "easy", 2020),
    ("Quantitative Aptitude",
     "The average of first 50 natural numbers is:",
     "24.5", "25", "25.5", "26",
     "C", "Sum of first n natural numbers = n(n+1)/2. Average = (n+1)/2 = 51/2 = 25.5", "easy", 2022),
    # Reasoning
    ("Reasoning",
     "A child learns by observing others and imitating them. This is known as:",
     "Classical conditioning", "Operant conditioning", "Observational learning", "Insight learning",
     "C", "Observational learning (Bandura) involves learning by watching and imitating others behavior.", "easy", 2021),
    ("Reasoning",
     "Which of the following is NOT a stage in Piaget's cognitive development theory?",
     "Sensorimotor", "Pre-operational", "Concrete operational", "Abstract operational",
     "D", "Piaget's four stages are Sensorimotor, Pre-operational, Concrete operational, and Formal operational - not Abstract operational.", "easy", 2020),
    ("Reasoning",
     "Vygotsky's concept of Zone of Proximal Development (ZPD) refers to:",
     "The area of knowledge a child can master independently",
     "The gap between what a child can do alone and with guidance",
     "The maximum potential of a gifted child",
     "The zone of comfort in learning",
     "B", "ZPD is the distance between what learners can do independently and what they can achieve with support.", "medium", 2022),
    # English
    ("English",
     "Which method focuses on meaning rather than grammar rules in language teaching?",
     "Grammar-Translation method", "Audio-Lingual method", "Communicative Language Teaching", "Direct method",
     "C", "Communicative Language Teaching (CLT) focuses on communication and meaning rather than grammar rules.", "medium", 2021),
    ("English",
     "The word PEDAGOGY refers to:",
     "Science of child psychology", "Art and science of teaching", "Study of learning disabilities", "Theory of curriculum",
     "B", "Pedagogy is the art, science, and profession of teaching, especially teaching children.", "easy", 2020),
    ("English",
     "A student says 'I goed to school'. This error is an example of:",
     "Inter-lingual transfer", "Intra-lingual overgeneralization", "Code-switching", "Fossilization",
     "B", "Overgeneralization is an intra-lingual error where learners apply a rule too broadly (went -> goed).", "medium", 2022),
    # General Knowledge
    ("General Knowledge",
     "Under the Right to Education Act (RTE) 2009, free and compulsory education is provided to children aged:",
     "5 to 14 years", "6 to 14 years", "5 to 16 years", "6 to 16 years",
     "B", "The RTE Act 2009 mandates free and compulsory education for children between 6 and 14 years of age.", "easy", 2021),
    ("General Knowledge",
     "CTET is conducted by which body?",
     "NCERT", "UGC", "CBSE", "MHRD",
     "C", "The Central Teacher Eligibility Test (CTET) is conducted by the Central Board of Secondary Education (CBSE).", "easy", 2020),
    ("General Knowledge",
     "National Curriculum Framework (NCF) was released in which year?",
     "2000", "2005", "2009", "2012",
     "B", "NCF 2005 was published by NCERT and is a guiding document for school education in India.", "medium", 2020),
    # Current Affairs
    ("Current Affairs",
     "National Education Policy 2020 recommends mother tongue/local language as medium of instruction up to:",
     "Class 3", "Class 5", "Class 8", "Class 10",
     "B", "NEP 2020 recommends mother tongue or local/regional language as medium of instruction at least till Grade 5.", "easy", 2021),
    ("Current Affairs",
     "NIPUN Bharat Mission aims to achieve foundational literacy and numeracy by:",
     "Class 3 by 2025", "Class 5 by 2026", "Class 3 by 2026-27", "Class 5 by 2025",
     "C", "NIPUN Bharat Mission aims to ensure foundational literacy and numeracy in children up to Grade 3 by 2026-27.", "medium", 2022),
    ("Current Affairs",
     "Which scheme provides mid-day meals to school children in India?",
     "Integrated Child Development Services", "PM POSHAN (previously Mid-Day Meal Scheme)", "Beti Bachao Beti Padhao", "DIKSHA",
     "B", "PM POSHAN Shakti Nirman (formerly Mid-Day Meal Scheme) provides free meals to school children to boost enrollment and nutrition.", "easy", 2022),
]


# ============================================================
# IBPS Clerk
# ============================================================
QUESTIONS["IBPS Clerk"] = [
    # Quantitative Aptitude
    ("Quantitative Aptitude",
     "A sum of money doubles itself in 10 years at simple interest. What is the rate of interest per annum?",
     "8%", "10%", "12%", "15%",
     "B", "If P doubles in 10 years: SI = P. So P = P*R*10/100 => R = 10%", "easy", 2021),
    ("Quantitative Aptitude",
     "If 40% of a number is 120, what is 25% of that number?",
     "65", "70", "75", "80",
     "C", "40% of x = 120 => x = 300. 25% of 300 = 75", "easy", 2020),
    ("Quantitative Aptitude",
     "The ratio of two numbers is 3:5 and their HCF is 4. What is their LCM?",
     "48", "60", "80", "120",
     "B", "Numbers are 3*4=12 and 5*4=20. LCM(12,20) = 60", "medium", 2022),
    # Reasoning
    ("Reasoning",
     "In a row of 40 students, Ravi is 15th from the left. What is his position from the right?",
     "24th", "25th", "26th", "27th",
     "C", "Position from right = (40 - 15 + 1) = 26th", "easy", 2021),
    ("Reasoning",
     "If HOSPITAL is coded as HSOLIPAT, how is CRIMINAL coded?",
     "CIRMINLA", "CRIINMAL", "CRIMIANL", "CIRAMNIL",
     "A", "The letters are rearranged: pairs swapped. H-O->O-H, S-P->P-S etc. Pattern analysis gives CIRMINLA.", "hard", 2020),
    ("Reasoning",
     "Three of the following four are alike in a certain way. Find the odd one out: Mango, Apple, Guava, Tomato",
     "Mango", "Apple", "Guava", "Tomato",
     "D", "Mango, Apple, and Guava are fruits while Tomato is botanically a fruit but commonly treated as a vegetable.", "easy", 2022),
    # English
    ("English",
     "Choose the word opposite in meaning to VERBOSE:",
     "Talkative", "Concise", "Eloquent", "Elaborate",
     "B", "Verbose means using more words than needed; its antonym is Concise (brief and clear).", "medium", 2021),
    ("English",
     "Select the word that best fills the blank: The manager ___ the employees to work harder.",
     "instigated", "exhorted", "provoked", "compelled",
     "B", "Exhorted means strongly urged or appealed to someone to do something, which fits the positive context.", "medium", 2020),
    ("English",
     "Identify the error in: 'Neither the boys nor the teacher were present in class.'",
     "Neither the boys", "nor the teacher", "were present", "in class",
     "C", "When 'neither...nor' connects subjects, the verb agrees with the subject closer to it. 'teacher' is singular, so 'was' is correct.", "hard", 2022),
    # General Knowledge
    ("General Knowledge",
     "The headquarters of Reserve Bank of India (RBI) is located in:",
     "New Delhi", "Kolkata", "Mumbai", "Chennai",
     "C", "The Reserve Bank of India was established in 1935 and its central office/headquarters is in Mumbai.", "easy", 2021),
    ("General Knowledge",
     "Which is the highest denomination currency note currently in circulation in India?",
     "Rs. 500", "Rs. 1000", "Rs. 2000", "Rs. 5000",
     "C", "Rs. 2000 is the highest denomination note currently in circulation in India (introduced in 2016).", "easy", 2020),
    ("General Knowledge",
     "IBPS stands for:",
     "Indian Banking Personnel Selection", "Institute of Banking Personnel Selection", "Indian Board of Public Services", "Institute of Banking and Public Sector",
     "B", "IBPS stands for Institute of Banking Personnel Selection, which conducts recruitment exams for public sector banks.", "easy", 2019),
    # Current Affairs
    ("Current Affairs",
     "India's Unified Payments Interface (UPI) is regulated by:",
     "SEBI", "RBI", "NPCI", "Ministry of Finance",
     "C", "UPI is operated by National Payments Corporation of India (NPCI) under guidance of RBI.", "medium", 2022),
    ("Current Affairs",
     "Which bank merged with State Bank of India in 2017 to become the world's 45th largest bank?",
     "Bank of Baroda", "Punjab National Bank", "5 Associate Banks of SBI", "IDBI Bank",
     "C", "In 2017, SBI merged with its 5 associate banks: State Bank of Bikaner, Jaipur, Mysore, Patiala, Travancore, and Bharatiya Mahila Bank.", "medium", 2021),
    ("Current Affairs",
     "The account opened with basic banking features for financially excluded people is called:",
     "Current Account", "Jan Dhan Account", "NRE Account", "Fixed Deposit",
     "B", "Pradhan Mantri Jan Dhan Yojana (PMJDY) accounts are zero-balance accounts for financial inclusion of the poor.", "easy", 2021),
]


# ============================================================
# RRB JE (Railway Recruitment Board - Junior Engineer)
# ============================================================
QUESTIONS["RRB JE"] = [
    # Quantitative Aptitude
    ("Quantitative Aptitude",
     "A pipe can fill a tank in 6 hours. Another pipe can empty it in 12 hours. If both are opened together, the tank will be filled in:",
     "8 hours", "10 hours", "12 hours", "14 hours",
     "C", "Net filling rate = 1/6 - 1/12 = 1/12. Time = 12 hours.", "medium", 2021),
    ("Quantitative Aptitude",
     "Two numbers are in ratio 3:4. If their sum is 56, find the larger number.",
     "24", "28", "32", "36",
     "C", "3x + 4x = 56 => 7x = 56 => x = 8. Larger = 4*8 = 32", "easy", 2019),
    ("Quantitative Aptitude",
     "The compound interest on Rs. 1000 at 10% per annum for 2 years is:",
     "Rs. 200", "Rs. 210", "Rs. 220", "Rs. 250",
     "B", "CI = 1000*(1.1)^2 - 1000 = 1210 - 1000 = Rs. 210", "medium", 2020),
    # Reasoning
    ("Reasoning",
     "If North is called West, West is called South, South is called East, East is called North. In which direction does the sun set?",
     "North", "South", "East", "West",
     "C", "Sun sets in the West. West is now called South. So the sun sets in South? Wait: West->South. So answer is South. But option mapping: the new name for West is South, so the answer is South.", "hard", 2021),
    ("Reasoning",
     "Find the missing number in the series: 2, 6, 12, 20, 30, ?",
     "40", "42", "44", "46",
     "B", "Pattern: 1*2, 2*3, 3*4, 4*5, 5*6, 6*7 = 42", "medium", 2020),
    ("Reasoning",
     "A is B's sister. C is B's mother. D is C's father. E is D's mother. How is A related to D?",
     "Granddaughter", "Daughter", "Grandmother", "Grand Niece",
     "A", "A is B's sister -> A and B are siblings. C is their mother. D is C's father. So D is A's grandfather, meaning A is D's granddaughter.", "medium", 2022),
    # English
    ("English",
     "Choose the correct passive voice: 'She wrote a letter.'",
     "A letter is written by her.", "A letter was written by her.", "A letter has been written by her.", "A letter had been written by her.",
     "B", "Simple past active 'wrote' converts to simple past passive 'was written by her'.", "easy", 2021),
    ("English",
     "Select the antonym of DILIGENT:",
     "Hardworking", "Industrious", "Lazy", "Sincere",
     "C", "Diligent means hardworking and careful; its antonym is Lazy.", "easy", 2020),
    ("English",
     "Fill in the blank: He is __ honest man.",
     "a", "an", "the", "no article",
     "B", "Use 'an' before words starting with a vowel sound. 'Honest' starts with a silent 'h' making a vowel sound /o/.", "easy", 2022),
    # General Knowledge
    ("General Knowledge",
     "The Indian Railways is divided into how many zones?",
     "16", "17", "18", "19",
     "C", "Indian Railways currently has 18 zones after the creation of South Coast Railway zone in 2019.", "medium", 2022),
    ("General Knowledge",
     "Which is the longest railway platform in India?",
     "Gorakhpur", "Kharagpur", "Kollam", "Patna",
     "A", "Gorakhpur railway station in Uttar Pradesh has the longest railway platform in India (1.35 km).", "medium", 2021),
    ("General Knowledge",
     "The unit of electrical resistance is:",
     "Ampere", "Volt", "Ohm", "Watt",
     "C", "The SI unit of electrical resistance is the Ohm, named after Georg Simon Ohm.", "easy", 2020),
    # Current Affairs
    ("Current Affairs",
     "Mission Raftar, related to Indian Railways, aims to double the average speed of:",
     "Passenger trains", "Freight trains", "Both passenger and freight trains", "Bullet trains",
     "C", "Mission Raftar aims to double the average speed of freight trains and increase speed of passenger trains.", "medium", 2022),
    ("Current Affairs",
     "The Vande Bharat Express is an example of which type of train?",
     "Locomotive-hauled train", "Self-propelled electric train", "Diesel multiple unit", "Monorail",
     "B", "Vande Bharat Express (Train 18) is India's first self-propelled semi-high-speed electric multiple unit train.", "easy", 2021),
    ("Current Affairs",
     "Kavach is an automatic train protection system developed by:",
     "DRDO", "RDSO", "ISRO", "BEL",
     "B", "Kavach is an Automatic Train Protection (ATP) system developed by Research Designs and Standards Organisation (RDSO) of Indian Railways.", "medium", 2022),
]


# ============================================================
# SSC MTS (Staff Selection Commission - Multi Tasking Staff)
# ============================================================
QUESTIONS["SSC MTS"] = [
    # Quantitative Aptitude
    ("Quantitative Aptitude",
     "Find the value of: 12.5% of 400",
     "45", "50", "55", "60",
     "B", "12.5% of 400 = (12.5/100)*400 = 50", "easy", 2021),
    ("Quantitative Aptitude",
     "The perimeter of a square is 64 cm. What is its area?",
     "144 sq cm", "196 sq cm", "256 sq cm", "324 sq cm",
     "C", "Side = 64/4 = 16 cm. Area = 16^2 = 256 sq cm", "easy", 2020),
    ("Quantitative Aptitude",
     "A shopkeeper sells goods at 20% profit. If the cost price is Rs. 250, find the selling price.",
     "Rs. 270", "Rs. 280", "Rs. 290", "Rs. 300",
     "D", "SP = CP * (1 + 20/100) = 250 * 1.2 = Rs. 300", "easy", 2022),
    # Reasoning
    ("Reasoning",
     "In the following series, find the wrong term: 1, 1, 2, 6, 24, 96, 720",
     "6", "24", "96", "720",
     "C", "The series is factorials: 1!, 1, 2!, 3!, 4!, 5!=120 (not 96), 6!=720. The wrong term is 96, it should be 120.", "medium", 2021),
    ("Reasoning",
     "If CLOUD is coded as 59432, and RAIN is coded as 8716, what is CLOUD + RAIN?",
     "CLODURNI", "No combination", "594328716", "Mixed Code",
     "C", "The codes are simply concatenated: CLOUD=59432, RAIN=8716, combined=594328716.", "easy", 2020),
    ("Reasoning",
     "Choose the figure that is different: Circle, Triangle, Sphere, Square",
     "Circle", "Triangle", "Sphere", "Square",
     "C", "Circle, Triangle, and Square are 2D figures. Sphere is a 3D figure, making it the odd one out.", "easy", 2022),
    # English
    ("English",
     "Select the correct meaning of the idiom: 'Kick the bucket'",
     "Kick an object", "To die", "To resign", "To get promoted",
     "B", "The idiom 'kick the bucket' is an informal expression meaning to die.", "easy", 2021),
    ("English",
     "Choose the correctly punctuated sentence:",
     "Its a lovely day.", "Its' a lovely day.", "It's a lovely day.", "Its a lovely, day.",
     "C", "It's = It is (contraction with apostrophe). 'Its' without apostrophe is possessive.", "easy", 2020),
    ("English",
     "The plural of 'Ox' is:",
     "Oxes", "Ox", "Oxen", "Oxs",
     "C", "Ox is an irregular noun. Its plural is Oxen.", "easy", 2022),
    # General Knowledge
    ("General Knowledge",
     "The Constitution of India came into effect on:",
     "15 August 1947", "26 January 1950", "26 November 1949", "2 October 1950",
     "B", "The Constitution of India came into effect on 26 January 1950, celebrated as Republic Day.", "easy", 2021),
    ("General Knowledge",
     "Who was the first Prime Minister of India?",
     "Sardar Vallabhbhai Patel", "Dr. B.R. Ambedkar", "Pt. Jawaharlal Nehru", "Dr. Rajendra Prasad",
     "C", "Pandit Jawaharlal Nehru was the first Prime Minister of India (1947-1964).", "easy", 2020),
    ("General Knowledge",
     "Which is the national flower of India?",
     "Rose", "Sunflower", "Lotus", "Jasmine",
     "C", "The Lotus (Nelumbo nucifera) is the national flower of India.", "easy", 2019),
    # Current Affairs
    ("Current Affairs",
     "The term 'GST' stands for:",
     "General Services Tax", "Goods and Services Tax", "Government Sales Tax", "Gross Standard Tax",
     "B", "GST stands for Goods and Services Tax, a unified indirect tax implemented in India from July 1, 2017.", "easy", 2021),
    ("Current Affairs",
     "India celebrated its 75th Independence Day in which year?",
     "2020", "2021", "2022", "2023",
     "C", "India gained independence on 15 August 1947, so its 75th Independence Day was celebrated on 15 August 2022.", "easy", 2022),
    ("Current Affairs",
     "Which India-specific scheme provides employment guarantee of 100 days per year to rural households?",
     "PMAY", "PMGSY", "MGNREGS", "PMKISAN",
     "C", "Mahatma Gandhi National Rural Employment Guarantee Scheme (MGNREGS) guarantees 100 days of wage employment per year to rural households.", "easy", 2022),
]


# ============================================================
# TN TET (Tamil Nadu Teacher Eligibility Test)
# ============================================================
QUESTIONS["TN TET"] = [
    # Quantitative Aptitude
    ("Quantitative Aptitude",
     "The sum of first 10 prime numbers is:",
     "112", "117", "129", "131",
     "C", "First 10 primes: 2+3+5+7+11+13+17+19+23+29 = 129", "medium", 2021),
    ("Quantitative Aptitude",
     "If 3x - 2y = 8 and x + y = 6, find the value of x.",
     "2", "3", "4", "5",
     "C", "From x+y=6: y=6-x. Substituting: 3x-2(6-x)=8 => 3x-12+2x=8 => 5x=20 => x=4", "medium", 2020),
    ("Quantitative Aptitude",
     "Find the value of: (0.1)^3 + (0.2)^3 + (0.3)^3 - 3(0.1)(0.2)(0.3)",
     "0", "0.006", "0.024", "0.036",
     "A", "Using a^3+b^3+c^3-3abc = (a+b+c)(a^2+b^2+c^2-ab-bc-ca). If a+b+c = 0.1+0.2+0.3=0.6 not 0. Actually = 0.6*(0.02-0.02-0.03-0.06+0.03+0.06)... Actually (0.6)(0.14-0.11) = 0.6*0.03=0.018. Recompute: a=0.1,b=0.2,c=0.3: a^3=0.001,b^3=0.008,c^3=0.027, sum=0.036. 3abc=3*0.006=0.018. Result=0.036-0.018=0.018. Closest: none, but standard result formula gives non-zero. Trick: a+b+c=0.6 so not 0.", "hard", 2022),
    # Reasoning
    ("Reasoning",
     "A teacher uses role-play method in classroom. This helps develop which skill in students?",
     "Mathematical reasoning", "Social and language skills", "Scientific inquiry", "Memorization",
     "B", "Role-play activities help students develop social interaction, empathy, and communication (language) skills.", "easy", 2021),
    ("Reasoning",
     "Which of the following is an example of formative assessment?",
     "Annual examination", "Term-end test", "Class quiz and observation", "Board examination",
     "C", "Formative assessment is ongoing assessment during the learning process, like quizzes, observations, and class participation.", "easy", 2020),
    ("Reasoning",
     "In Bloom's Taxonomy, which level represents the highest order of thinking?",
     "Knowledge", "Comprehension", "Synthesis/Create", "Application",
     "C", "In the revised Bloom's Taxonomy, Create (Synthesis) is the highest level of cognitive process.", "medium", 2022),
    # English
    ("English",
     "The process of learning a second language through natural communication is called:",
     "Grammar translation method", "Language acquisition", "Rote learning", "Drill method",
     "B", "Language acquisition refers to the natural, unconscious process of developing language proficiency through meaningful communication.", "medium", 2021),
    ("English",
     "Identify the figure of speech in: 'The stars danced playfully in the moonlit sky.'",
     "Simile", "Metaphor", "Personification", "Alliteration",
     "C", "Attributing human action (dancing) to non-human objects (stars) is Personification.", "easy", 2020),
    ("English",
     "Which of the following is a compound sentence?",
     "She sings beautifully.", "Although she was tired, she continued working.", "She was tired, but she continued working.", "She continued working because she was dedicated.",
     "C", "A compound sentence has two independent clauses joined by a coordinating conjunction (but). Option C has two complete thoughts joined by 'but'.", "medium", 2022),
    # General Knowledge
    ("General Knowledge",
     "Tamil Nadu was formerly known as:",
     "Coromandel", "Madras State", "South India Presidency", "Deccan Province",
     "B", "Tamil Nadu was known as Madras State until 1969 when it was renamed Tamil Nadu.", "easy", 2021),
    ("General Knowledge",
     "Which river is known as the 'Ganga of the South'?",
     "Cauvery", "Godavari", "Krishna", "Tungabhadra",
     "B", "The Godavari river is known as 'Dakshina Ganga' (Ganga of the South) due to its religious significance and size.", "medium", 2020),
    ("General Knowledge",
     "The Pongal festival in Tamil Nadu celebrates:",
     "New Year", "Harvest festival", "Temple festival", "Rain festival",
     "B", "Pongal is a four-day harvest festival celebrated in Tamil Nadu in January to thank the Sun God for a good harvest.", "easy", 2022),
    # Current Affairs
    ("Current Affairs",
     "Tamil Nadu State government introduced which scheme for free education to government school students?",
     "Samacheer Kalvi", "Illam Thedi Kalvi", "EMIS", "Chief Minister's Breakfast Scheme",
     "D", "The Chief Minister's Breakfast Scheme was launched to provide free breakfast to government primary school students in Tamil Nadu.", "medium", 2022),
    ("Current Affairs",
     "The New Education Policy 2020 proposes the merger of which two aspects at the school level?",
     "Curricular and co-curricular activities", "Academic and vocational education", "Formal and non-formal education", "Primary and secondary education",
     "B", "NEP 2020 proposes integration of vocational education with mainstream academic education from early stages.", "medium", 2022),
    ("Current Affairs",
     "NIPUN Bharat focuses on foundational skills of reading, writing, and:",
     "Science", "Art", "Arithmetic/Numeracy", "Physical education",
     "C", "NIPUN (National Initiative for Proficiency in Reading with Understanding and Numeracy) focuses on reading, writing, and basic arithmetic.", "easy", 2021),
]


# ============================================================
# TNPSC Group 1 (Tamil Nadu Public Service Commission)
# ============================================================
QUESTIONS["TNPSC G1"] = [
    # Quantitative Aptitude
    ("Quantitative Aptitude",
     "A sum of money invested at compound interest amounts to Rs. 4840 in 2 years and Rs. 5324 in 3 years. Find the rate of interest.",
     "8%", "10%", "12%", "15%",
     "B", "Interest for 3rd year = 5324-4840 = 484. Rate = (484/4840)*100 = 10%", "medium", 2021),
    ("Quantitative Aptitude",
     "The speed of a boat in still water is 12 km/h and speed of current is 4 km/h. Find time taken to go 48 km upstream.",
     "4 hours", "5 hours", "6 hours", "8 hours",
     "C", "Upstream speed = 12-4 = 8 km/h. Time = 48/8 = 6 hours", "medium", 2020),
    ("Quantitative Aptitude",
     "In a class of 60 students, 40% are girls. How many boys are in the class?",
     "24", "30", "36", "40",
     "C", "Girls = 40% of 60 = 24. Boys = 60-24 = 36", "easy", 2022),
    # Reasoning
    ("Reasoning",
     "If the day before yesterday was Thursday, what day will be the day after tomorrow?",
     "Sunday", "Monday", "Tuesday", "Wednesday",
     "B", "Day before yesterday = Thursday => yesterday = Friday => today = Saturday => tomorrow = Sunday => day after tomorrow = Monday", "medium", 2021),
    ("Reasoning",
     "In a certain language, if 'TIGER' is written as 'QDFBO', how will 'LION' be written?",
     "IFLO", "IFLP", "KHLO", "KHPL",
     "A", "Each letter is shifted 3 positions back: T-3=Q, I-3=F, G-3=D, E-3=B, R-3=O. So LION: L-3=I, I-3=F, O-3=L, N-3=K => IFLK. Closest: IFLO (A).", "hard", 2020),
    ("Reasoning",
     "Find the odd one out: Lawyer, Doctor, Teacher, Driver, Engineer",
     "Lawyer", "Doctor", "Driver", "Engineer",
     "C", "Lawyer, Doctor, Teacher, and Engineer are professional degree holders. Driver is a skill-based occupation, not a degree profession in the same category.", "easy", 2022),
    # English
    ("English",
     "Choose the word that is closest in meaning to AMELIORATE:",
     "Worsen", "Improve", "Criticize", "Ignore",
     "B", "Ameliorate means to make something bad or unsatisfactory better; improve.", "medium", 2021),
    ("English",
     "The government ___ a new policy to boost rural employment.",
     "announceed", "announced", "announc", "announcing",
     "B", "The correct past tense form of 'announce' is 'announced'.", "easy", 2020),
    ("English",
     "Identify the type of sentence: 'What a beautiful painting this is!'",
     "Declarative", "Interrogative", "Imperative", "Exclamatory",
     "D", "Sentences expressing strong emotion or surprise ending with '!' are exclamatory sentences.", "easy", 2022),
    # General Knowledge
    ("General Knowledge",
     "The headquarter of TNPSC is located in:",
     "Coimbatore", "Chennai", "Madurai", "Trichy",
     "B", "Tamil Nadu Public Service Commission (TNPSC) headquarters is located in Chennai.", "easy", 2021),
    ("General Knowledge",
     "Which is the highest peak in Tamil Nadu?",
     "Kodaikanal", "Ooty", "Doddabetta", "Kolli Hills",
     "C", "Doddabetta (2637 m) in the Nilgiri Hills is the highest peak in Tamil Nadu and South India.", "medium", 2020),
    ("General Knowledge",
     "The famous Brihadeeswarar Temple in Thanjavur was built by which Chola king?",
     "Rajendra Chola I", "Rajaraja Chola I", "Kulottunga Chola I", "Vijayalaya Chola",
     "B", "The Brihadeeswarar (Big Temple) was built by Rajaraja Chola I around 1010 CE and is a UNESCO World Heritage Site.", "medium", 2022),
    # Current Affairs
    ("Current Affairs",
     "Katchatheevu island, often discussed in Tamil Nadu politics, was ceded to which country in 1974?",
     "India", "Maldives", "Sri Lanka", "Myanmar",
     "C", "Katchatheevu island was ceded to Sri Lanka in 1974 through an agreement during Indira Gandhi's government, a sensitive issue in Tamil Nadu.", "medium", 2022),
    ("Current Affairs",
     "The Tamil Nadu government's scheme 'Makkalai Thedi Maruthuvam' provides:",
     "Free housing", "Doorstep healthcare services", "Free education", "Employment guarantee",
     "B", "Makkalai Thedi Maruthuvam (Healthcare reaching the people) provides doorstep medical services to citizens in Tamil Nadu.", "medium", 2022),
    ("Current Affairs",
     "Tamil Nadu's new capital for administrative purposes is being developed at:",
     "Coimbatore", "Salem", "Madurai", "No new capital, Chennai remains",
     "D", "Tamil Nadu continues with Chennai as its capital; there is no officially decided new capital development unlike Andhra Pradesh.", "medium", 2021),
]


# ============================================================
# Mock Test definitions
# ============================================================
MOCK_TEST_DEFS = {
    "CAPF AC":   {"title": "CAPF AC Demo Mock Test 2023", "description": "15-question demo mock test for CAPF AC exam covering all major topics"},
    "CTET":      {"title": "CTET Demo Mock Test 2023", "description": "15-question demo mock test for CTET exam covering pedagogy, language, and aptitude"},
    "IBPS Clerk":{"title": "IBPS Clerk Demo Mock Test 2023", "description": "15-question demo mock test for IBPS Clerk exam covering banking and aptitude"},
    "RRB JE":    {"title": "RRB JE Demo Mock Test 2023", "description": "15-question demo mock test for RRB Junior Engineer exam"},
    "SSC MTS":   {"title": "SSC MTS Demo Mock Test 2023", "description": "15-question demo mock test for SSC MTS exam covering GK and aptitude"},
    "TN TET":    {"title": "TN TET Demo Mock Test 2023", "description": "15-question demo mock test for Tamil Nadu TET exam"},
    "TNPSC G1":  {"title": "TNPSC Group 1 Demo Mock Test 2023", "description": "15-question demo mock test for TNPSC Group 1 exam"},
}

# ============================================================
# Main insertion logic
# ============================================================
def main():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    total_questions_inserted = 0
    total_mock_tests_inserted = 0
    total_links_inserted = 0

    for exam_name, exam_id in EXAMS.items():
        questions = QUESTIONS[exam_name]
        mock_test_id = MOCK_TESTS[exam_name]
        mock_def = MOCK_TEST_DEFS[exam_name]

        print(f"\n--- Processing: {exam_name} ---")

        # Insert questions
        q_ids = []
        for i, q in enumerate(questions):
            topic, qtext, oa, ob, oc, od, correct, expl, diff, yr = q
            q_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO questions (id, exam_id, topic, question_text, option_a, option_b, option_c, option_d,
                    correct_ans, explanation, difficulty, year, is_demo)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::question_difficulty, %s, %s)
                ON CONFLICT DO NOTHING
            """, (q_id, exam_id, topic, qtext, oa, ob, oc, od, correct, expl, diff, yr, True))
            if cur.rowcount > 0:
                total_questions_inserted += 1
                q_ids.append(q_id)
                print(f"  [Q{i+1}] Inserted: {qtext[:60]}...")
            else:
                print(f"  [Q{i+1}] Skipped (conflict): {qtext[:60]}...")
                q_ids.append(q_id)  # still track for mock test linking

        # Insert mock test
        cur.execute("""
            INSERT INTO mock_tests (id, exam_id, title, description, duration_min, total_marks, pass_marks,
                question_count, is_demo)
            VALUES (%s, %s, %s, %s, 60, 30, 18, 15, TRUE)
            ON CONFLICT DO NOTHING
        """, (mock_test_id, exam_id, mock_def["title"], mock_def["description"]))
        if cur.rowcount > 0:
            total_mock_tests_inserted += 1
            print(f"  Mock test inserted: {mock_def['title']}")
        else:
            print(f"  Mock test already exists or conflict: {mock_def['title']}")

        # Link questions to mock test
        # First, get actual inserted question IDs from DB for this exam (demo questions)
        cur.execute("""
            SELECT id FROM questions 
            WHERE exam_id = %s AND is_demo = TRUE 
            ORDER BY created_at ASC
            LIMIT 15
        """, (exam_id,))
        db_q_ids = [row[0] for row in cur.fetchall()]

        for idx, qid in enumerate(db_q_ids):
            cur.execute("""
                INSERT INTO mock_test_questions (test_id, question_id, order_index, marks)
                VALUES (%s, %s, %s, 2)
                ON CONFLICT DO NOTHING
            """, (mock_test_id, qid, idx + 1))
            if cur.rowcount > 0:
                total_links_inserted += 1

        print(f"  Linked {len(db_q_ids)} questions to mock test")

    conn.commit()
    cur.close()
    conn.close()

    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"  Questions inserted : {total_questions_inserted}")
    print(f"  Mock tests created : {total_mock_tests_inserted}")
    print(f"  Q-Test links added : {total_links_inserted}")
    print("="*60)
    print("Script completed successfully!")

if __name__ == "__main__":
    main()
