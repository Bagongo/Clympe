# AGENTS.md

This repository is intended to be agent-agnostic.

These guidelines apply to any coding agent (Cline, Claude Code, Codex, OpenCode, etc.) working on this project.

---

# Project

This project is a Chrome extension that displays:

- the Top cryptocurrency market list (up to 100 coins);
- the current BTC price in the browser badge.

The existing popup/UI is considered a valuable project asset and should generally be preserved rather than rewritten.

---

# Guiding Principle

Use the minimum infrastructure necessary for the current level of scale.

Prefer simple, reliable solutions over theoretically more scalable ones.

Introduce backend infrastructure only when there is a clear operational or architectural benefit.

---

# Architecture Roadmap

## Phase 1 (current architecture)

The extension operates autonomously.

Primary data source:

Extension
→ CoinGecko Keyless Public API

Requirements:

- short client-side cache (around one minute);
- request deduplication;
- retry with exponential backoff;
- stale-safe rendering;
- no backend dependency.

---

## Phase 2

Introduce an **optional** Cloudflare Worker fallback.

The Worker should only be used when direct CoinGecko requests repeatedly fail, timeout or become rate limited.

---

## Phase 3

Optimize the fallback infrastructure only if real usage justifies it.

Possible improvements:

- KV
- Cache API
- Worker caching

---

## Phase 4

Only if the project reaches significant scale:

Worker
→ R2
→ CDN

This architecture requires a custom domain and is intentionally outside the initial implementation scope.

---

# Existing and Experimental Features

The repository may contain historical branches with partially implemented features.

Before implementing new functionality, inspect existing branches to determine whether similar work already exists.

Known experimental work includes:

- an Options panel;
- configurable limit for the number of displayed coins (partially implemented).

Potential future features include:

- user-defined watchlists;
- additional user preferences exposed through the Options panel.

Whenever practical, prefer completing existing work over creating new implementations from scratch.

---

# Development Rules

- Preserve the existing popup whenever reasonably possible.
- Prefer incremental improvements over large rewrites.
- Avoid premature optimization.
- Avoid introducing unnecessary infrastructure.
- Preserve a stale-safe user experience whenever possible.
- Document important architectural decisions before implementing them.

---

# Long-Term Vision

The project should remain:

- lightweight;
- fast;
- privacy-friendly;
- easy to maintain.

Potential future improvements should enhance the user experience without significantly increasing architectural complexity.

---

# Default Execution Policy

Unless explicitly requested by the user:

- inspect;
- analyze;
- discuss;
- propose.

Do not modify code, files or project structure without explicit approval.