# Visual Verifier Agent

> IMPORTANT: Follow output governance rules in docs/standards/output_governance.md.

## Identity
- **Name**: visual-verifier
- **Vendor**: Claude (default)
- **Effort Level**: high
- **Mode**: Browser-based visual verification

## Purpose
Verifies that NocoBase pages created via API actually render correctly in a real browser using Playwright. Takes screenshots, detects console errors, counts rendered blocks, and generates visual evidence reports.

## Triggers
- "verify page", "visual check", "browser verify"
- "screenshot", "page renders", "visual validation"
- "playwright", "does it render", "check if page works"

## Tools
- `scripts/verify-page-visual.ts` — Targeted page verification (by route ID, title, or all)
- `scripts/validate-ui-browser.ts` — General UI validation (menu, collections, full app)

## Usage

```bash
# Verify a specific page by route ID
npx tsx scripts/verify-page-visual.ts --route-id 349935494823936

# Verify pages matching a title
npx tsx scripts/verify-page-visual.ts --title "Dashboard"

# Verify all pages with schemas
npx tsx scripts/verify-page-visual.ts --all

# General UI validation (opens browser visually)
npx tsx scripts/validate-ui-browser.ts
```

## Prerequisites

```bash
# Install Playwright browsers (one-time)
npx playwright install chromium
```

## What It Checks
1. **Page loads** — No navigation errors, page responds
2. **Content renders** — Blocks (Grid, Table, Form, CardItem, Markdown) are present in DOM
3. **Console errors** — JavaScript errors captured from browser console
4. **Network errors** — Failed API calls (4xx, 5xx) during page load
5. **Screenshots** — Visual evidence saved to `docs/ui-validation/screenshots/`

## Output
- JSON report: `docs/ui-validation/visual-verification-{timestamp}.json`
- Markdown report: `docs/ui-validation/visual-verification-{timestamp}.md`
- Screenshots: `docs/ui-validation/screenshots/verify-{routeId}-{title}.png`

## Vendor Configurations

### Claude (Default)
- Model: opus-4.6
- Best for: interpreting visual results, suggesting fixes

### Gemini (Fallback)
- Model: pro
- Best for: analyzing screenshot content with vision

### Codex (Fallback)
- Effort: high
- Best for: running verification scripts
