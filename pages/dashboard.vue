<template>
  <div class="mx-auto p-8 text-center bg-[#E5E4DF] w-full h-screen">
    <h1 class="text-4xl font-bold mb-8 text-[#CC785C]">
      Welcome to Mentry, {{ user.name }}! ✨
    </h1>

    <div class="my-8">
      <span
        @click="changeEmoji('happy')"
        :class="{'text-[3rem]': userEmoji=='happy' }"
        class="rounded-full text-4xl mx-4 hover:text-[3rem] hover:cursor-pointer transition-all"
        role="img"
        aria-label="happy"
      >
        😊
      </span>
      <span
        @click="changeEmoji('sad')"
        :class="{'text-[3rem]': userEmoji=='sad' }"
        class="text-4xl mx-4 hover:text-[3rem] hover:cursor-pointer transition-all"
        role="img"
        aria-label="sad"
      >
        😢
      </span>
      <span
        @click="changeEmoji('smile')"
        :class="{'text-[3rem]': userEmoji=='smile' }"
        class="text-4xl mx-4 hover:text-[3rem] hover:cursor-pointer transition-all"
        role="img"
        aria-label="smile"
      >
        😄
      </span>
    </div>

    <div class="my-8">
      <p class="text-lg text-gray-600 mb-4">✨ Tell me, how are you feeling today? ✨</p>
      <div class="flex justify-center items-center gap-4">
        <input
          type="text"
          v-model="userFeeling"
          placeholder="Share your feelings..."
          class="px-4 py-2 text-base border-2 border-gray-200 rounded-full w-[800px] outline-none focus:border-purple-600"
        >
        <p v-if="loading">Loading...</p>
        <button
          @click="generateStory"
          class="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors duration-300"
        >
          Let's Go! 🚀
        </button>
      </div>
    </div>

    <!-- Analytics: Mood Variations Statistics -->
    <div class="mt-8">
      <h3 class="text-lg font-medium mb-2">Your Mood Statistics</h3>
      <ul class="flex justify-center gap-6">
        <li v-for="stat in analytics" :key="stat.mood" class="flex flex-col items-center">
          <span class="text-2xl">
            {{ stat.mood }}
          </span>
          <span class="text-sm text-gray-600">{{ stat.count }} story<span v-if="stat.count > 1">ies</span></span>
        </li>
      </ul>
    </div>

    <div class="mt-12">
      <button
        @click="logout"
        class="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-300"
      >
        Sign out
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const loading = ref(false);
const user = useUser();
const userFeeling = ref('');
const userEmoji = ref('smile');
const analytics = ref([]);
const router = useRouter();

async function logout() {
  await $fetch("/api/logout", {
    method: "POST",
  });
  await router.push("/login");
}

function changeEmoji(a) {
  userEmoji.value = a;
}

async function generateStory() {
  loading.value = true;
  const data = await $fetch('/api/story/generate', {
    method: "POST",
    body: {
      userEmoji: userEmoji.value,
      userFeeling: userFeeling.value
    }
  });
  const storyId = data.story_id;
  router.push('/stories/'+storyId);
  loading.value = false;
}

async function fetchAnalytics() {
  try {
    const response = await $fetch('/api/story/analytics', { method: "POST" });
    if (response.success) {
      analytics.value = response.stats;
    }
  } catch (error) {
    console.error("Error fetching analytics:", error);
  }
}

onMounted(() => {
  fetchAnalytics();
});
</script>

<style scoped>
/* Add any additional styles you need */
</style>