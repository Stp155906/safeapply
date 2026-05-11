# SafeApply Chrome Extension

SafeApply is a Manifest V3 Chrome extension that scans visible job-page text and creates a trust scorecard for job seekers.

## Local install

1. Go to `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select this `extension/` folder.
5. Visit a job posting and click the SafeApply extension icon.

## Security and privacy model

- Uses `activeTab` access only after the user opens the extension popup.
- Does not request broad `<all_urls>` host permissions.
- Does not run a persistent background worker.
- Does not send page text to a server or third-party API.
- Does not store scan results.
- Blocks scans on browser-internal pages such as `chrome://` and local files.

## Important note

SafeApply provides a risk score and verification helper, not a final verdict. A job may still be legitimate, so applicants should verify through the company’s official careers page before applying.
