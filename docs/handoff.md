# Handoff

## Status

Active.

## Project state summary

The project is not greenfield.

The popup/frontend is already in a relatively advanced state compared with the infrastructure around it. At minimum, there is a functioning popup capable of rendering the market list.

The project direction has been updated: the current preferred approach is no longer an immediate migration to a backend-first architecture.

## Current reality to preserve

Agents should assume the existing popup is worth preserving.

The current goal is not to redesign the frontend from scratch. The current goal is to understand the existing implementation, preserve the working UI, and improve the data flow only as much as the current scale actually requires.

## Guiding architectural principle

The current guiding principle is:

**Use the minimum infrastructure necessary for the current level of scale.**

That means:

- direct client-side CoinGecko access is acceptable in the primary phase;
- local cache and stale-safe rendering are important;
- backend infrastructure should be introduced only when there is a concrete reliability or scale reason.

## Current preferred roadmap

### Phase 1 — Primary architecture
- Extension fetches CoinGecko directly.
- Client-side caching should be used.
- Stale-safe behavior should exist locally in the extension.

### Phase 2 — Worker fallback
- Introduce a Cloudflare Worker only as a fallback path if CoinGecko fails, times out, or rate-limits too often.
- Worker may serve cached snapshot data.

### Phase 3 — Backend optimization
- Optimize Worker/KV/cache behavior only if real usage indicates that fallback traffic is meaningful.

### Phase 4 — Advanced scale
- If usage grows enough to justify it, consider a scheduled Worker generating static JSON snapshots distributed through R2/CDN.

## Known but still fuzzy history

This project dates back several years.

There may be additional branches containing in-progress or partial features such as options panels or other extension-related UI/functionality. The exact state of those branches and features is not yet fully remembered by the project owner.

Agents should therefore stay generic and careful in their assumptions.

## Safe assumptions for now

- The popup can render the list and is a useful existing asset.
- Some extra features may exist, but not all are confirmed yet.
- The repository likely needs inspection before deciding what to keep, merge, or retire.
- The most reliable current target is to understand the current client-side fetch path before proposing infrastructure changes.

## Migration guardrails

- Do not rewrite the popup unless the codebase inspection shows a strong technical reason.
- Do not assume direct client-side CoinGecko access is automatically wrong in the current phase.
- Do not assume incomplete or old branches are useless; inspect before removing.
- Prefer incremental migration over broad refactors.
- Only introduce backend complexity when there is a clear operational justification.

## Immediate next actions for any agent

1. Inspect the current branch and repo structure.
2. Identify popup entry points and the current data-fetching code.
3. Check whether the client-side fetch path already includes cache, retry, deduplication, or stale fallback behavior.
4. Identify where CoinGecko calls are made and how frequently.
5. Check whether experimental branches or partially implemented features appear relevant.
6. Propose the smallest viable improvement consistent with the current roadmap phase.

## What to look for specifically

Agents should try to confirm:

- whether the popup already stores data locally;
- whether current fetches are bursty or excessive;
- whether existing code can support a simple TTL cache without broader rewrites;
- whether backend fallback is already partially implemented somewhere;
- whether any options/settings UI already exists for refresh behavior.

## How to update this file

As the project owner remembers more details, or as agents inspect the repo, this file should be refined with:

- confirmed existing features;
- confirmed obsolete work;
- important file paths;
- roadmap phase currently implemented;
- migration progress;
- next concrete tasks.

Until then, keep the document generic enough to avoid misleading future agents.

## Consistency with AGENTS.md

This handoff must be read together with `AGENTS.md`, which defines the default execution policy:

- default mode is **discussion and planning only**;
- no code changes, file writes, or modifying commands unless explicitly requested.
