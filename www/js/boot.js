// -----------------------------------------------------------
// APPLICATION ENTRY POINT
// -----------------------------------------------------------

window.onload = function() {
    try {
        console.log("Booting Resolver...");

        // 1. Initialize Icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // FIX (Issue 1): Battery Optimization Check MOVED UP
        // Performed early to ensure it appears regardless of loading errors elsewhere
        if (!localStorage.getItem('bojroBatteryOpt')) {
            const batteryModal = document.getElementById('batteryModal');
            if (batteryModal) {
                batteryModal.classList.remove('hidden');
                console.log("Battery Modal Triggered");
            }
        }

        // 2. Initialize Database
        // (Defined in utils.js)
        if (typeof initDatabase === 'function') {
            initDatabase();
        }

        // 3. Load Centralized Configuration First
        loadConnectionConfig();    // cfg.js
        
        // 4. First-Run Configuration Check
        if (!connectionConfig.isConfigured) {
            console.log("First run detected - showing configuration");
            // Force CFG tab on first run
            setTimeout(() => {
                switchTab('cfg');
                if (Toast) Toast.show({
                    text: 'Welcome! Please configure your connection settings',
                    duration: 'long',
                    position: 'center'
                });
            }, 500);
        }
        
        // 5. Load Saved Settings & State
        injectConfigModal();       // ui.js
        loadHostIp();              // network.js (now uses centralized config)
        loadQueueState();          // utils.js
        renderQueueAll();          // engine.js
        loadAutoDlState();         // ui.js
        loadLlmSettings();         // ui.js
        loadPowerSettings();       // ui.js
        loadSavedPrompts();        // ui.js - RESTORE PROMPTS

        // 6. Setup Background & Notifications
        setupBackgroundListeners(); // utils.js
        createNotificationChannel();// utils.js

        // 7. Initialize Graphics Engine
        initMainCanvas();          // editor.js
        setupEditorEvents();       // editor.js
        
        // 8. Request Capacitor Notification Access (Android) - System Check
        if (LocalNotifications) {
            LocalNotifications.checkPermissions().then(perm => {
                console.log("Notification Perm Status:", perm.display);
            });
        }
        
        // 9. Acquire Wake Lock (Prevent screen sleep during generation)
        if ("wakeLock" in navigator) {
            navigator.wakeLock.request('screen').then(wakeLock => {
                console.log("Wake lock acquired");
                globalWakeLock = wakeLock;
            }).catch(error => {
                console.log("Wake lock not available:", error);
            });
        } else {
            console.log("Wake Lock API not supported");
        }
        
        // 10. Acquire WiFi Lock (Prevent WiFi disconnect during generation)
        if ('connection' in navigator && 'saveData' in navigator.connection) {
            try {
                navigator.connection.saveData = false; // Request high power mode
                console.log("WiFi lock enabled - high power mode");
            } catch (error) {
                console.log("WiFi lock not available:", error);
            }
        } else {
            console.log("WiFi Lock API not supported");
        }
        
        // 11. Release locks when app becomes visible again
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && globalWakeLock) {
                console.log("Releasing wake lock - app visible");
                globalWakeLock.release();
                globalWakeLock = null;
            }
        });

        // 12. Auto-Connect if configuration is complete
        if (connectionConfig.isConfigured && connectionConfig.baseIp) {
            console.log("Auto-connecting with centralized config...");
            window.connect(true); // network.js (now uses centralized config)
        } else if (document.getElementById('hostIp') && document.getElementById('hostIp').value) {
            // Fallback to legacy auto-connect
            console.log("Auto-connecting with legacy config...");
            window.connect(true); // network.js
        }

        // =========================================================================
        // NEO BRIDGE: CONNECTS LORA.JS TO APP.JS
        // Allows the external LoraManager to inject prompts into the active UI
        // =========================================================================
        if (!window.Neo) window.Neo = {};
        
        window.Neo.appInjectConfig = async function(alias, name, textArea) {
            // 1. Get path from the LoraManager (if available)
            const loraEntry = window.LoraManager && window.LoraManager.allLoras 
                ? window.LoraManager.allLoras.find(l => l.name === name) 
                : null;

            let config = loraConfigs[name];

            // 2. Fetch Config if missing, using the helper
            if (!config && loraEntry && loraEntry.path) {
                if (Toast) Toast.show({
                    text: 'Fetching config...',
                    duration: 'short'
                });
                config = await loadSidecarConfig(name, loraEntry.path);
            }

            // 3. Build Tag
            const weight = config ? config.weight : 1.0;
            const trigger = config && config.trigger ? ` ${config.trigger}` : "";
            const tag = ` <lora:${alias}:${weight}>${trigger}`;

            // 4. Inject into Text Area
            if (!textArea.value.includes(`<lora:${alias}:`)) {
                textArea.value = textArea.value.trim() + tag;
                if (Toast) Toast.show({
                    text: `Added ${alias}`,
                    duration: 'short'
                });
            } else {
                if (Toast) Toast.show({
                    text: `Already added`,
                    duration: 'short'
                });
            }

            document.getElementById('loraModal').classList.add('hidden');
        };

        console.log("App Initialized Successfully");
    } catch (e) {
        console.error("Initialization Error:", e);
        alert("App Init Failed: " + e.message);
    }
}