# Clympe

A lightweight Chrome extension that displays:

- the Top cryptocurrency market list (up to 100 coins);
- the current Bitcoin (BTC) price directly in the browser toolbar.

The project is designed around a simple principle:

> **Keep the architecture as simple as possible while allowing future scalability.**

---

## Current Architecture

The extension currently targets a **fully autonomous client-side architecture**.

Primary data source:

```
Extension
    ↓
CoinGecko Keyless Public API
```

Key characteristics:

- short local cache;
- retry with exponential backoff;
- stale-safe behaviour;
- no backend required.

Cloudflare infrastructure is planned only as an optional future fallback if real-world usage justifies it.

---

## Project Status

The project is under active development.

The current focus is improving the reliability of the data layer while preserving the existing popup and user experience.

---

## Documentation

- **AGENTS.md** → project guidelines and architectural principles for both humans and coding agents.
- **docs/HANDOFF.md** → current development status, active milestone and next implementation steps.

---

## Philosophy

This project values:

- simplicity over unnecessary complexity;
- incremental improvements over large rewrites;
- reliability over premature optimization.

Infrastructure should only be introduced when there is a measurable benefit.

---

## License

(To be defined.)