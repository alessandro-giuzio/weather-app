<template>
  <div class="space-y-6">
    <div class="flex justify-end gap-2">
      <button
        @click="toggleUnit"
        class="p-2 rounded-lg bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-800 transition-colors"
        :title="useCelsius ? 'Switch to Fahrenheit' : 'Switch to Celsius'"
      >
        {{ useCelsius ? '°C' : '°F' }}
      </button>
      <button
        @click="toggleDarkMode"
        class="p-2 rounded-lg bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-800 transition-colors"
        :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        {{ isDarkMode ? '☀️' : '🌙' }}
      </button>
    </div>

    <WeatherSearch
      :recent-searches="recentSearches"
      :favorites="favorites"
      :loading="loading"
      @search="handleSearch"
      @select-recent="handleSearch"
      @remove-recent="removeRecent"
      @toggle-favorite="toggleFavorite"
    />

    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent"></div>
    </div>

    <div v-if="error" class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
      {{ error }}
    </div>

    <WeatherCard
      v-if="weatherData && !loading"
      :weather="weatherData"
      :use-celsius="useCelsius"
      :is-favorite="isFavorite(weatherData.location.name)"
      @toggle-favorite="toggleFavorite(weatherData.location.name)"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WeatherSearch from './WeatherSearch.vue';
import WeatherCard from './WeatherCard.vue';
import { useWeather } from '../composables/useWeather';

const {
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
} = useWeather();

const handleSearch = (query: string) => {
  fetchWeather(query);
};

onMounted(() => {
  loadFromStorage();

  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  }

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude},${position.coords.longitude}`;
        fetchWeather(coords);
      },
      () => {
        console.warn('Geolocation denied. Waiting for manual input.');
      }
    );
  }
});
</script>
