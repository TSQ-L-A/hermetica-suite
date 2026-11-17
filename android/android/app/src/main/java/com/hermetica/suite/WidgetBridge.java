package com.hermetica.suite;

import android.content.Context;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Ponte JS → nativo: os apps web informam a cidade escolhida para os widgets. */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridge extends Plugin {

    @PluginMethod
    public void setLocation(PluginCall call) {
        Double lat = call.getDouble("lat"), lon = call.getDouble("lon");
        if (lat == null || lon == null) { call.reject("lat/lon obrigatórios"); return; }
        Context ctx = getContext();
        ctx.getSharedPreferences(AstraWidget.PREFS, Context.MODE_PRIVATE).edit()
            .putFloat("lat", lat.floatValue())
            .putFloat("lon", lon.floatValue())
            .putString("name", call.getString("name", ""))
            .apply();
        AstraWidget.atualizarTodos(ctx);
        call.resolve();
    }

    @PluginMethod
    public void setHorasLocation(PluginCall call) {
        Double lat = call.getDouble("lat"), lon = call.getDouble("lon");
        if (lat == null || lon == null) { call.reject("lat/lon obrigatórios"); return; }
        Context ctx = getContext();
        ctx.getSharedPreferences(HorasWidget.PREFS, Context.MODE_PRIVATE).edit()
            .putFloat("lat", lat.floatValue())
            .putFloat("lon", lon.floatValue())
            .putString("name", call.getString("name", ""))
            .apply();
        HorasWidget.atualizarTodos(ctx);
        call.resolve();
    }

    @PluginMethod
    public void setShemLocation(PluginCall call) {
        Double lat = call.getDouble("lat"), lon = call.getDouble("lon");
        if (lat == null || lon == null) { call.reject("lat/lon obrigatórios"); return; }
        Context ctx = getContext();
        ctx.getSharedPreferences(ShemWidget.PREFS, Context.MODE_PRIVATE).edit()
            .putFloat("lat", lat.floatValue())
            .putFloat("lon", lon.floatValue())
            .putString("name", call.getString("name", ""))
            .apply();
        ShemWidget.atualizarTodos(ctx);
        call.resolve();
    }

    @PluginMethod
    public void setTattvaLocation(PluginCall call) {
        Double lat = call.getDouble("lat"), lon = call.getDouble("lon");
        if (lat == null || lon == null) { call.reject("lat/lon obrigatórios"); return; }
        Context ctx = getContext();
        ctx.getSharedPreferences(TattvaWidget.PREFS, Context.MODE_PRIVATE).edit()
            .putFloat("lat", lat.floatValue())
            .putFloat("lon", lon.floatValue())
            .putString("name", call.getString("name", ""))
            .apply();
        TattvaWidget.atualizarTodos(ctx);
        call.resolve();
    }
}
