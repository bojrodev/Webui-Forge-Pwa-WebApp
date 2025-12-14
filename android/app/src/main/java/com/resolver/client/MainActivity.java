package com.resolver.client;

import android.os.Bundle;
import android.os.PowerManager;
import android.content.Context;
import android.net.wifi.WifiManager;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    private PowerManager.WakeLock wakeLock;
    private WifiManager.WifiLock wifiLock;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ResolverServicePlugin.class);
        super.onCreate(savedInstanceState);
        
        // 1. CPU WAKE LOCK (Keeps processor running)
        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (powerManager != null) {
            wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Resolver:CoreWakeLock");
            wakeLock.acquire(); 
        }

        // 2. WIFI LOCK (Keeps network active for large downloads in background)
        WifiManager wifiManager = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        if (wifiManager != null) {
            wifiLock = wifiManager.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "Resolver:NetworkLock");
            wifiLock.acquire();
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        // Optimize WebView for background execution
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebSettings settings = this.bridge.getWebView().getSettings();
            // Allow JS to open windows automatically if needed (rare but good for auth)
            settings.setJavaScriptCanOpenWindowsAutomatically(true);
            // Disable caching to prevent stale 'progress' API reads
            settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // CRITICAL: Force JS timers to continue running when backgrounded
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().resumeTimers();
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        // Release locks only when app is fully killed
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        if (wifiLock != null && wifiLock.isHeld()) {
            wifiLock.release();
        }
    }
}