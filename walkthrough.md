# Walkthrough: Prime Video `Remove paid content` fix

## What was fixed
- Reworked Prime paid-content detection to use `article[data-card-entitlement="Unentitled"]` (stable marker).
- Kept fallback detection for store icon markers (`svg.NbhXwl` and entitlement icon SVG title containing `store`).
- Switched URL checks to use the live `window.location.href` each run (avoids stale startup URL issues in SPA navigation).
- Added throttled debug logs when filtering is enabled but no paid markers are found.
- Added a small regression guard module with unit tests for:
  - eligible Prime URLs,
  - paid store icon title detection,
  - section-removal threshold logic.
- Added CPU-safety optimizations for paid filtering:
  - throttle filter execution (`350ms`) when MutationObserver fires frequently,
  - keep a trailing run after throttle windows so events are not missed.
- Added startup bootstrap filtering to reduce first-render paid-card flash:
  - run immediate filter once at startup,
  - re-run on a short bounded interval (`220ms`) for ~`2.2s` only,
  - then stop automatically (no continuous polling).
- Expanded paid marker detection to handle localized/variant labels:
  - treat entitlement icon containers as paid markers,
  - detect paid labels in `aria-label` / `title` / entitlement text (e.g. rent/buy/acquista/noleggia).

## Files changed
- `src/content-script/amazon.ts`
- `android-app/content-script/amazon.ts`
- `src/content-script/amazonFilterPaidGuard.ts`
- `src/content-script/amazonFilterPaidGuard.test.ts`
- `package.json` (`test:amazon-filter`)

## Validation steps
1. Enable `Remove paid content` in extension settings.
2. Open Prime Video storefront/home.
3. Confirm rows or cards marked as paid are removed.
4. Check console logs:
   - Success logs: `Filtered paid category` / `Filtered paid Element`
   - Debug log (if none found): `FilterPaid active but no paid markers found`
5. Run automated regression check:
   - `npm run test:amazon-filter`
6. Optional UX check:
   - on first page load, paid cards may briefly paint but should disappear quickly without persistent flicker.
