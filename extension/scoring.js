const rules = [
  {
    id: 'fake-check',
    severity: 32,
    title: 'Fake check or equipment purchase language',
    pattern: /\b(check|cheque).{0,80}\b(equipment|supplies|software|laptop|printer)|\b(equipment|supplies|laptop).{0,80}\b(check|cheque)\b/i,
    detail: 'Scammers often claim they will send a check so applicants can buy equipment.',
  },
  {
    id: 'payment-request',
    severity: 30,
    title: 'Payment or upfront fee request',
    pattern: /\b(pay|payment|fee|deposit|wire|zelle|cashapp|crypto|bitcoin|gift card|venmo)\b/i,
    detail: 'Legitimate employers should not ask applicants to pay to get hired.',
  },
  {
    id: 'personal-email',
    severity: 18,
    title: 'Personal email address detected',
    pattern: /\b[A-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail|icloud|proton)\.[A-Z]{2,}\b/i,
    detail: 'Recruiting from a personal email address can be a sign of impersonation.',
  },
  {
    id: 'messaging-app',
    severity: 16,
    title: 'Off-platform messaging pressure',
    pattern: /\b(telegram|whatsapp|signal app|google chat|skype|text me|sms)\b/i,
    detail: 'Scam recruiters often move applicants to private chat apps quickly.',
  },
  {
    id: 'no-interview',
    severity: 16,
    title: 'No interview or instant hire language',
    pattern: /\b(no interview|required immediately|start today|hired immediately|instant hire|urgent hiring)\b/i,
    detail: 'A rushed process with no real interview can be unsafe.',
  },
  {
    id: 'unrealistic-pay',
    severity: 15,
    title: 'Unusually high or vague pay claim',
    pattern: /\$ ?([7-9]\d|[1-9]\d{2,})\s*(\/|per)?\s*(hour|hr)\b|\b(high pay|easy money|earn from home|no experience needed)\b/i,
    detail: 'Very high pay for vague work is common in fake remote-job posts.',
  },
  {
    id: 'vague-role',
    severity: 10,
    title: 'Vague role description',
    pattern: /\b(data entry|personal assistant|remote assistant|package handler|reshipping|mystery shopper)\b/i,
    detail: 'Some role categories are frequently abused by scammers when details are thin.',
  },
]

const positiveSignals = [
  {
    id: 'company-email',
    value: 8,
    title: 'Company-domain email found',
    pattern: /\b[A-Z0-9._%+-]+@(?!gmail|yahoo|outlook|hotmail|icloud|proton)[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  },
  {
    id: 'careers-portal',
    value: 8,
    title: 'Careers portal or application system mentioned',
    pattern: /\b(careers portal|official careers|greenhouse|lever|workday|ashby|smartrecruiters|jobvite)\b/i,
  },
  {
    id: 'clear-process',
    value: 7,
    title: 'Clear hiring process language',
    pattern: /\b(interview|recruiter screen|hiring manager|responsibilities|qualifications|benefits|team)\b/i,
  },
]

export function scoreJobPost(text = '') {
  const normalized = String(text).replace(/\s+/g, ' ').trim()
  const findings = rules
    .filter((rule) => rule.pattern.test(normalized))
    .map(({ id, severity, title, detail }) => ({ id, severity, title, detail }))
  const positives = positiveSignals
    .filter((signal) => signal.pattern.test(normalized))
    .map(({ id, value, title }) => ({ id, value, title }))
  const penalty = findings.reduce((total, finding) => total + finding.severity, 0)
  const boost = positives.reduce((total, signal) => total + signal.value, 0)
  const thinDescriptionPenalty = normalized.length < 420 ? 8 : 0
  const score = clamp(88 + boost - penalty - thinDescriptionPenalty, 0, 100)
  const label = labelForScore(score)
  return {
    score,
    label,
    tone: label === 'Safe to review' ? 'safe' : label === 'Needs verification' ? 'review' : 'risk',
    findings,
    positives,
    summary: summaryFor(label, findings),
    nextSteps: nextStepsFor(label),
  }
}

function labelForScore(score) {
  if (score >= 75) return 'Safe to review'
  if (score >= 45) return 'Needs verification'
  return 'High scam risk'
}

function summaryFor(label, findings) {
  if (label === 'Safe to review') return 'This posting has several legitimacy signals and no major scam language detected.'
  if (label === 'Needs verification') return 'This posting has mixed signals. Verify the company and role through an official careers page before applying.'
  return `${findings[0]?.title || 'Multiple scam indicators detected'}. Do not send documents, bank details, or payment until the role is verified.`
}

function nextStepsFor(label) {
  if (label === 'Safe to review') return ['Confirm the role on the company careers page', 'Apply through the official application link', 'Keep communication on verified channels']
  if (label === 'Needs verification') return ['Search the company careers page', 'Check the recruiter email domain', 'Avoid sharing sensitive documents until verified']
  return ['Do not pay for equipment or fees', 'Do not share bank or SSN details', 'Report the post and verify through the official company site']
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Math.round(value)))
}
