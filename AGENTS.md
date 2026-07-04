# AGENTS.md

This repository is intended to be agent-agnostic.

The project may be worked on with Cline on one machine, OpenCode on another, and possibly other coding agents in the future. This file is the main shared source of truth for agent behavior in this repository.

## Project overview

This project is a Chrome extension focused on displaying a list of up to the top 100 crypto coins by market capitalization.

I also displays the current price of BTC in the extension badge (icon)

The popup UI is an important part of the project and should be treated as an asset to preserve where possible, not something to rewrite casually.

## Architectural direction

The preferred architecture going forward is:

1. Chrome extension frontend for popup and related UI.
2. A lightweight backend/cache layer, currently preferred as a Cloudflare Worker.
3. CoinGecko Demo API as the upstream market data source.
4. Local cache and stale-safe rendering behavior in the extension.

## Important current constraint

Historically, the project appears to have used direct client-side calls to CoinGecko from the extension popup or frontend code.

That direct data access pattern should be treated as the main architectural debt to remove.

The preferred migration path is to preserve the existing frontend as much as practical while changing the data flow behind it.

## Core rules for all agents

- Do not assume the popup should be rewritten from scratch.
- Default assumption: preserve the existing popup UI and existing useful frontend logic where feasible.
- Focus refactoring effort first on the data access path and architecture, not on cosmetic rewrites.
- Do not silently revert to a direct keyless CoinGecko client-polling design.
- Prefer CoinGecko Demo API over keyless public access for the planned architecture.
- Prefer a backend cache layer between the extension and CoinGecko.
- Preserve a stale-safe UX: if fresh data fails temporarily, the extension should still be able to render the last valid data when safe.

## Default execution policy

Default behavior for this repository is **discussion and planning only**.

Unless the user explicitly asks for implementation, agents must:

- inspect and analyze the repository;
- explain findings;
- propose plans and trade-offs;
- avoid editing files;
- avoid creating files;
- avoid running modifying commands.

Code changes, file writes, refactors, or command execution that alters the project require **explicit user approval**.

## Working assumptions

Unless the repository proves otherwise, agents should work from these assumptions:

- A popup already exists and can render the list.
- Some branches may contain experimental or unfinished work such as options panels or additional UI/features.
- The exact state of all historical branches and features is not yet fully recalled by the project owner.
- Agents should inspect the repo carefully before making structural decisions.

## Initial investigation priority

Before major implementation work, agents should:

1. Identify the current popup entry point and current data-fetching path.
2. Identify whether additional UI/features exist on branches or behind incomplete files.
3. Avoid deleting dormant or uncertain features unless there is strong evidence they are obsolete.
4. Document important findings in `docs/handoff.md` as the repo becomes better understood.

## Documentation rules

Keep documentation minimal.

- `AGENTS.md` contains stable cross-agent instructions.
- `docs/handoff.md` contains current project state, migration guidance, and next steps.
- `.clinerules/00-core.md` is only a thin adapter for Cline.

Do not create many new markdown files unless the project genuinely grows enough to need them.

## Startup read order

Before non-trivial work:

1. Read `AGENTS.md`.
2. Read `docs/handoff.md`.
3. Inspect the actual repository structure and current branch before changing architecture.

## Change control

If an agent believes the current direction should change, it should first update `docs/handoff.md` with the discovered reality and the reason for the proposed change.

## Default chapter

At the start of each task, restate in your own words:

- the current policy (discussion-first, no edits by default);
- the current objective (migration of data flow, not popup rewrite);
- the next concrete step (inspection, analysis, plan).