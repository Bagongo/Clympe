# Handoff

## Current Status

Architecture definition completed.

The project direction has intentionally changed from a backend-first approach to a client-first approach.

The current goal is to build a fully functional extension that works independently from any backend.

---

# Current Milestone

Implement the autonomous client architecture.

The extension should:

- fetch market data directly from the CoinGecko Keyless Public API;
- maintain a short local cache (approximately one minute);
- avoid duplicate requests while the cache is valid;
- retry failed requests using exponential backoff;
- continue displaying the latest valid cached data whenever fresh data cannot be retrieved.

No backend should be required for normal operation.

---

# Architecture Decisions

The following decisions have already been made.

### Primary data source

Use the CoinGecko Keyless Public API.

Reason:

- zero infrastructure
- zero operating cost
- naturally distributed traffic across users
- simplest architecture for the current project size

---

### Cache strategy

Use a short client-side cache.

Its purpose is **not** to minimize CoinGecko usage, but to:

- avoid repeated requests caused by opening the popup multiple times;
- improve responsiveness;
- provide stale-safe behaviour during temporary network failures.

---

### Backend

Cloudflare is **not** part of the current milestone.

Backend infrastructure should only be introduced when there is a measurable reliability or scalability benefit.

---

# Planned Evolution

When justified by real usage:

1. Optional Cloudflare Worker fallback.
2. Worker + KV improvements.
3. Worker + Cache API optimizations.
4. R2 + CDN (if large-scale distribution becomes necessary).

Each step should only be implemented after the previous one proves insufficient.

---

# Immediate Priorities

When working on the repository, prioritize:

1. understanding the current CoinGecko fetch flow;
2. implementing the local cache correctly;
3. implementing retry/backoff behaviour;
4. implementing stale-safe rendering;
5. preserving the existing popup and UI.

Avoid architectural refactors unless they are necessary for the current milestone.

---

# Decision Log

## Current accepted architecture

Primary path:

Extension
→ CoinGecko

Fallback (future):

Extension
→ Cloudflare Worker
→ Cached snapshot

Advanced scale (future):

Worker
→ R2
→ CDN

This roadmap has been intentionally chosen to keep the project simple while allowing future scalability.

Future agents should avoid proposing backend-first solutions unless new project requirements justify them.