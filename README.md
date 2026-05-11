# SafeApply

SafeApply is a privacy-first Chrome extension prototype that helps job seekers review job postings before they apply.

It scans visible job-page text, creates a trust scorecard, highlights scam-risk signals, and provides quick verification links so applicants can check whether a role appears on the company’s official careers page or a known applicant tracking system.

Live site: https://safeapply-ai.vercel.app

## Why this exists

Job seekers, especially students and early-career applicants, often run into fake companies, ghost jobs, suspicious recruiter messages, and postings that ask for unsafe personal information. SafeApply is designed as a free tool that gives applicants a lightweight safety check where they already search for jobs.

## Features

- Manifest V3 Chrome extension
- Local trust scoring based on visible job-page text
- Multiple visible listing scores on job search result pages
- Risk signals for fake checks, upfront fees, personal email addresses, off-platform messaging pressure, instant-hire language, unrealistic pay, and vague scam-prone roles
- Legitimacy signals for company-domain emails, official careers systems, and clear hiring-process language
- Free verification links for company careers pages and common ATS platforms
- Privacy-first design: no server upload, no background worker, no stored scan results

## Important disclaimer

SafeApply provides a risk score and verification helper, not a final verdict. A job may still be legitimate, so applicants should verify through the company’s official careers page before sharing personal information.

## Project structure

```text
safeapply/
  extension/   Chrome extension source
  site/        React/Vite showcase website
```

## Run the website locally

```bash
cd site
npm install
npm run dev
```

## Load the extension locally

1. Open Chrome and go to `chrome://extensions`.
2. Enable Developer mode.
3. Click **Load unpacked**.
4. Select the `extension/` folder.
5. Open a job posting and click the SafeApply extension icon.

## Package the extension

From the repo root:

```bash
cd extension
zip -r ../safeapply-extension.zip manifest.json popup.html popup.css popup.js content.js scoring.js README.md icons -x "*.DS_Store"
```

## Security model

SafeApply uses only:

- `activeTab`
- `scripting`

The extension does not request broad `<all_urls>` host permissions, does not run a persistent background worker, and does not transmit page text to a remote API.

## Roadmap

- Improve parsing for more job boards
- Add first-class support for Indeed, LinkedIn, Greenhouse, Lever, Workday, Ashby, and SmartRecruiters
- Add optional evidence-based verification summaries
- Publish Chrome Web Store release
- Add automated extension tests

## License

MIT
