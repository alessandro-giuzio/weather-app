<template>
  <div class="space-y-3">
    <form
      @submit.prevent="handleSubmit"
      class="flex flex-col sm:flex-row gap-2">
      <div class="relative flex-1">
        <input
          v-model="city"
          type="text"
          maxlength="100"
          placeholder="Enter city name"
          class="w-full px-4 py-2.5 border border-sky-300 dark:border-sky-600 rounded-lg shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400"
          aria-label="Search for a city" />
      </div>
      <button
        type="submit"
        :disabled="loading || !city.trim()"
        class="bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 dark:disabled:bg-sky-700 text-white px-6 py-2.5 rounded-lg shadow transition-all duration-150 active:scale-95 disabled:scale-100 flex items-center justify-center gap-2 min-w-[100px]">
        <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
        <span v-else>Search</span>
      </button>
    </form>

    <div
      v-if="recentSearches.length > 0 || favorites.length > 0"
      class="space-y-3">
      <div v-if="favorites.length > 0">
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          Favorites
        </p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="fav in favorites"
            :key="'fav-' + fav"
            @click="$emit('select-recent', fav)"
            class="px-3 py-1.5 text-sm rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors flex items-center gap-1">
            <Star class="w-4 h-4 fill-current flex-shrink-0" />
            {{ fav }}
            <span
              @click.stop="$emit('toggle-favorite', fav)"
              class="ml-1 hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer"
              role="button"
              tabindex="0"
              aria-label="Remove from favorites">
              <X class="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>

      <!--  <div v-if="recentSearches.length > 0">
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Recent</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="search in recentSearches"
            :key="'recent-' + search"
            @click="$emit('select-recent', search)"
            class="px-3 py-1.5 text-sm rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
          >
            <Clock class="w-4 h-4 flex-shrink-0" />
            {{ search }}
            <span
              @click.stop="$emit('remove-recent', search)"
              class="ml-1 hover:text-red-500 cursor-pointer"
              role="button"
              tabindex="0"
              aria-label="Remove from recent"
            >
              <X class="w-4 h-4" />
            </span>
          </button>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Loader2, Star, X } from '@lucide/vue';

defineProps<{
  recentSearches: string[];
  favorites: string[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'search', city: string): void;
  (e: 'select-recent', city: string): void;
  (e: 'remove-recent', city: string): void;
  (e: 'toggle-favorite', city: string): void;
}>();

const city = ref('');

const handleSubmit = () => {
  if (city.value.trim()) {
    emit('search', city.value.trim());
    city.value = '';
  }
};
</script>
