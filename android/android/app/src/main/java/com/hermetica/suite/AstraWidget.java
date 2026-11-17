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
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.widget.RemoteViews;


public class AstraWidget extends AppWidgetProvider {

    private static final int[] PLANET_COLORS = {
        0xFFE8B820, 0xFFB0B0E0, 0xFF70A8E0, 0xFFE080A0, 0xFFCC2828,
        0xFFE09030, 0xFFB09050, 0xFF50C8E8, 0xFF6060E0, 0xFFA060C0,
    };

    private static final String[] PLANET_SYMS = {
        "☉","☽","☿","♀","♂","♃","♄","♅","♆","♇"
    };

    private static final int[] SIGN_COLORS = {
        0xFFE05050, 0xFF70B050, 0xFFC8A820, 0xFF8888D0,
        0xFFE08818, 0xFF78B878, 0xFFD080A8, 0xFFB02020,
        0xFFD06820, 0xFF808898, 0xFF4090D8, 0xFF7060B8,
    };

    private static final String[] SIGN_SYMS = {
        "♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"
    };

    private static double lon2a(double lon, double asc) { return Ephemeris.toRad(180-(lon-asc)); }
    private static double norm360(double x) { return Ephemeris.norm360(x); }

    /** Fase da Lua: elong = Lua − Sol. Lado iluminado como visto no céu do local (espelhado no sul). */
    private static void desenharFaseLua(Canvas c, float cx, float cy, float r, double elong, boolean sul) {
        double e = norm360(elong);
        double cos = Math.cos(Math.toRadians(e));          // 1 = nova, −1 = cheia
        boolean litRight = e < 180;
        if (sul) litRight = !litRight;
        float rx = (float) (r * Math.abs(cos));
        boolean terminadorDireita = (cos > 0) == litRight;

        Paint fundo = new Paint(Paint.ANTI_ALIAS_FLAG); fundo.setColor(0xF5F0ECE4);
        c.drawCircle(cx, cy, r * 1.35f, fundo);
        Paint escuro = new Paint(Paint.ANTI_ALIAS_FLAG); escuro.setColor(0xFF3a3848);
        c.drawCircle(cx, cy, r, escuro);

        Path p = new Path();
        RectF disco = new RectF(cx - r, cy - r, cx + r, cy + r);
        RectF elipse = new RectF(cx - rx, cy - r, cx + rx, cy + r);
        p.arcTo(disco, -90, litRight ? 180 : -180);              // semicírculo do lado aceso (topo → base)
        p.arcTo(elipse, 90, terminadorDireita ? -180 : 180);      // terminador (base → topo)
        p.close();
        Paint aceso = new Paint(Paint.ANTI_ALIAS_FLAG); aceso.setColor(0xFFece6c8);
        c.drawPath(p, aceso);

        Paint borda = new Paint(Paint.ANTI_ALIAS_FLAG); borda.setStyle(Paint.Style.STROKE);
        borda.setColor(Color.argb(140, 100, 75, 30)); borda.setStrokeWidth(Math.max(1f, r * 0.05f));
        c.drawCircle(cx, cy, r, borda);
    }

    private static Bitmap renderChart(int size, double[] planets, boolean[] rx, double[] houses, boolean sul) {
        double ascDeg=houses[0];
        Bitmap bmp=Bitmap.createBitmap(size,size,Bitmap.Config.ARGB_8888);
        Canvas c=new Canvas(bmp);
        c.drawColor(Color.TRANSPARENT,android.graphics.PorterDuff.Mode.CLEAR);
        float cx=size/2f,cy=size/2f,R=size/2f-size*0.03f;
        float rZ1=R,rZ2=R*0.78f,rH2=R*0.63f,rP=R*0.535f,rCt=R*0.32f;

        Paint bgPaint=new Paint(Paint.ANTI_ALIAS_FLAG); bgPaint.setStyle(Paint.Style.FILL); bgPaint.setColor(0xFFF0ECE4);
        c.drawCircle(cx,cy,rZ1,bgPaint);

        Paint rp=new Paint(Paint.ANTI_ALIAS_FLAG); rp.setStyle(Paint.Style.STROKE); rp.setColor(Color.argb(100,100,75,30)); rp.setStrokeWidth(1.5f);
        for(float r:new float[]{rZ1,rZ2,rH2,rCt}) c.drawCircle(cx,cy,r,rp);
        rp.setColor(Color.argb(50,100,75,30)); rp.setStrokeWidth(0.8f); c.drawCircle(cx,cy,R*0.46f,rp);

        Paint sp=new Paint(Paint.ANTI_ALIAS_FLAG); sp.setStyle(Paint.Style.STROKE); sp.setStrokeWidth(0.8f); sp.setColor(Color.argb(100,100,75,30));
        Paint tp=new Paint(Paint.ANTI_ALIAS_FLAG); tp.setTextAlign(Paint.Align.CENTER);
        float symR=(rZ1+rZ2)/2f; float sts=Math.max(10f,R*0.10f); tp.setTextSize(sts);

        for(int i=0;i<12;i++){
            double a=lon2a(i*30.0,ascDeg); double midA=lon2a(i*30.0+15.0,ascDeg);
            c.drawLine((float)(cx+rZ2*Math.cos(a)),(float)(cy+rZ2*Math.sin(a)),(float)(cx+rZ1*Math.cos(a)),(float)(cy+rZ1*Math.sin(a)),sp);
            tp.setColor(SIGN_COLORS[i]);
            c.drawText(SIGN_SYMS[i],(float)(cx+symR*Math.cos(midA)),(float)(cy+symR*Math.sin(midA)+sts*0.35f),tp);
        }

        Paint hp=new Paint(Paint.ANTI_ALIAS_FLAG); hp.setStyle(Paint.Style.STROKE);
        Paint htp=new Paint(Paint.ANTI_ALIAS_FLAG); htp.setTextAlign(Paint.Align.CENTER); htp.setTextSize(Math.max(8f,R*0.07f)); htp.setColor(Color.argb(180,100,75,25)); htp.setFakeBoldText(true);
        float nR=(rZ2+rH2)/2f;
        for(int i=0;i<12;i++){
            double hLon=houses[i],a=lon2a(hLon,ascDeg),midA=lon2a(hLon+norm360(houses[(i+1)%12]-hLon)/2.0,ascDeg);
            boolean ang=(i%3==0); hp.setColor(ang?Color.argb(180,80,55,15):Color.argb(90,100,75,30)); hp.setStrokeWidth(ang?1.5f:0.6f);
            c.drawLine((float)(cx+rCt*Math.cos(a)),(float)(cy+rCt*Math.sin(a)),(float)(cx+rZ2*Math.cos(a)),(float)(cy+rZ2*Math.sin(a)),hp);
            c.drawText(String.valueOf(i+1),(float)(cx+nR*Math.cos(midA)),(float)(cy+nR*Math.sin(midA)+htp.getTextSize()*0.35f),htp);
        }

        Paint lp=new Paint(Paint.ANTI_ALIAS_FLAG); lp.setTextAlign(Paint.Align.CENTER); lp.setTextSize(Math.max(7f,R*0.065f)); lp.setFakeBoldText(true);
        double[] ll={ascDeg,ascDeg+180,houses[9],houses[3]};
        String[] ln={"AC","DC","MC","FC"}; boolean[] ls={true,false,true,false};
        float rLbl=rZ2-R*0.04f;
        for(int i=0;i<4;i++){double a=lon2a(ll[i],ascDeg); lp.setColor(ls[i]?Color.argb(220,70,45,10):Color.argb(130,70,45,10)); c.drawText(ln[i],(float)(cx+rLbl*Math.cos(a)),(float)(cy+rLbl*Math.sin(a)+lp.getTextSize()*0.35f),lp);}

        // Fase da Lua no centro (mesmo desenho do app)
        desenharFaseLua(c, cx, cy, R * 0.075f, planets[1] - planets[0], sul);

        float[] angles=new float[planets.length];
        for(int i=0;i<planets.length;i++) angles[i]=(float)lon2a(planets[i],ascDeg);
        float minGap=(float)Ephemeris.toRad(Math.max(10.0,R*0.065));
        for(int iter=0;iter<8;iter++) for(int i=0;i<angles.length;i++) for(int j=i+1;j<angles.length;j++){
            float da=angles[j]-angles[i]; while(da>Math.PI)da-=(float)(Math.PI*2); while(da<-Math.PI)da+=(float)(Math.PI*2);
            if(Math.abs(da)<minGap){float push=(minGap-Math.abs(da))/2f*(da>=0?1:-1); angles[i]-=push; angles[j]+=push;}
        }

        Paint plp=new Paint(Paint.ANTI_ALIAS_FLAG); plp.setStyle(Paint.Style.STROKE); plp.setStrokeWidth(0.7f);
        Paint dp=new Paint(Paint.ANTI_ALIAS_FLAG); dp.setStyle(Paint.Style.FILL);
        Paint ptp=new Paint(Paint.ANTI_ALIAS_FLAG); ptp.setTextAlign(Paint.Align.CENTER); ptp.setTextSize(Math.max(11f,R*0.105f));
        Paint dtp=new Paint(Paint.ANTI_ALIAS_FLAG); dtp.setTextAlign(Paint.Align.CENTER); dtp.setTextSize(Math.max(6f,R*0.058f));
        float rDot=R*0.46f;

        for(int i=0;i<planets.length;i++){
            int col=PLANET_COLORS[i]; float aOrig=(float)lon2a(planets[i],ascDeg); float aMoved=angles[i];
            plp.setColor(Color.argb(112,Color.red(col),Color.green(col),Color.blue(col)));
            c.drawLine((float)(cx+rH2*Math.cos(aOrig)),(float)(cy+rH2*Math.sin(aOrig)),(float)(cx+rDot*Math.cos(aMoved)),(float)(cy+rDot*Math.sin(aMoved)),plp);
            dp.setColor(col); float ds=Math.max(2.5f,R*0.018f);
            c.drawCircle((float)(cx+rH2*Math.cos(aOrig)),(float)(cy+rH2*Math.sin(aOrig)),ds,dp);
            ptp.setColor(col); float px=(float)(cx+rP*Math.cos(aMoved)),py=(float)(cy+rP*Math.sin(aMoved));
            c.drawText(PLANET_SYMS[i],px,py+ptp.getTextSize()*0.35f,ptp);
            if(rx[i]){
                float rr=rP+R*0.07f;
                dtp.setColor(Color.argb(204,Color.red(col),Color.green(col),Color.blue(col)));
                c.drawText("℞",(float)(cx+rr*Math.cos(aMoved)),(float)(cy+rr*Math.sin(aMoved)+dtp.getTextSize()*0.35f),dtp);
            }
            int deg=(int)(planets[i]-Math.floor(planets[i]/30)*30);
            dtp.setColor(Color.argb(187,Color.red(col),Color.green(col),Color.blue(col)));
            c.drawText(deg+"°",(float)(cx+(rP-R*0.085f)*Math.cos(aMoved)),(float)(cy+(rP-R*0.085f)*Math.sin(aMoved)+dtp.getTextSize()*0.35f),dtp);
        }
        return bmp;
    }

    static final String ACTION_UPDATE = "com.hermetica.suite.WIDGET_ASTRA_UPDATE";
    static final String PREFS = "astra_widget_prefs";
    private static final long INTERVALO_MS = 5L * 60 * 1000;   // Ascendente anda ~1° a cada 4 min

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        atualizar(context, appWidgetManager, appWidgetIds);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context ctx, AppWidgetManager mgr, int id, android.os.Bundle opts) {
        atualizar(ctx, mgr, new int[]{id});
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        super.onReceive(ctx, intent);
        if (ACTION_UPDATE.equals(intent.getAction())) atualizarTodos(ctx);
    }

    @Override public void onEnabled(Context ctx) { atualizarTodos(ctx); }

    @Override
    public void onDisabled(Context ctx) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        am.cancel(getPendingIntent(ctx));
    }

    static void atualizarTodos(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, AstraWidget.class));
        if (ids != null && ids.length > 0) atualizar(ctx, mgr, ids);
    }

    static void atualizar(Context context, AppWidgetManager mgr, int[] ids) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            double lat = prefs.getFloat("lat", -23.5505f);
            double lon = prefs.getFloat("lon", -46.6333f);
            long now = System.currentTimeMillis();
            double[] planets = Ephemeris.calcPlanets(now);
            boolean[] rx     = Ephemeris.calcRetrogrades(now);
            double[] houses  = Ephemeris.calcHouses(now, lat, lon);
            float density = context.getResources().getDisplayMetrics().density;

            for (int id : ids) {
                android.os.Bundle opts = mgr.getAppWidgetOptions(id);
                int wDp = opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH, 250);
                int hDp = opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 250);
                int size = (int) (Math.min(wDp, hDp) * density);
                size = Math.max(300, Math.min(size, 900));   // limite de memória do RemoteViews
                Bitmap bmp = renderChart(size, planets, rx, houses, lat < 0);

                RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_astra);
                views.setImageViewBitmap(R.id.widget_image, bmp);
                Intent intent = new Intent(context, MainActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                PendingIntent pi = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                views.setOnClickPendingIntent(R.id.widget_image, pi);
                mgr.updateAppWidget(id, views);
            }
        } catch (Exception e) {
            android.util.Log.e("AstraWidget", "falha ao atualizar", e);
        }
        agendarProxima(context);
    }

    // Alarme inexato (não exige permissão de alarme exato)
    static void agendarProxima(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        am.setWindow(AlarmManager.RTC, System.currentTimeMillis() + INTERVALO_MS, 60 * 1000L, getPendingIntent(context));
    }

    static PendingIntent getPendingIntent(Context context) {
        Intent i = new Intent(ACTION_UPDATE);
        i.setClass(context, AstraWidget.class);
        return PendingIntent.getBroadcast(context, 1002, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
