import { scoreJobPost } from './scoring.js'

const toneColors = {
  safe: '#16a34a',
  review: '#c27a02',
  risk: '#dc2626',
}

const scorecard = document.querySelector('#scorecard')
const rescanButton = document.querySelector('#rescan')

rescanButton.addEventListener('click', () => {
  renderLoading()
  scanAndRender()
})

async function scanCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) throw new Error('No active tab available.')
  if (!/^https?:\/\//.test(tab.url || '')) {
    throw new Error('SafeApply can scan regular web pages only. Open a job post on an http or https site.')
  }

  try {
    return await chrome.tabs.sendMessage(tab.id, { type: 'SAFEAPPLY_SCAN_PAGE' })
  } catch (_error) {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] })
    return chrome.tabs.sendMessage(tab.id, { type: 'SAFEAPPLY_SCAN_PAGE' })
  }
}

function renderLoading() {
  scorecard.className = 'scorecard loading'
  scorecard.removeAttribute('style')
  scorecard.innerHTML = '<div class="pulse"></div><p>Scanning visible job-page text...</p>'
}

function renderScorecard(result, page) {
  if (Array.isArray(page.jobs) && page.jobs.length > 1) {
    renderJobList(page)
    return
  }

  const findings = renderSignals(result.findings, 'No major scam language detected', 'Still verify the role through the company careers page.')
  const positives = renderSignals(result.positives, 'Legitimacy signals are limited', 'Look for an official careers page, verified company domain, and clear hiring process.')
  const checkedTitle = [page.title, page.company].filter(Boolean).join(' · ') || 'Current job page'

  scorecard.className = 'scorecard'
  scorecard.style.setProperty('--tone', toneColors[result.tone])
  scorecard.style.setProperty('--score-width', `${result.score}%`)
  scorecard.innerHTML = `
    <div class="score-head">
      <div>
        <p class="eyebrow">Trust scorecard</p>
        <h1 class="label">${escapeHtml(result.label)}</h1>
        <p class="summary">${escapeHtml(result.summary)}</p>
      </div>
      <div class="score-pill">${result.score}</div>
    </div>
    <div class="meter" aria-label="Trust score ${result.score} out of 100"><span></span></div>
    <article class="meta">
      <strong>${escapeHtml(checkedTitle)}</strong>
      <p>${escapeHtml(page.hostname || page.url || '')}</p>
    </article>
    <p class="section-title">Risk signals</p>
    <div class="signals">${findings}</div>
    <p class="section-title">Legitimacy signals</p>
    <div class="signals">${positives}</div>
    <p class="section-title">Next steps</p>
    <ol class="next-steps">${result.nextSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
  `
}

function renderJobList(page) {
  const scoredJobs = page.jobs.slice(0, 6).map((job) => ({
    ...job,
    result: scoreJobPost(`${job.title}\n${job.company}\n${job.location}\n${job.text}`),
  }))
  const averageScore = Math.round(scoredJobs.reduce((total, job) => total + job.result.score, 0) / scoredJobs.length)
  const riskyCount = scoredJobs.filter((job) => job.result.tone === 'risk').length
  const reviewCount = scoredJobs.filter((job) => job.result.tone === 'review').length

  scorecard.className = 'scorecard list-mode'
  scorecard.style.setProperty('--tone', toneColors[scoreToneForScore(averageScore)])
  scorecard.style.setProperty('--score-width', `${averageScore}%`)
  scorecard.innerHTML = `
    <div class="score-head compact">
      <div>
        <p class="eyebrow">Visible job scan</p>
        <h1 class="label">${scoredJobs.length} listings scored</h1>
        <p class="summary">${summaryForJobList(scoredJobs.length, riskyCount, reviewCount)}</p>
      </div>
      <div class="score-pill">${averageScore}</div>
    </div>
    <div class="meter" aria-label="Average visible listing trust score ${averageScore} out of 100"><span></span></div>
    <p class="section-title">Scored listings</p>
    <div class="job-list">${scoredJobs.map(renderJobRow).join('')}</div>
    <article class="meta proof-note">
      <strong>Free verification layer</strong>
      <p>Open the proof links to confirm whether each role exists on the company site or a known ATS.</p>
    </article>
  `
}

function renderJobRow(job, index) {
  const findings = job.result.findings.length
    ? job.result.findings.slice(0, 2).map((finding) => `<li>${escapeHtml(finding.title)}</li>`).join('')
    : '<li>No major scam language detected in this visible card.</li>'

  return `
    <details class="job-row" ${index === 0 ? 'open' : ''} style="--row-tone:${toneColors[job.result.tone]}">
      <summary>
        <span class="job-main">
          <strong>${escapeHtml(job.title)}</strong>
          <small>${escapeHtml([job.company, job.location].filter(Boolean).join(' · ') || 'Visible listing')}</small>
        </span>
        <span class="row-score">${job.result.score}</span>
      </summary>
      <div class="job-detail">
        <p class="mini-label">${escapeHtml(job.result.label)}</p>
        <ul class="compact-list">${findings}</ul>
        <div class="verify-links">
          <a href="${escapeAttribute(searchUrl(`"${job.company || ''}" "${job.title || ''}" careers`))}" target="_blank" rel="noreferrer">Verify role</a>
          <a href="${escapeAttribute(searchUrl(`${job.company || job.title} official careers jobs`))}" target="_blank" rel="noreferrer">Careers</a>
          <a href="${escapeAttribute(searchUrl(`"${job.company || ''}" "${job.title || ''}" greenhouse lever workday ashby smartrecruiters`))}" target="_blank" rel="noreferrer">ATS match</a>
        </div>
      </div>
    </details>
  `
}

function renderSignals(signals, fallbackTitle, fallbackDetail) {
  if (signals.length === 0) {
    return `<article class="finding signal-row"><span class="dot"></span><div><strong>${escapeHtml(fallbackTitle)}</strong><p>${escapeHtml(fallbackDetail)}</p></div></article>`
  }
  return signals.map((signal) => `<article class="finding signal-row"><span class="dot"></span><div><strong>${escapeHtml(signal.title)}</strong><p>${escapeHtml(signal.detail || 'This signal affects the SafeApply score.')}</p></div></article>`).join('')
}

function renderError(error) {
  scorecard.className = 'scorecard'
  scorecard.style.setProperty('--tone', toneColors.review)
  scorecard.style.setProperty('--score-width', '55%')
  scorecard.innerHTML = `
    <div class="score-head">
      <div>
        <p class="eyebrow">Scan issue</p>
        <h1 class="label error-title">Needs verification</h1>
        <p class="summary">SafeApply could not read this page. Open the full job description, then click Rescan.</p>
      </div>
      <div class="score-pill">--</div>
    </div>
    <div class="meter"><span></span></div>
    <article class="finding"><strong>What happened</strong><p>${escapeHtml(error.message)}</p></article>
  `
}

function summaryForJobList(count, riskyCount, reviewCount) {
  if (riskyCount > 0) return `${riskyCount} of ${count} visible listings show high-risk scam signals. Expand each row for proof links.`
  if (reviewCount > 0) return `${reviewCount} of ${count} visible listings need verification. Expand rows for proof links.`
  return `All ${count} visible listings look safe to review, but still verify on the company site.`
}

function scoreToneForScore(score) {
  if (score >= 75) return 'safe'
  if (score >= 45) return 'review'
  return 'risk'
}

function searchUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query.replace(/\s+/g, ' ').trim())}`
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char])
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#096;')
}

function scanAndRender() {
  scanCurrentTab()
    .then((page) => renderScorecard(scoreJobPost(page.text), page))
    .catch(renderError)
}

scanAndRender()
