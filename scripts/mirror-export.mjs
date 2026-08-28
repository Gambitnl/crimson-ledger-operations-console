export function emptyMirror() {
  return { schemaVersion: "StaticOperationsMirrorV1", snapshotAvailable: false, generatedAt: new Date().toISOString(), provenance: { source: "public-pages-mirror", exportKind: "empty-safe-placeholder", detail: "No approved public snapshot is present." }, tasks: [], pipelineRuns: [], auditSummary: [] };
}
