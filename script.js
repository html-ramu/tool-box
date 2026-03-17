/* ─── Default Tools ─── */
const DEFAULT_TOOLS = [
  { id: genId(), name: "Google Keep", url: "https://keep.google.com",   category: "Work Tools" },
  { id: genId(), name: "Gemini",      url: "https://gemini.google.com", category: "AI Tools"   },
  { id: genId(), name: "ChatGPT",     url: "https://chat.openai.com",   category: "AI Tools"   },
  { id: genId(), name: "Claude",      url: "https://claude.ai",         category: "AI Tools"   },
];

function genId() { return Date.now() + Math.floor(Math.random() * 1e6); }

/* ─── State ─── */
let tools         = [];
let currentFilter = "All";
let searchQuery   = "";
let dragSrcId     = null;

/* ─── LocalStorage ─── */
function loadTools() {
  const saved = localStorage.getItem("toolbox_tools");
  tools = saved ? JSON.parse(saved) : DEFAULT_TOOLS.map(t => ({ ...t, id: genId() }));
  if (!saved) saveTools();
}
function saveTools() { localStorage.setItem("toolbox_tools", JSON.stringify(tools)); }

/* ─── Theme ─── */
function loadTheme() {
  const dark = localStorage.getItem("toolbox_theme") === "dark";
  if (dark) { document.body.classList.replace("light-mode", "dark-mode"); updateThemeBtn(true); }
}
function toggleTheme() {
  const isDark = document.body.classList.contains("dark-mode");
  document.body.classList.replace(
    isDark ? "dark-mode" : "light-mode",
    isDark ? "light-mode" : "dark-mode"
  );
  localStorage.setItem("toolbox_theme", isDark ? "light" : "dark");
  updateThemeBtn(!isDark);
}
function updateThemeBtn(isDark) {
  document.getElementById("darkModeToggle").innerHTML =
    isDark ? '<i class="fas fa-sun"></i> Light Mode'
           : '<i class="fas fa-moon"></i> Dark Mode';
}

/* ─── Category Helper ─── */
function catClass(cat) {
  return { "AI Tools": "cat-ai", "News Tools": "cat-news", "Work Tools": "cat-work", "Other": "cat-other" }[cat] || "cat-other";
}

/* ─── Render ─── */
function getFiltered() {
  return tools.filter(t =>
    (currentFilter === "All" || t.category === currentFilter) &&
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
}

function renderTools() {
  const list      = document.getElementById("toolsList");
  const emptyEl   = document.getElementById("emptyState");
  const countEl   = document.getElementById("toolCount");
  const filtered  = getFiltered();

  list.innerHTML = "";

  if (!filtered.length) {
    emptyEl.style.display = "block";
    countEl.textContent   = "0 Tools";
    return;
  }

  emptyEl.style.display = "none";
  countEl.textContent   = `${filtered.length} Tool${filtered.length !== 1 ? "s" : ""}`;

  filtered.forEach((tool, idx) => {
    const row        = document.createElement("div");
    row.className    = "tool-row";
    row.draggable    = true;
    row.dataset.id   = tool.id;

    const cleanUrl = tool.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

    row.innerHTML = `
      <div class="tool-number">${idx + 1}</div>
      <div class="tool-info">
        <span class="tool-name">${esc(tool.name)}</span>
        <span class="tool-url">${esc(cleanUrl)}</span>
      </div>
      <span class="category-badge ${catClass(tool.category)}">${esc(tool.category)}</span>
      <button class="btn-open" data-url="${esc(tool.url)}">
        <i class="fas fa-external-link-alt"></i> Open
      </button>
      <button class="btn-delete" data-id="${tool.id}">
        <i class="fas fa-trash"></i> Delete
      </button>
    `;

    row.querySelector(".btn-open").addEventListener("click",   () => window.open(tool.url, "_blank"));
    row.querySelector(".btn-delete").addEventListener("click", () => deleteTool(tool.id));

    row.addEventListener("dragstart", onDragStart);
    row.addEventListener("dragover",  onDragOver);
    row.addEventListener("drop",      onDrop);
    row.addEventListener("dragend",   onDragEnd);
    row.addEventListener("dragenter", e => e.preventDefault());

    list.appendChild(row);
  });
}

function esc(str) {
  return String(str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

/* ─── Add Tool ─── */
function addTool() {
  let name = document.getElementById("toolName").value.trim();
  let url  = document.getElementById("toolURL").value.trim();
  const cat  = document.getElementById("toolCategory").value;

  if (!name) { showToast("Please enter a tool name", "error"); return; }
  if (!url)  { showToast("Please enter a tool URL",  "error"); return; }
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  tools.push({ id: genId(), name, url, category: cat });
  saveTools();

  document.getElementById("toolName").value = "";
  document.getElementById("toolURL").value  = "";

  renderTools();
  showToast(`"${name}" added! ✅`);
}

/* ─── Delete Tool ─── */
function deleteTool(id) {
  const idx = tools.findIndex(t => String(t.id) === String(id));
  if (idx === -1) return;
  const name = tools[idx].name;
  tools.splice(idx, 1);
  saveTools();
  renderTools();
  showToast(`"${name}" removed 🗑️`);
}

/* ─── Drag & Drop ─── */
function onDragStart(e) {
  dragSrcId = this.dataset.id;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}
function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  document.querySelectorAll(".tool-row").forEach(r => r.classList.remove("drag-over"));
  if (this.dataset.id !== dragSrcId) this.classList.add("drag-over");
}
function onDrop(e) {
  e.stopPropagation();
  const targetId = this.dataset.id;
  if (dragSrcId !== targetId) {
    const si = tools.findIndex(t => String(t.id) === String(dragSrcId));
    const ti = tools.findIndex(t => String(t.id) === String(targetId));
    if (si !== -1 && ti !== -1) {
      const [moved] = tools.splice(si, 1);
      tools.splice(ti, 0, moved);
      saveTools();
      renderTools();
      showToast("Order updated ↕️");
    }
  }
}
function onDragEnd() {
  document.querySelectorAll(".tool-row").forEach(r => r.classList.remove("dragging","drag-over"));
}

/* ─── Toast ─── */
function showToast(msg, type = "success") {
  document.querySelector(".toast")?.remove();
  const t = document.createElement("div");
  t.className = `toast toast-${type}`;
  t.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i> ${msg}`;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 350); }, 2800);
}
/* ─── Export / Import ─── */
function exportTools() {
  const dataStr = JSON.stringify(tools, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `toolbox-backup.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Backup downloaded! 💾", "success");
}

function importTools(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported)) {
        tools = imported;
        saveTools();
        renderTools();
        showToast("Backup imported! 🔄", "success");
      } else {
        showToast("Invalid file format", "error");
      }
    } catch (err) {
      showToast("Error reading file", "error");
    }
  };
  reader.readAsText(file);
  e.target.value = ""; // reset input
}

/* ─── Init ─── */
document.addEventListener("DOMContentLoaded", () => {
  loadTools();
  loadTheme();
  renderTools();

  document.getElementById("darkModeToggle").addEventListener("click", toggleTheme);
  document.getElementById("addToolBtn").addEventListener("click", addTool);
  document.getElementById("exportBtn").addEventListener("click", exportTools);
  document.getElementById("importBtn").addEventListener("click", () => document.getElementById("importFile").click());
  document.getElementById("importFile").addEventListener("change", importTools);

  ["toolName","toolURL"].forEach(id => {
    document.getElementById(id).addEventListener("keydown", e => { if (e.key === "Enter") addTool(); });
  });

  document.getElementById("searchInput").addEventListener("input", e => {
    searchQuery = e.target.value;
    renderTools();
  });

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderTools();
    });
  });
});
