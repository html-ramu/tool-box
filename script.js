document.addEventListener("DOMContentLoaded", () => {
    const toolsGrid = document.getElementById("toolsGrid");
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");

    let allTools = [];

    // 1. Fetch data from the JSON file
    async function loadTools() {
        try {
            const response = await fetch("toolbox-backup.json");
            if (!response.ok) throw new Error("Network response was not ok");
            
            allTools = await response.json();
            
            populateCategories(allTools);
            renderTools(allTools);
        } catch (error) {
            console.error("Failed to load tools:", error);
            toolsGrid.innerHTML = `<div class="no-results">Error loading tools. Check console.</div>`;
        }
    }

    // 2. Extract unique categories and populate the dropdown
    function populateCategories(tools) {
        const categories = new Set();
        tools.forEach(tool => {
            if (tool.category) {
                categories.add(tool.category);
            }
        });

        // Sort categories alphabetically
        const sortedCategories = Array.from(categories).sort();

        sortedCategories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // 3. Render tools to the DOM
    function renderTools(toolsToRender) {
        toolsGrid.innerHTML = ""; // Clear current grid

        if (toolsToRender.length === 0) {
            toolsGrid.innerHTML = `<div class="no-results">No tools found matching your criteria.</div>`;
            return;
        }

        const fragment = document.createDocumentFragment();

        toolsToRender.forEach(tool => {
            const card = document.createElement("a");
            card.href = tool.url;
            card.target = "_blank";
            card.rel = "noopener noreferrer";
            card.className = "card";

            card.innerHTML = `
                <div class="card-name">${tool.name}</div>
                <div class="card-url">${tool.url.replace(/^https?:\/\/(www\.)?/, '')}</div>
                <div class="card-category">${tool.category || 'Uncategorized'}</div>
            `;

            fragment.appendChild(card);
        });

        toolsGrid.appendChild(fragment);
    }

    // 4. Handle Search and Filtering logic
    function filterTools() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value;

        const filteredTools = allTools.filter(tool => {
            const matchesSearch = tool.name.toLowerCase().includes(searchTerm) || 
                                  tool.url.toLowerCase().includes(searchTerm);
            const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
            
            return matchesSearch && matchesCategory;
        });

        renderTools(filteredTools);
    }

    // Event Listeners for controls
    searchInput.addEventListener("input", filterTools);
    categoryFilter.addEventListener("change", filterTools);

    // Initialize
    loadTools();
});