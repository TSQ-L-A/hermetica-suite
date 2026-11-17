package com.hermetica.suite;

/**
 * Efemérides do Astra Hermetica — mesmo motor de renderer/astra/astro.js.
 * Planetas: elementos keplerianos do JPL (1800–2050) com conversão geocêntrica,
 * tempo-luz, precessão e nutação. Lua: Meeus cap. 47. Casas: Plácido
 * (Porfírio em latitudes polares).
 */
public final class Ephemeris {

    private Ephemeris() {}

    static double toRad(double d) { return d * Math.PI / 180.0; }
    static double toDeg(double r) { return r * 180.0 / Math.PI; }
    static double norm360(double x) { return ((x % 360) + 360) % 360; }

    static double jdn(long timeMs) { return timeMs / 86400000.0 + 2440587.5; }

    // ΔT (TT − UT) em segundos — aproximação a partir de Espenak & Meeus
    static double deltaT(double jd) {
        double y = 2000 + (jd - 2451545.0) / 365.25;
        if (y >= 2015 && y < 2050) return 69.2;
        if (y >= 2005 && y < 2015) return 64.7 + 0.29 * (y - 2005);
        if (y >= 1986 && y < 2005) { double t = y - 2000; return 63.86 + 0.3345*t - 0.060374*t*t + 0.0017275*t*t*t + 0.000651814*t*t*t*t + 0.00002373599*t*t*t*t*t; }
        if (y >= 1961 && y < 1986) { double t = y - 1975; return 45.45 + 1.067*t - t*t/260 - t*t*t/718; }
        if (y >= 1941 && y < 1961) { double t = y - 1950; return 29.07 + 0.407*t - t*t/233 + t*t*t/2547; }
        if (y >= 1920 && y < 1941) { double t = y - 1920; return 21.20 + 0.84493*t - 0.076100*t*t + 0.0020936*t*t*t; }
        if (y >= 1900 && y < 1920) { double t = y - 1900; return -2.79 + 1.494119*t - 0.0598939*t*t + 0.0061966*t*t*t - 0.000197*t*t*t*t; }
        double u = (y - 1820) / 100;
        return -20 + 32*u*u;
    }

    static double julianCenturies(long timeMs) { return (jdn(timeMs) - 2451545.0) / 36525.0; }

    static double julianCenturiesTT(long timeMs) {
        double jd = jdn(timeMs);
        return (jd + deltaT(jd) / 86400 - 2451545.0) / 36525.0;
    }

    /** {Δψ, ε verdadeira} em graus — Meeus cap. 22 (baixa precisão) */
    static double[] nutation(double T) {
        double Om = toRad(125.04452 - 1934.136261*T);
        double Ls = toRad(280.4665 + 36000.7698*T);
        double Lm = toRad(218.3165 + 481267.8813*T);
        double dPsi = (-17.20*Math.sin(Om) - 1.32*Math.sin(2*Ls) - 0.23*Math.sin(2*Lm) + 0.21*Math.sin(2*Om)) / 3600;
        double dEps = (  9.20*Math.cos(Om) + 0.57*Math.cos(2*Ls) + 0.10*Math.cos(2*Lm) - 0.09*Math.cos(2*Om)) / 3600;
        double eps0 = 23.439291111 - 0.0130041667*T - 1.64e-7*T*T + 5.036e-7*T*T*T;
        return new double[]{ dPsi, eps0 + dEps };
    }

    // Elementos keplerianos (JPL, Standish) — {a, e, I, L, ϖ, Ω} e taxas por século, eclíptica J2000
    static final int MERCURY = 0, VENUS = 1, EARTH = 2, MARS = 3, JUPITER = 4,
                     SATURN = 5, URANUS = 6, NEPTUNE = 7, PLUTO = 8;
    static final double[][][] ORBITS = {
        {{0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593},
         {0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081}},
        {{0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255},
         {0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418}},
        {{1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0},
         {0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0}},
        {{1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891},
         {0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343}},
        {{5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909},
         {-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106}},
        {{9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448},
         {-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794}},
        {{19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503},
         {-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589}},
        {{30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574},
         {0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664}},
        {{39.48211675, 0.24882730, 17.14001206, 238.92903833, 224.06891629, 110.30393684},
         {-0.00031596, 0.00005170, 0.00004818, 145.20780515, -0.04062942, -0.01183482}},
    };

    /** Posição heliocêntrica eclíptica (J2000) em UA */
    static double[] helioXYZ(int id, double T) {
        double[] el = ORBITS[id][0], rt = ORBITS[id][1];
        double a = el[0] + rt[0]*T, e = el[1] + rt[1]*T, I = toRad(el[2] + rt[2]*T);
        double L = el[3] + rt[3]*T, w = el[4] + rt[4]*T, O = el[5] + rt[5]*T;
        double M = toRad(norm360(L - w));
        double E = M + e*Math.sin(M);
        for (int k = 0; k < 10; k++) {
            double dE = (E - e*Math.sin(E) - M) / (1 - e*Math.cos(E));
            E -= dE;
            if (Math.abs(dE) < 1e-12) break;
        }
        double xp = a*(Math.cos(E) - e), yp = a*Math.sqrt(1 - e*e)*Math.sin(E);
        double om = toRad(w - O), Or = toRad(O);
        double co = Math.cos(om), so = Math.sin(om), cO = Math.cos(Or), sO = Math.sin(Or), cI = Math.cos(I), sI = Math.sin(I);
        return new double[]{
            (co*cO - so*sO*cI)*xp + (-so*cO - co*sO*cI)*yp,
            (co*sO + so*cO*cI)*xp + (-so*sO + co*cO*cI)*yp,
            (so*sI)*xp + (co*sI)*yp,
        };
    }

    /** Longitude geocêntrica aparente (eclíptica e equinócio da data) */
    static double planetLon(int id, double T, double dPsi) {
        double[] E = helioXYZ(EARTH, T);
        double[] P = helioXYZ(id, T);
        for (int k = 0; k < 2; k++) {          // correção de tempo-luz
            double d = Math.sqrt((P[0]-E[0])*(P[0]-E[0]) + (P[1]-E[1])*(P[1]-E[1]) + (P[2]-E[2])*(P[2]-E[2]));
            P = helioXYZ(id, T - d * 0.0057755183 / 36525);
        }
        double lonJ2000 = toDeg(Math.atan2(P[1]-E[1], P[0]-E[0]));
        return norm360(lonJ2000 + 1.396971*T + 0.0003086*T*T + dPsi);
    }

    static double sunLon(double T) {
        double L0 = norm360(280.46646 + 36000.76983*T + 0.0003032*T*T);
        double M  = norm360(357.52911 + 35999.05029*T - 0.0001537*T*T);
        double Mr = toRad(M);
        double C  = (1.914602 - 0.004817*T - 0.000014*T*T) * Math.sin(Mr)
                  + (0.019993 - 0.000101*T) * Math.sin(2*Mr)
                  + 0.000289 * Math.sin(3*Mr);
        double Om = toRad(125.04 - 1934.136*T);
        return norm360(L0 + C - 0.00569 - 0.00478*Math.sin(Om));  // longitude aparente
    }

    // Lua — Meeus tabela 47.A (D, M, M', F, coeficiente em 1e-6 grau)
    static final int[][] MOON_TERMS = {
        {0,0,1,0,6288774},{2,0,-1,0,1274027},{2,0,0,0,658314},{0,0,2,0,213618},{0,1,0,0,-185116},
        {0,0,0,2,-114332},{2,0,-2,0,58793},{2,-1,-1,0,57066},{2,0,1,0,53322},{2,-1,0,0,45758},
        {0,1,-1,0,-40923},{1,0,0,0,-34720},{0,1,1,0,-30383},{2,0,0,-2,15327},{0,0,1,2,-12528},
        {0,0,1,-2,10980},{4,0,-1,0,10675},{0,0,3,0,10034},{4,0,-2,0,8548},{2,1,-1,0,-7888},
        {2,1,0,0,-6766},{1,0,-1,0,-5163},{1,1,0,0,4987},{2,-1,1,0,4036},{2,0,2,0,3994},
        {4,0,0,0,3861},{2,0,-3,0,3665},{0,1,-2,0,-2689},{2,0,-1,2,-2602},{2,-1,-2,0,2390},
        {1,0,1,0,-2348},{2,-2,0,0,2236},{0,1,2,0,-2120},{0,2,0,0,-2069},{2,-2,-1,0,2048},
        {2,0,1,-2,-1773},{2,0,0,2,-1595},{4,-1,-1,0,1215},{0,0,2,2,-1110},{3,0,-1,0,-892},
        {2,1,1,0,-810},{4,-1,-2,0,759},{0,2,-1,0,-713},{2,2,-1,0,-700},{2,1,-2,0,691},
        {2,-1,0,-2,596},{4,0,1,0,549},{0,0,4,0,537},{4,-1,0,0,520},{1,0,-2,0,-487},
        {2,1,0,-2,-399},{0,0,2,-2,-381},{1,1,1,0,351},{3,0,-2,0,-340},{4,0,-3,0,330},
        {2,-1,2,0,327},{0,2,1,0,-323},{1,1,-1,0,299},{2,0,3,0,294},
    };

    static double moonLon(double T, double dPsi) {
        double Lp = norm360(218.3164477 + 481267.88123421*T - 0.0015786*T*T);
        double D  = norm360(297.8501921 + 445267.1114034*T - 0.0018819*T*T);
        double M  = norm360(357.5291092 + 35999.0502909*T - 0.0001536*T*T);
        double Mp = norm360(134.9633964 + 477198.8675055*T + 0.0087414*T*T);
        double F  = norm360( 93.2720950 + 483202.0175233*T - 0.0036539*T*T);
        double Ecc = 1 - 0.002516*T - 0.0000074*T*T;
        double sum = 0;
        for (int[] t : MOON_TERMS) {
            int am = Math.abs(t[1]);
            double k = am == 1 ? Ecc : am == 2 ? Ecc*Ecc : 1;
            sum += t[4] * k * Math.sin(toRad(t[0]*D + t[1]*M + t[2]*Mp + t[3]*F));
        }
        double A1 = toRad(119.75 + 131.849*T), A2 = toRad(53.09 + 479264.290*T);
        sum += 3958*Math.sin(A1) + 1962*Math.sin(toRad(Lp - F)) + 318*Math.sin(A2);
        return norm360(Lp + sum / 1e6 + dPsi);
    }

    /** Longitudes na ordem: Sol, Lua, Mercúrio, Vênus, Marte, Júpiter, Saturno, Urano, Netuno, Plutão */
    static double[] calcPlanets(long timeMs) {
        double T = julianCenturiesTT(timeMs);
        double dPsi = nutation(T)[0];
        return new double[]{
            sunLon(T), moonLon(T, dPsi),
            planetLon(MERCURY, T, dPsi), planetLon(VENUS, T, dPsi), planetLon(MARS, T, dPsi),
            planetLon(JUPITER, T, dPsi), planetLon(SATURN, T, dPsi), planetLon(URANUS, T, dPsi),
            planetLon(NEPTUNE, T, dPsi), planetLon(PLUTO, T, dPsi),
        };
    }

    /** Retrogradação: longitude 12h depois menor que 12h antes */
    static boolean[] calcRetrogrades(long timeMs) {
        long h12 = 12L * 3600 * 1000;
        double[] a = calcPlanets(timeMs - h12), b = calcPlanets(timeMs + h12);
        boolean[] rx = new boolean[a.length];
        for (int i = 0; i < a.length; i++) {
            double d = b[i] - a[i];
            if (d >  180) d -= 360;
            if (d < -180) d += 360;
            rx[i] = d < 0;
        }
        return rx;
    }

    // ── Casas ──────────────────────────────────────────────────────

    /** Tempo sideral aparente de Greenwich (graus) */
    static double gst(long timeMs) {
        double T = julianCenturies(timeMs), D = jdn(timeMs) - 2451545.0;
        double[] n = nutation(T);
        return norm360(280.46061837 + 360.98564736629*D + 0.000387933*T*T - T*T*T/38710000
                     + n[0] * Math.cos(toRad(n[1])));
    }

    static double calcAscendant(double lstDeg, double latDeg, double epsDeg) {
        double e = toRad(epsDeg), RA = toRad(lstDeg), la = toRad(latDeg);
        return norm360(toDeg(Math.atan2(Math.cos(RA), -(Math.sin(RA)*Math.cos(e) + Math.tan(la)*Math.sin(e)))));
    }

    /** Ascendente (graus) para o instante e local */
    static double ascendant(long timeMs, double latDeg, double lonDeg) {
        double eps = nutation(julianCenturies(timeMs))[1];
        return calcAscendant(norm360(gst(timeMs) + lonDeg), latDeg, eps);
    }

    /** Longitude aparente do Sol (graus) */
    static double sunLongitude(long timeMs) { return sunLon(julianCenturiesTT(timeMs)); }

    /** Longitude eclíptica do ponto da eclíptica com a ascensão reta dada (também dá o MC) */
    static double raToLon(double raDeg, double epsDeg) {
        double RA = toRad(raDeg);
        return norm360(toDeg(Math.atan2(Math.sin(RA), Math.cos(RA)*Math.cos(toRad(epsDeg)))));
    }

    /** Cúspide intermediária de Plácido; NaN se o ponto for circumpolar */
    static double placidusCusp(double ramc, double latDeg, double epsDeg, double frac, boolean nocturnal) {
        double tl = Math.tan(toRad(latDeg)), se = Math.sin(toRad(epsDeg));
        double ra = norm360(ramc + (nocturnal ? 180 - 90*frac : 90*frac));
        for (int k = 0; k < 50; k++) {
            double lon = raToLon(ra, epsDeg);
            double dec = Math.asin(se * Math.sin(toRad(lon)));
            double x = tl * Math.tan(dec);
            if (Math.abs(x) >= 1) return Double.NaN;
            double dsa = 90 + toDeg(Math.asin(x));
            double next = nocturnal ? norm360(ramc + 180 - frac*(180 - dsa)) : norm360(ramc + frac*dsa);
            double diff = Math.abs(next - ra); if (diff > 180) diff = 360 - diff;
            ra = next;
            if (diff < 1e-7) break;
        }
        return raToLon(ra, epsDeg);
    }

    /** Cúspides 1..12 (índices 0..11) — Plácido, ou Porfírio em latitudes polares */
    static double[] calcHouses(long timeMs, double latDeg, double lonDeg) {
        double eps  = nutation(julianCenturies(timeMs))[1];
        double ramc = norm360(gst(timeMs) + lonDeg);
        double asc  = calcAscendant(ramc, latDeg, eps);
        double mc   = raToLon(ramc, eps);

        double c11 = placidusCusp(ramc, latDeg, eps, 1.0/3, false);
        double c12 = placidusCusp(ramc, latDeg, eps, 2.0/3, false);
        double c2  = placidusCusp(ramc, latDeg, eps, 2.0/3, true);
        double c3  = placidusCusp(ramc, latDeg, eps, 1.0/3, true);

        double[] h;
        if (Double.isNaN(c11) || Double.isNaN(c12) || Double.isNaN(c2) || Double.isNaN(c3)) {
            double q1 = norm360(asc - mc) / 3, q2 = norm360(mc + 180 - asc) / 3;
            h = new double[]{ asc, asc + q2, asc + 2*q2, mc + 180, mc + 180 + q1, mc + 180 + 2*q1,
                              asc + 180, asc + 180 + q2, asc + 180 + 2*q2, mc, mc + q1, mc + 2*q1 };
        } else {
            h = new double[]{ asc, c2, c3, mc + 180, c11 + 180, c12 + 180,
                              asc + 180, c2 + 180, c3 + 180, mc, c11, c12 };
        }
        for (int i = 0; i < 12; i++) h[i] = norm360(h[i]);
        return h;
    }
}
