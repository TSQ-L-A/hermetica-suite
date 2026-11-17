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
import android.graphics.RectF;
import android.graphics.Typeface;
import android.os.Build;
import android.widget.RemoteViews;

import java.util.Calendar;

/**
 * Widget Shem HaMephorash — anjo do momento (quinário no Ascendente) e
 * anjo dos dias (quinário do Sol), atribuição da Golden Dawn a partir de 0° Leão.
 * Mesmos dados de www/shem/shem.js.
 */
public class ShemWidget extends AppWidgetProvider {

    static final String ACTION_UPDATE = "com.hermetica.suite.WIDGET_SHEM_UPDATE";
    static final String PREFS = "shem_widget_prefs";
    static final double LAT_PADRAO = -23.55, LON_PADRAO = -46.63;
    static final double INICIO_LEAO = 120;

    // {transliteração usual (11 e 17 desambiguados: Leviah / Lauiah), raiz, sufixo} — mesma ordem de ANJOS em shem.js
    static final String[][] ANJOS = {
        {"Vehuiah","והו","IH"},{"Yeliel","ילי","AL"},{"Sitael","סיט","AL"},{"Elemiah","עלמ","IH"},
        {"Mahasiah","מהש","IH"},{"Lelahel","ללה","AL"},{"Achaiah","אכא","IH"},{"Kahetel","כהת","AL"},
        {"Haziel","הזי","AL"},{"Aladiah","אלד","IH"},{"Leviah","לאו","IH"},{"Hahaiah","ההע","IH"},
        {"Yezalel","יזל","AL"},{"Mebahel","מבה","AL"},{"Hariel","הרי","AL"},{"Hakamiah","הקמ","IH"},
        {"Lauiah","לאו","IH"},{"Kaliel","כלי","AL"},{"Leuviah","לוו","IH"},{"Pahaliah","פהל","IH"},
        {"Nelchael","נלכ","AL"},{"Yeiayel","ייי","AL"},{"Melahel","מלה","AL"},{"Chahuiah","חהו","IH"},
        {"Nithaiah","נתה","IH"},{"Haaiah","האא","IH"},{"Yerathel","ירת","AL"},{"Seheiah","שאה","IH"},
        {"Reiyel","ריי","AL"},{"Omael","אומ","AL"},{"Lekabel","לכב","AL"},{"Vasariah","ושר","IH"},
        {"Yechuiah","יחו","IH"},{"Lehachiah","להח","IH"},{"Kevaqiah","כוק","IH"},{"Menadel","מנד","AL"},
        {"Aniel","אני","AL"},{"Chaamiah","חעמ","IH"},{"Rehael","רהע","AL"},{"Yeiazel","ייז","AL"},
        {"Hahahel","ההה","AL"},{"Mikael","מיכ","AL"},{"Veuliah","וול","IH"},{"Yelahiah","ילה","IH"},
        {"Sealiah","סאל","IH"},{"Ariel","ערי","AL"},{"Asaliah","עשל","IH"},{"Mihael","מיה","AL"},
        {"Vehuel","והו","AL"},{"Daniel","דני","AL"},{"Hachashiah","החש","IH"},{"Imamiah","עממ","IH"},
        {"Nanael","ננא","AL"},{"Nithael","נית","AL"},{"Mebahiah","מבה","IH"},{"Poiel","פוי","AL"},
        {"Nemamiah","נממ","IH"},{"Yeialel","ייל","AL"},{"Harahel","הרח","AL"},{"Mitzrael","מצר","AL"},
        {"Umabel","ומב","AL"},{"Iahhel","יהה","AL"},{"Anauel","ענו","AL"},{"Mehiel","מחי","AL"},
        {"Damabiah","דמב","IH"},{"Manakel","מנק","AL"},{"Eiael","איע","AL"},{"Chabuiah","חבו","IH"},
        {"Rochel","ראה","AL"},{"Yabamiah","יבמ","IH"},{"Haiaiel","היי","AL"},{"Mumiah","מומ","IH"},
    };

    static final String[] SIGNOS = {"♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"};

    static String hebraico(int i) { return ANJOS[i][1] + ("IH".equals(ANJOS[i][2]) ? "יה" : "אל"); }

    static int quinario(double lon) { return (int) Math.floor(Ephemeris.norm360(lon - INICIO_LEAO) / 5.0) % 72; }

    static String quinarioTexto(int i) {
        double ini = Ephemeris.norm360(INICIO_LEAO + i * 5);
        int s = (int) (ini / 30), g = (int) (ini - s * 30);
        return SIGNOS[s] + "\uFE0E " + g + "°–" + (g + 5) + "°";
    }

    // ── Cálculo do período atual ─────────────────────────────────

    static class Info { int idx, idxSol, idxProx; long inicio, fim; }

    interface Quin { int at(long t); }

    /** Bisseção: primeiro instante em (t0, t1] em que cond(t) passa a ser verdadeira */
    static long transicao(long t0, long t1, java.util.function.LongPredicate cond) {
        while (t1 - t0 > 1000) {
            long m = (t0 + t1) / 2;
            if (cond.test(m)) t1 = m; else t0 = m;
        }
        return t1;
    }

    static Info calcular(long agora, double lat, double lon) {
        Quin q = t -> quinario(Ephemeris.ascendant(t, lat, lon));
        long passo = 60_000L;
        final int idx = q.at(agora);
        long a = agora; for (int k = 0; k < 240 && q.at(a - passo) == idx; k++) a -= passo;
        long b = agora; for (int k = 0; k < 240 && q.at(b + passo) == idx; k++) b += passo;
        Info info = new Info();
        info.idx    = idx;
        info.inicio = transicao(a - passo, a, t -> q.at(t) == idx);
        info.fim    = transicao(b, b + passo, t -> q.at(t) != idx);
        info.idxProx = q.at(info.fim + 1000);
        info.idxSol = quinario(Ephemeris.sunLongitude(agora));
        return info;
    }

    static String fmt(long ms) {
        Calendar c = Calendar.getInstance(); c.setTimeInMillis(ms);
        return String.format("%02d:%02d", c.get(Calendar.HOUR_OF_DAY), c.get(Calendar.MINUTE));
    }

    // ── Desenho (mesmo estilo do widget Horae) ───────────────────

    /** Reduz o tamanho da fonte até o texto caber na largura */
    static void caber(Paint p, String texto, float maxW) {
        float m = p.measureText(texto);
        if (m > maxW && m > 0) p.setTextSize(p.getTextSize() * maxW / m);
    }

    static Bitmap desenhar(int w, int h, Info info) {
        Bitmap bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(bmp);
        final int OURO = 0xFF8a6a1a, TINTA = 0xFF1a1820, CINZA = 0xFF555060, CLARO = 0xFF9a8a60;

        float radius = h * 0.07f, lineY = h * 0.28f, contentH = h - lineY, contentCY = lineY + contentH / 2f;
        float pad = h * 0.13f;
        float hebW = h * 1.05f, hebCX = pad + hebW / 2f;
        float sep1X = pad + hebW + pad * 0.6f, sep2X = w - h * 1.05f, solCX = (sep2X + w) / 2f;
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
        label.setTextAlign(Paint.Align.LEFT);   c.drawText("ANJO DO MOMENTO", textX, lineY * 0.72f, label);
        label.setTextAlign(Paint.Align.CENTER); c.drawText("DIAS ☉", solCX, lineY * 0.72f, label);

        Paint sep = new Paint(Paint.ANTI_ALIAS_FLAG); sep.setColor(0x508a6a1a); sep.setStrokeWidth(1f);
        c.drawLine(0, lineY, w, lineY, sep);
        c.drawLine(sep1X, lineY + 8, sep1X, h - 10, sep);
        c.drawLine(sep2X, lineY + 8, sep2X, h - 10, sep);

        // Nome hebraico — ajusta o tamanho à largura disponível
        Paint heb = new Paint(Paint.ANTI_ALIAS_FLAG); heb.setColor(OURO); heb.setTextAlign(Paint.Align.CENTER);
        heb.setTypeface(Typeface.create(Typeface.SERIF, Typeface.BOLD));
        heb.setTextSize(h * 0.40f);
        String hebAtual = hebraico(info.idx);
        float medida = heb.measureText(hebAtual);
        if (medida > hebW) heb.setTextSize(heb.getTextSize() * hebW / medida);
        Paint.FontMetrics fm = heb.getFontMetrics();
        c.drawText(hebAtual, hebCX, contentCY - (fm.ascent + fm.descent) / 2f, heb);

        int save = c.save(); c.clipRect(textX, lineY, textX + textMaxW, h);
        // 1ª linha: nome (e o número, se couber)
        Paint nome = new Paint(Paint.ANTI_ALIAS_FLAG); nome.setColor(TINTA); nome.setTextSize(h * 0.22f); nome.setTypeface(Typeface.DEFAULT_BOLD);
        caber(nome, ANJOS[info.idx][0], textMaxW);
        c.drawText(ANJOS[info.idx][0], textX, lineY + contentH * 0.36f, nome);
        float nomeW = nome.measureText(ANJOS[info.idx][0] + "  ");
        Paint num = new Paint(Paint.ANTI_ALIAS_FLAG); num.setColor(CLARO); num.setTextSize(h * 0.11f);
        String numTxt = "nº " + (info.idx + 1);
        if (nomeW + num.measureText(numTxt) <= textMaxW)
            c.drawText(numTxt, textX + nomeW, lineY + contentH * 0.36f, num);

        // 2ª linha: horário e quinário
        Paint hora = new Paint(Paint.ANTI_ALIAS_FLAG); hora.setColor(CINZA); hora.setTextSize(h * 0.135f);
        String horaTxt = fmt(info.inicio) + " – " + fmt(info.fim) + "  ·  " + quinarioTexto(info.idx);
        caber(hora, horaTxt, textMaxW);
        c.drawText(horaTxt, textX, lineY + contentH * 0.64f, hora);

        // 3ª linha: próximo anjo
        Paint prox = new Paint(Paint.ANTI_ALIAS_FLAG); prox.setColor(CLARO); prox.setTextSize(h * 0.12f);
        String proxTxt = "Próx: " + ANJOS[info.idxProx][0];
        caber(prox, proxTxt, textMaxW);
        c.drawText(proxTxt, textX, lineY + contentH * 0.89f, prox);

        c.restoreToCount(save);

        // Anjo dos dias (Sol)
        Paint hebSol = new Paint(heb); hebSol.setTextSize(h * 0.22f);
        String hs = hebraico(info.idxSol);
        float ms = hebSol.measureText(hs), maxSol = (w - sep2X) - pad;
        if (ms > maxSol) hebSol.setTextSize(hebSol.getTextSize() * maxSol / ms);
        c.drawText(hs, solCX, lineY + contentH * 0.45f, hebSol);
        Paint nomeSol = new Paint(Paint.ANTI_ALIAS_FLAG); nomeSol.setColor(CINZA); nomeSol.setTextSize(h * 0.12f); nomeSol.setTextAlign(Paint.Align.CENTER);
        caber(nomeSol, ANJOS[info.idxSol][0], maxSol);
        c.drawText(ANJOS[info.idxSol][0], solCX, lineY + contentH * 0.78f, nomeSol);
        return bmp;
    }

    // ── Ciclo de vida ────────────────────────────────────────────

    static void atualizar(Context context, AppWidgetManager mgr, int[] ids) {
        long fim = System.currentTimeMillis() + 5 * 60_000L;
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            double lat = prefs.getFloat("lat", (float) LAT_PADRAO);
            double lon = prefs.getFloat("lon", (float) LON_PADRAO);
            Info info = calcular(System.currentTimeMillis(), lat, lon);
            fim = info.fim;
            float density = context.getResources().getDisplayMetrics().density;
            for (int id : ids) {
                android.os.Bundle opts = mgr.getAppWidgetOptions(id);
                int wDp = opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH, 300);
                int hDp = opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 80);
                int wPx = Math.max((int) (wDp * density), 400), hPx = Math.max((int) (hDp * density), 100);
                hPx = Math.min(hPx, wPx / 3);   // mantém o formato de faixa
                RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_shem);
                views.setImageViewBitmap(R.id.widget_image, desenhar(wPx, hPx, info));
                Intent intent = new Intent(context, MainActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                PendingIntent pi = PendingIntent.getActivity(context, 2, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                views.setOnClickPendingIntent(R.id.widget_image, pi);
                mgr.updateAppWidget(id, views);
            }
        } catch (Exception e) {
            android.util.Log.e("ShemWidget", "falha ao atualizar", e);
        }
        agendarProxima(context, fim);
    }

    static void atualizarTodos(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, ShemWidget.class));
        if (ids != null && ids.length > 0) atualizar(ctx, mgr, ids);
    }

    static void agendarProxima(Context context, long fimMs) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        long trigger = fimMs + 2000L;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms())
            am.setWindow(AlarmManager.RTC, trigger, 60_000L, getPendingIntent(context));
        else
            am.setExact(AlarmManager.RTC, trigger, getPendingIntent(context));
    }

    static PendingIntent getPendingIntent(Context context) {
        Intent i = new Intent(ACTION_UPDATE); i.setClass(context, ShemWidget.class);
        return PendingIntent.getBroadcast(context, 1003, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
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
