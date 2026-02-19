import { ref, watch } from 'vue';

export interface WeatherData {
  location: {
    name: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_kph: number;
    humidity: number;
    feelslike_c: number;
    feelslike_f: number;
    uv: number;
    air_quality: {
      'us-epa-index': number;
    };
  };
  forecast: {
    forecastday: ForecastDay[];
  };
  alerts: {
    alert: Alert[];
  };
}

export interface ForecastDay {
  date: string;
  day: {
    avgtemp_c: number;
    avgtemp_f: number;
    maxtemp_c: number;
    mintemp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    uv: number;
  };
  hour: HourForecast[];
}

export interface HourForecast {
  time: string;
  temp_c: number;
  temp_f: number;
  condition: {
    text: string;
    icon: string;
  };
}

export interface Alert {
  headline: string;
  severity: string;
  event: string;
}

const STORAGE_KEYS = {
  RECENT: 'weather_recent_searches',
  FAVORITES: 'weather_favorites',
  DARK_MODE: 'weather_dark_mode',
  UNIT: 'weather_unit',
};

const MAX_RECENT = 5;
const MAX_FAVORITES = 5;

export function useWeather() {
  const weatherData = ref<WeatherData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const recentSearches = ref<string[]>([]);
  const favorites = ref<string[]>([]);
  const isDarkMode = ref(false);
  const useCelsius = ref(true);

  const loadFromStorage = () => {
    if (typeof window === 'undefined') return;

    try {
      const recent = localStorage.getItem(STORAGE_KEYS.RECENT);
      if (recent) recentSearches.value = JSON.parse(recent);

      const favs = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (favs) favorites.value = JSON.parse(favs);

      const dark = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (dark) isDarkMode.value = dark === 'true';

      const unit = localStorage.getItem(STORAGE_KEYS.UNIT);
      if (unit) useCelsius.value = unit === 'celsius';
    } catch (e) {
      console.error('Failed to load from storage:', e);
    }
  };

  const saveRecent = (query: string) => {
    const filtered = recentSearches.value.filter((s) => s.toLowerCase() !== query.toLowerCase());
    recentSearches.value = [query, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(recentSearches.value));
  };

  const removeRecent = (query: string) => {
    recentSearches.value = recentSearches.value.filter((s) => s !== query);
    localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(recentSearches.value));
  };

  const toggleFavorite = (query: string) => {
    if (favorites.value.includes(query)) {
      favorites.value = favorites.value.filter((f) => f !== query);
    } else if (favorites.value.length < MAX_FAVORITES) {
      favorites.value = [...favorites.value, query];
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites.value));
  };

  const isFavorite = (query: string) => favorites.value.includes(query);

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(isDarkMode.value));
    document.documentElement.classList.toggle('dark', isDarkMode.value);
  };

  const toggleUnit = () => {
    useCelsius.value = !useCelsius.value;
    localStorage.setItem(STORAGE_KEYS.UNIT, useCelsius.value ? 'celsius' : 'fahrenheit');
  };

  const fetchWeather = async (query: string) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch weather');
      }

      weatherData.value = data;
      saveRecent(query);
    } catch (err: any) {
      error.value = err.message;
      weatherData.value = null;
    } finally {
      loading.value = false;
    }
  };

  watch(isDarkMode, (dark) => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', dark);
    }
  });

  return {
    weatherData,
    loading,
    error,
    recentSearches,
    favorites,
    isDarkMode,
    useCelsius,
    loadFromStorage,
    removeRecent,
    toggleFavorite,
    isFavorite,
    toggleDarkMode,
    toggleUnit,
    fetchWeather,
  };
}
