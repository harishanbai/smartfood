/**
 * translator.js
 *
 * Backend translation utility to support Tamil and English.
 * Translates dynamic database strings (like Food names, descriptions, categories)
 * and rule/calendar engine text before returning them in API responses.
 */

const MONTHS_MAP = {
  "Chithirai": "சித்திரை",
  "Vaikasi": "வைகாசி",
  "Aani": "ஆனி",
  "Aadi": "ஆடி",
  "Avani": "ஆவணி",
  "Purattasi": "புரட்டாசி",
  "Aippasi": "ஐப்பசி",
  "Karthigai": "கார்த்திகை",
  "Margazhi": "மார்கழி",
  "Thai": "தை",
  "Maasi": "மாசி",
  "Panguni": "பங்குனி"
};

const TITHIS_MAP = {
  "Prathamai": "பிரதமை",
  "Thuthiyai": "துதியை",
  "Thirithiyai": "திருதியை",
  "Chathurthi": "சதுர்த்தி",
  "Panchami": "பஞ்சமி",
  "Shashti": "சஷ்டி",
  "Saptami": "சப்தமி",
  "Ashtami": "அஷ்டமி",
  "Navami": "நவமி",
  "Dasami": "தசமி",
  "Ekadashi": "ஏகாதசி",
  "Duvadashi": "துவாதசி",
  "Thiriyodashi": "திரியோதசி",
  "Chathurdashi": "சதுர்தசி",
  "Amavasai": "அமாவாசை",
  "Pournami": "பௌர்ணமி"
};

const NAKSHATRAS_MAP = {
  "Ashwini": "அஸ்வினி",
  "Bharani": "பரணி",
  "Karthigai": "கார்த்திகை",
  "Rohini": "ரோகிணி",
  "Mirugashiradam": "மிருகசீரிடம்",
  "Thiruvadhirai": "திருவாதிரை",
  "Punarpoosam": "புனர்பூசம்",
  "Poosam": "பூசம்",
  "Ayilyam": "ஆயில்யம்",
  "Pooram": "பூரம்",
  "Uthiram": "உத்திரம்",
  "Hastham": "அஸ்தம்",
  "Chithirai": "சித்திரை",
  "Swathi": "சுவாதி",
  "Visagam": "விசாகம்",
  "Anusham": "அनुஷம்",
  "Kettai": "கேட்டை",
  "Moolam": "மூலம்",
  "Pooradam": "பூராடம்",
  "Uthiradam": "உத்திராடம்",
  "Thiruvonam": "திருவோணம்",
  "Avittam": "அவிட்டம்",
  "Sadhayam": "சதயம்",
  "Poorattadhi": "பூரட்டாதி",
  "Uthirattadhi": "உத்திரட்டாதி",
  "Revathi": "ரேவதி"
};

const DAYS_MAP = {
  "Sunday": "ஞாயிற்றுக்கிழமை",
  "Monday": "திங்கட்கிழமை",
  "Tuesday": "செவ்வாய்க்கிழமை",
  "Wednesday": "புதன்கிழமை",
  "Thursday": "வியாழக்கிழமை",
  "Friday": "வெள்ளிக்கிழமை",
  "Saturday": "சனிக்கிழமை"
};

const RULES_MAP = {
  "Festival – Veg Only": "பண்டிகை – சைவ உணவு மட்டும்",
  "Amavasai – Veg Only": "அமாவாசை – சைவ உணவு மட்டும்",
  "Company Rule – Wednesday Non-Veg": "நிறுவன விதி – புதன்கிழமை அசைவ உணவு",
  "Normal Random": "சாதாரண சீரற்ற முறை"
};

const REASONS_MAP = {
  "Amavasai detected. Vegetarian menu selected.": "அமாவாசை கண்டறியப்பட்டது. சைவ உணவு மெனு தேர்ந்தெடுக்கப்பட்டது.",
  "Wednesday detected. Non-Veg menu generated.": "புதன்கிழமை கண்டறியப்பட்டது. அசைவ உணவு மெனு உருவாக்கப்பட்டது.",
  "Normal day. Random menu generated.": "சாதாரண நாள். சீரற்ற மெனு உருவாக்கப்பட்டது."
};

const FESTIVALS_MAP = {
  "Special Festival": "சிறப்பு திருவிழா",
  "Tamil Festival": "தமிழ் பண்டிகை",
  "Deepavali": "தீபாவளி",
  "Pongal": "பொங்கல்",
  "Tamil New Year": "தமிழ்ப்புத்தாண்டு"
};

const CATEGORIES_MAP = {
  "Main Course": "முதன்மை உணவு",
  "Starter": "துவக்க உணவு",
  "Dessert": "இனிப்பு",
  "Beverage": "பானம்",
  "Salad": "சாலட்",
  "Soup": "சূপ",
  "Special": "சிறப்பு உணவு"
};

// Seeded food items fallback map
const SEEDED_FOODS_TA = {
  "Butter Chicken with Garlic Naan": {
    name: "பூண்டு நானுடன் பட்டர் சிக்கன்",
    description: "ஒரு செழுமையான, கிரீமியான, மசாலா தக்காளி வெண்ணெய் குழம்பில் சமைக்கப்பட்ட மென்மையான கோழி இறைச்சி, புதிய தந்தூரி பூண்டு நானுடன் பரிமாறப்படுகிறது."
  },
  "Crispy Grilled Salmon": {
    name: "மொறுமொறுப்பான வறுக்கப்பட்ட சால்மன்",
    description: "எலுமிச்சை-மூலிகை வெண்ணெய் சாஸ் தூவப்பட்டு, வறுத்த அஸ்பாரகஸுடன் பரிமாறப்படும் மொறுமொறுப்பான தோலுடன் கூடிய அட்லாண்டிக் சால்மன் மீன்."
  },
  "Premium Veg Hakka Noodles": {
    name: "பிரீமியம் வெஜ் ஹக்கா நூடுல்ஸ்",
    description: "மொறுமொறுப்பான வண்ணமயமான குடைமிளகாய், முட்டைக்கோஸ், கேரட், வெங்காயத்தாள் மற்றும் சிக்னேச்சர் சோயா-எள் சாஸ் ஆகியவற்றுடன் கிளறி வறுத்த கோதுமை நூடுல்ஸ்."
  },
  "Caesar Salad with Crispy Bacon": {
    name: "மொறுமொறுப்பான பேக்கனுடன் சீசர் சாலட்",
    description: "கிரீமியான சீசர் டிரஸ்ஸிங், பூண்டு க்ரூட்டான்கள், மொறுமொறுப்பான புகைபிடித்த பேக்கன் துண்டுகள் மற்றும் துருவிய பார்மேசன் சீஸ் ஆகியவற்றுடன் கலக்கப்பட்ட புதிய ரோமெய்ன் கீரை."
  },
  "Classic Italian Tiramisu": {
    name: "கிளாசிக் இத்தாலிய டிராமிசு",
    description: "முட்டையின் மஞ்சள் கருக்கள், சர்க்கரை, மஸ்கார்போன் மற்றும் கோகோ தூள் ஆகியவற்றின் கலவையுடன் அடுக்கப்பட்ட மென்மையான எஸ்பிரெசோவில் நனைத்த லேடிஃபிங்கர் பிஸ்கட்."
  },
  "Double Chocolate Lava Cake": {
    name: "டபுள் சாக்லேட் லாவா கேக்",
    description: "பிரீமியம் மடகாஸ்கன் வெண்ணிலா ஐஸ்கிரீமுடன் பரிமாறப்படும் திரவ சாக்லேட் மையத்தைக் கொண்ட சூடான சாக்லேட் ஸ்பாஞ்ச் கேக்."
  },
  "Classic Garlic Butter Garlic Bread": {
    name: "கிளாசிக் பூண்டு வெண்ணெய் பூண்டு ரொட்டி",
    description: "பூண்டு, புதிய பார்ஸ்லி மற்றும் உருகிய உப்பு இல்லாத வெண்ணெய் தடவி, மொஸரெல்லா சீஸ் தூவி வறுக்கப்பட்ட பக்கோடா துண்டுகள்."
  },
  "Spiced Mango Smoothie": {
    name: "மசாலா மாம்பழ ஸ்மூத்தி",
    description: "பழுத்த அல்போன்சோ மாம்பழங்கள், கிரேக்க தயிர், தேன் மற்றும் ஒரு சிட்டிகை ஏலக்காய் தூள் ஆகியவற்றின் கிரீமியான கலவை, குளிராக பரிமாறப்படுகிறது."
  },
  "Creamy Roasted Tomato Soup": {
    name: "கிரீமியான வறுத்த தக்காளி சூப்",
    description: "வறுத்த தக்காளி, பூண்டு, கூடுதல் கன்னி ஆலிவ் எண்ணெய், புதிய துளசி இலைகள் மற்றும் ஒரு துளி கிரீம் கொண்டு தயாரிக்கப்படும் துடிப்பான சூப்."
  },
  "Signature Spicy Chicken Wings": {
    name: "சிக்னேச்சர் காரமான சிக்கன் விங்ஸ்",
    description: "காரமான தேன் ஸ்ரீராச்சா மரினேடில் மெருகூட்டப்பட்டு, கிரீமியான புளூ சீஸ் டிப்புடன் பரிமாறப்படும் வறுத்த கோழி இறக்கைகள்."
  }
};

const translateText = (text, map) => {
  if (!text) return text;
  return map[text] || text;
};

const translateReason = (reason) => {
  if (!reason) return reason;
  if (REASONS_MAP[reason]) return REASONS_MAP[reason];
  
  if (reason.includes("Amavasai detected")) {
    return "🌑 அமாவாசை கண்டறியப்பட்டது. சைவ உணவு மெனு தேர்ந்தெடுக்கப்பட்டது.";
  }
  if (reason.includes("Wednesday detected")) {
    return "🍗 புதன்கிழமை கண்டறியப்பட்டது. அசைவ உணவு மெனு உருவாக்கப்பட்டது.";
  }
  if (reason.includes("Normal day")) {
    return "🎲 சாதாரண நாள். சீரற்ற மெனு உருவாக்கப்பட்டது.";
  }

  // Check festival regex
  const festivalRegex = /🪔\s*(.*?)\s*detected\.\s*Vegetarian\s*menu\s*selected\./i;
  const match = reason.match(festivalRegex);
  if (match) {
    const festName = match[1];
    const translatedFest = translateText(festName, FESTIVALS_MAP);
    return `🪔 ${translatedFest} கண்டறியப்பட்டது. சைவ உணவு மெனு தேர்ந்தெடுக்கப்பட்டது.`;
  }

  return reason;
};

/**
 * Translates a single food item
 */
const translateFood = (food, lang) => {
  if (!food) return food;
  
  // If it's a mongoose doc, convert to object first to prevent read-only issues
  const foodObj = typeof food.toObject === 'function' ? food.toObject() : { ...food };

  if (lang === 'ta') {
    // If the database has Tamil translations, use them
    if (foodObj.name_ta) {
      foodObj.name = foodObj.name_ta;
    } else {
      // Fallback to our seeded foods list
      const seeded = SEEDED_FOODS_TA[foodObj.name];
      if (seeded) foodObj.name = seeded.name;
    }



    foodObj.category = translateText(foodObj.category, CATEGORIES_MAP);
  }

  return foodObj;
};

/**
 * Translates a single calendar snapshot
 */
const translateCalendar = (cal, lang) => {
  if (!cal) return cal;
  const calObj = { ...cal };

  if (lang === 'ta') {
    calObj.tamilMonth = translateText(calObj.tamilMonth, MONTHS_MAP);
    calObj.tithi = translateText(calObj.tithi, TITHIS_MAP);
    calObj.nakshatra = translateText(calObj.nakshatra, NAKSHATRAS_MAP);
    calObj.day = translateText(calObj.day, DAYS_MAP);
    calObj.festivalName = translateText(calObj.festivalName, FESTIVALS_MAP);
  }

  return calObj;
};

/**
 * Translates a single menu item
 */
const translateMenu = (menu, lang) => {
  if (!menu) return menu;
  
  const menuObj = typeof menu.toObject === 'function' ? menu.toObject() : { ...menu };

  if (lang === 'ta') {
    menuObj.ruleApplied = translateText(menuObj.ruleApplied, RULES_MAP);
    
    // Check nested rule if present
    if (menuObj.rule) {
      menuObj.rule.ruleApplied = translateText(menuObj.rule.ruleApplied, RULES_MAP);
      menuObj.rule.reason = translateReason(menuObj.rule.reason);
      menuObj.rule.festivalName = translateText(menuObj.rule.festivalName, FESTIVALS_MAP);
    }
  }

  // Translate populated foodId, vegFoodId, and nonVegFoodId if present
  if (menuObj.foodId) {
    menuObj.foodId = translateFood(menuObj.foodId, lang);
  }
  if (menuObj.vegFoodId) {
    menuObj.vegFoodId = translateFood(menuObj.vegFoodId, lang);
  }
  if (menuObj.nonVegFoodId) {
    menuObj.nonVegFoodId = translateFood(menuObj.nonVegFoodId, lang);
  }

  // Translate tamilCalendarSnapshot if present
  if (menuObj.tamilCalendarSnapshot) {
    menuObj.tamilCalendarSnapshot = translateCalendar(menuObj.tamilCalendarSnapshot, lang);
  }
  if (menuObj.tamilCalendar) {
    menuObj.tamilCalendar = translateCalendar(menuObj.tamilCalendar, lang);
  }

  return menuObj;
};

/**
 * Main entry point to translate any response data based on lang.
 * Identifies the type of data and maps translation accordingly.
 */
export const translateResponse = (data, lang = 'en') => {
  if (!data || (lang !== 'ta' && lang !== 'ta-IN')) {
    // Return original data as is (no translation needed for English or empty lang)
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => translateResponse(item, lang));
  }

  // Handle Menu items (detected by date and status, or ruleApplied)
  if (data.date !== undefined && (data.status !== undefined || data.ruleApplied !== undefined)) {
    return translateMenu(data, lang);
  }

  // Handle Food items (detected by name, category, and description)
  if (data.name !== undefined && data.category !== undefined && data.description !== undefined) {
    return translateFood(data, lang);
  }

  // Handle Tamil Calendar responses (detected by tamilMonth, tithi, etc.)
  if (data.tamilMonth !== undefined || data.tithi !== undefined || data.tamilCalendar !== undefined) {
    const obj = { ...data };
    if (obj.tamilCalendar) {
      obj.tamilCalendar = translateCalendar(obj.tamilCalendar, lang);
    }
    if (obj.rule) {
      obj.rule.ruleApplied = translateText(obj.rule.ruleApplied, RULES_MAP);
      obj.rule.reason = translateReason(obj.rule.reason);
      obj.rule.festivalName = translateText(obj.rule.festivalName, FESTIVALS_MAP);
    }
    return obj;
  }

  // Handle stats object
  if (data.totalFoods !== undefined && data.menusGenerated !== undefined) {
    const statsObj = { ...data };
    if (statsObj.mostGeneratedFood) {
      statsObj.mostGeneratedFood = {
        ...statsObj.mostGeneratedFood,
        name: translateText(statsObj.mostGeneratedFood.name, Object.fromEntries(
          Object.entries(SEEDED_FOODS_TA).map(([en, t]) => [en, t.name])
        )),
        category: translateText(statsObj.mostGeneratedFood.category, CATEGORIES_MAP)
      };
    }
    if (statsObj.categoryStats) {
      statsObj.categoryStats = statsObj.categoryStats.map(item => ({
        ...item,
        name: translateText(item.name, CATEGORIES_MAP)
      }));
    }
    if (statsObj.weeklyStats) {
      statsObj.weeklyStats = statsObj.weeklyStats.map(item => ({
        ...item,
        food: translateText(item.food, Object.fromEntries(
          Object.entries(SEEDED_FOODS_TA).map(([en, t]) => [en, t.name])
        ))
      }));
    }
    return statsObj;
  }

  return data;
};
