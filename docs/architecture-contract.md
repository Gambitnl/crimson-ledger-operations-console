# Static Operations Console mirror contract

## Purpose

This repository is a public presentation layer for a read-only Operations Console shell. Its only runtime data source is the checked-in shape of the generated `snapshot.json` file. The default artifact always sets `snapshotAvailable` to `false` and contains no records.

## Allowed public shape

`StaticOperationsMirrorV1` may contain only:

- snapshot availability and generation time;
- generic provenance describing the public mirror;
- task cards with a public task label, title, lifecycle, priority, lane, revision, update time, and purpose text;
- technical run summaries with status, stage, timestamp, and a generic receipt label;
- generic audit summaries without actor, evidence, or private context.

The schema is an allowlist. The browser renders absent facts as “Not recorded” or “No public snapshot is available”; it does not infer task state.

## Hosting boundary

GitHub Pages serves static files only. It cannot run the private Operations Console service or its durable data store, and it cannot perform task changes. The public page therefore has no forms, write controls, browser storage, or application API routes. Delivery signals are labelled as technical context and never presented as task authority.

## Review boundary

Only the empty-safe artifact is produced by this public repository. Any future populated artifact would require a separately reviewed allowlist export before publication. The public repository must not contain application source, runtime data, private records, access material, or deployment credentials.
