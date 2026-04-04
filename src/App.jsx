import { useState, useEffect, useRef } from 'react';
import './App.css';

const DEFAULT_TOOLS = [
  { id: 1773754623800, name: "Google Keep", url: "https://keep.google.com", category: "Work Tools" },
  { id: 1773754343285, name: "ChatGPT", url: "https://chat.openai.com", category: "AI Tools" },
  { id: 1773754870472, name: "gmail", url: "https://mail.google.com/mail/u/1/#all", category: "AI Tools" },
  { id: 1773755100031, name: "github", url: "https://github.com/html-ramu", category: "AI Tools" },
  { id: 1773755211432, name: "sarvam", url: "https://dashboard.sarvam.ai/", category: "AI Tools" },
  { id: 1773755239788, name: "docs", url: "https://docs.google.com/document/u/1/", category: "AI Tools" },
  { id: 1773754723597, name: "drive", url: "https://drive.google.com/drive/u/1/home", category: "AI Tools" },
  { id: 1773754601896, name: "circle crop", url: "https://html-ramu.github.io/circular-crop-tool/", category: "AI Tools" },
  { id: 1773754811248, name: "linked in", url: "https://www.linkedin.com/feed/", category: "AI Tools" },
  { id: 1773754700932, name: "cloud flare", url: "https://dash.cloudflare.com/login", category: "AI Tools" },
  { id: 1773754487213, name: "sora", url: "https://sora.chatgpt.com/explore", category: "AI Tools" },
  { id: 1773754743450, name: "proton mail", url: "https://account.proton.me/apps", category: "AI Tools" },
  { id: 1773754936670, name: "account expert", url: "https://web.accountsexpertapp.com/new-courses/14-free-material-content?activeTab=content", category: "AI Tools" },
  { id: 1773754931673, name: "whats app", url: "https://web.whatsapp.com/", category: "AI Tools" },
  { id: 1773755171889, name: "green key", url: "https://html-ramu.github.io/greenkey/", category: "AI Tools" },
  { id: 1773754354137, name: "chroma key", url: "https://html-ramu.github.io/chroma-key-tool/", category: "AI Tools" },
  { id: 1773755117995, name: "news ticker", url: "https://html-ramu.github.io/news-ticker/", category: "AI Tools" },
  { id: 1773755133491, name: "text wrap", url: "https://b10design.work/", category: "AI Tools" },
  { id: 1773754973319, name: "ticker generator", url: "https://html-ramu.github.io/ticker-generator/", category: "AI Tools" },
  { id: 1773754651461, name: "epaper b10", url: "https://epaperb10vartha.in/#", category: "AI Tools" },
  { id: 1773754605025, name: "b10vartha", url: "https://www.b10vartha.in/", category: "AI Tools" },
  { id: 1773754303906, name: "link-lite", url: "https://html-ramu.github.io/link-lite/", category: "Work Tools" },
  { id: 1773755110095, name: "Figma", url: "https://www.figma.com/files/team/1572614101672313643/recents-and-sharing?fuid=1572614099818656258", category: "Work Tools" },
  { id: 1774796167733, name: "firebase", url: "https://console.firebase.google.com/u/1/", category: "Other" },
  { id: 1774796270042, name: "analytics.google", url: "https://analytics.google.com/", category: "Other" },
  { id: 1775223182910, name: "godaddy", url: "https://www.godaddy.com/en-in", category: "Other" },
  { id: 1775223178187, name: "youtube", url: "https://www.youtube.com/", category: "Other" },
  { id: 1775223436959, name: "google messages", url: "https://messages.google.com/web/welcome", category: "Other" },
  { id: 1775223435500, name: "arattai", url: "https://web.arattai.in/", category: "Other" },
  { id: 1775223585051, name: "rrsarees", url: "https://rrsareescenterallagadda.com/", category: "Other" },
  { id: 1775223178426, name: "gemini", url: "https://gemini.google.com/u/1/app", category: "Other" },
  { id: 1775223905089, name: "prime video", url: "https://www.primevideo.com/region/eu/storefront", category: "Other" },
  { id: 1775223189048, name: "netflix", url: "https://www.netflix.com/", category: "Other" },
  { id: 1775223611646, name: "ambitious-baba", url: "https://ambitiousbaba.com/jaiib-ie-ifs-recollected-questions-2-november-2025-memory-based/", category: "Other" },
  { id: 1775223452858, name: "perplexity-jaiib", url: "https://www.perplexity.ai/search/https-ambitiousbaba-com-https-wz28euwjTOiNyDDvTgnlTw", category: "Other" },
  { id: 1775223313256, name: "anujjindal-jaiib", url: "https://anujjindal.in/jaiib-exam-complete-info/", category: "Other" },
  { id: 1775223571415, name: "iibf-jaiib", url: "https://www.iibf.org.in/", category: "Other" },
  { id: 1775223770623, name: "iibf-02-jaiib", url: "https://www.iibf.org.in/ELearning.asp", category: "Other" },
  { id: Date.now(), name: "PhotoRoom BG Remover", url: "https://www.photoroom.com/tools/background-remover", category: "AI Tools" }
];

function genId() { 
  return typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Date.now() + Math.floor(Math.random() * 1e6); 
}

function formatURL(url) {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

function App() {
  const [tools, setTools] = useState([]);
  const [deletedTools, setDeletedTools] = useState([]); 
  const [showTrash, setShowTrash] = useState(false); 
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState("All");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [newToolName, setNewToolName] = useState("");
  const [newToolURL, setNewToolURL] = useState("");
  const [newToolCategory, setNewToolCategory] = useState("Other");

  const fileInputRef = useRef(null);

  // Load Initial Data
  useEffect(() => {
    const savedTools = localStorage.getItem("toolbox_tools_react");
    if (savedTools) {
      try {
        const parsed = JSON.parse(savedTools);
        if (parsed.length === 0) setTools(DEFAULT_TOOLS);
        else setTools(parsed);
      } catch (err) {
        setTools(DEFAULT_TOOLS);
      }
    } else {
      setTools(DEFAULT_TOOLS);
    }

    const savedTrash = localStorage.getItem("toolbox_trash_react");
    if (savedTrash) {
      try {
        setDeletedTools(JSON.parse(savedTrash));
      } catch (err) {
        setDeletedTools([]);
      }
    }

    const theme = localStorage.getItem("toolbox_theme_react");
    if (theme) setIsDarkMode(theme === "dark");
  }, []);

  // Theme Update
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
    }
    localStorage.setItem("toolbox_theme_react", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Save changes to Local Storage
  useEffect(() => {
    if (tools.length > 0) {
       localStorage.setItem("toolbox_tools_react", JSON.stringify(tools));
    }
  }, [tools]);

  useEffect(() => {
    localStorage.setItem("toolbox_trash_react", JSON.stringify(deletedTools));
  }, [deletedTools]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const addTool = () => {
    let url = newToolURL.trim();
    if (!newToolName.trim() || !url) return showToast("Please fill all fields", "error");
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;

    setTools([...tools, { id: genId(), name: newToolName.trim(), url, category: newToolCategory }]);
    setNewToolName(""); setNewToolURL(""); setNewToolCategory("Other");
    showToast("Tool added! ✅");
  };

  const deleteTool = (toolToRemove) => {
    setTools(tools.filter(t => t.id !== toolToRemove.id));
    setDeletedTools([toolToRemove, ...deletedTools]);
    showToast("Moved to Trash 🗑️", "info");
  };

  const restoreTool = (toolToRestore) => {
    setDeletedTools(deletedTools.filter(t => t.id !== toolToRestore.id));
    setTools([...tools, toolToRestore]);
    showToast("Tool Restored! ♻️");
  };

  const permanentlyDeleteTool = (id) => {
    setDeletedTools(deletedTools.filter(t => t.id !== id));
    showToast("Deleted Permanently ❌", "error");
  };

  const exportTools = () => {
    const dataStr = JSON.stringify(tools, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `toolbox-backup.json`;
    a.click();
    showToast("Backup saved! 💾");
  };

  const currentList = showTrash ? deletedTools : tools;

  // A to Z ఆర్డర్ లో సార్టింగ్ (Sorting) లాజిక్
  const filteredAndSortedTools = currentList
    .filter(t => 
      (currentFilter === "All" || t.category === currentFilter) &&
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())); // Alphabetical Sort

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <span className="logo">🧰</span>
          <h1>Tool Box Dashboard</h1>
        </div>
        <div className="header-right">
          <button onClick={exportTools} className="action-btn" title="Export Backup"><i className="fas fa-download"></i></button>
          <button onClick={() => fileInputRef.current.click()} className="action-btn" title="Import Backup"><i className="fas fa-upload"></i></button>
          <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={(e) => {
            const reader = new FileReader();
            reader.onload = (ev) => { setTools(JSON.parse(ev.target.result)); showToast("Imported! 🔄"); };
            reader.readAsText(e.target.files[0]);
          }} />
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="theme-toggle">
            <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i> {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </header>

      <main className="main-content">
        {!showTrash && (
          <section className="add-tool-panel">
            <h2><i className="fas fa-plus-circle"></i> ADD NEW TOOL</h2>
            <div className="form-grid">
              <input placeholder="Tool Name (e.g. Notion)" value={newToolName} onChange={e => setNewToolName(e.target.value)} />
              <input placeholder="Tool URL (e.g. https://notion.so)" value={newToolURL} onChange={e => setNewToolURL(e.target.value)} />
              <select value={newToolCategory} onChange={e => setNewToolCategory(e.target.value)}>
                <option value="Work Tools">Work Tools</option>
                <option value="AI Tools">AI Tools</option>
                <option value="News Tools">News Tools</option>
                <option value="Other">Other</option>
              </select>
              <button onClick={addTool} id="addToolBtn"><i className="fas fa-plus"></i> Add Tool</button>
            </div>
          </section>
        )}

        <section className="controls-panel">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input placeholder="Search tools by name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="filter-box">
            <select value={currentFilter} onChange={e => setCurrentFilter(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Work Tools">Work Tools</option>
              <option value="AI Tools">AI Tools</option>
              <option value="News Tools">News Tools</option>
              <option value="Other">Other</option>
            </select>
            <button className="btn-trash-toggle" onClick={() => setShowTrash(!showTrash)}>
              <i className={`fas fa-${showTrash ? 'arrow-left' : 'trash'}`}></i> 
              {showTrash ? 'Back to Tools' : `Trash (${deletedTools.length})`}
            </button>
          </div>
        </section>

        <div className="tools-header">
          <span id="toolCount">{filteredAndSortedTools.length} {showTrash ? 'Items in Trash' : 'Tools'}</span>
          {!showTrash && <span className="drag-hint"><i className="fas fa-sort-alpha-down"></i> A-Z Sorted</span>}
        </div>

        <section className="tools-list">
          {filteredAndSortedTools.length === 0 && showTrash && (
             <div className="empty-state">
               <i className="fas fa-dumpster"></i>
               <p>Trash is empty</p>
             </div>
          )}
          
          {filteredAndSortedTools.map((tool, idx) => (
            <div key={tool.id} className="tool-row">
              <div className="tool-number">{idx + 1}</div>
              <div className="tool-info">
                <span className="tool-name" style={showTrash ? {textDecoration: 'line-through', opacity: 0.6} : {}}>{tool.name}</span>
                <span className="tool-url">{formatURL(tool.url)}</span>
              </div>
              <span className={`category-badge ${
                  tool.category === 'AI Tools' ? 'cat-ai' : 
                  tool.category === 'Work Tools' ? 'cat-work' : 
                  tool.category === 'News Tools' ? 'cat-news' : 'cat-other'
                }`}>{tool.category}</span>
              
              {!showTrash ? (
                <>
                  <button className="btn-open" onClick={() => window.open(tool.url, "_blank")}>
                    <i className="fas fa-external-link-alt"></i> Open
                  </button>
                  <button className="btn-delete" onClick={() => deleteTool(tool)} title="Move to Trash">
                    <i className="fas fa-trash"></i>
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-restore" onClick={() => restoreTool(tool)} title="Restore Tool">
                    <i className="fas fa-undo"></i>
                  </button>
                  <button className="btn-delete" onClick={() => permanentlyDeleteTool(tool.id)} title="Permanently Delete">
                    <i className="fas fa-times"></i>
                  </button>
                </>
              )}
            </div>
          ))}
        </section>
      </main>
      {toast && <div className={`toast toast-${toast.type} show`}>{toast.msg}</div>}
    </div>
  );
}

export default App;