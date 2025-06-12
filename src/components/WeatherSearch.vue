<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col sm:flex-row gap-2">
    <input
      v-model="city"
      type="text"
      placeholder="Enter city"
      class="flex-1 px-4 py-2 border border-sky-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
    <button
      type="submit"
      class="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded shadow transition-transform duration-150 active:scale-95">
      Search
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'search', city: string): void;
}>();

const city = ref('');

const handleSubmit = () => {
  if (city.value.trim()) {
    emit('search', city.value.trim());
    city.value = '';
  }
};
</script>
