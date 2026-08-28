import { existsSync, readdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const artifactMode = process.argv.includes("--artifact");
const tracked = artifactMode ? [] : execFileSync("git", ["ls-files"], { encoding: "utf8" }).trim().split(/\r?\n/).filter(Boolean);
const forbiddenPaths = [
  /^local-app\//,
  /^migration\//,
  /^docs\/source-extracted\//,
  /^contracts\/local-store\.v1\.json$/,
  /^scripts\/import-hosted-snapshot\.mjs$/,
  /(^|\/)(?:\.env|.*\.(?:db|sqlite|sqlite3|bak|backup|pem|key|p12|jsonl))$/i,
];
const forbiddenText = [
  /(?:localhost|127\.0\.0\.1|[A-Z]:\\|\/Users\/)/i,
  /(?:Authorization|Idempotency-Key|If-Match|localStorage|contextThreadId|actorId|sourceCheckout|CL-OPS-001)/i,
  /(?:\b(?:POST|PUT|PATCH|DELETE)\b|\/api\/)/i,
  /(?:private evidence|owner@example\.com|rawLog|migrationSnapshots)/i,
];
const violations = [];

if (artifactMode) {
  const expected = [".nojekyll", "app.js", "assets", "favicon.svg", "index.html", "snapshot.json"];
  const actual = existsSync("pages-dist") ? readdirSync("pages-dist").sort() : [];
  if (!existsSync("pages-dist") || actual.join("|") !== expected.join("|")) violations.push(`unexpected artifact root: ${actual.join(", ")}`);
  if (existsSync("pages-dist/snapshot.json")) {
    const snapshot = JSON.parse(readFileSync("pages-dist/snapshot.json", "utf8"));
    if (snapshot.snapshotAvailable !== false || snapshot.tasks.length !== 0 || snapshot.pipelineRuns.length !== 0 || snapshot.auditSummary.length !== 0) violations.push("artifact is not empty-safe");
  }
  for (const file of ["pages-dist/index.html", "pages-dist/app.js", "pages-dist/assets/styles.css", "pages-dist/favicon.svg", "pages-dist/snapshot.json"]) {
    if (!existsSync(file)) continue;
    const content = readFileSync(file, "utf8");
    for (const pattern of forbiddenText) if (pattern.test(content)) violations.push(`forbidden artifact text ${pattern}: ${file}`);
  }
}

for (const file of tracked) {
  if (forbiddenPaths.some((pattern) => pattern.test(file))) violations.push(`forbidden path: ${file}`);
  if (!existsSync(file) || file === "scripts/validate-public.mjs") continue;
  const content = readFileSync(file, "utf8");
  for (const pattern of forbiddenText) if (pattern.test(content)) violations.push(`forbidden text ${pattern}: ${file}`);
}

const app = readFileSync("mirror/app.js", "utf8");
if ((app.match(/fetch\(/g) || []).length !== 1 || !app.includes('fetch("snapshot.json"')) violations.push("mirror must read only snapshot.json");
if (/<(?:form|button)\b/i.test(readFileSync("mirror/index.html", "utf8"))) violations.push("mirror must not contain forms or buttons");
if (violations.length) {
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log(`public boundary clean: ${tracked.length} tracked paths checked`);
