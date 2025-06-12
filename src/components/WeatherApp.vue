<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-4xl font-bold mb-2">🌤️ Weather App</h1>
      <p class="text-sm text-sky-700">Check the weather in any city</p>
    </header>

    <WeatherSearch @search="fetchWeather" />

    <div v-if="loading" class="text-sky-600 animate-pulse">Loading...</div>

    <div v-if="error" class="text-red-600">{{ error }}</div>

    <WeatherCard v-if="weatherData" :weather="weatherData" />

    <footer>
      Built with 💙 by
      <a
        href="https://www.agencyga.es"
        target="_blank"
        rel="noopener noreferrer"
        >Agency GA</a
      >
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import WeatherSearch from './WeatherSearch.vue';
import WeatherCard from './WeatherCard.vue';

const weatherData = ref();
const error = ref<string | null>(null);
const loading = ref(false);

const fetchWeather = async (query: string) => {
  const apiKey = import.meta.env.PUBLIC_WEATHER_API_KEY;
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(
    query
  )}&days=3&aqi=no&alerts=no`;

  try {
    loading.value = true;
    error.value = null;
    const res = await fetch(url);
    if (!res.ok) throw new Error('City not found');
    weatherData.value = await res.json();
  } catch (err: any) {
    weatherData.value = null;
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// ✅ On mount, try geolocation
onMounted(() => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const coords = `${position.coords.latitude},${position.coords.longitude}`;
        fetchWeather(coords);
      },
      () => {
        console.warn('Geolocation denied or failed. Waiting for manual input.');
      }
    );
  }
});
</script>
