package com.hermetica.suite;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.os.Build;
import android.widget.RemoteViews;

import java.util.Calendar;
import java.util.TimeZone;

public class HorasWidget extends AppWidgetProvider {

    static final String ACTION_UPDATE = "com.hermetica.suite.WIDGET_HORAS_UPDATE";

    static final String[] NOMES = {"Sol","Lua","Marte","Mercúrio","Júpiter","Vênus","Saturno"};
    static final String[] SYMS  = {"\u2609","\u263D","\u2642","\u263F","\u2643","\u2640","\u2644"};
    static final int[]    CORES = {0xFFc4890a,0xFF7a7a9a,0xFFaa2020,0xFF3a7a3a,0xFF1a4a8a,0xFF8a2a6a,0xFF555060};

    static final int[] ORDEM_CALDEIA = {6,4,2,0,5,3,1};
    static final int[] REGENTE_DIA   = {0,1,2,3,4,5,6};

    static final String PREFS = "horas_widget_prefs";
    // Padrão (São Paulo) até o app Horae informar a cidade escolhida
    static final double LAT_PADRAO = -23.55;
    static final double LON_PADRAO = -46.63;

    static double[] nascerPoente(double lat, double lon, long refMs) {
        double JD=refMs/86400000.0+2440587.5,T=(JD-2451545.0)/36525.0;
        double L0=(280.46646+36000.76983*T)%360,M=(357.52911+35999.05029*T-0.0001537*T*T)%360;
        double Mrad=Math.toRadians(M);
        double C=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(Mrad)+(0.019993-0.000101*T)*Math.sin(2*Mrad)+0.000289*Math.sin(3*Mrad);
        double sunLon=L0+C,e=23.439291-0.013004*T,erad=Math.toRadians(e);
        double decl=Math.toDegrees(Math.asin(Math.sin(erad)*Math.sin(Math.toRadians(sunLon))));
        double y=Math.pow(Math.tan(erad/2),2);
        double EqT=4*Math.toDegrees(y*Math.sin(2*Math.toRadians(L0))-2*0.016708634*Math.sin(Mrad)+4*0.016708634*y*Math.sin(Mrad)*Math.cos(2*Math.toRadians(L0))-0.5*y*y*Math.sin(4*Math.toRadians(L0))-1.25*0.016708634*0.016708634*Math.sin(2*Mrad));
        double zenith=90.833;
        double cosHA=(Math.cos(Math.toRadians(zenith))-Math.sin(Math.toRadians(lat))*Math.sin(Math.toRadians(decl)))/(Math.cos(Math.toRadians(lat))*Math.cos(Math.toRadians(decl)));
        if(cosHA<-1) return new double[]{0,1440};
        if(cosHA>1)  return new double[]{720,720};
        double HA=Math.toDegrees(Math.acos(cosHA));
        double tzOffset=TimeZone.getDefault().getOffset(refMs)/60000.0;
        double nascer=((720-4*(lon+HA)-EqT+tzOffset)%1440+1440)%1440;
        double poente=((720-4*(lon-HA)-EqT+tzOffset)%1440+1440)%1440;
        return new double[]{nascer,poente};
    }

    static class HoraInfo {
        int idxPlaneta,idxRegente,idxProximo,numHora; boolean diurna; String intervalo; long fimMs;
    }

    static HoraInfo calcHoraAtual(Context context) {
        android.content.SharedPreferences prefs=context.getSharedPreferences(PREFS,Context.MODE_PRIVATE);
        final double LAT=prefs.getFloat("lat",(float)LAT_PADRAO);
        final double LON=prefs.getFloat("lon",(float)LON_PADRAO);
        long nowMs=System.currentTimeMillis();

        // Determinar meia-noite do dia atual
        Calendar midnight=Calendar.getInstance();
        midnight.set(Calendar.HOUR_OF_DAY,0); midnight.set(Calendar.MINUTE,0); midnight.set(Calendar.SECOND,0); midnight.set(Calendar.MILLISECOND,0);
        long meiaNocteMs=midnight.getTimeInMillis();

        // Nascer do sol hoje
        double[] spHoje=nascerPoente(LAT,LON,meiaNocteMs+720*60000L);
        long nascerHojeMs=meiaNocteMs+(long)(spHoje[0]*60000);

        // Se for antes do nascer do sol, usar o dia anterior como base do ciclo
        if(nowMs < nascerHojeMs) {
            midnight.add(Calendar.DAY_OF_MONTH, -1);
            meiaNocteMs = midnight.getTimeInMillis();
        }

        double[] sp=nascerPoente(LAT,LON,meiaNocteMs+720*60000L);
        long nascerMs=meiaNocteMs+(long)(sp[0]*60000),poenteMs=meiaNocteMs+(long)(sp[1]*60000);
        Calendar amanha=(Calendar)midnight.clone(); amanha.add(Calendar.DAY_OF_MONTH,1);
        double[] spA=nascerPoente(LAT,LON,amanha.getTimeInMillis()+720*60000L);
        long nascerAmanhaMs=amanha.getTimeInMillis()+(long)(spA[0]*60000);
        long durDiurnaMs=(poenteMs-nascerMs)/12,durNoturnaMs=(nascerAmanhaMs-poenteMs)/12;
        int diaSemana=midnight.get(Calendar.DAY_OF_WEEK)-1,idxRegente=REGENTE_DIA[diaSemana];
        int posReg=0; for(int i=0;i<ORDEM_CALDEIA.length;i++) if(ORDEM_CALDEIA[i]==idxRegente){posReg=i;break;}
        for(int i=0;i<24;i++){
            long ini=i<12?nascerMs+(long)i*durDiurnaMs:poenteMs+(long)(i-12)*durNoturnaMs;
            long fim=i<12?nascerMs+(long)(i+1)*durDiurnaMs:poenteMs+(long)(i-11)*durNoturnaMs;
            if(nowMs>=ini&&nowMs<fim){
                HoraInfo h=new HoraInfo(); h.idxPlaneta=ORDEM_CALDEIA[(posReg+i)%7]; h.idxProximo=ORDEM_CALDEIA[(posReg+i+1)%7];
                h.idxRegente=idxRegente; h.fimMs=fim; h.diurna=i<12; h.numHora=h.diurna?(i+1):(i-11);
                h.intervalo=fmt(ini)+" \u2013 "+fmt(fim); return h;
            }
        }
        HoraInfo h=new HoraInfo(); h.idxPlaneta=ORDEM_CALDEIA[posReg%7]; h.idxProximo=ORDEM_CALDEIA[(posReg+1)%7];
        h.idxRegente=idxRegente; h.fimMs=nascerMs+durDiurnaMs; h.diurna=true; h.numHora=1;
        h.intervalo=fmt(nascerMs)+" \u2013 "+fmt(nascerMs+durDiurnaMs); return h;
    }

    static String fmt(long ms){Calendar c=Calendar.getInstance();c.setTimeInMillis(ms);return String.format("%02d:%02d",c.get(Calendar.HOUR_OF_DAY),c.get(Calendar.MINUTE));}

    static Bitmap desenharWidget(int w, int h, HoraInfo info) {
        Bitmap bmp=Bitmap.createBitmap(w,h,Bitmap.Config.ARGB_8888);
        Canvas c=new Canvas(bmp);
        int corPlaneta=CORES[info.idxPlaneta],corRegente=CORES[info.idxRegente],corProx=CORES[info.idxProximo];
        float radius=h*0.07f,lineY=h*0.28f,contentH=h-lineY,contentCY=lineY+contentH/2f;
        float pad=h*0.13f,symSize=h*0.52f,symCX=pad+symSize*0.35f;
        float sep1X=symCX+symSize*0.55f+pad*0.8f,sep2X=w-h*1.02f,regCX=(sep2X+w)/2f;
        float textX=sep1X+pad*0.85f,textMaxW=sep2X-textX-pad*0.5f;

        Paint bg=new Paint(Paint.ANTI_ALIAS_FLAG); bg.setColor(0xFFe4dece);
        c.drawRoundRect(new RectF(0,0,w,h),radius,radius,bg);

        Paint top=new Paint(Paint.ANTI_ALIAS_FLAG); top.setColor(0x17c4a050);
        c.drawRoundRect(new RectF(0,0,w,lineY),radius,radius,top);
        c.drawRect(0,lineY/2f,w,lineY,top);

        Paint border=new Paint(Paint.ANTI_ALIAS_FLAG); border.setStyle(Paint.Style.STROKE); border.setColor(0x508a6a1a); border.setStrokeWidth(1.5f);
        c.drawRoundRect(new RectF(1,1,w-1,h-1),radius,radius,border);

        Paint label=new Paint(Paint.ANTI_ALIAS_FLAG); label.setColor(0xFF8a6a1a); label.setTextSize(h*0.095f); label.setTypeface(Typeface.DEFAULT_BOLD); label.setLetterSpacing(0.12f);
        label.setTextAlign(Paint.Align.LEFT); c.drawText("HORA ATUAL",textX,lineY*0.72f,label);
        label.setTextAlign(Paint.Align.CENTER); c.drawText("DIA",regCX,lineY*0.72f,label);

        Paint sep=new Paint(Paint.ANTI_ALIAS_FLAG); sep.setColor(0x508a6a1a); sep.setStrokeWidth(1f);
        c.drawLine(0,lineY,w,lineY,sep);

        Paint sym=new Paint(Paint.ANTI_ALIAS_FLAG); sym.setColor(corPlaneta); sym.setTextSize(symSize); sym.setTypeface(Typeface.DEFAULT_BOLD); sym.setTextAlign(Paint.Align.CENTER);
        Paint.FontMetrics fmSym=sym.getFontMetrics(); float symY=contentCY-(fmSym.ascent+fmSym.descent)/2f;
        c.drawText(SYMS[info.idxPlaneta],symCX,symY,sym);

        c.drawLine(sep1X,lineY+8,sep1X,h-10,sep); c.drawLine(sep2X,lineY+8,sep2X,h-10,sep);

        int save=c.save(); c.clipRect(textX,lineY,textX+textMaxW,h);

        Paint nome=new Paint(Paint.ANTI_ALIAS_FLAG); nome.setColor(0xFF1a1820); nome.setTextSize(h*0.26f); nome.setTypeface(Typeface.DEFAULT_BOLD); nome.setTextAlign(Paint.Align.LEFT);
        c.drawText(NOMES[info.idxPlaneta],textX,lineY+contentH*0.43f,nome);

        Paint hora=new Paint(Paint.ANTI_ALIAS_FLAG); hora.setColor(0xFF555060); hora.setTextSize(h*0.165f); hora.setTextAlign(Paint.Align.LEFT);
        c.drawText(info.intervalo,textX,lineY+contentH*0.68f,hora);

        Paint tipo=new Paint(Paint.ANTI_ALIAS_FLAG); tipo.setColor(0xFF9a8a60); tipo.setTextSize(h*0.128f); tipo.setTextAlign(Paint.Align.LEFT);
        String tipoStr=(info.diurna?"\u2600 Diurna":"\u263D Noturna")+" \u00B7 Hora "+info.numHora+" de 12 \u00B7 Pr\u00F3x: "+SYMS[info.idxProximo]+" ";
        c.drawText(tipoStr,textX,lineY+contentH*0.91f,tipo);
        float tipoW=tipo.measureText(tipoStr);
        Paint prox=new Paint(Paint.ANTI_ALIAS_FLAG); prox.setColor(corProx); prox.setTextSize(h*0.128f); prox.setTypeface(Typeface.DEFAULT_BOLD); prox.setTextAlign(Paint.Align.LEFT);
        c.drawText(NOMES[info.idxProximo],textX+tipoW,lineY+contentH*0.91f,prox);
        c.restoreToCount(save);

        Paint reg=new Paint(Paint.ANTI_ALIAS_FLAG); reg.setColor(corRegente); reg.setTextSize(h*0.44f); reg.setTypeface(Typeface.DEFAULT_BOLD); reg.setTextAlign(Paint.Align.CENTER);
        Paint.FontMetrics fmReg=reg.getFontMetrics(); float regY=contentCY-(fmReg.ascent+fmReg.descent)/2f;
        c.drawText(SYMS[info.idxRegente],regCX,regY,reg);
        return bmp;
    }

    static void atualizar(Context context, AppWidgetManager manager, int[] ids) {
        try {
            HoraInfo info=calcHoraAtual(context);
            for(int id:ids){
                android.os.Bundle opts=manager.getAppWidgetOptions(id);
                int wDp=opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH,300);
                int hDp=opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT,80);
                float density=context.getResources().getDisplayMetrics().density;
                int wPx=Math.max((int)(wDp*density),400),hPx=Math.max((int)(hDp*density),100);
                Bitmap bmp=desenharWidget(wPx,hPx,info);
                RemoteViews views=new RemoteViews(context.getPackageName(),R.layout.widget_horas);
                views.setImageViewBitmap(R.id.widget_image,bmp);
                Intent intent=new Intent(context,MainActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TOP);
                PendingIntent pi=PendingIntent.getActivity(context,1,intent,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
                views.setOnClickPendingIntent(R.id.widget_image,pi);
                manager.updateAppWidget(id,views);
            }
            agendarProxima(context,info.fimMs);
        } catch(Exception e){}
    }

    static void agendarProxima(Context context, long fimMs) {
        AlarmManager am=(AlarmManager)context.getSystemService(Context.ALARM_SERVICE);
        PendingIntent pi=getPendingIntent(context);
        long trigger=fimMs+2000L;
        if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.S&&!am.canScheduleExactAlarms())
            am.setWindow(AlarmManager.RTC_WAKEUP,trigger,2*60*1000L,pi);
        else
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,trigger,pi);
    }

    static PendingIntent getPendingIntent(Context context){
        Intent i=new Intent(ACTION_UPDATE); i.setClass(context,HorasWidget.class);
        return PendingIntent.getBroadcast(context,1001,i,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
    }

    static void atualizarTodos(Context ctx){AppWidgetManager mgr=AppWidgetManager.getInstance(ctx);int[] ids=mgr.getAppWidgetIds(new ComponentName(ctx,HorasWidget.class));if(ids!=null&&ids.length>0)atualizar(ctx,mgr,ids);}

    @Override public void onUpdate(Context ctx,AppWidgetManager mgr,int[] ids){atualizar(ctx,mgr,ids);}
    @Override public void onAppWidgetOptionsChanged(Context ctx,AppWidgetManager mgr,int id,android.os.Bundle opts){atualizar(ctx,mgr,new int[]{id});}
    @Override public void onReceive(Context ctx,Intent intent){
        super.onReceive(ctx,intent);
        if(ACTION_UPDATE.equals(intent.getAction())){AppWidgetManager mgr=AppWidgetManager.getInstance(ctx);int[] ids=mgr.getAppWidgetIds(new ComponentName(ctx,HorasWidget.class));if(ids!=null&&ids.length>0)atualizar(ctx,mgr,ids);}
    }
    @Override public void onEnabled(Context ctx){AppWidgetManager mgr=AppWidgetManager.getInstance(ctx);int[] ids=mgr.getAppWidgetIds(new ComponentName(ctx,HorasWidget.class));atualizar(ctx,mgr,ids);}
    @Override public void onDisabled(Context ctx){AlarmManager am=(AlarmManager)ctx.getSystemService(Context.ALARM_SERVICE);am.cancel(getPendingIntent(ctx));}
}
