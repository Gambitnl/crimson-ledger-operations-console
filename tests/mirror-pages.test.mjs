import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { emptyMirror } from "../scripts/mirror-export.mjs";

test("empty mirror is explicit and contains no records", () => {
  const mirror = emptyMirror();
  assert.equal(mirror.schemaVersion, "StaticOperationsMirrorV1");
  assert.equal(mirror.snapshotAvailable, false);
  assert.deepEqual(mirror.tasks, []);
  assert.deepEqual(mirror.pipelineRuns, []);
  assert.deepEqual(mirror.auditSummary, []);
  assert.equal(mirror.provenance.source, "public-pages-mirror");
});

test("static page has read-only navigation and purpose vocabulary", async () => {
  const html = await readFile("mirror/index.html", "utf8");
  const app = await readFile("mirror/app.js", "utf8");
  assert.match(html, /<html lang="en">/);
  assert.match(html, /aria-label="Primary navigation"/);
  assert.match(html, /href="#tasks"/);
  assert.match(html, /Why this exists/);
  assert.match(html, /Success outcome/);
  assert.doesNotMatch(html, /<form|<button/i);
  assert.match(app, /snapshot\.json/);
});

test("Pages artifact contains only the static allowlist", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "cl-pages-"));
  try {
    process.env.PAGES_OUTPUT_DIR = directory;
    const { spawn } = await import("node:child_process");
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, ["scripts/build-pages.mjs", "--empty"], { cwd: path.resolve("."), stdio: "ignore" });
      child.once("error", reject);
      child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`build failed: ${code}`)));
    });
    const files = (await readdir(directory)).sort();
    assert.deepEqual(files, [".nojekyll", "app.js", "assets", "favicon.svg", "index.html", "snapshot.json"]);
    const snapshot = JSON.parse(await readFile(path.join(directory, "snapshot.json"), "utf8"));
    assert.equal(snapshot.snapshotAvailable, false);
    assert.deepEqual(snapshot.tasks, []);
  } finally {
    Reflect.deleteProperty(process.env, "PAGES_OUTPUT_DIR");
    await rm(directory, { recursive: true, force: true });
  }
});
