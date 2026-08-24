/**
 * tamilCalendarService.js
 *
 * REAL-TIME Tamil Panchangam Calculation Engine.
 *
 * Instead of relying solely on mock/static data, this module uses true
 * astronomical algorithms to compute:
 *   - Tamil Month & Date (solar transit-based)
 *   - Tithi (lunar phase, 30 tithis per synodic month)
 *   - Nakshatra (moon's sidereal longitude divided into 27 nakshatras)
 *   - Festival Flags (derived from month+date combos and computed tithi)
 *   - Viratham Flags (derived from specific tithis like Ekadashi, Sashti)
 *
 * Falls back gracefully to live API if TAMIL_CALENDAR_API key is set,
 * enriched with the astronomical data for any missing fields.
 */

import { getKolkataDateStr } from '../utils/dateUtils.js';

// In-memory cache: { 'YYYY-MM-DD': data }
const calendarCache = new Map();

// ─── Constants ──────────────────────────────────────────────────────────────

/** Julian Date of J2000.0 epoch */
const J2000 = 2451545.0;

/** Tamil month names (solar month order) */
const TAMIL_MONTHS = [
  'Chithirai', 'Vaikasi', 'Aani', 'Aadi',
  'Avani', 'Purattasi', 'Aippasi', 'Karthigai',
  'Margazhi', 'Thai', 'Maasi', 'Panguni'
];

/** Tamil Tithi names (1–30, where 15=Pournami, 30=Amavasai) */
const TITHI_NAMES = [
  'Prathamai', 'Thuthiyai', 'Thirithiyai', 'Chathurthi', 'Panchami',
  'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dasami',
  'Ekadashi', 'Duvadashi', 'Thiriyodashi', 'Chathurdashi', 'Pournami',
  'Prathamai', 'Thuthiyai', 'Thirithiyai', 'Chathurthi', 'Panchami',
  'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dasami',
  'Ekadashi', 'Duvadashi', 'Thiriyodashi', 'Chathurdashi', 'Amavasai'
];

/** 27 Nakshatra names */
const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Karthigai', 'Rohini', 'Mirugashiradam',
  'Thiruvadhirai', 'Punarpoosam', 'Poosam', 'Ayilyam', 'Pooram',
  'Uthiram', 'Hastham', 'Chithirai', 'Swathi', 'Visagam',
  'Anusham', 'Kettai', 'Moolam', 'Pooradam', 'Uthiradam',
  'Thiruvonam', 'Avittam', 'Sadhayam', 'Poorattadhi', 'Uthirattadhi',
  'Revathi', 'Ashwini' // wrap
];


/**
 * Fixed Tamil festivals: [tamilMonthIndex(0-based), tamilDayApprox]
 * These are matched against computed Tamil month + date range.
 */
const FIXED_FESTIVALS = [
  { month: 9, dayMin: 1, dayMax: 1, name: 'Pongal' },          // Thai 1
  { month: 0, dayMin: 1, dayMax: 1, name: 'Tamil New Year' },   // Chithirai 1
  { month: 3, dayMin: 18, dayMax: 18, name: 'Aadi Perukku' },     // Aadi 18
  { month: 5, dayMin: 1, dayMax: 9, name: 'Navratri' },         // Purattasi 1–9
  { month: 5, dayMin: 9, dayMax: 9, name: 'Ayudha Pooja' },     // Purattasi 9
  { month: 6, dayMin: 1, dayMax: 1, name: 'Deepavali' },        // Aippasi 1
  { month: 7, dayMin: 1, dayMax: 1, name: 'Karthigai Deepam' }, // Karthigai 1
  { month: 8, dayMin: 1, dayMax: 1, name: 'Margazhi Thiruvizha' }, // Margazhi 1
  { month: 10, dayMin: 14, dayMax: 14, name: 'Maha Shivaratri' },  // Maasi 14
  { month: 11, dayMin: 14, dayMax: 14, name: 'Panguni Uthiram' }, // Panguni 14
];

// ─── Astronomical Utility Functions ──────────────────────────────────────────

/**
 * Convert a YYYY-MM-DD string to Julian Day Number.
 * Uses the proleptic Gregorian calendar formula.
 * @param {string} dateStr
 * @returns {number}
 */
const dateToJD = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const a = Math.floor((14 - m) / 12);
  const yr = y + 4800 - a;
  const mo = m + 12 * a - 3;
  return d + Math.floor((153 * mo + 2) / 5) + 365 * yr +
    Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045;
};

/**
 * Normalize an angle to [0, 360) degrees.
 * @param {number} deg
 * @returns {number}
 */
const normAngle = (deg) => ((deg % 360) + 360) % 360;

/**
 * Compute the Sun's ecliptic longitude for a given Julian Day (low-precision, ~1° accuracy).
 * Based on Jean Meeus "Astronomical Algorithms" Ch.25 simplified.
 * @param {number} jd
 * @returns {number} Sun's ecliptic longitude in degrees [0, 360)
 */
const sunLongitude = (jd) => {
  const T = (jd - J2000) / 36525; // Julian centuries from J2000
  const L0 = normAngle(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = normAngle(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = M * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
    + 0.000289 * Math.sin(3 * Mrad);
  const sunLon = normAngle(L0 + C);
  // Convert tropical to sidereal (subtract ayanamsa ~23.85° for Lahiri)
  const ayanamsa = 23.85 + 0.0136 * T; // approximate Lahiri ayanamsa
  return normAngle(sunLon - ayanamsa);
};

/**
 * Compute the Moon's ecliptic longitude for a given Julian Day (low-precision, ~1° accuracy).
 * @param {number} jd
 * @returns {number} Moon's sidereal ecliptic longitude in degrees [0, 360)
 */
const moonLongitude = (jd) => {
  const T = (jd - J2000) / 36525;
  // Moon's mean longitude
  const L = normAngle(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T);
  // Moon's mean anomaly
  const M = normAngle(134.9633964 + 477198.8676313 * T + 0.0089970 * T * T);
  // Moon's argument of latitude
  const F = normAngle(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T);
  // Sun's mean anomaly (for corrections)
  const Ms = normAngle(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
  // Elongation of Moon from Sun
  const D = normAngle(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T);

  const toRad = (d) => d * Math.PI / 180;

  // Main periodic terms (degrees)
  const dL = 6.288774 * Math.sin(toRad(M))
    + 1.274027 * Math.sin(toRad(2 * D - M))
    + 0.658314 * Math.sin(toRad(2 * D))
    + 0.213618 * Math.sin(toRad(2 * M))
    - 0.185116 * Math.sin(toRad(Ms))
    - 0.114332 * Math.sin(toRad(2 * F))
    + 0.058793 * Math.sin(toRad(2 * D - 2 * M))
    + 0.057066 * Math.sin(toRad(2 * D - Ms - M))
    + 0.053322 * Math.sin(toRad(2 * D + M))
    + 0.045758 * Math.sin(toRad(2 * D - Ms));

  const tropicalMoon = normAngle(L + dL);
  // Lahiri ayanamsa correction
  const ayanamsa = 23.85 + 0.0136 * T;
  return normAngle(tropicalMoon - ayanamsa);
};

// ─── Panchang Computation ─────────────────────────────────────────────────────

/**
 * Compute all Tamil Panchang values astronomically for a given date.
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {Object} Panchang data object
 */
const getAstronomicalPanchang = (dateStr) => {
  const jd = dateToJD(dateStr);
  const jdNoon = jd + 0.5; // Approximate noon JD (IST ~UTC+5:30 → JD + 0.229)
  const jdIST = jd + 0.229; // More accurate IST noon

  // ── Tamil Date & Month (Solar) ─────────────────────────────────────────────
  const sunLon = sunLongitude(jdIST);
  // Tamil solar month = which 30° segment the sun is in
  const tamilMonthIndex = Math.floor(sunLon / 30) % 12;
  const tamilMonth = TAMIL_MONTHS[tamilMonthIndex];
  // Tamil date = day within the solar month (1–30ish)
  const sunLonInMonth = sunLon - tamilMonthIndex * 30;
  const tamilDate = Math.min(30, Math.max(1, Math.floor(sunLonInMonth) + 1));

  // ── Tithi (Lunar) ──────────────────────────────────────────────────────────
  const moonLon = moonLongitude(jdIST);
  const sunLonTropical = (() => {
    const T = (jdIST - J2000) / 36525;
    const L0 = normAngle(280.46646 + 36000.76983 * T);
    const M = normAngle(357.52911 + 35999.05029 * T);
    const Mrad = M * Math.PI / 180;
    const C = 1.914602 * Math.sin(Mrad) + 0.019993 * Math.sin(2 * Mrad);
    return normAngle(L0 + C);
  })();
  // Tithi = (moonLon_tropical - sunLon_tropical) / 12, each 12° = 1 tithi
  // We need tropical moon too for elongation
  const moonLonTropical = (() => {
    const T = (jdIST - J2000) / 36525;
    const L = normAngle(218.3164477 + 481267.88123421 * T);
    const M = normAngle(134.9633964 + 477198.8676313 * T);
    const F = normAngle(93.2720950 + 483202.0175233 * T);
    const Ms = normAngle(357.5291092 + 35999.0502909 * T);
    const D = normAngle(297.8501921 + 445267.1114034 * T);
    const toRad = (d) => d * Math.PI / 180;
    const dL = 6.288774 * Math.sin(toRad(M))
      + 1.274027 * Math.sin(toRad(2 * D - M))
      + 0.658314 * Math.sin(toRad(2 * D))
      + 0.213618 * Math.sin(toRad(2 * M))
      - 0.185116 * Math.sin(toRad(Ms))
      - 0.114332 * Math.sin(toRad(2 * F));
    return normAngle(L + dL);
  })();

  const elongation = normAngle(moonLonTropical - sunLonTropical);
  const tithiIndex = Math.floor(elongation / 12); // 0–29
  const tithi = TITHI_NAMES[tithiIndex];

  // ── Nakshatra (Moon's Sidereal Position) ───────────────────────────────────
  // Each nakshatra = 360/27 = 13.333° of sidereal longitude
  const nakshatraIndex = Math.floor(moonLon / (360 / 27)) % 27;
  const nakshatra = NAKSHATRA_NAMES[nakshatraIndex];

  // ── Special Day Flags ──────────────────────────────────────────────────────
  const isAmavasai = tithiIndex === 29; // 30th tithi = Amavasai
  const isPournami = tithiIndex === 14; // 15th tithi = Pournami

  // Viratham detection from tithi index
  const isEkadashi = tithiIndex === 10 || tithiIndex === 25; // 11th and 26th
  const isSashti = tithiIndex === 5 || tithiIndex === 20; // 6th and 21st
  const isPradosham = tithiIndex === 12 || tithiIndex === 27; // 13th and 28th
  const isSankatahara = tithiIndex === 3;                       // 4th of Krishna paksha

  const isViratham = isEkadashi || isSashti || isPradosham || isSankatahara;
  const virathamName = isEkadashi ? 'Ekadashi'
    : isSashti ? 'Sashti'
      : isPradosham ? 'Pradosham'
        : isSankatahara ? 'Sankatahara Chaturthi'
          : null;

  // ── Festival Detection ─────────────────────────────────────────────────────
  let isFestival = false;
  let festivalName = null;

  // Check fixed solar festivals by Tamil month + date range
  for (const fest of FIXED_FESTIVALS) {
    if (fest.month === tamilMonthIndex && tamilDate >= fest.dayMin && tamilDate <= fest.dayMax) {
      isFestival = true;
      festivalName = fest.name;
      break;
    }
  }

  // Vinayakar Chaturthi: Shukla Chaturthi (4th tithi, waxing) in Avani (month 4)
  if (!isFestival && tithiIndex === 3 && tamilMonthIndex === 4) {
    isFestival = true;
    festivalName = 'Vinayakar Chaturthi';
  }

  // Thaipusam: Pournami in Thai (month 9) near Poosam nakshatra
  if (!isFestival && isPournami && tamilMonthIndex === 9) {
    isFestival = true;
    festivalName = 'Thaipusam';
  }

  // ── Day of Week ────────────────────────────────────────────────────────────
  const dateObj = new Date(dateStr);
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];

  // ── Sunrise / Sunset (approximate for Chennai lat ~13°N) ──────────────────
  // Simple constant approximation (real implementation would use SPA algorithm)
  const sunrise = '06:08';
  const sunset = '18:22';

  return {
    tamilDate: String(tamilDate),
    tamilMonth,
    tamilYear: 'Sobakiruthu', // Tamil year (60-year cycle) — can be computed but kept static for stability
    day: dayOfWeek,
    tithi,
    nakshatra,
    festivalName: festivalName || null,
    isFestival,
    isAmavasai,
    isPournami,
    isViratham,
    virathamName: virathamName || null,
    sunrise,
    sunset,
    _source: 'astronomical', // helps distinguish from mock/api
  };
};

// ─── API Response Normaliser ──────────────────────────────────────────────────

/**
 * Normalises raw API response into a clean, consistent shape,
 * enriching with astronomical data for any missing fields.
 * @param {Object} raw - Raw JSON from API
 * @param {string} dateStr - YYYY-MM-DD used for astronomical fallback
 * @returns {Object} Normalised Tamil calendar data
 */
const normaliseApiResponse = (raw, dateStr = null) => {
  const d = raw?.data || raw || {};
  const tithiStr = typeof d.tithi === 'string' ? d.tithi : '';

  // If API data looks incomplete, enrich with astronomical calculation
  const astro = dateStr ? getAstronomicalPanchang(dateStr) : null;

  // Deduce viratham from tithi if not explicitly set
  const hasVirathamTithi = /pradosham|sashti|shashti|ekadashi|ekadasi|sankatahara/i.test(tithiStr);
  const deducedVirathamName = tithiStr.toLowerCase().includes('pradosham') ? 'Pradosham'
    : (tithiStr.toLowerCase().includes('sashti') || tithiStr.toLowerCase().includes('shashti')) ? 'Sashti'
      : (tithiStr.toLowerCase().includes('ekadashi') || tithiStr.toLowerCase().includes('ekadasi')) ? 'Ekadashi'
        : tithiStr.toLowerCase().includes('sankatahara') ? 'Sankatahara Chaturthi'
          : null;

  return {
    tamilDate: d.tamil_date || d.tamilDate || (d.tamil_day !== undefined ? `${d.tamil_day}` : null) || astro?.tamilDate || null,
    tamilMonth: d.tamil_month || d.tamilMonth || d.month || astro?.tamilMonth || null,
    tamilYear: d.tamil_year || d.tamilYear || d.year || astro?.tamilYear || null,
    day: d.day || d.weekday || d.day_of_week || astro?.day || null,
    tithi: d.tithi || d.thithi || astro?.tithi || null,
    nakshatra: d.nakshatra || d.natchathiram || astro?.nakshatra || null,
    festivalName: d.festival_name || d.festivalName || d.festival || astro?.festivalName || null,
    isFestival: !!(d.is_festival || d.isFestival || d.festival_name || d.festivalName || astro?.isFestival),
    isAmavasai: !!(d.is_amavasai || d.isAmavasai || d.amavasai || tithiStr.toLowerCase().includes('amavasai') || astro?.isAmavasai),
    isPournami: !!(d.is_pournami || d.isPournami || d.pournami || tithiStr.toLowerCase().includes('pournami') || astro?.isPournami),
    isViratham: !!(d.is_viratham || d.isViratham || d.is_viratham_day || d.isVirathamDay || hasVirathamTithi || astro?.isViratham),
    virathamName: d.viratham_name || d.virathamName || d.viratham || deducedVirathamName || astro?.virathamName || null,
    sunrise: d.sunrise || astro?.sunrise || null,
    sunset: d.sunset || astro?.sunset || null,
    _source: 'api',
  };
};

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Formats a JS Date to YYYY-MM-DD string in local time.
 * @param {Date} date
 * @returns {string}
 */
const toDateStr = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Fetches Tamil calendar data for the given date string.
 * Priority: (1) Cache, (2) Live RapidAPI (enriched with astro), (3) Pure astronomical calculation.
 *
 * @param {string} dateStr - Target date in YYYY-MM-DD format
 * @returns {Promise<Object>} Normalised Tamil calendar data
 */
export const getCalendarData = async (dateStr) => {
  // 1. Cache hit
  if (calendarCache.has(dateStr)) {
    console.log(`[TamilCalendarService] Cache hit for ${dateStr}`);
    return calendarCache.get(dateStr);
  }

  const apiKey = process.env.TAMIL_CALENDAR_API;

  // 2. No API key → use pure astronomical calculation (not mock anymore)
  if (!apiKey) {
    console.info(`[TamilCalendarService] No API key — using astronomical panchang for ${dateStr}`);
    const data = getAstronomicalPanchang(dateStr);
    calendarCache.set(dateStr, data);
    return data;
  }

  const apiHost = 'yawin-indian-astrology.p.rapidapi.com';
  const url = `https://${apiHost}/TamilCalendar?date=${dateStr}`;

  try {
    console.log(`[TamilCalendarService] Fetching live panchang for ${dateStr} from RapidAPI...`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      console.error(`[TamilCalendarService] RapidAPI error for ${dateStr}: ${response.status} ${response.statusText} — ${responseBody}`);
      console.warn('[TamilCalendarService] Falling back to astronomical calculation.');
      const data = getAstronomicalPanchang(dateStr);
      calendarCache.set(dateStr, data);
      return data;
    }

    const raw = await response.json();
    console.log(`[TamilCalendarService] Live RapidAPI response for ${dateStr}:`, JSON.stringify(raw, null, 2));

    // Normalise API response, enriching with astronomical data for any missing fields
    const data = normaliseApiResponse(raw, dateStr);
    calendarCache.set(dateStr, data);
    console.log(`[TamilCalendarService] Normalised panchang for ${dateStr}:`, data);
    return data;

  } catch (error) {
    console.error(`[TamilCalendarService] Failed to fetch for ${dateStr} — falling back to astronomical:`, error.message);
    const data = getAstronomicalPanchang(dateStr);
    calendarCache.set(dateStr, data);
    return data;
  }
};

/**
 * Returns Tamil calendar data for today (Asia/Kolkata timezone).
 * @returns {Promise<Object>}
 */
export const getTodayCalendarData = async () => getCalendarData(getKolkataDateStr(0));

/**
 * Returns Tamil calendar data for tomorrow (Asia/Kolkata timezone).
 * @returns {Promise<Object>}
 */
export const getTomorrowCalendarData = async () => getCalendarData(getKolkataDateStr(1));

/**
 * Clears the cache (useful for testing or scheduled midnight resets).
 */
export const clearCache = () => {
  calendarCache.clear();
  console.log('[TamilCalendarService] Cache cleared.');
};
