<template>
  <div v-if="tideData" class="max-w-md mx-auto space-y-4">
    <div class="bg-white/60 dark:bg-slate-800/60 rounded-2xl p-4 backdrop-blur animate-fade-in-up">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200">🌊 Tide</h3>
        <span class="text-xs text-slate-500 dark:text-slate-400">
          {{ tideData.tide_height_unit || 'm' }}
        </span>
      </div>

      <div class="text-center mb-4">
        <p class="text-4xl font-bold text-slate-800 dark:text-slate-100">
          {{ currentTide.height.toFixed(2) }}
          <span class="text-lg font-normal text-slate-500">m</span>
        </p>
        <p class="text-sm font-medium mt-1" :class="tideStatusColor">
          {{ tideStatus }} · {{ currentTide.heightFeet.toFixed(1) }} ft
        </p>
        <p v-if="currentTide.change !== 0" class="text-xs text-slate-500 dark:text-slate-400">
          {{ currentTide.change > 0 ? 'Rising' : 'Falling' }} {{ Math.abs(currentTide.change).toFixed(2) }} m/h
        </p>
      </div>

      <div class="relative h-24 bg-sky-100 dark:bg-sky-900/50 rounded-xl overflow-hidden mb-4">
        <div class="absolute inset-0 flex items-end">
          <div
            v-for="(h, i) in chartData"
            :key="i"
            class="flex-1 transition-all duration-500"
            :class="i === currentHourIndex ? 'bg-sky-500' : 'bg-sky-400/60 dark:bg-sky-500/40'"
            :style="{ height: h.relativeHeight + '%' }"
            :title="`${h.time}: ${h.height.toFixed(2)}m`"
          ></div>
        </div>
        <div
          class="absolute left-0 right-0 border-t-2 border-dashed border-red-400/60"
          :style="{ bottom: '50%' }"
        ></div>
      </div>

      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="bg-sky-50 dark:bg-sky-900/30 rounded-lg p-3 text-center">
          <p class="text-xs text-slate-500 dark:text-slate-400">⬆ Next High Tide</p>
          <p class="font-semibold text-slate-700 dark:text-slate-200">{{ nextHighTide.time }}</p>
          <p class="text-sm text-sky-600 dark:text-sky-400">{{ nextHighTide.height.toFixed(2) }}m</p>
        </div>
        <div class="bg-sky-50 dark:bg-sky-900/30 rounded-lg p-3 text-center">
          <p class="text-xs text-slate-500 dark:text-slate-400">⬇ Next Low Tide</p>
          <p class="font-semibold text-slate-700 dark:text-slate-200">{{ nextLowTide.time }}</p>
          <p class="text-sm text-sky-600 dark:text-sky-400">{{ nextLowTide.height.toFixed(2) }}m</p>
        </div>
      </div>

      <div v-if="tideData.daily?.tide_height_max" class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Daily Extremes</p>
        <div class="space-y-1.5">
          <div
            v-for="(day, index) in dailyExtremes"
            :key="index"
            class="flex justify-between text-sm"
          >
            <span class="text-slate-600 dark:text-slate-300">{{ day.date }}</span>
            <span class="text-slate-700 dark:text-slate-200">
              <span class="text-sky-600 dark:text-sky-400">↑{{ day.max.toFixed(2) }}</span>
              <span class="text-slate-400 mx-1">/</span>
              <span class="text-amber-600 dark:text-amber-400">↓{{ day.min.toFixed(2) }}</span>
              <span class="text-slate-400 text-xs ml-1">m</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';

interface TideData {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly: {
    time: string[];
    tide_height: number[];
  };
  daily?: {
    time: string[];
    tide_height_max: number[];
    tide_height_min: number[];
  };
  tide_height_unit?: string;
}

const props = defineProps<{
  lat: number;
  lon: number;
}>();

const tideData = ref<TideData | null>(null);
const tideError = ref<string | null>(null);
const tideLoading = ref(false);

const fetchTide = async () => {
  tideLoading.value = true;
  tideError.value = null;

  try {
    const res = await fetch('/api/tide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: props.lat, lon: props.lon }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load tide data');
    tideData.value = data;
  } catch (err: any) {
    tideError.value = err.message;
  } finally {
    tideLoading.value = false;
  }
};

const now = new Date();
const currentHourIndex = computed(() => {
  const hours = tideData.value?.hourly?.time ?? [];
  const currentISO = now.toISOString().slice(0, 13) + ':00';
  const idx = hours.indexOf(currentISO);
  return idx >= 0 ? idx : 0;
});

const currentTide = computed(() => {
  const hours = tideData.value?.hourly?.tide_height ?? [];
  const idx = currentHourIndex.value;
  const height = hours[idx] ?? 0;
  const nextHeight = hours[idx + 1] ?? height;
  return {
    height,
    heightFeet: height * 3.28084,
    change: nextHeight - height,
  };
});

const tideStatus = computed(() => {
  const ch = currentTide.value.change;
  if (Math.abs(ch) < 0.01) return 'Slack Tide';
  return ch > 0 ? '🌊 Rising' : '🌊 Falling';
});

const tideStatusColor = computed(() => {
  const ch = currentTide.value.change;
  if (Math.abs(ch) < 0.01) return 'text-slate-500';
  return ch > 0 ? 'text-sky-600 dark:text-sky-400' : 'text-amber-600 dark:text-amber-400';
});

const chartData = computed(() => {
  const hours = tideData.value?.hourly?.tide_height ?? [];
  const times = tideData.value?.hourly?.time ?? [];
  const min = Math.min(...hours);
  const max = Math.max(...hours);
  const range = max - min || 1;

  return times.slice(0, 48).map((time, i) => {
    const h = hours[i] ?? 0;
    const date = new Date(time);
    return {
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      height: h,
      relativeHeight: ((h - min) / range) * 100,
    };
  });
});

const nextHighTide = computed(() => {
  const hours = tideData.value?.hourly?.tide_height ?? [];
  const times = tideData.value?.hourly?.time ?? [];
  const start = currentHourIndex.value;

  for (let i = start; i < hours.length - 1; i++) {
    const h = hours[i];
    const prev = hours[i - 1] ?? -Infinity;
    const next = hours[i + 1] ?? -Infinity;
    if (h >= prev && h > next) {
      const date = new Date(times[i]);
      return {
        time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        height: h,
      };
    }
  }

  const last = hours.length - 1;
  const date = new Date(times[last]);
  return {
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    height: hours[last] ?? 0,
  };
});

const nextLowTide = computed(() => {
  const hours = tideData.value?.hourly?.tide_height ?? [];
  const times = tideData.value?.hourly?.time ?? [];
  const start = currentHourIndex.value;

  for (let i = start; i < hours.length - 1; i++) {
    const h = hours[i];
    const prev = hours[i - 1] ?? Infinity;
    const next = hours[i + 1] ?? Infinity;
    if (h <= prev && h < next) {
      const date = new Date(times[i]);
      return {
        time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        height: h,
      };
    }
  }

  const last = hours.length - 1;
  const date = new Date(times[last]);
  return {
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    height: hours[last] ?? 0,
  };
});

const dailyExtremes = computed(() => {
  const daily = tideData.value?.daily;
  if (!daily?.tide_height_max || !daily.tide_height_min) return [];

  return daily.time.map((time, i) => {
    const date = new Date(time);
    const label = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      date: label,
      max: daily.tide_height_max[i],
      min: daily.tide_height_min[i],
    };
  });
});

onMounted(fetchTide);
</script>
