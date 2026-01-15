window.StyleManager = {
    styles: [],
    selectedStyles: new Set(), // Track which styles are active
    fs: window.Capacitor ? window.Capacitor.Plugins.Filesystem : null,
    DIR: 'Resolver/styles',
    FILE: 'Resolver/styles/styles.csv',
    editingOldName: null,

    init: async function() {
        // 1. Instant recovery from LocalStorage so UI isn't empty on boot
        const cache = localStorage.getItem('resolver_styles_fallback');
        if (cache) {
            try {
                this.styles = JSON.parse(cache);
            } catch(e) { console.error("Cache parse failed", e); }
        }

        // 2. Initialize Filesystem and try to load the physical CSV
        if (this.fs) {
            try { 
                await this.fs.mkdir({ path: this.DIR, directory: 'DOCUMENTS', recursive: true }); 
                await this.loadLocalCSV();
            } catch(e) { console.log("FS init skipped"); }
        }
    },

    open: function() {
        document.getElementById('styleModal').classList.remove('hidden');
        this.render();
    },

    // --- SYNC & FILESYSTEM ---
    syncWithServer: async function() {
        const host = typeof buildWebUIUrl === 'function' ? buildWebUIUrl() : "";
        
        // Guard against uninitialized network config
        if (!host || host.includes('undefined') || host.length < 5) {
            return alert("Connection not ready. Please wait 2 seconds or check CFG.");
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); 

            const res = await fetch(`${host}/sdapi/v1/prompt-styles`, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            const serverData = await res.json();
            
            serverData.forEach(ss => {
                if (!this.styles.find(ls => ls.name === ss.name)) {
                    this.styles.push({ 
                        name: ss.name, 
                        prompt: ss.prompt || ss.value || "", 
                        negative_prompt: ss.negative_prompt || "" 
                    });
                }
            });

            await this.writeToDisk();
            this.render();
            alert("Sync Successful: " + serverData.length + " styles loaded.");
        } catch (e) { 
            console.error("Style Sync Error:", e);
            alert("Connection failed. Ensure WebUI is running with --api and your network is stable."); 
        }
    },

    loadLocalCSV: async function() {
        if (!this.fs) return;
        try {
            const ret = await this.fs.readFile({ 
                path: this.FILE, 
                directory: 'DOCUMENTS', 
                encoding: 'utf8' 
            });
            if (!ret.data) return;
            
            const lines = ret.data.split('\n');
            const parsed = lines.slice(1).filter(l => l.trim()).map(line => {
                const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                return {
                    name: parts[0]?.replace(/^"|"$/g, '').trim(),
                    prompt: parts[1]?.replace(/^"|"$/g, '').trim(),
                    negative_prompt: parts[2]?.replace(/^"|"$/g, '').trim()
                };
            });
            
            if (parsed.length > 0) this.styles = parsed;
        } catch (e) {
            console.log("No local file found, using cache.");
        }
    },

    writeToDisk: async function() {
        // 1. Immediate save to LocalStorage (Reliable on restart)
        localStorage.setItem('resolver_styles_fallback', JSON.stringify(this.styles));

        // 2. Generate CSV for Filesystem
        let csv = "name,prompt,negative_prompt\n";
        this.styles.forEach(s => {
            csv += `"${s.name}","${(s.prompt || '').replace(/"/g, '""')}","${(s.negative_prompt || '').replace(/"/g, '""')}"\n`;
        });

        // 3. Save to physical storage
        if (this.fs) {
            try {
                await this.fs.writeFile({ 
                    path: this.FILE, 
                    data: csv, 
                    directory: 'DOCUMENTS', 
                    encoding: 'utf8',
                    recursive: true
                });
            } catch(e) { console.error("FS Write failed", e); }
        }
    },

    // --- UI RENDERING ---
    render: function() {
        const container = document.getElementById('styleList');
        const query = document.getElementById('styleSearch').value.toLowerCase();
        container.innerHTML = '';

        this.styles.filter(s => s.name.toLowerCase().includes(query)).forEach(style => {
            const isActive = this.selectedStyles.has(style.name);
            const div = document.createElement('div');
            div.className = `glass-box style-card ${isActive ? 'selected-glow' : ''}`;
            div.style.cssText = `margin-bottom:10px; padding:12px; transition: 0.3s; border: 1px solid ${isActive ? '#ffd700' : 'var(--border-color)'}; box-shadow: ${isActive ? '0 0 15px rgba(255, 215, 0, 0.3)' : 'none'};`;
            
            div.innerHTML = `
                <div class="row" style="justify-content:space-between; align-items:center;">
                    <div style="flex:1; cursor:pointer;" onclick="window.StyleManager.toggleSelection('${style.name}')">
                        <div style="font-weight:900; color:${isActive ? '#ffd700' : 'var(--accent-primary)'}; font-size:12px;">${style.name.toUpperCase()} ${isActive ? '★' : ''}</div>
                        <div style="font-size:10px; color:var(--text-muted); display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;">
                            ${style.prompt || '...'}
                        </div>
                    </div>
                    <div class="row" style="width:auto; gap:10px;">
                        <button onclick="event.stopPropagation(); window.StyleManager.openEditor('${style.name}')" style="background:none; border:none; color:var(--text-muted); padding:4px;">
                            <i data-lucide="edit-2" size="14"></i>
                        </button>
                        <button onclick="event.stopPropagation(); window.StyleManager.deleteStyle('${style.name}')" style="background:none; border:none; color:#ff4444; padding:4px;">
                            <i data-lucide="trash-2" size="14"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
        if (window.lucide) lucide.createIcons();
    },

    // --- TOGGLE & INJECT ---
    toggleSelection: function(name) {
        if (this.selectedStyles.has(name)) {
            this.selectedStyles.delete(name);
        } else {
            this.selectedStyles.add(name);
        }
        this.render();
        this.updateGenTabs();
    },

    updateGenTabs: function() {
        const mode = typeof currentMode !== 'undefined' ? currentMode : 'xl';
        const pEl = document.getElementById(`${mode}_prompt`);
        const nEl = document.getElementById(`${mode}_neg`);
        
        let finalP = pEl.value;
        let finalN = nEl ? nEl.value : "";

        this.selectedStyles.forEach(name => {
            const s = this.styles.find(x => x.name === name);
            if (s) {
                if (s.prompt && !finalP.includes(s.prompt)) finalP += ", " + s.prompt;
                if (s.negative_prompt && nEl && !finalN.includes(s.negative_prompt)) finalN += ", " + s.negative_prompt;
            }
        });

        pEl.value = finalP.replace(/^, /, "").trim();
        if (nEl) nEl.value = finalN.replace(/^, /, "").trim();
        if (typeof savePrompt === 'function') savePrompt(mode);
    },

    // --- EDITOR ---
    openCreatePopup: function() {
        this.editingOldName = null;
        document.getElementById('styleEditorModal').classList.remove('hidden');
        document.getElementById('styleEditorTitle').innerText = "NEW STYLE";
        document.getElementById('styleEditName').value = "";
        document.getElementById('styleEditPrompt').value = "";
        document.getElementById('styleEditNeg').value = "";
    },

    openEditor: function(name) {
        const style = this.styles.find(s => s.name === name);
        this.editingOldName = name;
        document.getElementById('styleEditorModal').classList.remove('hidden');
        document.getElementById('styleEditorTitle').innerText = "EDIT STYLE";
        document.getElementById('styleEditName').value = style.name;
        document.getElementById('styleEditPrompt').value = style.prompt || "";
        document.getElementById('styleEditNeg').value = style.negative_prompt || "";
    },

    copyFromTab: function() {
        const mode = typeof currentMode !== 'undefined' ? currentMode : 'xl';
        document.getElementById('styleEditPrompt').value = document.getElementById(`${mode}_prompt`).value;
        const neg = document.getElementById(`${mode}_neg`);
        if(neg) document.getElementById('styleEditNeg').value = neg.value;
    },

    saveStyle: async function() {
        const newName = document.getElementById('styleEditName').value.trim();
        const prompt = document.getElementById('styleEditPrompt').value.trim();
        const neg = document.getElementById('styleEditNeg').value.trim();

        if (!newName) return alert("Name required");

        if (this.editingOldName) {
            const idx = this.styles.findIndex(s => s.name === this.editingOldName);
            this.styles[idx] = { name: newName, prompt, negative_prompt: neg };
        } else {
            this.styles.push({ name: newName, prompt, negative_prompt: neg });
        }

        await this.writeToDisk();
        this.render();
        document.getElementById('styleEditorModal').classList.add('hidden');
    },

    deleteStyle: async function(name) {
        if (!confirm("Delete style?")) return;
        this.styles = this.styles.filter(s => s.name !== name);
        this.selectedStyles.delete(name);
        await this.writeToDisk();
        this.render();
    }
};

window.addEventListener('load', () => window.StyleManager.init());