import React, { useState, useEffect } from 'react';
import { Wind, Sun, CloudRain, Droplets, MapPin, RefreshCw, AlertTriangle, ShieldCheck, Thermometer, Compass } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CityCoord {
  name: string;
  state: string;
  lat: number;
  lon: number;
}

const TOP_INDIAN_CITIES: CityCoord[] = [
  { name: 'Delhi NCR', state: 'Delhi', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
  { name: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376 },
  { name: 'Chandigarh', state: 'Punjab/Haryana', lat: 30.7333, lon: 76.7794 },
  { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
  { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739 },
  { name: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311 },
  { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
  { name: 'Guwahati', state: 'Assam', lat: 26.1445, lon: 91.7362 },
  { name: 'Kochi', state: 'Kerala', lat: 9.9312, lon: 76.2673 },
];

export const AqiAndWeatherSuite: React.FC = () => {
  const { showToast } = useApp();
  const [selectedCity, setSelectedCity] = useState<CityCoord>(TOP_INDIAN_CITIES[0]);
  const [aqiData, setAqiData] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchCityData = async (city: CityCoord) => {
    setLoading(true);
    try {
      // 1. Fetch Air Quality from Open-Meteo (Zero Auth Open API)
      const aqiRes = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone`
      );
      const aqiJson = await aqiRes.json();
      setAqiData(aqiJson.current || null);

      // 2. Fetch Weather & Temperature
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata`
      );
      const weatherJson = await weatherRes.json();
      setWeatherData(weatherJson || null);
    } catch (err) {
      showToast('Could not refresh live meteorological data. Showing fallback snapshot.', 'info');
      // Offline fallback snapshot
      setAqiData({
        european_aqi: 65,
        pm2_5: 38.4,
        pm10: 72.1,
        nitrogen_dioxide: 22.0,
        ozone: 45.0
      });
      setWeatherData({
        current: {
          temperature_2m: 31.5,
          relative_humidity_2m: 54,
          apparent_temperature: 34.2,
          wind_speed_10m: 11.2
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCityData(selectedCity);
  }, [selectedCity]);

  // Compute Indian CPCB Category based on PM2.5 (ug/m3)
  const getAqiCategory = (pm25: number) => {
    if (pm25 <= 30) {
      return {
        label: 'Good',
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
        advice: 'Air quality is satisfactory. Minimal to no health risk for outdoor activities.',
        icon: ShieldCheck
      };
    } else if (pm25 <= 60) {
      return {
        label: 'Satisfactory',
        color: 'text-green-500 bg-green-500/10 border-green-500/30',
        advice: 'Minor breathing discomfort to sensitive people with asthma or lung conditions.',
        icon: ShieldCheck
      };
    } else if (pm25 <= 90) {
      return {
        label: 'Moderate',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
        advice: 'Breathing discomfort to people with lungs, asthma, and heart diseases.',
        icon: AlertTriangle
      };
    } else if (pm25 <= 120) {
      return {
        label: 'Poor',
        color: 'text-orange-500 bg-orange-500/10 border-orange-500/30',
        advice: 'Breathing discomfort to most people on prolonged exposure. Wear N95 mask.',
        icon: AlertTriangle
      };
    } else if (pm25 <= 250) {
      return {
        label: 'Very Poor',
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
        advice: 'Respiratory illness on prolonged exposure. Avoid strenuous outdoor workouts.',
        icon: AlertTriangle
      };
    } else {
      return {
        label: 'Severe',
        color: 'text-purple-600 bg-purple-500/10 border-purple-500/30',
        advice: 'Hazardous air quality. Affects healthy people and seriously impacts those with existing diseases.',
        icon: AlertTriangle
      };
    }
  };

  const pm25Value = aqiData?.pm2_5 || 45;
  const aqiInfo = getAqiCategory(pm25Value);

  const filteredCities = TOP_INDIAN_CITIES.filter(
    c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Selector and Live City Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-1">
              <Wind className="w-3.5 h-3.5" />
              <span>Real-Time Indian Air Quality & Weather API</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white font-display">
              Live AQI & Weather Monitor
            </h2>
          </div>

          <button
            onClick={() => fetchCityData(selectedCity)}
            disabled={loading}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-accent font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-accent' : ''}`} />
            <span>Update Now</span>
          </button>
        </div>

        {/* City Quick Pills */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
            Select Indian City / District:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {TOP_INDIAN_CITIES.slice(0, 10).map(city => (
              <button
                key={city.name}
                onClick={() => setSelectedCity(city)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border cursor-pointer ${
                  selectedCity.name === city.name
                    ? 'bg-accent text-white border-accent shadow-xs'
                    : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-accent/40'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live Metrics Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Main AQI Status Card */}
          <div className={`p-6 rounded-3xl border-2 ${aqiInfo.color} flex flex-col justify-between space-y-4`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">Air Quality (AQI)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-extrabold border bg-white/50 dark:bg-black/30">
                  {aqiInfo.label}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold font-mono tracking-tight">
                  {Math.round(pm25Value)}
                </span>
                <span className="text-xs font-semibold opacity-75">µg/m³ (PM2.5)</span>
              </div>
            </div>

            <p className="text-xs leading-relaxed opacity-90 border-t border-current/20 pt-3">
              {aqiInfo.advice}
            </p>
          </div>

          {/* Current Weather Card */}
          <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
                <span>Temperature & Condition</span>
                <MapPin className="w-4 h-4 text-accent" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold font-mono text-neutral-900 dark:text-white">
                  {weatherData?.current?.temperature_2m ?? '31'}°C
                </span>
                <span className="text-xs text-neutral-500 font-semibold">
                  Feels like {weatherData?.current?.apparent_temperature ?? '34'}°C
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-neutral-200/60 dark:border-neutral-700/60 pt-3">
              <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span>Humidity: {weatherData?.current?.relative_humidity_2m ?? '50'}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                <Wind className="w-3.5 h-3.5 text-teal-500" />
                <span>Wind: {weatherData?.current?.wind_speed_10m ?? '12'} km/h</span>
              </div>
            </div>
          </div>

          {/* Pollutant Breakdown Grid */}
          <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
              Key Pollutant Levels
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-400 block text-[10px] uppercase font-bold">PM10 (Dust)</span>
                <span className="text-sm font-bold font-mono text-neutral-900 dark:text-white">
                  {aqiData?.pm10 ?? 72} µg/m³
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-400 block text-[10px] uppercase font-bold">NO2 (Traffic)</span>
                <span className="text-sm font-bold font-mono text-neutral-900 dark:text-white">
                  {aqiData?.nitrogen_dioxide ?? 24} µg/m³
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-400 block text-[10px] uppercase font-bold">Ozone (O3)</span>
                <span className="text-sm font-bold font-mono text-neutral-900 dark:text-white">
                  {aqiData?.ozone ?? 45} µg/m³
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-400 block text-[10px] uppercase font-bold">Carbon (CO)</span>
                <span className="text-sm font-bold font-mono text-neutral-900 dark:text-white">
                  {aqiData?.carbon_monoxide ?? 320} µg/m³
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Indian CPCB Air Quality Index Scale Reference */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            CPCB Air Quality Scale Guidelines (India)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <span className="font-bold block">Good</span>
              <span className="text-[10px] opacity-80">0 - 30 PM2.5</span>
            </div>
            <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400">
              <span className="font-bold block">Satisfactory</span>
              <span className="text-[10px] opacity-80">31 - 60 PM2.5</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <span className="font-bold block">Moderate</span>
              <span className="text-[10px] opacity-80">61 - 90 PM2.5</span>
            </div>
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
              <span className="font-bold block">Poor</span>
              <span className="text-[10px] opacity-80">91 - 120 PM2.5</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
              <span className="font-bold block">Very Poor</span>
              <span className="text-[10px] opacity-80">121 - 250 PM2.5</span>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
              <span className="font-bold block">Severe</span>
              <span className="text-[10px] opacity-80">250+ PM2.5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
