// -----------------------------------------------------------
// CONFIGURATION & SETTINGS PAGE LOGIC
// -----------------------------------------------------------

// Load configuration from localStorage
function loadConnectionConfig() {
    const saved = localStorage.getItem('bojroConnectionConfig');
    if (saved) {
        connectionConfig = { ...connectionConfig, ...JSON.parse(saved) };
    }
    
    // Update UI fields
    const elBase = document.getElementById('cfgBaseIp');
    if (elBase) elBase.value = connectionConfig.baseIp || '';
    
    const elWeb = document.getElementById('cfgPortWebUI');
    if (elWeb) elWeb.value = connectionConfig.portWebUI || 7860;
    
    const elLlm = document.getElementById('cfgPortLlm');
    if (elLlm) elLlm.value = connectionConfig.portLlm || 1234;
    
    const elWake = document.getElementById('cfgPortWake');
    if (elWake) elWake.value = connectionConfig.portWake || 5000;
    
    // Update protocol selection
    const protocol = connectionConfig.protocol || 'http';
    if (protocol === 'https') {
        const rHttps = document.getElementById('httpsProtocol');
        if (rHttps) rHttps.checked = true;
    } else {
        const rHttp = document.getElementById('httpProtocol');
        if (rHttp) rHttp.checked = true;
    }
}

// Save configuration to localStorage
function saveConnectionConfig() {
    localStorage.setItem('bojroConnectionConfig', JSON.stringify(connectionConfig));
}

// Build full URLs from base IP and ports
function buildWebUIUrl() {
    if (!connectionConfig.baseIp) return '';
    
    let url = connectionConfig.baseIp;
    // Only add port if it's specified and not already in URL
    if (connectionConfig.portWebUI && connectionConfig.portWebUI !== null && !url.includes(':')) {
        url += `:${connectionConfig.portWebUI}`;
    }
    // Add protocol from user selection
    const protocol = connectionConfig.protocol || 'http';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `${protocol}://${url}`;
    }
    return url;
}

function buildLlmUrl() {
    if (!connectionConfig.baseIp) return '';
    
    let url = connectionConfig.baseIp;
    // Only add port if it's specified and not already in URL
    if (connectionConfig.portLlm && connectionConfig.portLlm !== null && !url.includes(':')) {
        url += `:${connectionConfig.portLlm}`;
    }
    // Add protocol from user selection
    const protocol = connectionConfig.protocol || 'http';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `${protocol}://${url}`;
    }
    return url;
}

function buildWakeUrl() {
    if (!connectionConfig.baseIp) return '';
    
    let url = connectionConfig.baseIp;
    // Only add port if it's specified and not already in URL
    if (connectionConfig.portWake && connectionConfig.portWake !== null && !url.includes(':')) {
        url += `:${connectionConfig.portWake}`;
    }
    // Add protocol from user selection
    const protocol = connectionConfig.protocol || 'http';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `${protocol}://${url}`;
    }
    return url;
}

// Update connection status display
function updateConnectionStatus(service, status) {
    connectionState[service] = status;
    
    // Update UI elements based on service
    if (service === 'webui') {
        const btn = document.getElementById('webuiLinkBtn');
        const dot = document.getElementById('webuiStatusDot');
        const statusText = document.getElementById('connectionStatus');
        
        if (!btn || !dot || !statusText) return;
        
        // Remove all state classes
        btn.classList.remove('connecting', 'connected', 'disconnected');
        dot.classList.remove('connecting', 'connected', 'disconnected');
        
        if (status === 'connecting') {
            btn.classList.add('connecting');
            btn.innerText = 'LINKING...';
            dot.classList.add('connecting');
            statusText.innerText = 'Connecting...';
            statusText.style.color = 'var(--accent-primary)';
        } else if (status === 'connected') {
            btn.classList.add('connected');
            btn.innerText = 'CONNECTED';
            dot.classList.add('connected');
            statusText.innerText = `Connected to ${connectionConfig.baseIp}:${connectionConfig.portWebUI}`;
            statusText.style.color = 'var(--success)';
        } else {
            btn.classList.add('disconnected');
            btn.innerText = 'LINK';
            dot.classList.add('disconnected');
            statusText.innerText = 'Not Connected';
            statusText.style.color = 'var(--text-muted)';
        }
    }
    
    if (service === 'llm') {
        const btn = document.getElementById('llmLinkBtn');
        const dot = document.getElementById('llmStatusDot');
        
        if (!btn || !dot) return;
        
        // Remove all state classes
        btn.classList.remove('connecting', 'connected', 'disconnected');
        dot.classList.remove('connecting', 'connected', 'disconnected');
        
        if (status === 'connecting') {
            btn.classList.add('connecting');
            btn.innerText = 'LINKING...';
            dot.classList.add('connecting');
        } else if (status === 'connected') {
            btn.classList.add('connected');
            btn.innerText = 'CONNECTED';
            dot.classList.add('connected');
        } else {
            btn.classList.add('disconnected');
            btn.innerText = 'LINK';
            dot.classList.add('disconnected');
        }
    }
}

// Settings page functions
window.saveConfiguration = function() {
    const baseIp = document.getElementById('cfgBaseIp').value.trim();
    const protocol = document.querySelector('input[name="protocol"]:checked').value;
    const portWebUI = document.getElementById('cfgPortWebUI').value ? parseInt(document.getElementById('cfgPortWebUI').value) : '';
    const portLlm = document.getElementById('cfgPortLlm').value ? parseInt(document.getElementById('cfgPortLlm').value) : '';
    const portWake = document.getElementById('cfgPortWake').value ? parseInt(document.getElementById('cfgPortWake').value) : '';
    
    // Validation
    if (!baseIp) {
        alert('Please enter a PC IP address');
        return;
    }
    
    if (portWebUI && (isNaN(portWebUI) || portWebUI < 1 || portWebUI > 65535)) {
        alert('Please enter a valid WebUI port (1-65535)');
        return;
    }
    
    if (portLlm && (isNaN(portLlm) || portLlm < 1 || portLlm > 65535)) {
        alert('Please enter a valid LLM port (1-65535)');
        return;
    }
    
    if (portWake && (isNaN(portWake) || portWake < 1 || portWake > 65535)) {
        alert('Please enter a valid Wake port (1-65535)');
        return;
    }
    
    // Save configuration
    connectionConfig.baseIp = baseIp;
    connectionConfig.protocol = protocol; // Save protocol selection
    connectionConfig.portWebUI = portWebUI !== '' ? portWebUI : null; 
    connectionConfig.portLlm = portLlm !== '' ? portLlm : null;    
    connectionConfig.portWake = portWake !== '' ? portWake : null; 
    connectionConfig.isConfigured = true;
    
    saveConnectionConfig();
    
    // Update global HOST variable for backward compatibility
    HOST = buildWebUIUrl();
    
    // Update legacy localStorage keys for backward compatibility
    localStorage.setItem('bojroHostIp', HOST);
    localStorage.setItem('bojro_power_ip', buildWakeUrl());
    
    if (Toast) Toast.show({
        text: 'Configuration Saved Successfully',
        duration: 'short'
    });
    
    // Switch to GEN tab
    switchTab('gen');
}

window.resetAppConfig = function() {
    if (confirm('Reset all app configuration? This will clear all saved settings and return to the first-time setup.')) {
        // Clear connection config
        localStorage.removeItem('bojroConnectionConfig');
        
        // Clear legacy keys
        localStorage.removeItem('bojroHostIp');
        localStorage.removeItem('bojro_power_ip');
        localStorage.removeItem('bojroLlmConfig');
        localStorage.removeItem('bojroBatteryOpt');
        
        // Reset global variables
        connectionConfig = {
            baseIp: "",
            portWebUI: 7860,
            portLlm: 1234,
            portWake: 5000,
            isConfigured: false
        };
        
        HOST = "";
        
        // Reset UI
        loadConnectionConfig();
        
        // Switch to CFG tab
        switchTab('cfg');
        
        if (Toast) Toast.show({
            text: 'Configuration Reset',
            duration: 'short'
        });
    }
}

// Test connection functions
window.connectToWebUI = async function() {
    if (!connectionConfig.baseIp) {
        alert('Please configure your connection settings first');
        switchTab('cfg');
        return;
    }
    
    // FIX (Issue 2): Trigger Notification Permission Request IMMEDIATELY upon interaction
    if (LocalNotifications) {
        try {
            const perm = await LocalNotifications.requestPermissions();
            if (perm.display === 'granted') await createNotificationChannel();
            console.log("Permissions requested via LINK button");
        } catch (e) {
            console.warn("Notification permission error:", e);
        }
    }
    
    const btn = document.getElementById('webuiLinkBtn');
    
    updateConnectionStatus('webui', 'connecting');
    
    try {
        const url = buildWebUIUrl();
        const res = await fetch(`${url}/sdapi/v1/sd-models`, {
            headers: getHeaders()
        });
        
        if (!res.ok) throw new Error("Status " + res.status);
        
        // Update global HOST for backward compatibility
        HOST = url;
        localStorage.setItem('bojroHostIp', HOST);
        
        // Enable generation button
        document.getElementById('genBtn').disabled = false;
        
        // Fetch models, samplers, VAEs
        await Promise.all([fetchModels(), fetchSamplers(), fetchVaes()]);
        
        updateConnectionStatus('webui', 'connected');
        
        if (Toast) Toast.show({
            text: 'WebUI Linked Successfully',
            duration: 'short'
        });
    } catch (e) {
        updateConnectionStatus('webui', 'disconnected');
        alert("Failed to connect: " + e.message);
    }
}

window.connectToLlmService = async function() {
    if (!connectionConfig.baseIp) {
        alert('Please configure your connection settings first');
        switchTab('cfg');
        return;
    }
    
    const btn = document.getElementById('llmLinkBtn');
    
    updateConnectionStatus('llm', 'connecting');
    
    try {
        const url = buildLlmUrl();
        
        if (!CapacitorHttp) {
            throw new Error("Native HTTP Plugin not loaded!");
        }
        
        const response = await CapacitorHttp.get({
            url: `${url}/v1/models`,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status >= 400) throw new Error(`HTTP ${response.status}`);
        
        const data = response.data;
        if (data.data && Array.isArray(data.data)) {
            const select = document.getElementById('llmModelSelect');
            select.innerHTML = "";
            data.data.forEach(m => {
                select.appendChild(new Option(m.id, m.id));
            });
            
            // Update LLM settings for backward compatibility
            llmSettings.baseUrl = url;
            // Manually save settings without depending on legacy DOM elements
            localStorage.setItem('bojroLlmConfig', JSON.stringify(llmSettings));
            
            updateConnectionStatus('llm', 'connected');
            
            if (Toast) Toast.show({
                text: `Found ${data.data.length} models`,
                duration: 'short'
            });
        } else {
            throw new Error("Invalid model format");
        }
    } catch (e) {
        updateConnectionStatus('llm', 'disconnected');
        alert("Link Error: " + (e.message || JSON.stringify(e)));
    }
}

// Initialize protocol property if not exists
if (!connectionConfig.protocol) {
    connectionConfig.protocol = 'http'; // Default to HTTP
}

// Enhanced wake signal using centralized config
window.sendPowerSignal = async function() {
    if (!connectionConfig.baseIp) {
        alert('Please configure your connection settings first');
        switchTab('cfg');
        return;
    }
    
    const btn = document.getElementById('power-btn-mini');
    const serverUrl = buildWakeUrl();
    
    if (!serverUrl) {
        alert("Invalid wake server configuration");
        return;
    }
    
    // Visual Feedback
    btn.classList.add('active');
    if (Toast) Toast.show({
        text: 'Sending Wake Signal...',
        duration: 'short'
    });
    
    try {
        // STANDARD FETCH
        await fetch(serverUrl, {
            method: 'POST'
        });
        
        if (Toast) Toast.show({
            text: 'Signal Sent! Starting Services...',
            duration: 'long'
        });
        
        setTimeout(() => {
            btn.classList.remove('active');
        }, 3000);
        
    } catch (error) {
        console.error(error);
        if (Toast) Toast.show({
            text: 'Signal Sent (Or Check Connection)',
            duration: 'short'
        });
        btn.classList.remove('active');
    }
}

// Initialize configuration on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load configuration if CFG elements exist
    if (document.getElementById('cfgBaseIp')) {
        loadConnectionConfig();
    }
    
    // Initialize connection status displays
    updateConnectionStatus('webui', 'disconnected');
    updateConnectionStatus('llm', 'disconnected');
});

// Add CFG tab support to switchTab function
const originalSwitchTab = window.switchTab;
window.switchTab = function(view) {
    // Call original function first
    if (originalSwitchTab) {
        originalSwitchTab(view);
    }
    
    // Handle CFG tab specifically
    if (view === 'cfg') {
        const items = document.querySelectorAll('.dock-item');
        items.forEach(item => item.classList.remove('active'));
        items[5].classList.add('active'); // 6th item (0-indexed)
        
        // Load configuration into UI
        loadConnectionConfig();
    }
};