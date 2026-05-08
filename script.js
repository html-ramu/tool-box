import { auth, provider, db } from './firebase.js';
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const authOverlay = document.getElementById("authOverlay");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    
    const toolsGrid = document.getElementById("toolsGrid");
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    
    const addToolBtn = document.getElementById("addToolBtn");
    const importBtn = document.getElementById("importBtn");
    
    const addModal = document.getElementById("addModal");
    const closeModal = document.getElementById("closeModal");
    const addToolForm = document.getElementById("addToolForm");
    const modalTitle = document.getElementById("modalTitle");
    const toolIdInput = document.getElementById("toolId");

    let currentUser = null;
    let allTools = []; 
    let unsubscribe = null; 

    // --- Authentication ---
    loginBtn.addEventListener("click", () => signInWithPopup(auth, provider));
    logoutBtn.addEventListener("click", () => signOut(auth));

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            authOverlay.style.display = "none";
            listenToFirestore();
        } else {
            currentUser = null;
            authOverlay.style.display = "flex";
            toolsGrid.innerHTML = "";
            allTools = [];
            if (unsubscribe) unsubscribe(); 
        }
    });

    // --- Firestore Real-Time Sync ---
    function listenToFirestore() {
        const userToolsRef = collection(db, "users", currentUser.uid, "tools");
        
        unsubscribe = onSnapshot(userToolsRef, (snapshot) => {
            allTools = [];
            snapshot.forEach((doc) => {
                allTools.push({ id: doc.id, ...doc.data() });
            });
            // Sort tools alphabetically
            allTools.sort((a, b) => a.name.localeCompare(b.name));
            populateCategories(allTools);
            filterTools();
        }, (error) => console.error("Firestore sync error:", error));
    }

    // --- Import JSON to Firestore ---
    importBtn.addEventListener("click", async () => {
        if (!confirm("This will import toolbox-backup.json into your cloud database. Proceed?")) return;
        
        const originalText = importBtn.textContent;
        importBtn.textContent = "Importing...";
        importBtn.disabled = true;

        try {
            const response = await fetch("toolbox-backup.json");
            const backupTools = await response.json();
            
            const batch = writeBatch(db);
            const userToolsRef = collection(db, "users", currentUser.uid, "tools");

            backupTools.forEach(tool => {
                const newDocRef = doc(userToolsRef); 
                batch.set(newDocRef, {
                    name: tool.name,
                    url: tool.url,
                    category: tool.category || "Other"
                });
            });

            await batch.commit();
            alert("Data imported to Firebase successfully!");
        } catch (error) {
            console.error("Import failed:", error);
            alert("Import failed. Check console.");
        } finally {
            importBtn.textContent = originalText;
            importBtn.disabled = false;
        }
    });

    // --- Modal Logic (Add & Edit) ---
    function openModal(isEdit = false, tool = null) {
        if (isEdit && tool) {
            modalTitle.textContent = "Edit Tool";
            toolIdInput.value = tool.id;
            document.getElementById("newName").value = tool.name;
            document.getElementById("newUrl").value = tool.url;
            document.getElementById("newCategory").value = tool.category;
        } else {
            modalTitle.textContent = "Add New Tool";
            addToolForm.reset();
            toolIdInput.value = "";
        }
        addModal.style.display = "block";
    }

    addToolBtn.onclick = () => openModal(false);
    closeModal.onclick = () => addModal.style.display = "none";
    window.onclick = (e) => { if (e.target == addModal) addModal.style.display = "none"; };

    // --- Save/Update Tool ---
    addToolForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.textContent = "Saving...";
        submitBtn.disabled = true;
        
        const toolData = {
            name: document.getElementById("newName").value.trim(),
            url: document.getElementById("newUrl").value.trim(),
            category: document.getElementById("newCategory").value.trim()
        };

        const currentToolId = toolIdInput.value;

        try {
            if (currentToolId) {
                // Edit existing
                const toolRef = doc(db, "users", currentUser.uid, "tools", currentToolId);
                await updateDoc(toolRef, toolData);
            } else {
                // Add new
                const userToolsRef = collection(db, "users", currentUser.uid, "tools");
                await addDoc(userToolsRef, toolData);
            }
            addModal.style.display = "none";
        } catch (error) {
            console.error("Error saving tool:", error);
        } finally {
            submitBtn.textContent = "Save to Firebase";
            submitBtn.disabled = false;
        }
    });

    // --- Edit & Delete Buttons (Event Delegation) ---
    toolsGrid.addEventListener("click", async (e) => {
        // Edit Action
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            const toolId = editBtn.getAttribute('data-id');
            const toolToEdit = allTools.find(t => t.id === toolId);
            if (toolToEdit) openModal(true, toolToEdit);
            return;
        }

        // Delete Action
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const toolId = deleteBtn.getAttribute('data-id');
            if (!confirm("Are you sure you want to delete this tool?")) return;
            try {
                await deleteDoc(doc(db, "users", currentUser.uid, "tools", toolId));
            } catch (error) {
                console.error("Error deleting tool:", error);
            }
        }
    });

    // --- UI Rendering ---
    function populateCategories(tools) {
        const categories = new Set();
        tools.forEach(tool => { if (tool.category) categories.add(tool.category); });

        const currentSelection = categoryFilter.value;
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        
        Array.from(categories).sort().forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });

        if (categories.has(currentSelection)) categoryFilter.value = currentSelection;
    }

    function renderTools(toolsToRender) {
        toolsGrid.innerHTML = ""; 
        if (toolsToRender.length === 0) {
            toolsGrid.innerHTML = `<div class="no-results">No tools found matching your criteria.</div>`;
            return;
        }

        const fragment = document.createDocumentFragment();
        toolsToRender.forEach(tool => {
            const card = document.createElement("div");
            card.className = "card";

            const displayUrl = tool.url.replace(/^https?:\/\/(www\.)?/, '');
            card.innerHTML = `
                <div class="card-header">
                    <div class="card-name">${tool.name}</div>
                    <div class="card-actions">
                        <button class="icon-btn edit-btn" data-id="${tool.id}" title="Edit Tool">✏️</button>
                        <button class="icon-btn delete-btn" data-id="${tool.id}" title="Delete Tool" style="color: #ff5555;">🗑️</button>
                    </div>
                </div>
                <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="card-url card-url-link" title="${tool.url}">${displayUrl}</a>
                <div class="card-category">${tool.category || 'Uncategorized'}</div>
            `;
            fragment.appendChild(card);
        });
        toolsGrid.appendChild(fragment);
    }

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

    searchInput.addEventListener("input", filterTools);
    categoryFilter.addEventListener("change", filterTools);
});