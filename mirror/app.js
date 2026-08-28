const $ = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
const formatDate = (value) => value ? new Date(value).toLocaleString() : "Not recorded";

function setRoute() {
  const requested = location.hash.slice(1);
  const route = ["overview", "tasks", "signals", "audit"].includes(requested) ? requested : "overview";
  document.querySelectorAll("[data-view]").forEach((view) => { view.hidden = view.dataset.view !== route; });
  document.querySelectorAll("[data-route]").forEach((link) => {
    if (link.dataset.route === route) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.title = `${route === "overview" ? "Overview" : route[0].toUpperCase() + route.slice(1)} · Crimson Ledger`;
}

function renderEmpty(data) {
  $("task-count").textContent = data.tasks.length;
  $("run-count").textContent = data.pipelineRuns.length;
  $("audit-count").textContent = data.auditSummary.length;
  $("mirror-status").textContent = "No public snapshot is currently available.";
  $("notice").innerHTML = `<span class="notice-icon" aria-hidden="true">i</span><span><strong>No public snapshot is available.</strong> This Pages mirror is empty-safe; it will not guess missing task state.</span>`;
}

function renderSnapshot(data) {
  $("task-count").textContent = data.tasks.length;
  $("run-count").textContent = data.pipelineRuns.length;
  $("audit-count").textContent = data.auditSummary.length;
  $("mirror-status").textContent = `Snapshot generated ${formatDate(data.generatedAt)}.`;
  $("notice").innerHTML = `<span class="notice-icon" aria-hidden="true">✓</span><span><strong>Read-only snapshot loaded.</strong> Generated ${escapeHtml(formatDate(data.generatedAt))}; this page does not accept task changes.</span>`;
  $("tasks").innerHTML = data.tasks.length ? data.tasks.map((task) => `<article class="task-card"><div class="task-card-top"><div><span class="task-id">${escapeHtml(task.taskId)}</span><h2>${escapeHtml(task.title)}</h2></div><span class="pill">${escapeHtml(task.status)} · r${escapeHtml(task.revision)}</span></div><div class="task-purpose"><div><strong>Why this exists</strong><p>${escapeHtml(task.purpose?.why || "Not recorded")}</p></div><div><strong>The problem</strong><p>${escapeHtml(task.purpose?.problem || "Not recorded")}</p></div><div><strong>Success outcome</strong><p>${escapeHtml(task.purpose?.outcome || "Not recorded")}</p></div></div><small>Updated ${escapeHtml(formatDate(task.updatedAt))}</small></article>`).join("") : `<div class="empty-state compact"><span class="empty-icon" aria-hidden="true">◌</span><h2>No public task records</h2><p>The approved snapshot contains no task records.</p></div>`;
}

async function load() {
  try {
    const response = await fetch("snapshot.json", { cache: "no-store" });
    if (!response.ok) throw new Error("The public snapshot could not be loaded.");
    const data = await response.json();
    if (data.snapshotAvailable !== true) renderEmpty(data);
    else renderSnapshot(data);
  } catch (error) {
    $("mirror-status").textContent = "Snapshot unavailable.";
    $("notice").innerHTML = `<span class="notice-icon" aria-hidden="true">!</span><span><strong>Public snapshot unavailable.</strong> ${escapeHtml(error.message)} The mirror will not substitute browser-local data.</span>`;
  }
}

window.addEventListener("hashchange", setRoute);
setRoute();
load();
