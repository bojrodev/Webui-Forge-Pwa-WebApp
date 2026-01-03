// www/js/updater.js

// 1. Notify native layer that the app is ready
if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorUpdater) {
    window.Capacitor.Plugins.CapacitorUpdater.notifyAppReady();
}

/**
 * Checks for updates and triggers the Custom UI.
 * @param {boolean} silent - If true, suppresses "Checking..." and "No updates" toasts.
 */
async function checkForAppUpdate(silent = false) {
    const Updater = window.Capacitor && window.Capacitor.Plugins ? window.Capacitor.Plugins.CapacitorUpdater : null;

    if (!Updater) {
        if (!silent) console.warn("Updater plugin missing (Web Mode?)");
        return;
    }

    try {
        if (!silent && typeof Toast !== 'undefined') {
            Toast.show({text: 'Checking for updates...', duration: 'short'});
        }

        // --- CONFIGURATION ---
        // Pointing to 'dev' branch
        const UPDATE_URL = 'https://raw.githubusercontent.com/bojrodev/Resolver-Stable-Diffusion-Client-for-android/dev/version.json';
        const currentVersion = '1.5'; // <--- CHANGE THIS BEFORE RELEASING NEW VERSION
        // ---------------------

        // Fetch version info (with timestamp to bust cache)
        const response = await fetch(UPDATE_URL + '?t=' + new Date().getTime());
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
        
        const remoteData = await response.json();

        if (isNewer(currentVersion, remoteData.version)) {
            // Found update! Show the Custom Modal
            showUpdateModal(remoteData, Updater);
        } else {
             if (!silent && typeof Toast !== 'undefined') {
                 Toast.show({text: 'You are up to date (v' + currentVersion + ')', duration: 'short'});
             }
        }

    } catch (error) {
        console.error(error);
        if (!silent && typeof Toast !== 'undefined') {
            Toast.show({text: 'Update check failed', duration: 'short'});
        }
    }
}

/**
 * Displays the custom HTML modal instead of native confirm()
 */
function showUpdateModal(data, UpdaterPlugin) {
    const modal = document.getElementById('updateModal');
    const badge = document.getElementById('updateVersionBadge');
    const notes = document.getElementById('updateNotes');
    const btn = document.getElementById('btnDoUpdate');

    if (!modal || !btn) {
        console.error("Update Modal DOM elements missing!");
        return;
    }

    // Populate Data
    if (badge) badge.innerText = `v${data.version}`;
    if (notes) notes.innerText = data.note || "New features and improvements.";

    // Set up the Install Button
    btn.onclick = async () => {
        // 1. Change button state to "Downloading..."
        btn.disabled = true;
        btn.innerHTML = `<div class="spinner" style="width:16px;height:16px;border-width:2px;margin-right:8px;"></div> DOWNLOADING...`;
        
        try {
            // 2. Start Download
            const update = await UpdaterPlugin.download({
                url: data.url,
                version: data.version
            });
            
            // 3. Apply & Restart
            btn.innerHTML = `RESTARTING...`;
            await UpdaterPlugin.set(update);
            
        } catch (e) {
            console.error(e);
            alert("Download Failed: " + e.message);
            btn.disabled = false;
            btn.innerHTML = `<i data-lucide="download-cloud"></i> RETRY`;
            lucide.createIcons(); // Re-render icon
        }
    };

    // Show the modal
    modal.classList.remove('hidden');
    
    // Refresh icons inside the modal (since it was hidden)
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function isNewer(current, remote) {
    const c = current.split('.').map(Number);
    const r = remote.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        const rVal = r[i] || 0;
        const cVal = c[i] || 0;
        if (rVal > cVal) return true;
        if (rVal < cVal) return false;
    }
    return false;
}