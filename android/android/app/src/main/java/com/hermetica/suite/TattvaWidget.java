package com.hermetica.suite;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.os.Build;
import android.widget.RemoteViews;

import java.util.Calendar;

/**
 * Widget Tattvas — maré tattvica atual. Mesma regra de www/tattvas/tattvas.js:
 * a partir do nascer do sol, Akasha, Vayu, Tejas, Prithivi, Apas (24 min cada);
 * 5 sub-Tattvas de 4,8 min começando pelo próprio Tattva.
 */
public class TattvaWidget extends AppWidgetProvider {

    static final String ACTION_UPDATE = "com.hermetica.suite.WIDGET_TATTVA_UPDATE";
    static final String PREFS = "tattva_widget_prefs";
    static final double LAT_PADRAO = -23.55, LON_PADRAO = -46.63;

    static final String[] NOMES     = {"Akasha", "Vayu", "Tejas", "Prithivi", "Apas"};
    static final String[] ELEMENTOS = {"Espírito", "Ar", "Fogo", "Terra", "Água"};
    static final int[]    CORES     = {0xFF23213a, 0xFF2f6fd0, 0xFFcc2a1e, 0xFFe0b412, 0xFF9aa0ae};

    static final long MIN_TATTVA = 24 * 60_000L;
    static final long MIN_SUB    = MIN_TATTVA / 5;

    // ── Cálculo ──────────────────────────────────────────────────

    static class Info { int idx, sub; long inicio, fim, subInicio, subFim; }

    static long meiaNoite(long t, int deltaDias) {
        Calendar c = Calendar.getInstance(); c.setTimeInMillis(t);
        c.set(Calendar.HOUR_OF_DAY, 0); c.set(Calendar.MINUTE, 0); c.set(Calendar.SECOND, 0); c.set(Calendar.MILLISECOND, 0);
        c.add(Calendar.DAY_OF_MONTH, deltaDias);
        return c.getTimeInMillis();
    }

    static long nascer(long meiaNoiteMs, double lat, double lon) {
        double[] sp = HorasWidget.nascerPoente(lat, lon, meiaNoiteMs + 720 * 60_000L);
        return meiaNoiteMs + (long) (sp[0] * 60_000);
    }

    static Info calcular(long agora, double lat, double lon) {
        long hoje = meiaNoite(agora, 0);
        long ini = nascer(hoje, lat, lon), fimDia = nascer(meiaNoite(agora, 1), lat, lon);
        if (agora < ini) { fimDia = ini; ini = nascer(meiaNoite(agora, -1), lat, lon); }

        long k = (agora - ini) / MIN_TATTVA;
        Info i = new Info();
        i.idx = (int) (k % 5);
        i.inicio = ini + k * MIN_TATTVA;
        i.fim = Math.min(i.inicio + MIN_TATTVA, fimDia);
        long j = Math.min(4, (agora - i.inicio) / MIN_SUB);
        i.sub = (int) ((i.idx + j) % 5);
        i.subInicio = i.inicio + j * MIN_SUB;
        i.subFim = Math.min(i.subInicio + MIN_SUB, i.fim);
        return i;
    }

    static String fmt(long ms) {
        Calendar c = Calendar.getInstance(); c.setTimeInMillis(ms);
        return String.format("%02d:%02d", c.get(Calendar.HOUR_OF_DAY), c.get(Calendar.MINUTE));
    }

    // ── Símbolos ─────────────────────────────────────────────────

    static void forma(Canvas c, int i, float cx, float cy, float r) {
        Paint f = new Paint(Paint.ANTI_ALIAS_FLAG); f.setColor(CORES[i]); f.setStyle(Paint.Style.FILL);
        Paint b = new Paint(Paint.ANTI_ALIAS_FLAG); b.setColor(0x8C281e0a); b.setStyle(Paint.Style.STROKE); b.setStrokeWidth(Math.max(1f, r * 0.04f));
        switch (i) {
            case 0: { RectF o = new RectF(cx - r * 0.68f, cy - r, cx + r * 0.68f, cy + r); c.drawOval(o, f); c.drawOval(o, b); break; }
            case 1: c.drawCircle(cx, cy, r, f); c.drawCircle(cx, cy, r, b); break;
            case 2: {
                float h = r * 1.5f, base = h / (float) Math.sqrt(3);
                Path p = new Path();
                p.moveTo(cx, cy - h * 0.62f); p.lineTo(cx - base, cy + h * 0.38f); p.lineTo(cx + base, cy + h * 0.38f); p.close();
                c.drawPath(p, f); c.drawPath(p, b); break;
            }
            case 3: { RectF q = new RectF(cx - r * 0.85f, cy - r * 0.85f, cx + r * 0.85f, cy + r * 0.85f); c.drawRect(q, f); c.drawRect(q, b); break; }
            case 4: {
                // crescente com as pontas para cima: círculo menos outro círculo deslocado para cima
                Path fora = new Path(); fora.addCircle(cx, cy, r, Path.Direction.CW);
                Path dentro = new Path(); dentro.addCircle(cx, cy - r * 0.45f, r * 0.95f, Path.Direction.CW);
                fora.op(dentro, Path.Op.DIFFERENCE);
                c.drawPath(fora, f); c.drawPath(fora, b); break;
            }
        }
    }

    static void simbolo(Canvas c, int principal, int sub, float cx, float cy, float tam) {
        forma(c, principal, cx, cy, tam * 0.42f);
        if (sub >= 0 && sub != principal) forma(c, sub, cx, principal == 2 ? cy + tam * 0.08f : cy, tam * 0.16f);
    }

    static void caber(Paint p, String texto, float maxW) {
        float m = p.measureText(texto);
        if (m > maxW && m > 0) p.setTextSize(p.getTextSize() * maxW / m);
    }

    // ── Desenho (mesmo estilo dos widgets Horae e Shem) ──────────

    static Bitmap desenhar(int w, int h, Info info) {
        Bitmap bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(bmp);
        final int OURO = 0xFF8a6a1a, TINTA = 0xFF1a1820, CINZA = 0xFF555060, CLARO = 0xFF9a8a60;

        float radius = h * 0.07f, lineY = h * 0.28f, contentH = h - lineY, contentCY = lineY + contentH / 2f;
        float pad = h * 0.13f;
        float simW = contentH * 0.95f, simCX = pad + simW / 2f;
        float sep1X = pad + simW + pad * 0.6f, sep2X = w - h * 0.95f, proxCX = (sep2X + w) / 2f;
        float textX = sep1X + pad * 0.85f, textMaxW = sep2X - textX - pad * 0.5f;

        Paint bg = new Paint(Paint.ANTI_ALIAS_FLAG); bg.setColor(0xFFe4dece);
        c.drawRoundRect(new RectF(0, 0, w, h), radius, radius, bg);
        Paint top = new Paint(Paint.ANTI_ALIAS_FLAG); top.setColor(0x17c4a050);
        c.drawRoundRect(new RectF(0, 0, w, lineY), radius, radius, top);
        c.drawRect(0, lineY / 2f, w, lineY, top);
        Paint border = new Paint(Paint.ANTI_ALIAS_FLAG); border.setStyle(Paint.Style.STROKE); border.setColor(0x508a6a1a); border.setStrokeWidth(1.5f);
        c.drawRoundRect(new RectF(1, 1, w - 1, h - 1), radius, radius, border);

        Paint label = new Paint(Paint.ANTI_ALIAS_FLAG); label.setColor(OURO); label.setTextSize(h * 0.095f);
        label.setTypeface(Typeface.DEFAULT_BOLD); label.setLetterSpacing(0.12f);
        label.setTextAlign(Paint.Align.LEFT);   c.drawText("TATTVA ATUAL", textX, lineY * 0.72f, label);
        label.setTextAlign(Paint.Align.CENTER); c.drawText("PRÓXIMO", proxCX, lineY * 0.72f, label);

        Paint sep = new Paint(Paint.ANTI_ALIAS_FLAG); sep.setColor(0x508a6a1a); sep.setStrokeWidth(1f);
        c.drawLine(0, lineY, w, lineY, sep);
        c.drawLine(sep1X, lineY + 8, sep1X, h - 10, sep);
        c.drawLine(sep2X, lineY + 8, sep2X, h - 10, sep);

        simbolo(c, info.idx, info.sub, simCX, contentCY, simW * 0.92f);

        int save = c.save(); c.clipRect(textX, lineY, textX + textMaxW, h);
        Paint nome = new Paint(Paint.ANTI_ALIAS_FLAG); nome.setColor(TINTA); nome.setTextSize(h * 0.22f); nome.setTypeface(Typeface.DEFAULT_BOLD);
        caber(nome, NOMES[info.idx], textMaxW);
        c.drawText(NOMES[info.idx], textX, lineY + contentH * 0.36f, nome);
        float nomeW = nome.measureText(NOMES[info.idx] + "  ");
        Paint elem = new Paint(Paint.ANTI_ALIAS_FLAG); elem.setColor(CLARO); elem.setTextSize(h * 0.11f);
        String elemTxt = ELEMENTOS[info.idx] + " · " + fmt(info.inicio) + "–" + fmt(info.fim);
        if (nomeW + elem.measureText(elemTxt) <= textMaxW) c.drawText(elemTxt, textX + nomeW, lineY + contentH * 0.36f, elem);

        Paint sub = new Paint(Paint.ANTI_ALIAS_FLAG); sub.setColor(CINZA); sub.setTextSize(h * 0.135f);
        String subTxt = NOMES[info.sub] + " de " + NOMES[info.idx];
        caber(sub, subTxt, textMaxW);
        c.drawText(subTxt, textX, lineY + contentH * 0.64f, sub);

        Paint hora = new Paint(Paint.ANTI_ALIAS_FLAG); hora.setColor(CLARO); hora.setTextSize(h * 0.12f);
        String horaTxt = "sub-Tattva " + fmt(info.subInicio) + " – " + fmt(info.subFim);
        caber(hora, horaTxt, textMaxW);
        c.drawText(horaTxt, textX, lineY + contentH * 0.89f, hora);
        c.restoreToCount(save);

        int prox = (info.idx + 1) % 5;
        simbolo(c, prox, -1, proxCX, lineY + contentH * 0.40f, contentH * 0.5f);
        Paint pn = new Paint(Paint.ANTI_ALIAS_FLAG); pn.setColor(CINZA); pn.setTextSize(h * 0.12f); pn.setTextAlign(Paint.Align.CENTER);
        String proxTxt = NOMES[prox] + " " + fmt(info.fim);
        caber(pn, proxTxt, (w - sep2X) - pad);
        c.drawText(proxTxt, proxCX, lineY + contentH * 0.88f, pn);
        return bmp;
    }

    // ── Ciclo de vida ────────────────────────────────────────────

    static void atualizar(Context context, AppWidgetManager mgr, int[] ids) {
        long proxima = System.currentTimeMillis() + MIN_SUB;
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            double lat = prefs.getFloat("lat", (float) LAT_PADRAO);
            double lon = prefs.getFloat("lon", (float) LON_PADRAO);
            Info info = calcular(System.currentTimeMillis(), lat, lon);
            proxima = info.subFim;
            float density = context.getResources().getDisplayMetrics().density;
            for (int id : ids) {
                android.os.Bundle opts = mgr.getAppWidgetOptions(id);
                int wDp = opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH, 300);
                int hDp = opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 80);
                int wPx = Math.max((int) (wDp * density), 400), hPx = Math.max((int) (hDp * density), 100);
                hPx = Math.min(hPx, wPx / 3);   // mantém o formato de faixa
                RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_tattva);
                views.setImageViewBitmap(R.id.widget_image, desenhar(wPx, hPx, info));
                Intent intent = new Intent(context, MainActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                PendingIntent pi = PendingIntent.getActivity(context, 3, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                views.setOnClickPendingIntent(R.id.widget_image, pi);
                mgr.updateAppWidget(id, views);
            }
        } catch (Exception e) {
            android.util.Log.e("TattvaWidget", "falha ao atualizar", e);
        }
        agendarProxima(context, proxima);
    }

    static void atualizarTodos(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, TattvaWidget.class));
        if (ids != null && ids.length > 0) atualizar(ctx, mgr, ids);
    }

    // Troca de sub-Tattva a cada 4,8 min
    static void agendarProxima(Context context, long fimMs) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        long trigger = fimMs + 2000L;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms())
            am.setWindow(AlarmManager.RTC, trigger, 30_000L, getPendingIntent(context));
        else
            am.setExact(AlarmManager.RTC, trigger, getPendingIntent(context));
    }

    static PendingIntent getPendingIntent(Context context) {
        Intent i = new Intent(ACTION_UPDATE); i.setClass(context, TattvaWidget.class);
        return PendingIntent.getBroadcast(context, 1004, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    @Override public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) { atualizar(ctx, mgr, ids); }
    @Override public void onAppWidgetOptionsChanged(Context ctx, AppWidgetManager mgr, int id, android.os.Bundle opts) { atualizar(ctx, mgr, new int[]{id}); }
    @Override public void onEnabled(Context ctx) { atualizarTodos(ctx); }
    @Override public void onDisabled(Context ctx) {
        ((AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE)).cancel(getPendingIntent(ctx));
    }
    @Override public void onReceive(Context ctx, Intent intent) {
        super.onReceive(ctx, intent);
        if (ACTION_UPDATE.equals(intent.getAction())) atualizarTodos(ctx);
    }
}
