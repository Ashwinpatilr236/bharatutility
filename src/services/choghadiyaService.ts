export interface CityConfig {
  name: string;
  hindi_name: string;
  state: string;
  lat: number;
  lng: number;
}

export const INDIAN_CITIES: { [key: string]: CityConfig } = {
  'delhi': { name: 'New Delhi', hindi_name: 'नई दिल्ली', state: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
  'mumbai': { name: 'Mumbai', hindi_name: 'मुंबई', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  'bengaluru': { name: 'Bengaluru', hindi_name: 'बेंगलुरु', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  'kolkata': { name: 'Kolkata', hindi_name: 'कोलकाता', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  'chennai': { name: 'Chennai', hindi_name: 'चेन्नई', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  'hyderabad': { name: 'Hyderabad', hindi_name: 'हैदराबाद', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  'ahmedabad': { name: 'Ahmedabad', hindi_name: 'अहमदाबाद', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  'pune': { name: 'Pune', hindi_name: 'पुणे', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  'jaipur': { name: 'Jaipur', hindi_name: 'जयपुर', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  'lucknow': { name: 'Lucknow', hindi_name: 'लखनऊ', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  'patna': { name: 'Patna', hindi_name: 'पटना', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
  'varanasi': { name: 'Varanasi', hindi_name: 'वाराणसी', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
  'ujjain': { name: 'Ujjain', hindi_name: 'उज्जैन', state: 'Madhya Pradesh', lat: 23.1765, lng: 75.7885 },
  'surat': { name: 'Surat', hindi_name: 'सूरत', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
  'indore': { name: 'Indore', hindi_name: 'इंदौर', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
  'chandigarh': { name: 'Chandigarh', hindi_name: 'चंडीगढ़', state: 'Punjab/Haryana', lat: 30.7333, lng: 76.7794 },
  'bhopal': { name: 'Bhopal', hindi_name: 'भोपाल', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
  'guwahati': { name: 'Guwahati', hindi_name: 'गुवाहाटी', state: 'Assam', lat: 26.1445, lng: 91.7362 },
  'bhubaneswar': { name: 'Bhubaneswar', hindi_name: 'भुवनेश्वर', state: 'Odisha', lat: 20.2961, lng: 85.8245 },
  'ranchi': { name: 'Ranchi', hindi_name: 'राँची', state: 'Jharkhand', lat: 23.3441, lng: 85.3096 }
};

export type ChoghadiyaType = 'amrit' | 'shubh' | 'labh' | 'char' | 'rog' | 'kaal' | 'udveg';

export interface ChoghadiyaSlot {
  index: number;
  name: string;
  hindi: string;
  type: ChoghadiyaType;
  quality: 'Excellent (अमृत)' | 'Good (शुभ)' | 'Gain (लाभ)' | 'Neutral / Dynamic (चर)' | 'Disease (रोग)' | 'Loss (काल)' | 'Anxiety (उद्वेग)';
  nature: 'shubh' | 'ashubh' | 'neutral';
  startTimeStr: string;
  endTimeStr: string;
  startMinutes: number;
  endMinutes: number;
  isCurrent: boolean;
  description: string;
}

export interface ChoghadiyaResult {
  dateStr: string;
  cityName: string;
  cityState: string;
  dayOfWeek: string;
  dayOfWeekHindi: string;
  sunrise: string;
  sunset: string;
  nextSunrise: string;
  dayLength: string;
  nightLength: string;
  dayChoghadiya: ChoghadiyaSlot[];
  nightChoghadiya: ChoghadiyaSlot[];
  currentSlot: ChoghadiyaSlot | null;
  currentPeriod: 'day' | 'night';
  rahuKaal: string;
  yamaganda: string;
  gulikaKaal: string;
  abhijitMuhurat: string;
  brahmaMuhurta: string;
  godhuliMuhurat: string;
  vijayaMuhurat: string;
  amritKaalam: string;
  tithi: string;
  nakshatra: string;
  paksha: string;
}

// 7 Choghadiyas cycling sequences based on day lord
// Day order: Sun(0), Mon(1), Tue(2), Wed(3), Thu(4), Fri(5), Sat(6)
const DAY_CHOGHADIYA_ORDER: ChoghadiyaType[][] = [
  // Sunday (Ravivara - Sun): Udveg, Char, Labh, Amrit, Kaal, Shubh, Rog, Udveg
  ['udveg', 'char', 'labh', 'amrit', 'kaal', 'shubh', 'rog', 'udveg'],
  // Monday (Somavara - Moon): Amrit, Kaal, Shubh, Rog, Udveg, Char, Labh, Amrit
  ['amrit', 'kaal', 'shubh', 'rog', 'udveg', 'char', 'labh', 'amrit'],
  // Tuesday (Mangalavara - Mars): Rog, Udveg, Char, Labh, Amrit, Kaal, Shubh, Rog
  ['rog', 'udveg', 'char', 'labh', 'amrit', 'kaal', 'shubh', 'rog'],
  // Wednesday (Budhavara - Mercury): Labh, Amrit, Kaal, Shubh, Rog, Udveg, Char, Labh
  ['labh', 'amrit', 'kaal', 'shubh', 'rog', 'udveg', 'char', 'labh'],
  // Thursday (Guruvara - Jupiter): Shubh, Rog, Udveg, Char, Labh, Amrit, Kaal, Shubh
  ['shubh', 'rog', 'udveg', 'char', 'labh', 'amrit', 'kaal', 'shubh'],
  // Friday (Shukravara - Venus): Char, Labh, Amrit, Kaal, Shubh, Rog, Udveg, Char
  ['char', 'labh', 'amrit', 'kaal', 'shubh', 'rog', 'udveg', 'char'],
  // Saturday (Shanivara - Saturn): Kaal, Shubh, Rog, Udveg, Char, Labh, Amrit, Kaal
  ['kaal', 'shubh', 'rog', 'udveg', 'char', 'labh', 'amrit', 'kaal']
];

const NIGHT_CHOGHADIYA_ORDER: ChoghadiyaType[][] = [
  // Sunday Night: Shubh, Amrit, Char, Rog, Kaal, Labh, Udveg, Shubh
  ['shubh', 'amrit', 'char', 'rog', 'kaal', 'labh', 'udveg', 'shubh'],
  // Monday Night: Char, Rog, Kaal, Labh, Udveg, Shubh, Amrit, Char
  ['char', 'rog', 'kaal', 'labh', 'udveg', 'shubh', 'amrit', 'char'],
  // Tuesday Night: Kaal, Labh, Udveg, Shubh, Amrit, Char, Rog, Kaal
  ['kaal', 'labh', 'udveg', 'shubh', 'amrit', 'char', 'rog', 'kaal'],
  // Wednesday Night: Udveg, Shubh, Amrit, Char, Rog, Kaal, Labh, Udveg
  ['udveg', 'shubh', 'amrit', 'char', 'rog', 'kaal', 'labh', 'udveg'],
  // Thursday Night: Amrit, Char, Rog, Kaal, Labh, Udveg, Shubh, Amrit
  ['amrit', 'char', 'rog', 'kaal', 'labh', 'udveg', 'shubh', 'amrit'],
  // Friday Night: Rog, Kaal, Labh, Udveg, Shubh, Amrit, Char, Rog
  ['rog', 'kaal', 'labh', 'udveg', 'shubh', 'amrit', 'char', 'rog'],
  // Saturday Night: Labh, Udveg, Shubh, Amrit, Char, Rog, Kaal, Labh
  ['labh', 'udveg', 'shubh', 'amrit', 'char', 'rog', 'kaal', 'labh']
];

const CHOGHADIYA_META: Record<ChoghadiyaType, {
  name: string;
  hindi: string;
  quality: 'Excellent (अमृत)' | 'Good (शुभ)' | 'Gain (लाभ)' | 'Neutral / Dynamic (चर)' | 'Disease (रोग)' | 'Loss (काल)' | 'Anxiety (उद्वेग)';
  nature: 'shubh' | 'ashubh' | 'neutral';
  description: string;
}> = {
  amrit: {
    name: 'Amrit',
    hindi: 'अमृत',
    quality: 'Excellent (अमृत)',
    nature: 'shubh',
    description: 'Supreme auspicious time. Ideal for starting prayers, financial investments, purchasing gold/property, and medical treatments.'
  },
  shubh: {
    name: 'Shubh',
    hindi: 'शुभ',
    quality: 'Good (शुभ)',
    nature: 'shubh',
    description: 'Auspicious period ruled by Jupiter. Best for religious ceremonies, marriages, starting education, and new projects.'
  },
  labh: {
    name: 'Labh',
    hindi: 'लाभ',
    quality: 'Gain (लाभ)',
    nature: 'shubh',
    description: 'Period of profits and commercial gains. Best for opening new businesses, signing trade deals, and shop openings.'
  },
  char: {
    name: 'Char',
    hindi: 'चर',
    quality: 'Neutral / Dynamic (चर)',
    nature: 'neutral',
    description: 'Dynamic / movable period. Best for commencing travel, vehicle journeys, sports, and outdoor activities.'
  },
  rog: {
    name: 'Rog',
    hindi: 'रोग',
    quality: 'Disease (रोग)',
    nature: 'ashubh',
    description: 'Inauspicious time causing delays or sickness. Avoid undertaking new endeavors, signing documents, or taking loans.'
  },
  kaal: {
    name: 'Kaal',
    hindi: 'काल',
    quality: 'Loss (काल)',
    nature: 'ashubh',
    description: 'Harmful period ruled by Saturn. Strictly avoid major financial transactions, starting travel, or auspicious rituals.'
  },
  udveg: {
    name: 'Udveg',
    hindi: 'उद्वेग',
    quality: 'Anxiety (उद्वेग)',
    nature: 'ashubh',
    description: 'Sun-governed turbulent period causing tension. Postpone critical meetings and property purchases.'
  }
};

const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

const TITHIS_LIST = [
  'Pratipada (प्रतिपदा)', 'Dwitiya (द्वितीया)', 'Tritiya (तृतीया)', 'Chaturthi (चतुर्थी)', 'Panchami (पंचमी)',
  'Shashthi (षष्ठी)', 'Saptami (सप्तमी)', 'Ashtami (अष्टमी)', 'Navami (नवमी)', 'Dashami (दशमी)',
  'Ekadashi (एकादशी)', 'Dwadashi (द्वादशी)', 'Trayodashi (त्रयोदशी)', 'Chaturdashi (चतुर्दशी)', 'Purnima / Amavasya'
];

const NAKSHATRAS_LIST = [
  'Ashwini (अश्विनी)', 'Bharani (भरणी)', 'Krittika (कृत्तिका)', 'Rohini (रोहिणी)', 'Mrigashirsha (मृगशीर्षा)',
  'Ardra (आर्द्रा)', 'Punarvasu (पुनर्वसु)', 'Pushya (पुष्य)', 'Ashlesha (आश्लेषा)', 'Magha (मघा)',
  'Purva Phalguni (पूर्वाफाल्गुनी)', 'Uttara Phalguni (उत्तराफाल्गुनी)', 'Hasta (हस्त)', 'Chitra (चित्रा)',
  'Swati (स्वाती)', 'Vishakha (विशाखा)', 'Anuradha (अनुराधा)', 'Jyeshtha (ज्येष्ठा)', 'Mula (मूल)',
  'Purva Ashadha (पूर्वाषाढ़ा)', 'Uttara Ashadha (उत्तराषाढ़ा)', 'Shravana (श्रवण)', 'Dhanishta (धनिष्ठा)',
  'Shatabhisha (शतभिषा)', 'Purva Bhadrapada (पूर्वाभाद्रपद)', 'Uttara Bhadrapada (उत्तराभाद्रपद)', 'Revati (रेवती)'
];

function formatMinutesToTimeStr(totalMinutes: number): string {
  let normalized = Math.round(totalMinutes) % 1440;
  if (normalized < 0) normalized += 1440;
  const hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(hours12)}:${pad(mins)} ${period}`;
}

export function calculateChoghadiya(
  cityKey: string = 'delhi',
  targetDate: Date = new Date(),
  nowDate: Date = new Date()
): ChoghadiyaResult {
  const city = INDIAN_CITIES[cityKey] || INDIAN_CITIES['delhi'];
  const dayOfWeekIdx = targetDate.getDay();

  // Longitude time correction relative to IST standard meridian (82.5° E)
  // 4 minutes per degree longitude
  const lngShiftMinutes = Math.round((city.lng - 82.5) * 4);

  // Approximate seasonal solar declination shift based on day of year
  const startOfYear = new Date(targetDate.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((targetDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const declination = 23.44 * Math.sin(((dayOfYear - 80) * 2 * Math.PI) / 365);
  const latRad = (city.lat * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;
  const hourAngleCos = -Math.tan(latRad) * Math.tan(decRad);
  const clampedCos = Math.max(-1, Math.min(1, hourAngleCos));
  const hourAngleDeg = (Math.acos(clampedCos) * 180) / Math.PI;
  const halfDayMinutes = (hourAngleDeg / 15) * 60;

  // Local solar noon in IST minutes (12:00 PM is 720 minutes - longitude shift)
  const solarNoonMinutes = 720 - lngShiftMinutes;
  const sunriseMinutes = solarNoonMinutes - halfDayMinutes;
  const sunsetMinutes = solarNoonMinutes + halfDayMinutes;
  const nextSunriseMinutes = sunriseMinutes + 1440;

  const dayDuration = sunsetMinutes - sunriseMinutes;
  const nightDuration = nextSunriseMinutes - sunsetMinutes;
  const daySlotDuration = dayDuration / 8;
  const nightSlotDuration = nightDuration / 8;

  // Current time in minutes of the target day
  const isSameDay = targetDate.toDateString() === nowDate.toDateString();
  const currentMinutes = isSameDay ? nowDate.getHours() * 60 + nowDate.getMinutes() : -1;

  // Calculate Day Choghadiyas
  const dayOrder = DAY_CHOGHADIYA_ORDER[dayOfWeekIdx];
  const dayChoghadiya: ChoghadiyaSlot[] = dayOrder.map((type, idx) => {
    const startM = sunriseMinutes + idx * daySlotDuration;
    const endM = sunriseMinutes + (idx + 1) * daySlotDuration;
    const isCurrent = isSameDay && currentMinutes >= startM && currentMinutes < endM;
    const meta = CHOGHADIYA_META[type];
    return {
      index: idx + 1,
      name: meta.name,
      hindi: meta.hindi,
      type,
      quality: meta.quality,
      nature: meta.nature,
      startTimeStr: formatMinutesToTimeStr(startM),
      endTimeStr: formatMinutesToTimeStr(endM),
      startMinutes: Math.round(startM),
      endMinutes: Math.round(endM),
      isCurrent,
      description: meta.description
    };
  });

  // Calculate Night Choghadiyas
  const nightOrder = NIGHT_CHOGHADIYA_ORDER[dayOfWeekIdx];
  const nightChoghadiya: ChoghadiyaSlot[] = nightOrder.map((type, idx) => {
    const startM = sunsetMinutes + idx * nightSlotDuration;
    const endM = sunsetMinutes + (idx + 1) * nightSlotDuration;
    const isCurrent = isSameDay && (
      (currentMinutes >= startM && currentMinutes < Math.min(endM, 1440)) ||
      (currentMinutes < (endM - 1440) && startM >= 1440)
    );
    const meta = CHOGHADIYA_META[type];
    return {
      index: idx + 1,
      name: meta.name,
      hindi: meta.hindi,
      type,
      quality: meta.quality,
      nature: meta.nature,
      startTimeStr: formatMinutesToTimeStr(startM),
      endTimeStr: formatMinutesToTimeStr(endM),
      startMinutes: Math.round(startM),
      endMinutes: Math.round(endM),
      isCurrent,
      description: meta.description
    };
  });

  let currentSlot: ChoghadiyaSlot | null = null;
  let currentPeriod: 'day' | 'night' = 'day';

  if (isSameDay) {
    const activeDay = dayChoghadiya.find((s) => s.isCurrent);
    const activeNight = nightChoghadiya.find((s) => s.isCurrent);
    if (activeDay) {
      currentSlot = activeDay;
      currentPeriod = 'day';
    } else if (activeNight) {
      currentSlot = activeNight;
      currentPeriod = 'night';
    }
  }

  // Astrological Muhurat Windows based on proportional daylight division (Muhurta = dayDuration / 15)
  const muhurtaMinutes = dayDuration / 15;
  // Abhijit is the 8th Muhurta (centred on Solar Noon)
  const abhijitStart = solarNoonMinutes - muhurtaMinutes / 2;
  const abhijitEnd = solarNoonMinutes + muhurtaMinutes / 2;

  // Rahu Kaal by 1/8th of daytime based on weekday
  const rahuRatios = [8, 2, 7, 5, 6, 4, 3]; // 1-indexed slot
  const rahuSlotIdx = rahuRatios[dayOfWeekIdx] - 1;
  const rahuStart = sunriseMinutes + rahuSlotIdx * daySlotDuration;
  const rahuEnd = sunriseMinutes + (rahuSlotIdx + 1) * daySlotDuration;

  // Yamaganda by weekday
  const yamaRatios = [5, 4, 3, 2, 1, 7, 6];
  const yamaSlotIdx = yamaRatios[dayOfWeekIdx] - 1;
  const yamaStart = sunriseMinutes + yamaSlotIdx * daySlotDuration;
  const yamaEnd = sunriseMinutes + (yamaSlotIdx + 1) * daySlotDuration;

  // Gulika Kaal by weekday
  const gulikaRatios = [7, 6, 5, 4, 3, 2, 1];
  const gulikaSlotIdx = gulikaRatios[dayOfWeekIdx] - 1;
  const gulikaStart = sunriseMinutes + gulikaSlotIdx * daySlotDuration;
  const gulikaEnd = sunriseMinutes + (gulikaSlotIdx + 1) * daySlotDuration;

  // Brahma Muhurta (2 Muhurtas before sunrise, approx 96 min to 48 min before sunrise)
  const brahmaStart = sunriseMinutes - 96;
  const brahmaEnd = sunriseMinutes - 48;

  // Godhuli (approx 24 minutes surrounding sunset)
  const godhuliStart = sunsetMinutes - 12;
  const godhuliEnd = sunsetMinutes + 12;

  // Vijaya Muhurat (11th Muhurta)
  const vijayaStart = sunriseMinutes + 10 * muhurtaMinutes;
  const vijayaEnd = sunriseMinutes + 11 * muhurtaMinutes;

  // Amrit Kaalam (Fruitful midday window)
  const amritStart = sunriseMinutes + 3 * muhurtaMinutes;
  const amritEnd = sunriseMinutes + 4.5 * muhurtaMinutes;

  // Tithi & Nakshatra approximations
  const tithiIdx = (dayOfYear + 4) % 15;
  const isShukla = ((dayOfYear + 2) % 30) < 15;
  const paksha = isShukla ? 'Shukla Paksha (शुक्ल पक्ष)' : 'Krishna Paksha (कृष्ण पक्ष)';
  const tithiName = tithiIdx === 14 ? (isShukla ? 'Purnima (पूर्णिमा)' : 'Amavasya (अमावस्या)') : TITHIS_LIST[tithiIdx];
  const nakshatraIdx = (dayOfYear + 7) % 27;
  const nakshatra = NAKSHATRAS_LIST[nakshatraIdx];

  const dayHours = Math.floor(dayDuration / 60);
  const dayMins = Math.round(dayDuration % 60);
  const nightHours = Math.floor(nightDuration / 60);
  const nightMins = Math.round(nightDuration % 60);

  return {
    dateStr: targetDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    cityName: city.name,
    cityState: city.state,
    dayOfWeek: DAY_NAMES_EN[dayOfWeekIdx],
    dayOfWeekHindi: DAY_NAMES_HI[dayOfWeekIdx],
    sunrise: formatMinutesToTimeStr(sunriseMinutes),
    sunset: formatMinutesToTimeStr(sunsetMinutes),
    nextSunrise: formatMinutesToTimeStr(nextSunriseMinutes),
    dayLength: `${dayHours} hrs ${dayMins} mins`,
    nightLength: `${nightHours} hrs ${nightMins} mins`,
    dayChoghadiya,
    nightChoghadiya,
    currentSlot,
    currentPeriod,
    rahuKaal: `${formatMinutesToTimeStr(rahuStart)} - ${formatMinutesToTimeStr(rahuEnd)}`,
    yamaganda: `${formatMinutesToTimeStr(yamaStart)} - ${formatMinutesToTimeStr(yamaEnd)}`,
    gulikaKaal: `${formatMinutesToTimeStr(gulikaStart)} - ${formatMinutesToTimeStr(gulikaEnd)}`,
    abhijitMuhurat: `${formatMinutesToTimeStr(abhijitStart)} - ${formatMinutesToTimeStr(abhijitEnd)}`,
    brahmaMuhurta: `${formatMinutesToTimeStr(brahmaStart)} - ${formatMinutesToTimeStr(brahmaEnd)}`,
    godhuliMuhurat: `${formatMinutesToTimeStr(godhuliStart)} - ${formatMinutesToTimeStr(godhuliEnd)}`,
    vijayaMuhurat: `${formatMinutesToTimeStr(vijayaStart)} - ${formatMinutesToTimeStr(vijayaEnd)}`,
    amritKaalam: `${formatMinutesToTimeStr(amritStart)} - ${formatMinutesToTimeStr(amritEnd)}`,
    tithi: `${tithiName} (${paksha})`,
    nakshatra,
    paksha
  };
}
