/**
 * Rule-based job scam risk detector
 * Supplement with AI analysis in the AI service for better accuracy
 */

const HIGH_RISK_PATTERNS = [
  /pay.*registration fee/i,
  /send.*money/i,
  /wire.*transfer/i,
  /western union/i,
  /upfront.*payment/i,
  /guaranteed.*salary/i,
  /work from home.*\d{5,}/i,  // very high WFH salary
  /no experience.*\d{4,}/i,
  /\.xyz|\.club|\.tk|\.ml/i,  // suspicious TLDs
];

const MEDIUM_RISK_PATTERNS = [
  /whatsapp.*apply/i,
  /telegram.*apply/i,
  /gmail.*hiring/i,
  /yahoo.*hiring/i,
  /no interview/i,
  /immediate joining/i,
  /send.*aadhar/i,
  /send.*pan card/i,
  /send.*bank details/i,
];

const detectScamRisk = (text) => {
  const reasons = [];
  let highCount = 0;
  let mediumCount = 0;

  HIGH_RISK_PATTERNS.forEach((pattern) => {
    if (pattern.test(text)) {
      highCount++;
      reasons.push(`High-risk indicator detected: "${pattern.source}"`);
    }
  });

  MEDIUM_RISK_PATTERNS.forEach((pattern) => {
    if (pattern.test(text)) {
      mediumCount++;
      reasons.push(`Suspicious indicator: "${pattern.source}"`);
    }
  });

  // Missing company info check
  if (text.length < 100) {
    mediumCount++;
    reasons.push('Job description is very short — missing company information');
  }

  let riskLevel = 'low';
  if (highCount > 0) riskLevel = 'high';
  else if (mediumCount >= 2) riskLevel = 'high';
  else if (mediumCount === 1) riskLevel = 'medium';

  return {
    riskLevel,
    reasons,
    disclaimer: 'This is an AI risk assessment based on pattern matching and is NOT a legal guarantee. Always verify through official channels.',
  };
};

module.exports = { detectScamRisk };
