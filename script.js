document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let jumper = {
        name: 'Jumper', // Default Name
        jumps: [],
        companions: [], // Global Companion Roster
        theme: 'default'
    };

    // Theme State
    const themes = ['default', 'light', 'cyberpunk', 'paper'];
    let currentThemeIndex = 0;

    let currentJumpId = null;
    let currentCharacterId = 'jumper'; // 'jumper' or companion ID

    // --- Elements ---
    const jumpListEl = document.getElementById('jump-list');
    const jumpDetails = document.getElementById('jump-details');
    const jumperProfile = document.getElementById('jumper-profile');
    const landingGuide = document.getElementById('landing-guide');

    // Inputs
    const jumpNameInput = document.getElementById('jump-name');
    const jumpOriginInput = document.getElementById('jump-origin');
    const jumpOriginDescInput = document.getElementById('jump-origin-description');
    const cpBudgetInput = document.getElementById('cp-budget-input'); // Changed ID
    const cpSpentEl = document.getElementById('cp-spent');
    const cpRemainingEl = document.getElementById('cp-remaining');

    // ... (Lists and other elements remain same)

    // ...

    // ... (Previous code)

    // Removed duplicate updateBudget function from here

    // ...

    cpBudgetInput.addEventListener('input', (e) => {
        const build = getCurrentBuild();
        if (!build) return;
        build.budget = parseInt(e.target.value) || 0;
        saveData();
        updateBudget();
    });

    // Lists
    const perkListEl = document.getElementById('perk-list');
    const itemListEl = document.getElementById('item-list');
    const companionListEl = document.getElementById('companion-list');
    const drawbackListEl = document.getElementById('drawback-list');
    const scenarioListEl = document.getElementById('scenario-list');

    const logListEl = document.getElementById('log-list');
    const btnAddLog = document.getElementById('btn-add-log');

    // Alt Form & Note Elements
    const altFormListEl = document.getElementById('altform-list');
    const noteListEl = document.getElementById('note-list');
    const btnAddAltForm = document.getElementById('btn-add-altform');
    const btnAddNote = document.getElementById('btn-add-note');
    const btnMigrateOrigin = document.getElementById('btn-migrate-origin');

    // Profile Elements
    const profileSearch = document.getElementById('profile-search');
    const profileResults = document.getElementById('profile-results');
    const profileTotalPerks = document.getElementById('profile-total-perks');
    const profileTotalItems = document.getElementById('profile-total-items');
    const profileTotalScenarios = document.getElementById('profile-total-scenarios');
    const profileTotalEvents = document.getElementById('profile-total-events');
    const profileFilter = document.getElementById('profile-filter');

    // Buttons
    const btnAddJump = document.getElementById('btn-add-jump');
    const btnAddSupplement = document.getElementById('btn-add-supplement');
    const btnDeleteJump = document.getElementById('btn-delete-jump');
    const btnProfile = document.getElementById('btn-profile');

    const btnAddPerk = document.getElementById('btn-add-perk');
    const btnAddItem = document.getElementById('btn-add-item');
    const btnAddCompanion = document.getElementById('btn-add-companion');
    const btnAddDrawback = document.getElementById('btn-add-drawback');
    const btnAddScenario = document.getElementById('btn-add-scenario');

    const btnExport = document.getElementById('btn-export');
    const btnImport = document.getElementById('btn-import');
    const btnPrintBuild = document.getElementById('btn-print-build');
    const btnClearData = document.getElementById('btn-clear-data');
    const fileImport = document.getElementById('file-import');

    // Companion Elements
    // const btnCreateCompanion = document.getElementById('btn-create-companion'); // Removed
    const globalCompanionList = document.getElementById('global-companion-list'); // Removed from HTML but keeping ref safe or remove
    const characterSelect = document.getElementById('character-select');
    const btnImportCompanion = document.getElementById('btn-import-companion');
    // const newCompanionNameInput = document.getElementById('new-companion-name'); // Removed from HTML

    // Modal Elements
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const btnCloseModal = document.getElementById('btn-close-modal');

    // --- Initialization moved to end of file ---

    // --- Core Logic ---

    function getJump() {
        return jumper.jumps.find(j => j.id === currentJumpId);
    }

    function getCurrentBuild() {
        const jump = getJump();
        if (!jump) return null;
        if (currentCharacterId === 'jumper') return jump;

        if (!jump.companionBuilds) jump.companionBuilds = {};
        return jump.companionBuilds[currentCharacterId];
    }
    function createJump(type = 'jump') {
        const id = Date.now();
        const newJump = {
            id: id,
            type: type,
            name: type === 'supplement' ? 'New Supplement' : 'New Jump',
            origin: '',
            originDescription: '',
            budget: 1000,
            perks: [],
            items: [],
            companions: [],
            drawbacks: [],
            scenarios: [],
            scenarios: [],
            logs: [],
            altForms: [],
            notes: [],
            companionBuilds: {}
        };
        jumper.jumps.push(newJump);
        saveData();
        renderSidebar();
        selectJump(id);
    }

    function deleteJump(id) {
        const targetId = id || currentJumpId;
        if (!targetId) return;

        if (confirm('Are you sure you want to delete this?')) {
            jumper.jumps = jumper.jumps.filter(j => j.id !== targetId);
            saveData();

            if (currentJumpId === targetId) {
                currentJumpId = null;
                // If no jumps left, show guide? Or just show profile?
                // Let's show profile for now as it's safer, or guide if empty.
                if (jumper.jumps.length === 0) {
                    showGuide();
                } else {
                    showProfile();
                }
            }
            renderSidebar();
        }
    }

    function showGuide() {
        jumpDetails.classList.add('hidden');
        jumperProfile.classList.add('hidden');
        if (landingGuide) landingGuide.classList.remove('hidden');
        currentJumpId = null;
        document.querySelectorAll('.jump-item').forEach(el => el.classList.remove('active'));
    }

    function renderSidebar() {
        const sidebarSupplements = document.getElementById('sidebar-supplements');
        const sidebarJumps = document.getElementById('sidebar-jumps');

        if (sidebarSupplements) sidebarSupplements.innerHTML = '';
        if (sidebarJumps) sidebarJumps.innerHTML = '';

        let jumpCount = 0;

        jumper.jumps.forEach((jump) => {
            const isSupplement = jump.type === 'supplement';
            if (!isSupplement) jumpCount++;

            const li = document.createElement('div');
            li.className = `jump-item ${jump.id === currentJumpId ? 'active' : ''}`;
            li.dataset.id = jump.id;

            const nameSpan = document.createElement('span');
            nameSpan.textContent = isSupplement ? jump.name : `${jumpCount}. ${jump.name}`;
            nameSpan.style.flex = '1'; // Allow text to take available space
            nameSpan.style.whiteSpace = 'nowrap';
            nameSpan.style.overflow = 'hidden';
            nameSpan.style.textOverflow = 'ellipsis';

            const trashBtn = document.createElement('button');
            trashBtn.className = 'btn-trash';
            trashBtn.innerHTML = '🗑️'; // Or use an icon class if available
            trashBtn.title = 'Delete';
            trashBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteJump(jump.id);
            });

            li.appendChild(nameSpan);
            li.appendChild(trashBtn);

            li.addEventListener('click', () => selectJump(jump.id));

            if (isSupplement) {
                if (sidebarSupplements) sidebarSupplements.appendChild(li);
            } else {
                if (sidebarJumps) sidebarJumps.appendChild(li);
            }
        });
    }

    function selectJump(id) {
        currentJumpId = id;
        const jump = jumper.jumps.find(j => j.id === id);
        if (!jump) return;

        // Update UI
        if (landingGuide) landingGuide.classList.add('hidden');
        jumperProfile.classList.add('hidden');
        jumpDetails.classList.remove('hidden');

        // Highlight Sidebar
        document.querySelectorAll('.jump-item').forEach(el => {
            el.classList.toggle('active', el.dataset.id === id);
        });

        // Reset to Jumper
        currentCharacterId = 'jumper';
        renderCharacterSwitcher();

        // Populate Fields (Jump Metadata)
        jumpNameInput.value = jump.name;

        // Populate Fields (Build Data)
        refreshJumpView();

        // Migration for old logs
        if (jump.log && (!jump.logs || jump.logs.length === 0)) {
            jump.logs = [{
                id: Date.now(),
                title: 'Legacy Log',
                content: jump.log,
                date: new Date().toLocaleString()
            }];
            delete jump.log;
            saveData();
        }

        renderEntries();
    }

    function showProfile() {
        if (landingGuide) landingGuide.classList.add('hidden');
        jumpDetails.classList.add('hidden');
        jumperProfile.classList.remove('hidden');
        currentJumpId = null;
        document.querySelectorAll('.jump-item').forEach(el => el.classList.remove('active'));
        renderGlobalProfile();
    }

    function updateBudget() {
        const build = getCurrentBuild();
        if (!build) return;

        // Update Input Value if it changed externally
        if (document.activeElement !== cpBudgetInput) {
            cpBudgetInput.value = build.budget;
        }

        const perkCost = (build.perks || []).reduce((sum, p) => sum + (parseInt(p.cost) || 0), 0);
        const itemCost = (build.items || []).reduce((sum, i) => sum + (parseInt(i.cost) || 0), 0);
        const companionCost = (build.companions || []).reduce((sum, c) => sum + (parseInt(c.cost) || 0), 0);

        const drawbackGain = (build.drawbacks || []).reduce((sum, d) => sum + (parseInt(d.cost) || 0), 0);
        const scenarioGain = (build.scenarios || []).reduce((sum, s) => sum + (parseInt(s.rewardValue) || 0), 0);

        // Logic: Budget + Drawbacks + Scenarios - Spent
        const totalBudget = parseInt(build.budget) + drawbackGain + scenarioGain;
        const totalSpent = perkCost + itemCost + companionCost;
        const remaining = totalBudget - totalSpent;

        cpSpentEl.textContent = totalSpent;
        cpRemainingEl.textContent = remaining;

        // Visual Feedback for Negative CP
        if (remaining < 0) {
            cpRemainingEl.style.color = 'var(--danger)';
            cpRemainingEl.style.textShadow = '0 0 10px rgba(255, 0, 90, 0.5)';
        } else {
            cpRemainingEl.style.color = 'var(--accent-primary)';
            cpRemainingEl.style.textShadow = '0 0 10px rgba(0, 209, 255, 0.5)';
        }

        // updateGlobalStats(); // Removed to fix error
    }

    function renderEntries() {
        const jump = getJump();
        if (!jump) return;
        const build = getCurrentBuild();

        // Helper to render a specific list
        const renderList = (list, elementId, type) => {
            const el = document.getElementById(elementId);
            if (!el) return;
            el.innerHTML = '';
            (list || []).forEach((item, index) => {
                el.appendChild(createEntryElement(item, index, type, list));
            });
        };

        // Build-specific lists (Now ALL lists are build-specific)
        if (build) {
            renderList(build.perks, 'perk-list', 'perk');
            renderList(build.items, 'item-list', 'item');
            renderList(build.companions, 'companion-list', 'companion');
            renderList(build.drawbacks, 'drawback-list', 'drawback');
            renderList(build.scenarios, 'scenario-list', 'scenario');

            // Now bound to character
            renderList(build.logs, 'log-list', 'event');
            renderList(build.notes, 'note-list', 'note');
            renderList(build.altForms, 'altform-list', 'altform');
        }
    }

    function createEntryElement(data, index, type, sourceList) {
        const div = document.createElement('div');
        div.className = `entry-item ${type}`;

        const isScenario = type === 'scenario';
        const isDrawback = type === 'drawback';
        const isEvent = type === 'event';
        const isNote = type === 'note';
        const isAltForm = type === 'altform';

        const hasCost = !isEvent && !isNote && !isAltForm;

        let costPlaceholder = 'Cost CP';
        if (isScenario) costPlaceholder = 'Reward CP';
        if (isDrawback) costPlaceholder = 'Gain CP';

        let costClass = 'entry-cost';
        if (isScenario || isDrawback) costClass += ' gain';

        // Name Placeholder
        let namePlaceholder = 'Name';
        if (isEvent) namePlaceholder = 'Event Title';
        if (isNote) namePlaceholder = 'Note Title';
        if (isAltForm) namePlaceholder = 'Form Name';

        // Description Placeholder
        let descPlaceholder = 'Description...';
        if (isEvent) descPlaceholder = 'Event Description...';
        if (isNote) descPlaceholder = 'Note Content...';
        if (isAltForm) descPlaceholder = 'Form Description...';

        let html = `
            <div class="entry-header">
                <div class="entry-details">
                    <input type="text" class="entry-name" value="${data.name}" placeholder="${namePlaceholder}">
                </div>
                ${hasCost ? `<input type="number" class="${costClass}" value="${isScenario ? (data.rewardValue || 0) : data.cost}" placeholder="${costPlaceholder}">` : ''}
                <button class="btn-remove">×</button>
            </div>
            <textarea class="entry-description" placeholder="${descPlaceholder}">${data.description || ''}</textarea>
        `;

        if (isScenario) {
            html += `<textarea class="entry-description" style="margin-top: 5px; border-left: 2px solid var(--success);" placeholder="Reward Description...">${data.rewardDescription || ''}</textarea>`;
        }

        div.innerHTML = html;

        // Event Listeners
        const nameInput = div.querySelector('.entry-name');
        const descInputs = div.querySelectorAll('.entry-description');
        const removeBtn = div.querySelector('.btn-remove');

        nameInput.addEventListener('input', (e) => {
            sourceList[index].name = e.target.value;
            saveData();
        });

        if (hasCost) {
            const costInput = div.querySelector(`.${costClass.split(' ')[0]}`);
            costInput.addEventListener('input', (e) => {
                if (isScenario) {
                    sourceList[index].rewardValue = parseInt(e.target.value) || 0;
                } else {
                    sourceList[index].cost = parseInt(e.target.value) || 0;
                }
                saveData();
                updateBudget();
            });
        }

        descInputs[0].addEventListener('input', (e) => {
            sourceList[index].description = e.target.value;
            saveData();
        });

        if (isScenario && descInputs[1]) {
            descInputs[1].addEventListener('input', (e) => {
                sourceList[index].rewardDescription = e.target.value;
                saveData();
            });
        }

        removeBtn.addEventListener('click', () => {
            if (confirm('Delete this entry?')) {
                sourceList.splice(index, 1);
                saveData();
                renderEntries();
                updateBudget();
            }
        });

        return div;
    }

    function addEntry(type) {
        const build = getCurrentBuild();
        if (!build) return;

        // Ensure arrays exist
        if (!build.items) build.items = [];
        if (!build.companions) build.companions = [];
        if (!build.scenarios) build.scenarios = [];
        if (!build.logs) build.logs = [];
        if (!build.notes) build.notes = [];
        if (!build.altForms) build.altForms = [];

        // Determine target list
        let targetList;
        if (type === 'perk') targetList = build.perks;
        if (type === 'item') targetList = build.items;
        if (type === 'companion') targetList = build.companions;
        if (type === 'drawback') targetList = build.drawbacks;
        if (type === 'scenario') targetList = build.scenarios;
        if (type === 'event') targetList = build.logs;
        if (type === 'note') targetList = build.notes;
        if (type === 'altform') targetList = build.altForms;

        const newItem = {
            id: Date.now(),
            name: '',
            description: '',
        };

        // Type specific defaults
        if (type === 'perk' || type === 'item' || type === 'companion' || type === 'drawback') {
            newItem.cost = 100;
        }
        if (type === 'scenario') {
            newItem.rewardValue = 0;
            newItem.rewardDescription = '';
        }
        if (type === 'event') {
            newItem.date = new Date().toLocaleString();
        }

        targetList.push(newItem);

        saveData();
        renderEntries();
        updateBudget();
    }


    // function updateGlobalStats() { ... } // Removed to fix error



    // Removed Modal Logic (btnCancelLog, btnSaveLog)

    function renderGlobalProfile(forceSelectName = null) {
        const query = profileSearch.value.toLowerCase();
        let filterChar = forceSelectName || profileFilter.value;
        profileResults.innerHTML = '';

        // Populate Filter Dropdown
        // Clear existing options except "Jumper" (which we will update)
        profileFilter.innerHTML = ''; // Clear all

        const jumperOption = document.createElement('option');
        jumperOption.value = 'Jumper';
        jumperOption.textContent = `${jumper.name} (Jumper)`;
        profileFilter.appendChild(jumperOption);

        jumper.companions.forEach(comp => {
            const option = document.createElement('option');
            option.value = comp.name;
            option.textContent = comp.name;
            profileFilter.appendChild(option);
        });

        // Add "Create New" Option
        const createOption = document.createElement('option');
        createOption.value = 'create_new';
        createOption.textContent = '+ Create New Companion...';
        createOption.style.fontWeight = 'bold';
        createOption.style.color = 'var(--accent-primary)';
        profileFilter.appendChild(createOption);

        // Restore selection
        if (filterChar && filterChar !== 'create_new') {
            let exists = false;
            for (let i = 0; i < profileFilter.options.length; i++) {
                if (profileFilter.options[i].value === filterChar) exists = true;
            }
            if (exists) profileFilter.value = filterChar;
            else profileFilter.value = 'Jumper';
        } else {
            profileFilter.value = 'Jumper';
        }

        // Update Header
        const profileHeader = document.querySelector('.profile-header h2');
        if (profileFilter.value === 'Jumper') {
            profileHeader.innerHTML = `${jumper.name} Profile <button id="btn-rename-jumper" style="font-size: 0.8rem; background: none; border: 1px solid var(--accent-primary); color: var(--accent-primary); border-radius: 4px; padding: 2px 8px; cursor: pointer; margin-left: 10px;">Rename</button>`;

            const btnRenameJumper = document.getElementById('btn-rename-jumper');
            if (btnRenameJumper) {
                btnRenameJumper.addEventListener('click', () => {
                    const newName = prompt("Rename Jumper:", jumper.name);
                    if (newName && newName !== jumper.name) {
                        jumper.name = newName;
                        saveData();
                        renderGlobalProfile(); // Re-render to update dropdown and header
                        renderCharacterSwitcher(); // Update switcher too
                    }
                });
            }
        } else {
            profileHeader.innerHTML = `${profileFilter.value} Profile <button id="btn-rename-companion" style="font-size: 0.8rem; background: none; border: 1px solid var(--accent-primary); color: var(--accent-primary); border-radius: 4px; padding: 2px 8px; cursor: pointer; margin-left: 10px;">Rename</button>`;

            const btnRename = document.getElementById('btn-rename-companion');
            if (btnRename) {
                btnRename.addEventListener('click', () => {
                    const currentName = profileFilter.value;
                    const companion = jumper.companions.find(c => c.name === currentName);
                    if (!companion) return;

                    const newName = prompt("Rename Companion:", currentName);
                    if (newName && newName !== currentName) {
                        if (jumper.companions.some(c => c.name === newName)) {
                            alert("A companion with that name already exists!");
                            return;
                        }
                        companion.name = newName;
                        saveData();
                        renderGlobalProfile(newName);
                    }
                });
            }
        }

        let totalPerks = 0;
        let totalItems = 0;
        let totalScenarios = 0;
        let totalEvents = 0;

        const allEntries = [];

        jumper.jumps.forEach(jump => {
            const addEntries = (list, type, charName) => {
                (list || []).forEach(item => {
                    allEntries.push({
                        ...item,
                        type,
                        jumpName: jump.name,
                        origin: charName === 'Jumper' ? jump.origin : (item.origin || jump.origin),
                        characterName: charName
                    });
                });
            };

            // Jumper Data
            addEntries(jump.perks, 'Perk', 'Jumper');
            addEntries(jump.items, 'Item', 'Jumper');
            addEntries(jump.companions, 'Companion', 'Jumper');
            addEntries(jump.scenarios, 'Scenario', 'Jumper');
            addEntries(jump.logs, 'Event', 'Jumper');
            addEntries(jump.notes, 'Note', 'Jumper');
            addEntries(jump.altForms, 'Alt Form', 'Jumper');

            // Companion Data
            if (jump.companionBuilds) {
                Object.keys(jump.companionBuilds).forEach(compId => {
                    const build = jump.companionBuilds[compId];
                    if (!build) return; // Safety check

                    const compName = jumper.companions.find(c => c.id === compId)?.name || 'Unknown Companion';

                    addEntries(build.perks, 'Perk', compName);
                    addEntries(build.items, 'Item', compName);
                    addEntries(build.companions, 'Companion', compName);
                    addEntries(build.scenarios, 'Scenario', compName);
                    addEntries(build.logs, 'Event', compName);
                    addEntries(build.notes, 'Note', compName);
                    addEntries(build.altForms, 'Alt Form', compName);
                });
            }
        });

        allEntries.forEach(entry => {
            // Filter by Character
            if (filterChar !== 'all' && entry.characterName !== filterChar) return;

            if (entry.type === 'Perk') totalPerks++;
            if (entry.type === 'Item') totalItems++;
            if (entry.type === 'Scenario') totalScenarios++;
            if (entry.type === 'Event') totalEvents++;

            // Search Filter
            const entryName = (entry.name || '').toLowerCase();
            const entryDesc = (entry.description || '').toLowerCase();
            const jumpName = (entry.jumpName || '').toLowerCase();

            if (entryName.includes(query) ||
                entryDesc.includes(query) ||
                jumpName.includes(query)) {

                const card = document.createElement('div');
                card.className = 'profile-card';
                card.style.borderLeft = `4px solid ${getColorForType(entry.type)}`;

                // Cost / Reward Display
                let costHtml = '';
                if (entry.type === 'Scenario') {
                    costHtml = `<span style="float:right; font-size:0.9em; color:var(--success); font-weight:bold;">+${entry.rewardValue || 0} CP</span>`;
                } else if (entry.cost) {
                    costHtml = `<span style="float:right; font-size:0.8em; color:var(--text-muted);">${entry.cost} CP</span>`;
                }

                // Description Display
                let descHtml = `<p>${entry.description || 'No description.'}</p>`;
                if (entry.type === 'Scenario' && entry.rewardDescription) {
                    descHtml += `<div style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1);">
                        <strong style="color:var(--success)">REWARD:</strong>
                        <p style="margin-top:5px; color:var(--text-main);">${entry.rewardDescription}</p>
                    </div>`;
                }

                card.innerHTML = `
                    <h4>${entry.name || 'Untitled'} ${costHtml}</h4>
                    <span class="origin" style="color: var(--accent-secondary); font-weight: bold;">
                        ${entry.characterName !== 'Jumper' ? `<span style="color: #9b59b6;">[${entry.characterName}]</span> ` : ''}
                        ${entry.jumpName}
                    </span>
                    <span class="origin">${entry.type} ${entry.origin ? '• ' + entry.origin : ''}</span>
                    ${descHtml}
                `;
                profileResults.appendChild(card);
            }
        });

        profileTotalPerks.textContent = totalPerks;
        profileTotalItems.textContent = totalItems;
        if (profileTotalScenarios) profileTotalScenarios.textContent = totalScenarios;
        if (profileTotalEvents) profileTotalEvents.textContent = totalEvents;
    }

    function getColorForType(type) {
        if (type === 'Perk') return 'var(--accent-primary)';
        if (type === 'Item') return '#f1c40f';
        if (type === 'Companion') return '#9b59b6';
        if (type === 'Scenario') return 'var(--success)'; // Green
        if (type === 'Event') return '#ffffff'; // White
        if (type === 'Note') return '#a0a0a0'; // Grey
        if (type === 'Alt Form') return 'var(--accent-secondary)'; // Cyan/Blue
        return '#fff';
    }

    // Theme Logic
    function applyTheme(index) {
        document.body.className = ''; // Reset
        const theme = themes[index];
        if (theme !== 'default') {
            document.body.classList.add(`theme-${theme}`);
        }
        const label = document.getElementById('theme-label');
        if (label) label.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);

        jumper.theme = theme;
        saveData();
    }

    const btnThemePrev = document.getElementById('btn-theme-prev');
    const btnThemeNext = document.getElementById('btn-theme-next');

    if (btnThemePrev) {
        btnThemePrev.addEventListener('click', () => {
            currentThemeIndex = (currentThemeIndex - 1 + themes.length) % themes.length;
            applyTheme(currentThemeIndex);
        });
    }

    if (btnThemeNext) {
        btnThemeNext.addEventListener('click', () => {
            currentThemeIndex = (currentThemeIndex + 1) % themes.length;
            applyTheme(currentThemeIndex);
        });
    }

    // --- Persistence ---
    function saveData() {
        const data = {
            ...jumper,
            currentJumpId: currentJumpId // Save current session state
        };
        localStorage.setItem('jumpchain_data', JSON.stringify(data));
    }

    function loadData() {
        const data = localStorage.getItem('jumpchain_data');
        if (data) {
            const parsed = JSON.parse(data);

            // Handle legacy structure where jumper was the root object
            if (parsed.jumps) {
                jumper = parsed;
            }

            // Restore Session State
            if (parsed.currentJumpId) {
                currentJumpId = parsed.currentJumpId;
            }

            // Restore Theme
            if (jumper.theme) {
                const index = themes.indexOf(jumper.theme);
                if (index !== -1) {
                    currentThemeIndex = index;
                    applyTheme(index);
                }
            }

            if (!jumper.companions) jumper.companions = []; // Ensure companions array exists
            if (!jumper.name) jumper.name = 'Jumper'; // Ensure name exists
            // Migration: Ensure new arrays exist for old data
            jumper.jumps.forEach(j => {
                if (!j.type) j.type = 'jump'; // Default to jump
                if (!j.items) j.items = [];
                if (!j.companions) j.companions = [];
                if (!j.scenarios) j.scenarios = [];
                if (!j.logs) j.logs = [];
                if (!j.altForms) j.altForms = [];
                if (!j.notes) j.notes = [];
                if (!j.companionBuilds) j.companionBuilds = {}; // Ensure companionBuilds exists

                // Standardize Logs/Notes (title->name, content->description)
                const migrateEntry = (list) => {
                    (list || []).forEach(entry => {
                        if (entry.title !== undefined && entry.name === undefined) {
                            entry.name = entry.title;
                            delete entry.title;
                        }
                        if (entry.content !== undefined && entry.description === undefined) {
                            entry.description = entry.content;
                            delete entry.content;
                        }
                    });
                };
                migrateEntry(j.logs);
                migrateEntry(j.notes);
                // AltForms already used name/description in my previous code, but good to check if legacy existed
            });
        }
    }

    // --- Companion Logic ---
    // createCompanion function removed as it's now handled via modal in filter change

    function renderGlobalCompanions() {
        // Function kept for compatibility but roster list is removed
        // We can use this to just refresh the dropdown if needed
        renderGlobalProfile();
    }

    function renderCharacterSwitcher() {
        const jump = getJump();
        if (!jump) return;

        characterSelect.innerHTML = '';
        const jumperOption = document.createElement('option');
        jumperOption.value = 'jumper';
        jumperOption.textContent = `${jumper.name} (Jumper)`;
        characterSelect.appendChild(jumperOption);

        // Find companions imported into this jump
        if (jump.companionBuilds) {
            Object.keys(jump.companionBuilds).forEach(compId => {
                const globalComp = jumper.companions.find(c => c.id === compId);
                const name = globalComp ? globalComp.name : 'Unknown Companion';
                const option = document.createElement('option');
                option.value = compId;
                option.textContent = name;
                characterSelect.appendChild(option);
            });
        }

        characterSelect.value = currentCharacterId;
    }

    function importCompanion() {
        const jump = getJump();
        if (!jump) return;

        const available = jumper.companions.filter(c => !jump.companionBuilds || !jump.companionBuilds[c.id]);

        if (available.length === 0) {
            alert("No new companions available to import. Create one in the Profile first!");
            return;
        }

        // Open Modal
        modalTitle.textContent = "Import Companion";
        modalBody.innerHTML = '';

        available.forEach(comp => {
            const btn = document.createElement('button');
            btn.className = 'modal-option';
            btn.textContent = comp.name;
            btn.addEventListener('click', () => {
                try {
                    // Import Logic
                    if (!jump.companionBuilds) jump.companionBuilds = {};

                    // Initialize Build
                    jump.companionBuilds[comp.id] = {
                        budget: 600, // Default companion budget
                        perks: [],
                        items: [],
                        drawbacks: [],
                        scenarios: [],
                        logs: [],
                        notes: [],
                        altForms: [],
                        origin: '',
                        originDescription: ''
                    };

                    saveData();
                    renderCharacterSwitcher();

                    // Switch to them
                    currentCharacterId = comp.id;
                    renderCharacterSwitcher(); // Update select value
                    refreshJumpView();
                } catch (err) {
                    console.error("Error importing companion:", err);
                    alert("Error importing companion: " + err.message);
                } finally {
                    closeModal();
                }
            });
            modalBody.appendChild(btn);
        });

        openModal();
    }

    // --- Modal Logic ---
    function openModal() {
        modalOverlay.classList.remove('hidden');
    }

    function closeModal() {
        modalOverlay.classList.add('hidden');
    }

    btnCloseModal.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    function refreshJumpView() {
        const build = getCurrentBuild();
        if (!build) return;

        // Update Inputs
        // Note: Jump Name is global to the Jump, not the Build.
        // Origin and Budget are per-Build.

        jumpOriginInput.value = build.origin || '';
        jumpOriginDescInput.value = build.originDescription || '';
        cpBudgetInput.value = build.budget;

        renderEntries();
        updateBudget();
    }

    // --- Event Listeners ---
    btnAddJump.addEventListener('click', () => createJump('jump'));
    if (btnAddSupplement) btnAddSupplement.addEventListener('click', () => createJump('supplement'));
    // btnDeleteJump.addEventListener('click', deleteJump); // Removed, moved to sidebar
    btnProfile.addEventListener('click', showProfile);

    jumpNameInput.addEventListener('change', (e) => {
        if (!currentJumpId) return;
        const jump = jumper.jumps.find(j => j.id === currentJumpId);
        jump.name = e.target.value || 'Untitled Jump';
        saveData();
        renderSidebar();
    });

    jumpOriginInput.addEventListener('change', (e) => {
        const build = getCurrentBuild();
        if (!build) return;
        build.origin = e.target.value;
        saveData();
    });

    jumpOriginDescInput.addEventListener('change', (e) => {
        const build = getCurrentBuild();
        if (!build) return;
        build.originDescription = e.target.value;
        saveData();
    });

    // New Event Listeners
    // btnCreateCompanion.addEventListener('click', createCompanion); // Removed
    btnImportCompanion.addEventListener('click', importCompanion);

    characterSelect.addEventListener('change', (e) => {
        currentCharacterId = e.target.value;
        refreshJumpView();
    });

    btnAddPerk.addEventListener('click', () => addEntry('perk'));
    btnAddItem.addEventListener('click', () => addEntry('item'));
    btnAddCompanion.addEventListener('click', () => addEntry('companion'));
    btnAddDrawback.addEventListener('click', () => addEntry('drawback'));
    btnAddScenario.addEventListener('click', () => addEntry('scenario'));

    // Standardized Add Buttons
    if (btnAddLog) btnAddLog.addEventListener('click', () => addEntry('event'));
    if (btnAddNote) btnAddNote.addEventListener('click', () => addEntry('note'));
    if (btnAddAltForm) btnAddAltForm.addEventListener('click', () => addEntry('altform'));

    if (btnMigrateOrigin) {
        btnMigrateOrigin.addEventListener('click', () => {
            const build = getCurrentBuild();
            if (!build) return;

            const origin = jumpOriginInput.value;
            const desc = jumpOriginDescInput.value;

            if (!origin && !desc) {
                alert("Nothing to migrate!");
                return;
            }

            if (!build.altForms) build.altForms = [];
            build.altForms.push({
                id: Date.now(),
                name: origin || "Untitled Form",
                description: desc
            });
            saveData();
            renderEntries();
        });
    }

    profileSearch.addEventListener('input', () => renderGlobalProfile());
    profileFilter.addEventListener('change', (e) => {
        // alert('Filter changed to: ' + e.target.value);
        if (e.target.value === 'create_new') {
            // Open Modal for Creation
            modalTitle.textContent = "Create New Companion";
            modalBody.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <input type="text" id="modal-companion-name" placeholder="Enter Companion Name" class="entry-name" style="width: 100%; padding: 10px;">
                    <button id="btn-modal-create" class="btn-secondary" style="align-self: flex-end;">Create</button>
                </div>
            `;

            openModal();

            const input = document.getElementById('modal-companion-name');
            const btn = document.getElementById('btn-modal-create');

            input.focus();

            const handleCreate = () => {
                const name = input.value.trim();
                if (!name) return;

                const newCompanion = {
                    id: 'c_' + Date.now(),
                    name: name,
                    description: ''
                };

                jumper.companions.push(newCompanion);
                saveData();

                // Refresh Profile (will rebuild dropdown)
                renderGlobalProfile();

                // Select the new companion
                profileFilter.value = name;
                renderGlobalProfile(); // Re-render results for new companion (empty)

                closeModal();
            };

            btn.addEventListener('click', handleCreate);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleCreate();
            });

            // Handle Cancel (revert dropdown)
            const handleClose = () => {
                if (profileFilter.value === 'create_new') {
                    profileFilter.value = 'Jumper'; // Default back to Jumper
                    renderGlobalProfile();
                }
            };

            // Hook into close modal logic temporarily? 
            // Actually, if they click close button or overlay, closeModal is called.
            // We need to ensure dropdown resets if they didn't create.
            // We can check in the change listener if it's still 'create_new' after a delay or just rely on the fact that renderGlobalProfile wasn't called with the new name.
            // Simpler: Reset it immediately to 'Jumper' visually, then if they create, we set it to the new one.
            // But then the UI flickers.
            // Let's just let the modal handle it.
        } else {
            renderGlobalProfile();
        }
    });

    // Import/Export
    btnExport.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jumper, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);

        const date = new Date();
        const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const safeName = (jumper.name || 'Jumper').replace(/[^a-z0-9]/gi, '_').toLowerCase();

        downloadAnchorNode.setAttribute("download", `JumpTRACK_${safeName}_${timestamp}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    // Print Build
    if (btnPrintBuild) {
        btnPrintBuild.addEventListener('click', () => {
            // Export full data for printing
            localStorage.setItem('jumpTrack_printData', JSON.stringify(jumper));
            window.open('print.html', '_blank');
        });
    }

    btnImport.addEventListener('click', () => {
        fileImport.click();
    });

    btnClearData.addEventListener('click', () => {
        if (confirm('WARNING: This will delete ALL your jumps and data. This action cannot be undone.\n\nAre you sure you want to proceed?')) {
            if (confirm('Double Check: Are you absolutely sure? All data will be lost.')) {
                // Full Reset
                jumper = {
                    name: 'Jumper',
                    jumps: [],
                    companions: [],
                    theme: 'default'
                };

                currentJumpId = null;
                currentCharacterId = 'jumper';
                currentThemeIndex = 0;

                saveData();
                applyTheme(0);
                renderSidebar();
                renderGlobalProfile(); // This handles stats and UI updates
                showProfile();
            }
        }
    });

    fileImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.jumps && Array.isArray(data.jumps)) {
                    jumper = data;
                    // Run migration on import too
                    jumper.jumps.forEach(j => {
                        if (!j.items) j.items = [];
                        if (!j.companions) j.companions = [];
                        if (!j.scenarios) j.scenarios = [];
                    });
                    saveData();
                    currentJumpId = null;
                    renderSidebar();
                    showProfile();
                    alert('Data imported successfully!');
                } else {
                    alert('Invalid JSON format');
                }
            } catch (err) {
                alert('Error parsing JSON');
            }
        };
        reader.readAsText(file);
        fileImport.value = ''; // Reset
    }); // End fileImport listener

    // --- Initialization (Moved to end to ensure listeners are attached) ---
    try {
        loadData();
        renderSidebar();
        renderGlobalCompanions(); // Initial render

        // Restore View
        if (currentJumpId) {
            // Verify it still exists
            if (jumper.jumps.find(j => j.id === currentJumpId)) {
                selectJump(currentJumpId);
            } else {
                currentJumpId = null;
                showGuide();
            }
        } else {
            showGuide();
        }
    } catch (err) {
        console.error("Initialization Error:", err);
        alert("An error occurred during initialization. You may need to clear your data if this persists.");
    }

}); // End DOMContentLoaded
