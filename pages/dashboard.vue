<script setup>
definePageMeta({
  middleware: ["protected"]
});

const loading = ref(false)
const user = useUser();
const userFeeling = ref('');
const userEmoji = ref('smile');
const router = useRouter()
async function logout() {
  await $fetch("/api/logout", {
    method: "POST"
  });
  await navigateTo("/login");
}

function changeEmoji(a) {
	userEmoji.value = a;
}

async function generateStory() {
	loading.value=true
  const data = await $fetch('/api/story/generate', {
	method: "POST",
	body: {
		userEmoji: userEmoji.value,
		userFeeling: userFeeling.value
	}
  })
  const storyId = data.story_id
  router.push('/stories/'+storyId);
  loading.value=false
}
</script>

<template>
  <div class="mx-auto p-8 text-center bg-[#E5E4DF] w-full h-screen">
    <h1 class="text-4xl font-bold mb-8 text-[#CC785C]">Welcome to Story with Horizon, {{ user.name }}! ✨</h1>
    
    <div class="my-8">
      <span @click="changeEmoji('happy')" :class="{'text-[3rem]': userEmoji=='happy' }" class="rounded-full text-4xl mx-4 hover:text-[3rem] hover:cursor-pointer transition-all" role="img" aria-label="happy">😊</span>
      <span @click="changeEmoji('sad')" :class="{'text-[3rem]': userEmoji=='sad' }"  class="text-4xl mx-4 hover:text-[3rem] hover:cursor-pointer transition-all" role="img" aria-label="sad">😢</span>
      <span @click="changeEmoji('smile')" :class="{'text-[3rem]': userEmoji=='smile' }"  class="text-4xl mx-4 hover:text-[3rem] hover:cursor-pointer transition-all" role="img" aria-label="smile">😄</span>
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

    <!-- <form @submit.prevent="logout" class="mt-8">
      <button class="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-300">
        Sign out
      </button>
    </form> -->
  </div>
</template>