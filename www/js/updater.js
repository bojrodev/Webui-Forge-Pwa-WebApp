// www/js/updater.js

// 1. Notify native layer that the app is ready
if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorUpdater) {
    window.Capacitor.Plugins.CapacitorUpdater.notifyAppReady();
}

async function checkForAppUpdate() {
    const Updater = window.Capacitor && window.Capacitor.Plugins ? window.Capacitor.Plugins.CapacitorUpdater : null;

    if (!Updater) {
        console.warn("CapacitorUpdater plugin missing (Web Mode?)");
        return;
    }

    try {
        if (typeof Toast !== 'undefined') Toast.show({text: 'Checking for updates...', duration: 'short'});

        // Pointing to 'dev' branch
        const UPDATE_URL = 'https://raw.githubusercontent.com/bojrodev/Resolver-Stable-Diffusion-Client-for-android/dev/version.json';
        
        // Add time parameter to bypass cache
        const response = await fetch(UPDATE_URL + '?t=' + new Date().getTime());
        
        if (!response.ok) {
            throw new Error(`Fetch failed: ${response.status}`);
        }
        
        const remoteData = await response.json();
        
        // --- CRITICAL CHANGE: Set this to your version ---
        const currentVersion = '1.6'; 

        if (isNewer(currentVersion, remoteData.version)) {
            const doUpdate = confirm(
                `Update v${remoteData.version} Available!\n\n` +
                `Notes: ${remoteData.note}\n\n` +
                `Download and Restart?`
            );

            if (doUpdate) {
                if (typeof Toast !== 'undefined') {
                    Toast.show({text: 'Downloading update... App will restart.', duration: 'long'});
                }
                
                const update = await Updater.download({
                    url: remoteData.url,
                    version: remoteData.version
                });
                
                await Updater.set(update);
            }
        } else {
             if (typeof Toast !== 'undefined') Toast.show({text: 'You are up to date (v' + currentVersion + ')', duration: 'short'});
        }

    } catch (error) {
        console.error(error);
        if (typeof Toast !== 'undefined') Toast.show({text: 'Update check failed', duration: 'short'});
    }
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