<template>
  <div
    v-if="weather"
    class="bg-white/80 rounded-xl shadow p-6 text-center space-y-2 backdrop-blur-sm animate-fade-in-up">
    <!-- 📍 Current Weather -->
    <h2 class="text-xl font-semibold">
      {{ weather.location.name }}, {{ weather.location.country }}
    </h2>

    <p class="text-4xl font-bold">{{ weather.current.temp_c }}°C</p>

    <p class="text-sky-500 capitalize">
      {{ weather.current.condition.text }}
    </p>

    <div
      class="w-16 h-16 mx-auto bg-sky-200 rounded-full flex items-center justify-center animate-float">
      <img
        :src="weather.current.condition.icon"
        :alt="weather.current.condition.text"
        class="w-10 h-10" />
    </div>

    <!-- 🔮 Forecast (This is the part you asked about) -->
    <div class="pt-4 space-y-2">
      <h3 class="text-lg font-semibold text-sky-700">Next 2 Days</h3>
      <div class="grid grid-cols-2 gap-4 sm:gap-6">
        <div
          v-for="(day, index) in weather.forecast.forecastday.slice(1)"
          :key="index"
          class="bg-white/60 rounded-lg p-4 shadow-sm backdrop-blur transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-100 touch-manipulation animate-pop-fade">
          <p class="text-sm text-sky-800 font-medium">
            {{
              new Date(day.date).toLocaleDateString('en-US', {
                weekday: 'short',
              })
            }}
          </p>
          <img
            :src="day.day.condition.icon"
            :alt="day.day.condition.text"
            class="w-10 h-10 mx-auto" />
          <p class="text-sm text-sky-600 mt-1">{{ day.day.condition.text }}</p>
          <p class="text-lg font-bold mt-1">{{ day.day.avgtemp_c }}°C</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  weather?: {
    location: {
      name: string;
      country: string;
    };
    current: {
      temp_c: number;
      condition: {
        text: string;
        icon: string;
      };
    };
    forecast: {
      forecastday: {
        date: string;
        day: {
          avgtemp_c: number;
          condition: {
            text: string;
            icon: string;
          };
        };
      }[];
    };
  };
}>();
</script>
