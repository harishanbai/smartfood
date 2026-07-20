/**
 * tamilCalendarService.js
 *
 * Fetches Tamil Panchang data from the external Tamil Calendar API.
 * Caches the response per date (in-memory) to avoid redundant API calls.
 * Returns null on failure so the rule engine can fall back to "Normal Random".
 */

// In-memory cache: { 'YYYY-MM-DD': { data, fetchedAt } }
const calendarCache = new Map();

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
 * Normalises raw API response into a clean, consistent shape.
 * Field names are mapped defensively — unknown keys default to null/false.
 *
 * @param {Object} raw - Raw JSON from API
 * @returns {Object} Normalised Tamil calendar data
 */
const normaliseApiResponse = (raw) => {
  // Support both flat and nested responses
  const d = raw?.data || raw || {};

  return {
    tamilDate:    d.tamil_date    || d.tamilDate    || (d.tamil_day !== undefined ? `${d.tamil_day}` : null) || d.date          || null,
    tamilMonth:   d.tamil_month   || d.tamilMonth   || d.month         || null,
    tamilYear:    d.tamil_year    || d.tamilYear     || d.year          || null,
    day:          d.day           || d.weekday       || d.day_of_week   || null,
    tithi:        d.tithi         || d.thithi        || null,
    nakshatra:    d.nakshatra     || d.natchathiram  || null,
    festivalName: d.festival_name || d.festivalName  || d.festival      || null,
    isFestival:   !!(d.is_festival   || d.isFestival   || d.festival_name || d.festivalName),
    isAmavasai:   !!(d.is_amavasai   || d.isAmavasai   || d.amavasai      ||
                     (typeof d.tithi === 'string' && d.tithi.toLowerCase().includes('amavasai'))),
    isPournami:   !!(d.is_pournami   || d.isPournami   || d.pournami      ||
                     (typeof d.tithi === 'string' && d.tithi.toLowerCase().includes('pournami'))),
    sunrise:      d.sunrise       || null,
    sunset:       d.sunset        || null,
  };
};

/**
 * Generates mock Tamil Calendar data for offline/fallback mode.
 * @param {string} dateStr - Target date in YYYY-MM-DD format
 * @returns {Object} Normalised mock Tamil calendar data
 */
const getMockCalendarData = (dateStr) => {
  const dateObj = new Date(dateStr);
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];
  
  const isAmavasai = dateObj.getDate() === 15;
  const isPournami = dateObj.getDate() === 30;
  const isFestival = dateObj.getDate() === 14;

  const mockData = {
    tamil_date: String(dateObj.getDate()),
    tamil_month: "Aadi",
    tamil_year: "Sobakiruthu",
    day: dayOfWeek,
    tithi: isAmavasai ? "Amavasai" : (isPournami ? "Pournami" : "Thuthiyai"),
    nakshatra: "Karthigai",
    festival_name: isFestival ? "Special Festival" : "",
    is_festival: isFestival,
    is_amavasai: isAmavasai,
    is_pournami: isPournami,
    sunrise: "06:00",
    sunset: "18:00"
  };

  return normaliseApiResponse(mockData);
};

/**
 * Fetches Tamil calendar data for the given date string.
 * Checks in-memory cache first; fetches from API on miss.
 *
 * @param {string} dateStr - Target date in YYYY-MM-DD format
 * @returns {Promise<Object|null>} Normalised Tamil calendar data, or null on failure
 */
export const getCalendarData = async (dateStr) => {
  // 1. Cache hit
  if (calendarCache.has(dateStr)) {
    const cached = calendarCache.get(dateStr);
    console.log(`[TamilCalendarService] Cache hit for ${dateStr}`);
    return cached;
  }

  const apiKey = process.env.TAMIL_CALENDAR_API;

  // 2. API key guard - Fallback to mock data offline
  if (!apiKey) {
    console.warn('[TamilCalendarService] TAMIL_CALENDAR_API key is not set in environment. Falling back to MOCK calendar data.');
    const normalised = getMockCalendarData(dateStr);
    calendarCache.set(dateStr, normalised);
    return normalised;
  }

  const apiHost = 'yawin-indian-astrology.p.rapidapi.com';
  const url = `https://${apiHost}/TamilCalendar?date=${dateStr}`;

  try {
    console.log(`[TamilCalendarService] Fetching data for ${dateStr} from RapidAPI...`);
    console.log(`[TamilCalendarService] Request URL: ${url}`);
    console.log(`[TamilCalendarService] Request Host: ${apiHost}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      const responseBody = await response.text();
      console.error(`[TamilCalendarService] RapidAPI error for ${dateStr}:`);
      console.error(`  - Status Code: ${response.status}`);
      console.error(`  - Status Text: ${response.statusText}`);
      console.error(`  - Response Body: ${responseBody}`);

      if (response.status === 401 || response.status === 403) {
        console.warn('  - Suggestion: RapidAPI key is invalid or not subscribed. USING MOCK DATA INSTEAD.');
        const normalised = getMockCalendarData(dateStr);
        calendarCache.set(dateStr, normalised);
        return normalised;
      } else if (response.status === 429) {
        console.error('  - Suggestion: RapidAPI Rate Limit exceeded.');
      }

      const normalised = getMockCalendarData(dateStr);
      calendarCache.set(dateStr, normalised);
      return normalised;
    }

    const data = await response.json();
    console.log(`[TamilCalendarService] Raw RapidAPI Response for ${dateStr}:`, JSON.stringify(data, null, 2));

    const normalised = normaliseApiResponse(data);

    // 3. Cache for the day
    calendarCache.set(dateStr, normalised);
    console.log(`[TamilCalendarService] Fetched & cached data for ${dateStr}:`, normalised);
    return normalised;

  } catch (error) {
    console.error(`[TamilCalendarService] Failed to fetch data for ${dateStr}. Falling back to MOCK calendar data:`);
    console.error(`  - Error Message: ${error.message}`);
    
    const normalised = getMockCalendarData(dateStr);
    calendarCache.set(dateStr, normalised);
    return normalised;
  }
};

/**
 * Returns Tamil calendar data for today.
 * @returns {Promise<Object|null>}
 */
export const getTodayCalendarData = async () => {
  return getCalendarData(toDateStr(new Date()));
};

/**
 * Returns Tamil calendar data for tomorrow.
 * @returns {Promise<Object|null>}
 */
export const getTomorrowCalendarData = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getCalendarData(toDateStr(tomorrow));
};

/**
 * Clears the cache (useful for testing or scheduled midnight resets).
 */
export const clearCache = () => {
  calendarCache.clear();
  console.log('[TamilCalendarService] Cache cleared.');
};
