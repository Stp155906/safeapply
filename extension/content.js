const JOB_TEXT_SELECTORS = [
  '[data-testid*="job"]',
  '[data-testid*="description"]',
  '[class*="job"]',
  '[class*="description"]',
  '[id*="job"]',
  '[id*="description"]',
  'main',
  'article',
  'body',
]

const TITLE_SELECTORS = ['h1', '[data-testid*="job-title"]', '[class*="job-title"]', '[class*="title"]']
const COMPANY_SELECTORS = ['[data-testid*="company"]', '[class*="company"]', '[class*="employer"]', '[aria-label*="Company"]']
const JOB_CARD_SELECTORS = ['[data-job-id]', '[data-occludable-job-id]', '.job-card-container', '.jobs-search-results__list-item', 'li[class*="jobs-search"]', 'article[class*="job"]']

function getVisibleJobText() {
  const candidates = JOB_TEXT_SELECTORS
    .map((selector) => ({
      selector,
      text: Array.from(document.querySelectorAll(selector))
        .map((node) => node.innerText)
        .filter(Boolean)
        .join('\n'),
    }))
    .filter((candidate) => candidate.text.trim().length > 260)
    .sort((a, b) => b.text.length - a.text.length)

  const text = candidates[0]?.text || document.body?.innerText || ''
  return cleanText(text).slice(0, 14000)
}

function getVisibleJobCards() {
  const seen = new Set()
  const cards = []
  for (const selector of JOB_CARD_SELECTORS) {
    for (const node of document.querySelectorAll(selector)) {
      if (cards.length >= 8) break
      if (seen.has(node)) continue
      seen.add(node)
      const text = cleanText(node.innerText || node.textContent || '')
      if (!looksLikeJobCard(text)) continue
      const title = extractCardTitle(node, text)
      const company = extractLine(text, title)
      const location = extractLine(text, company)
      const id = node.getAttribute('data-job-id') || node.getAttribute('data-occludable-job-id') || `${title}-${company}`.slice(0, 80)
      cards.push({ id, title, company, location, text: text.slice(0, 2200) })
    }
  }
  return dedupeCards(cards)
}

function extractCardTitle(node, fallbackText) {
  const title = firstTextInside(node, ['a[aria-label]', 'a[href*="/jobs/view"]', '.job-card-list__title', '.job-card-container__link', 'strong'])
  if (title) return title.replace(/^View job:?/i, '').trim()
  return fallbackText.split('\n').find((line) => line.length > 4) || 'Visible job listing'
}

function extractLine(text, previous = '') {
  const lines = text
    .split('\n')
    .map((line) => cleanText(line))
    .filter((line) => line.length > 1 && line !== previous && !/^viewed|promoted|easy apply|be an early applicant$/i.test(line))
  return lines[1] || ''
}

function firstTextInside(root, selectors) {
  for (const selector of selectors) {
    const node = root.querySelector(selector)
    const text = node?.getAttribute?.('aria-label') || node?.innerText || node?.textContent
    if (text && cleanText(text).length > 2) return cleanText(text).slice(0, 160)
  }
  return ''
}

function looksLikeJobCard(text) {
  const lines = text.split('\n').filter(Boolean)
  if (lines.length < 2 || text.length < 24) return false
  return /remote|on-site|hybrid|apply|promoted|viewed|company|engineer|analyst|assistant|manager|intern|developer|designer|specialist|coordinator/i.test(text)
}

function dedupeCards(cards) {
  const seen = new Set()
  return cards.filter((card) => {
    const key = `${card.title}|${card.company}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function firstText(selectors) {
  for (const selector of selectors) {
    const node = document.querySelector(selector)
    const text = node?.innerText || node?.textContent
    if (text && text.trim().length > 1) return cleanText(text).slice(0, 140)
  }
  return ''
}

function getPageContext() {
  return {
    title: firstText(TITLE_SELECTORS) || document.title || 'Current page',
    company: firstText(COMPANY_SELECTORS),
    url: location.href,
    hostname: location.hostname.replace(/^www\./, ''),
    text: getVisibleJobText(),
    jobs: getVisibleJobCards(),
  }
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'SAFEAPPLY_SCAN_PAGE') return false
  sendResponse(getPageContext())
  return true
})
