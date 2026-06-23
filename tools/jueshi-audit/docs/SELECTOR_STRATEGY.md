# Selector Strategy — jueshi-audit

## Priority Order

1. **`data-testid`** — Most stable, explicitly for testing
2. **`role` + `name`** — Accessibility-based, stable
3. **`label` / `aria-label`** — Semantic, stable
4. **`type` attribute** — e.g. `input[type="email"]`, `input[type="password"]`
5. **CSS class** — Least stable, use only as last resort

## Anti-Patterns (FORBIDDEN)

- ❌ Text-based matching: `button:has-text("登录")` — text may change
- ❌ English-only text: `button:has-text("Search")` — Chinese site
- ❌ Fragile CSS: `div > div > button` — structure may change
- ❌ `body.textContent().includes("500")` — matches any "500" in page text

## Required Patterns

- Use `page.locator()` with timeout: `page.locator('meta[name="description"]')`
- Use `page.$eval()` for reading attributes: `page.$eval('meta[name="description"]', el => el.content)`
- Wait for hydration: `await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})`
- Dismiss cookie consent before interacting: `await page.click('button:has-text("我知道了")').catch(() => {})`
- Use `page.type()` for React controlled inputs (not `page.fill()`)
- Use `page.waitForURL()` for post-login navigation

## Classification

| Category | Label | Description |
|----------|-------|-------------|
| Product defect | BUG | Real issue in the product |
| Script bug | AUDIT_SCRIPT_BUG | Selector/timing issue in audit code |
| Design difference | DESIGN_BEHAVIOR | Expected behavior, not a bug |

## Business Element Recommendations

Add `data-testid` to these critical elements:
- Login form: `data-testid="login-email"`, `data-testid="login-password"`, `data-testid="login-submit"`
- Postal code: `data-testid="postal-country-input"`, `data-testid="postal-query-input"`, `data-testid="postal-search-btn"`
- BBS: `data-testid="bbs-new-post-title"`, `data-testid="bbs-new-post-submit"`
- Admin: `data-testid="admin-dashboard"`, `data-testid="admin-community-posts"`
