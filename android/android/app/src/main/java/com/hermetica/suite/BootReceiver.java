package com.hermetica.suite;

import android.appwidget.AppWidgetManager;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            AppWidgetManager manager = AppWidgetManager.getInstance(context);
            int[] ids = manager.getAppWidgetIds(new ComponentName(context, HorasWidget.class));
            if (ids != null && ids.length > 0) {
                HorasWidget.atualizar(context, manager, ids);
            }
            AstraWidget.atualizarTodos(context);
            ShemWidget.atualizarTodos(context);
            TattvaWidget.atualizarTodos(context);
        }
    }
}
