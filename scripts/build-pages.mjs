import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { emptyMirror } from "./mirror-export.mjs";

const outputDir = process.env.PAGES_OUTPUT_DIR || "pages-dist";
if (!process.argv.includes("--empty")) throw new Error("Only the empty-safe public snapshot is publishable from this repository.");
await rm(outputDir, { recursive: true, force: true }); await mkdir(path.join(outputDir, "assets"), { recursive: true });
await cp("mirror/index.html", path.join(outputDir, "index.html")); await cp("mirror/app.js", path.join(outputDir, "app.js")); await cp("mirror/styles.css", path.join(outputDir, "assets", "styles.css"));
await cp("mirror/favicon.svg", path.join(outputDir, "favicon.svg"));
const payload = emptyMirror();
await writeFile(path.join(outputDir, "snapshot.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(outputDir, ".nojekyll"), "\n");
console.log(JSON.stringify({ outputDir, snapshotAvailable: payload.snapshotAvailable, taskCount: payload.tasks.length, sha256: payload.sha256 || null }, null, 2));
