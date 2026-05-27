<template>
  <div class="max-w-md mx-auto space-y-4">
    <div v-if="marineLoading" class="bg-white/60 dark:bg-slate-800/60 rounded-2xl p-6 backdrop-blur text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-3 border-sky-500 border-t-transparent mx-auto mb-2"></div>
      <p class="text-sm text-slate-500 dark:text-slate-400">Loading marine data...</p>
    </div>

    <!-- no card for inland locations -->

    <div v-else-if="marineData" class="bg-white/60 dark:bg-slate-800/60 rounded-2xl p-4 backdrop-blur animate-fade-in-up">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Waves class="w-5 h-5" />Ocean & Waves
        </h3>
        <button
          @click="fetchMarine"
          class="text-xs text-sky-600 dark:text-sky-400 hover:underline"
          :disabled="marineLoading"
        >
          Refresh
        </button>
      </div>

      <div class="grid grid-cols-3 gap-3 mb-4">
        <div class="bg-sky-50 dark:bg-sky-900/30 rounded-xl p-3 text-center">
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Wave</p>
          <p class="text-xl font-bold text-slate-800 dark:text-slate-100">
            {{ currentWave.height !== null ? currentWave.height.toFixed(1) : '—' }}
            <span class="text-xs font-normal text-slate-500">m</span>
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ waveCondition }}</p>
        </div>
        <div class="bg-sky-50 dark:bg-sky-900/30 rounded-xl p-3 text-center">
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Swell</p>
          <p class="text-xl font-bold text-slate-800 dark:text-slate-100">
            {{ currentWave.swellHeight !== null ? currentWave.swellHeight.toFixed(1) : '—' }}
            <span class="text-xs font-normal text-slate-500">m</span>
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ swellDirection }}</p>
        </div>
        <div class="bg-sky-50 dark:bg-sky-900/30 rounded-xl p-3 text-center">
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Period</p>
          <p class="text-xl font-bold text-slate-800 dark:text-slate-100">
            {{ currentWave.period !== null ? currentWave.period.toFixed(0) : '—' }}
            <span class="text-xs font-normal text-slate-500">s</span>
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">wave period</p>
        </div>
      </div>

      <div class="relative h-20 bg-sky-100 dark:bg-sky-900/50 rounded-xl overflow-hidden mb-4">
        <div class="absolute inset-0 flex items-end gap-px">
          <div
            v-for="(bar, i) in chartData"
            :key="i"
            class="flex-1 transition-all duration-500 min-w-0"
            :class="i === currentHourIndex ? 'bg-sky-500' : 'bg-sky-400/60 dark:bg-sky-500/40'"
            :style="{ height: bar.relativeHeight + '%' }"
            :title="`${bar.time}: ${bar.height !== null ? bar.height.toFixed(2) + 'm' : 'no data'}`"
          ></div>
        </div>
      </div>

      <div v-if="marineData.daily?.wave_height_max" class="mt-1">
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Daily Wave Max</p>
        <div class="space-y-1.5">
          <div
            v-for="(day, index) in dailyExtremes"
            :key="index"
            class="flex justify-between text-sm"
          >
            <span class="text-slate-600 dark:text-slate-300">{{ day.date }}</span>
            <span class="text-slate-700 dark:text-slate-200">
              <span class="text-sky-600 dark:text-sky-400">↑{{ day.waveMax !== null ? day.waveMax.toFixed(2) : '—' }}m</span>
              <span class="text-slate-400 mx-1">/</span>
              <span class="text-amber-600 dark:text-amber-400">swell {{ day.swellMax !== null ? day.swellMax.toFixed(2) : '—' }}m</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { Waves } from '@lucide/vue';

interface MarineData {
  latitude: number;
  longitude: number;
  utc_offset_seconds: number;
  timezone: string;
  hourly: {
    time: string[];
    wave_height: (number | null)[];
    wind_wave_height: (number | null)[];
    swell_wave_height: (number | null)[];
    wave_direction: (number | null)[];
    wave_period: (number | null)[];
  };
  daily?: {
    time: string[];
    wave_height_max: (number | null)[];
    wind_wave_height_max: (number | null)[];
    swell_wave_height_max: (number | null)[];
  };
}

const props = defineProps<{
  lat: number;
  lon: number;
}>();

const marineData = ref<MarineData | null>(null);
const marineError = ref<string | null>(null);
const marineLoading = ref(false);

const fetchMarine = async () => {
  if (props.lat == null || props.lon == null) {
    marineError.value = 'Location coordinates not available';
    return;
  }

  marineLoading.value = true;
  marineError.value = null;
  marineData.value = null;

  try {
    const res = await fetch('/api/tide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: props.lat, lon: props.lon }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No marine data');
    marineData.value = data;
  } catch (err: any) {
    marineError.value = err.message;
  } finally {
    marineLoading.value = false;
  }
};

const currentHourIndex = computed(() => {
  const times = marineData.value?.hourly?.time ?? [];
  if (!times.length) return 0;
  const now = new Date();
  const offsetMs = (marineData.value?.utc_offset_seconds ?? 0) * 1000;
  const localNow = new Date(now.getTime() + offsetMs);
  const currentISO = localNow.toISOString().slice(0, 13) + ':00';
  const idx = times.indexOf(currentISO);
  if (idx >= 0) return idx;
  // find closest past hour
  for (let i = times.length - 1; i >= 0; i--) {
    if (times[i] <= currentISO) return i;
  }
  return 0;
});

const currentWave = computed(() => {
  const idx = currentHourIndex.value;
  const h = marineData.value?.hourly;
  return {
    height: h?.wave_height?.[idx] ?? null,
    windHeight: h?.wind_wave_height?.[idx] ?? null,
    swellHeight: h?.swell_wave_height?.[idx] ?? null,
    direction: h?.wave_direction?.[idx] ?? null,
    period: h?.wave_period?.[idx] ?? null,
  };
});

const waveCondition = computed(() => {
  const h = currentWave.value.height;
  if (h === null) return '—';
  if (h < 0.1) return 'Calm';
  if (h < 0.5) return 'Rippled';
  if (h < 1.25) return 'Slight';
  if (h < 2.5) return 'Moderate';
  if (h < 4.0) return 'Rough';
  if (h < 6.0) return 'Very rough';
  return 'High';
});

const cardinalDirection = (deg: number | null): string => {
  if (deg === null) return '—';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
};

const swellDirection = computed(() => cardinalDirection(currentWave.value.direction));

const chartData = computed(() => {
  const heights = marineData.value?.hourly?.wave_height ?? [];
  const times = marineData.value?.hourly?.time ?? [];
  const nonNull = heights.filter((v) => v !== null) as number[];
  const min = nonNull.length ? Math.min(...nonNull) : 0;
  const max = nonNull.length ? Math.max(...nonNull) : 1;
  const range = max - min || 1;

  return times.slice(0, 48).map((time, i) => {
    const h = heights[i];
    const date = new Date(time);
    return {
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      height: h,
      relativeHeight: h !== null ? Math.max(4, ((h - min) / range) * 96) : 4,
    };
  });
});

const dailyExtremes = computed(() => {
  const daily = marineData.value?.daily;
  if (!daily?.wave_height_max) return [];

  return daily.time.map((time, i) => {
    const date = new Date(time);
    const label = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      date: label,
      waveMax: daily.wave_height_max[i],
      swellMax: daily.swell_wave_height_max?.[i] ?? null,
    };
  });
});

watch(() => [props.lat, props.lon], fetchMarine);

onMounted(fetchMarine);
</script>
