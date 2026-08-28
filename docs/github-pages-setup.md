# GitHub Pages publication

The repository is public because the configured GitHub Pages plan does not provide a private Pages site. Treat the Pages URL and every generated asset as public.

The `Build and publish sanitized Operations Console mirror` workflow runs on pull requests, pushes to `main`, and manual dispatch. The verify job uses a clean `npm ci`, runs the tests and public-tree validator, and builds the empty-safe artifact. The deploy job is gated to `main` and publishes only after verification succeeds.

The workflow uses the standard Pages permissions (`contents: read`, `pages: write`, and `id-token: write`) and the `github-pages` environment. No repository secrets, service credentials, runtime data, or external endpoints are needed.

The resulting site is a static read-only presentation. It does not provide the private service, durable records, live task updates, or task-changing controls. Keep those capabilities outside this public repository.
