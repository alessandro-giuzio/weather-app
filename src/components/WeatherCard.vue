<template>
  <div v-if="weather" class="space-y-6">
    <div
      class="max-w-md w-full mx-auto bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-lg p-4 sm:p-6 text-center backdrop-blur-sm animate-fade-in-up"
    >
      <div class="flex justify-between items-start">
        <div class="text-left">
          <h2 class="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
            {{ weather.location.name }}
          </h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ weather.location.country }}</p>
        </div>
        <button
          @click="$emit('toggle-favorite')"
          class="text-2xl transition-transform hover:scale-110"
          :title="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
          :aria-label="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
        >
          {{ isFavorite ? '⭐' : '☆' }}
        </button>
      </div>

      <div class="my-6">
        <p class="text-5xl sm:text-6xl font-bold text-slate-800 dark:text-slate-100">
          {{ useCelsius ? weather.current.temp_c : weather.current.temp_f }}°
        </p>
        <p class="text-sky-500 dark:text-sky-400 capitalize mt-1">
          {{ weather.current.condition.text }}
        </p>
      </div>

      <div class="w-20 h-20 mx-auto bg-sky-200 dark:bg-sky-700 rounded-full flex items-center justify-center animate-float">
        <img
          :src="weather.current.condition.icon"
          :alt="weather.current.condition.text"
          class="w-14 h-14"
          aria-hidden="true"
        />
      </div>

      <div class="grid grid-cols-2 gap-4 mt-6 text-sm">
        <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
          <p class="text-slate-500 dark:text-slate-400">Feels Like</p>
          <p class="font-semibold text-slate-700 dark:text-slate-200">
            {{ useCelsius ? weather.current.feelslike_c : weather.current.feelslike_f }}°
          </p>
        </div>
        <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
          <p class="text-slate-500 dark:text-slate-400">Humidity</p>
          <p class="font-semibold text-slate-700 dark:text-slate-200">{{ weather.current.humidity }}%</p>
        </div>
        <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
          <p class="text-slate-500 dark:text-slate-400">Wind</p>
          <p class="font-semibold text-slate-700 dark:text-slate-200">{{ weather.current.wind_kph }} km/h</p>
        </div>
        <div class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
          <p class="text-slate-500 dark:text-slate-400">UV Index</p>
          <p class="font-semibold" :class="uvColor">{{ weather.current.uv }}</p>
        </div>
      </div>

      <div v-if="weather.current.air_quality" class="mt-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
        <p class="text-slate-500 dark:text-slate-400 text-sm">Air Quality (US EPA)</p>
        <p class="font-semibold text-slate-700 dark:text-slate-200">{{ aqiLabel }}</p>
      </div>
    </div>

    <div v-if="weather.forecast.forecastday[0]?.astro" class="max-w-md mx-auto">
      <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 text-center">Sun & Moon</h3>
      <div class="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 backdrop-blur">
        <div class="grid grid-cols-2 gap-4 text-center">
          <div>
            <p class="text-2xl mb-1">🌅</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">Sunrise</p>
            <p class="font-semibold text-slate-700 dark:text-slate-200">{{ weather.forecast.forecastday[0].astro.sunrise }}</p>
          </div>
          <div>
            <p class="text-2xl mb-1">🌇</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">Sunset</p>
            <p class="font-semibold text-slate-700 dark:text-slate-200">{{ weather.forecast.forecastday[0].astro.sunset }}</p>
          </div>
          <div>
            <p class="text-2xl mb-1">🌙</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">Moon Phase</p>
            <p class="font-semibold text-slate-700 dark:text-slate-200">{{ weather.forecast.forecastday[0].astro.moon_phase }}</p>
          </div>
          <div>
            <p class="text-2xl mb-1">🌤️</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">Moon Illumination</p>
            <p class="font-semibold text-slate-700 dark:text-slate-200">{{ weather.forecast.forecastday[0].astro.moon_illumination }}%</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="weather.alerts?.alert?.length" class="max-w-md mx-auto space-y-2">
      <div
        v-for="(alert, index) in weather.alerts.alert"
        :key="index"
        class="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-4"
      >
        <div class="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <span class="text-xl">⚠️</span>
          <h3 class="font-semibold">{{ alert.event || alert.headline }}</h3>
        </div>
        <p class="text-sm text-amber-600 dark:text-amber-300 mt-1">{{ alert.headline }}</p>
      </div>
    </div>

    <div v-if="weather.forecast.forecastday[0]?.hour?.length" class="max-w-md mx-auto">
      <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 text-center">Hourly Forecast</h3>
      <div class="flex gap-2 overflow-x-auto pb-2 snap-x">
        <div
          v-for="hour in hourlyData"
          :key="hour.time"
          class="flex-shrink-0 bg-white/60 dark:bg-slate-800/60 rounded-lg p-2 text-center backdrop-blur snap-start min-w-[65px]"
        >
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ hour.time }}</p>
          <img :src="hour.condition.icon" :alt="hour.condition.text" class="w-8 h-8 my-1 mx-auto" aria-hidden="true" />
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {{ useCelsius ? hour.temp_c : hour.temp_f }}°
          </p>
          <p v-if="hour.chance_of_rain" class="text-xs text-sky-600 dark:text-sky-400">💧{{ hour.chance_of_rain }}%</p>
        </div>
      </div>
    </div>

    <div class="max-w-md mx-auto">
      <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 text-center">3-Day Forecast</h3>
      <div class="space-y-3">
        <div
          v-for="(day, index) in weather.forecast.forecastday"
          :key="day.date"
          class="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 shadow-sm backdrop-blur flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-300 w-16">
              {{ index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }) }}
            </p>
            <img :src="day.day.condition.icon" :alt="day.day.condition.text" class="w-10 h-10" aria-hidden="true" />
            <span class="text-sm text-slate-500 dark:text-slate-400 capitalize">{{ day.day.condition.text }}</span>
          </div>
          <div class="text-right">
            <p class="font-bold text-slate-700 dark:text-slate-200">
              {{ useCelsius ? Math.round(day.day.avgtemp_c) : Math.round(day.day.avgtemp_f) }}°
            </p>
            <p class="text-xs text-slate-400">UV {{ day.day.uv }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { WeatherData, HourForecast } from '../composables/useWeather';

const props = defineProps<{
  weather: WeatherData;
  useCelsius: boolean;
  isFavorite: boolean;
}>();

defineEmits<{
  (e: 'toggle-favorite'): void;
}>();

const aqiLevels = ['Good', 'Moderate', 'Unhealthy for Sensitive', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];
const aqiLabel = computed(() => {
  const index = props.weather.current.air_quality?.['us-epa-index'] || 1;
  return aqiLevels[Math.min(index - 1, 5)] || 'Unknown';
});

const uvColor = computed(() => {
  const uv = props.weather.current.uv;
  if (uv <= 2) return 'text-green-600 dark:text-green-400';
  if (uv <= 5) return 'text-yellow-600 dark:text-yellow-400';
  if (uv <= 7) return 'text-orange-600 dark:text-orange-400';
  if (uv <= 10) return 'text-red-600 dark:text-red-400';
  return 'text-purple-600 dark:text-purple-400';
});

const hourlyData = computed(() => {
  const today = props.weather.forecast.forecastday[0];
  if (!today?.hour) return [];
  
  const now = new Date();
  const currentHour = now.getHours();
  
  return today.hour
    .filter((h: HourForecast) => {
      const hour = new Date(h.time).getHours();
      return hour >= currentHour;
    })
    .slice(0, 24)
    .map((h: HourForecast) => ({
      ...h,
      time: new Date(h.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
    }));
});
</script>
