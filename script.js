document.addEventListener("DOMContentLoaded", () => {
    const toolsGrid = document.getElementById("toolsGrid");
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    
    // Modal Elements
    const addToolBtn = document.getElementById("addToolBtn");
    const exportBtn = document.getElementById("exportBtn");
    const addModal = document.getElementById("addModal");
    const closeModal = document.getElementById("closeModal");
    const addToolForm = document.getElementById("addToolForm");

    let baseTools = []; // Tools from JSON file
    let localTools = JSON.parse(localStorage.getItem('myLocalTools')) || []; // Tools added by user
    let allTools = []; // Combined tools

    // 1. Fetch JSON and combine with LocalStorage
    async function loadTools() {
        try {
            const response = await fetch("toolbox-backup.json");
            if (response.ok) {
                baseTools = await response.json();
            }
        } catch (error) {
            console.error("Error loading JSON file. Using only local tools.");
        }
        
        // Merge them. (Local tools first so newest show up, or base first. Let's do base first)
        allTools = [...baseTools, ...localTools];
        
        populateCategories(allTools);
        renderTools(allTools);
    }

    // 2. Categories setup
    function populateCategories(tools) {
        const categories = new Set();
        tools.forEach(tool => {
            if (tool.category) categories.add(tool.category);
        });

        categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Reset
        Array.from(categories).sort().forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // 3. Render
    function renderTools(toolsToRender) {
        toolsGrid.innerHTML = ""; 
        if (toolsToRender.length === 0) {
            toolsGrid.innerHTML = `<div class="no-results">No tools found.</div>`;
            return;
        }

        const fragment = document.createDocumentFragment();
        toolsToRender.forEach(tool => {
            const card = document.createElement("a");
            card.href = tool.url;
            card.target = "_blank";
            card.rel = "noopener noreferrer";
            card.className = "card";

            const displayUrl = tool.url.replace(/^https?:\/\/(www\.)?/, '');
            card.innerHTML = `
                <div class="card-name">${tool.name}</div>
                <div class="card-url" title="${tool.url}">${displayUrl}</div>
                <div class="card-category">${tool.category || 'Uncategorized'}</div>
            `;
            fragment.appendChild(card);
        });
        toolsGrid.appendChild(fragment);
    }

    // 4. Filter Logic
    function filterTools() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value;

        const filteredTools = allTools.filter(tool => {
            const matchesSearch = tool.name.toLowerCase().includes(searchTerm) || tool.url.toLowerCase().includes(searchTerm);
            const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        renderTools(filteredTools);
    }

    // --- NEW FEATURES: ADD & EXPORT ---

    // Open/Close Modal
    addToolBtn.onclick = () => addModal.style.display = "block";
    closeModal.onclick = () => addModal.style.display = "none";
    window.onclick = (event) => {
        if (event.target == addModal) addModal.style.display = "none";
    }

    // Handle Form Submit (Add new tool)
    addToolForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const newTool = {
            id: Date.now().toString(), // Generate a unique ID based on timestamp
            name: document.getElementById("newName").value.trim(),
            url: document.getElementById("newUrl").value.trim(),
            category: document.getElementById("newCategory").value.trim()
        };

        // Save to local storage
        localTools.push(newTool);
        localStorage.setItem('myLocalTools', JSON.stringify(localTools));

        // Update UI
        allTools = [...baseTools, ...localTools];
        populateCategories(allTools);
        filterTools(); // Re-render with current filters
        
        // Clean up
        addToolForm.reset();
        addModal.style.display = "none";
    });

    // Handle Export
    exportBtn.addEventListener("click", () => {
        // Convert allTools back to formatted JSON text
        const dataStr = JSON.stringify(allTools, null, 2);
        
        // Create a Blob (a file-like object in memory)
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        // Create a fake hidden <a> tag, click it, and delete it
        const a = document.createElement("a");
        a.href = url;
        a.download = "toolbox-backup.json";
        document.body.appendChild(a);
        a.click();
        
        // Cleanup memory
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Event Listeners
    searchInput.addEventListener("input", filterTools);
    categoryFilter.addEventListener("change", filterTools);

    // Boot up
    loadTools();
});