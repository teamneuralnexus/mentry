<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const storyId = route.params.id;

const data = ref(null);
const pending = ref(true);
const error = ref(null);
const isPlaying = ref(false);

// Chatbox reactive variables
const chatInput = ref('');
const chatLoading = ref(false);

const currentChapterIndex = ref(0);

onMounted(async () => {
  try {
    const response = await $fetch('/api/story/view', {
      method: 'POST',
      body: { story_id: storyId }
    });
    
    if (!response.story.chapters || response.story.chapters.length === 0) {
      throw new Error('No chapters found for this story');
    }
    
    data.value = response;
    currentChapterIndex.value = response.story.chapters.length - 1;
  } catch (err) {
    error.value = err;
  } finally {
    pending.value = false;
  }
});

const formatEmoji = (mood) => mood || '📖';

const nextChapter = async () => {
  if (isStoryEnded.value) return;
  pending.value = true;
  try {
    const nextChapterNumber = currentChapter.value
      ? currentChapter.value.chapter_number + 1
      : 1;

    const existingNextChapter = data.value.story.chapters
      .find(ch => ch.chapter_number === nextChapterNumber);

    if (existingNextChapter) {
      currentChapterIndex.value = data.value.story.chapters
        .findIndex(ch => ch.chapter_number === nextChapterNumber);
    } else {
      const response = await $fetch('/api/story/next', {
        method: 'POST',
        body: { 
          storyId,
          nextChapterNumber 
        }
      });
      
      if (response.success) {
        data.value.story.chapters.push({
          chapter_number: response.chapter_number,
          content: response.chapter,
          image_urls: response.images
        });
        data.value.story.chapters.sort((a, b) => a.chapter_number - b.chapter_number);
        currentChapterIndex.value = data.value.story.chapters
          .findIndex(ch => ch.chapter_number === response.chapter_number);
      }
    }
    isPlaying.value = true;
  } catch (err) {
    error.value = err;
  } finally {
    pending.value = false;
  }
};

const previousChapter = () => {
  if (currentChapterIndex.value > 0) {
    currentChapterIndex.value--;
  }
};

const currentChapter = computed(() => {
  return data.value?.story?.chapters?.[currentChapterIndex.value] || null;
});

const isStoryEnded = computed(() => {
  if (currentChapter.value?.content) {
    console.log(currentChapter.value.content)
    return currentChapter.value.content.includes("<end_story>");
  }
  return false;
});

const currentChapterParts = computed(() => {
  if (currentChapter.value?.content && currentChapter.value.image_urls) {
    return currentChapter.value.content
      .split('<horizon_separator>')
      .map(part => part.replace('<end_story>', '').trim());
  }
  return [];
});

// Function to handle chatbox submission on Enter
const chatSubmit = async () => {
  if (!chatInput.value.trim()) return;
  chatLoading.value = true;
  try {
    // Call the API to update the summary.
    // The new summary is assumed to preserve the original starting text.
    const updateResponse = await $fetch('/api/story/summary', {
      method: 'POST',
      body: { 
        storyId,
        newSummary: chatInput.value.trim() 
      }
    });
    // Update local story summary (if returned)
    if (data.value && data.value.story) {
      data.value.story.summary = updateResponse.summary || chatInput.value.trim();
    }
    // After updating summary, trigger next chapter generation
    await nextChapter();
  } catch (err) {
    console.error("Chat submit error:", err);
  } finally {
    chatLoading.value = false;
    chatInput.value = '';
  }
};
</script>

<template>
  <div class="w-full min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Loading State -->
      <div v-if="pending" class="text-center py-12">
        <div class="animate-spin h-12 w-12 mx-auto mb-4">🔄</div>
        <p class="text-gray-600">Loading your story...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 p-4 rounded-lg">
        <p class="text-red-600 text-center">{{ error.message }}</p>
      </div>
      
      <!-- Story Content -->
      <div v-else-if="data?.story" class="bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- Story Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-3xl font-bold text-gray-900">{{ data.story.title }}</h1>
            <span class="text-4xl" v-if="data.story.mood">
              {{ formatEmoji(data.story.mood) }}
            </span>
          </div>
          <div class="text-gray-600 italic">
            Feeling: {{ data.story.feeling }}
          </div>
        </div>
        
        <!-- Story Summary (Shown only when not playing) -->
        <div v-if="!isPlaying" class="p-6 bg-gray-50">
          <h2 class="text-xl font-semibold text-gray-800 mb-3">Story Summary</h2>
          <p class="text-gray-600 leading-relaxed">
            {{ data.story.summary }}
          </p>
          <div class="mt-6 text-center">
            <button
              @click="isPlaying = true"
              class="inline-flex items-center px-6 py-3 border border-green-600 rounded-md shadow-sm text-base font-medium text-green-600 bg-white hover:bg-green-50 transition transform hover:scale-105"
            >
              Play Story
            </button>
          </div>
        </div>
        
        <!-- Storyboard (Shown when playing) -->
        <transition name="fade" mode="out-in">
          <div v-if="isPlaying" key="play-view" class="p-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Chapter {{ currentChapter?.chapter_number }}
            </h2>
            <div class="space-y-8">
              <div 
                v-for="(img, idx) in currentChapter?.image_urls" 
                :key="idx" 
                class="flex flex-col md:flex-row items-center animate__animated animate__fadeInUp"
              >
                <!-- Image Card -->
                <div class="md:w-1/3 w-full p-2">
                  <img 
                    :src="img" 
                    alt="Story image" 
                    class="w-full h-48 object-cover rounded-lg shadow-lg transform transition duration-500 hover:scale-105" 
                  />
                </div>
                <!-- Text Block -->
                <div class="md:w-2/3 w-full p-4">
                  <div class="prose text-gray-700 leading-relaxed whitespace-pre-line">
                    {{ currentChapterParts[idx] || '' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
        
        <!-- Navigation -->
        <div class="p-6 flex justify-between">
          <button
            @click="previousChapter"
            :disabled="currentChapterIndex === 0"
            :class="{'opacity-50 cursor-not-allowed': currentChapterIndex === 0, 'hover:bg-gray-50': currentChapterIndex > 0}"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white transition transform hover:scale-105"
          >
            ← Previous Chapter
          </button>
          <div class="flex gap-2">
            <button
              @click="nextChapter"
              :disabled="isStoryEnded"
              :class="{'opacity-50 cursor-not-allowed': isStoryEnded, 'hover:bg-blue-50': !isStoryEnded}"
              class="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white transition transform hover:scale-105"
            >
              Next Chapter →
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Floating Chatbox -->
    <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
      <div class="relative">
        <input
          v-model="chatInput"
          @keydown.enter.prevent="chatSubmit"
          type="text"
          placeholder="Wanna talk something to me?"
          :disabled="chatLoading"
          class="w-full h-12 px-6 rounded-full border border-gray-300 bg-white shadow-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div v-if="chatLoading" class="absolute right-4 top-1/2 transform -translate-y-1/2">
          <div class="animate-spin text-blue-600">🔄</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose {
  font-size: 1.1rem;
  line-height: 1.8;
}

/* Basic fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Chatbox styling */
.fixed {
  position: fixed;
}
</style>