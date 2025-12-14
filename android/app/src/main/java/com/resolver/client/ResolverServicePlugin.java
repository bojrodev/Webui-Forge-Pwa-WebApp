package com.resolver.client;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.PowerManager;
import android.provider.Settings;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ResolverService")
public class ResolverServicePlugin extends Plugin {

    @PluginMethod()
    public void updateProgress(PluginCall call) {
        String title = call.getString("title", "Processing");
        String body = call.getString("body", "Preparing...");
        int progress = call.getInt("progress", 0);

        ResolverForegroundService.startOrUpdateService(getContext(), title, body, progress);
        call.resolve();
    }
    
    @PluginMethod()
    public void stop(PluginCall call) {
        ResolverForegroundService.stopService(getContext());
        call.resolve();
    }

    // --- NEW: Battery Optimization Request ---
    @PluginMethod()
    public void requestBatteryOpt(PluginCall call) {
        Context context = getContext();
        String packageName = context.getPackageName();
        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        
        if (pm != null && !pm.isIgnoringBatteryOptimizations(packageName)) {
            Intent intent = new Intent();
            intent.setAction(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            intent.setData(Uri.parse("package:" + packageName));
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        }
        call.resolve();
    }
}