# Crimson Ledger · Operations Console Pages mirror

This repository publishes a sanitized, read-only static view of the Crimson Ledger Operations Console. It is intentionally an empty-safe public mirror: no task snapshot is bundled until a separately reviewed public snapshot is approved.

The Pages site can show the console shell, navigation, task-purpose vocabulary, and read-only delivery/audit sections. It cannot run the private application service, a database, or any task-changing operation. Missing live data is labelled as unavailable; this page never guesses or uses browser-local state.

## Verify locally

Requires Node.js 20 or newer.

```text
npm ci
npm run verify
```

`npm run verify` runs the static contract tests, checks the public-tree boundary, and builds the empty-safe `pages-dist/` artifact.

## Publication boundary

GitHub Actions validates pull requests and pushes to `main`. Only a successful `main` run publishes the static artifact to GitHub Pages. The workflow does not require secrets. See [the static mirror contract](docs/architecture-contract.md) and [the Pages setup notes](docs/github-pages-setup.md).
