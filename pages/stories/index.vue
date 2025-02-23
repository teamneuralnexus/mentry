<template>
    <section class="max-w-3xl mx-auto py-8">
      <h1 class="text-2xl font-bold mb-6">My Stories</h1>
      <ul>
        <li v-for="story in stories" :key="story.story_id" class="mb-4">
          <router-link :to="`/stories/${story.story_id}`" class="text-blue-600 hover:underline block">
            <span class="text-xl font-semibold">{{ story.title }}</span>
            <p class="mt-1 text-gray-600">{{ story.summary }}</p>
          </router-link>
        </li>
      </ul>
    </section>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const stories = ref([]);
  
  onMounted(async () => {
    try {
      const response = await $fetch('/api/story/list', { method: 'POST' });
      if (response.success) {
        stories.value = response.stories;
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
    }
  });
  </script>
  
  <style scoped>
  /* Add any styles as needed */
  </style>