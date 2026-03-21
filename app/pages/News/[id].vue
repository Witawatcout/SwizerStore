<template>
  <div v-if="post" class="bg-neutral-50 text-neutral-900 font-body min-h-screen selection:bg-primary-500 selection:text-white pb-32">
    
    <!-- Hero Header with Parallax feel -->
    <header class="relative w-full h-[60vh] min-h-[500px] flex items-end justify-center overflow-hidden">
      <!-- Background Image -->
      <div class="absolute inset-0 w-full h-full bg-neutral-900">
        <img :src="post.image" :alt="post.title" class="w-full h-full object-cover opacity-80 mix-blend-overlay scale-105 animate-[kenburns_20s_ease-out_forwards]" />
        <!-- Subtle gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/60 to-transparent"></div>
      </div>
      
      <!-- Back button overlay -->
      <div class="absolute top-6 left-6 md:top-8 md:left-8 z-20 fade-in-up" style="animation-delay: 200ms;">
        <NuxtLink to="/news" class="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full font-bold transition-all hover:gap-3 text-sm tracking-widest uppercase shadow-lg">
          <span class="material-symbols-outlined text-sm"><Icon name="mynaui:arrow-long-left-solid" /></span> สู่หน้ารวมข่าว
        </NuxtLink>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 w-full max-w-screen-xl mx-auto px-6 md:px-12 pb-24 md:pb-32 text-center fade-in-up" style="animation-duration: 1s;">
        <span class="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary-500 text-white text-xs font-bold tracking-widest uppercase shadow-lg shadow-primary-500/30">
          {{ post.tag }}
        </span>
        <h1 class="font-headline text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-[1.15] tracking-tight mb-8 max-w-5xl mx-auto drop-shadow-xl text-balance" style="white-space: pre-line;">
          {{ post.title }}
        </h1>
        <div class="flex flex-wrap items-center justify-center gap-4 text-white/80 font-medium text-sm md:text-base">
          <span class="flex items-center gap-2"><Icon name="mynaui:calendar" class="text-[18px]" /> {{ post.date || 'ล่าสุด' }}</span>
          <span class="w-1.5 h-1.5 rounded-full bg-white/40 mx-2 hidden sm:block"></span>
          <span class="flex items-center gap-2"><Icon name="mynaui:book-open" class="text-[18px]" /> อ่าน 5 นาที</span>
          <span class="w-1.5 h-1.5 rounded-full bg-white/40 mx-2 hidden sm:block"></span>
          <span class="flex items-center gap-2"><Icon name="mynaui:user" class="text-[18px]" /> โดย Swizer Team</span>
        </div>
      </div>
    </header>

    <!-- Main Content Wrapped in Floating Card -->
    <main class="relative z-20 -mt-16 md:-mt-20 max-w-screen-lg mx-auto px-4 sm:px-8 md:px-12 fade-in-up" style="animation-delay: 400ms; animation-duration: 1s;">
      <article class="bg-white rounded-[2rem] md:rounded-[3rem] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] p-8 md:p-16 lg:px-24 lg:py-20 border border-neutral-100">
        
        <!-- Intro / Lead Paragraph -->
        <p class="text-2xl md:text-3xl font-headline font-semibold text-neutral-800 leading-[1.6] mb-16 text-center text-balance relative">
          <span class="absolute -top-10 left-1/2 -translate-x-1/2 text-9xl text-neutral-100 font-serif leading-none opacity-50 select-none">"</span>
          <span class="relative z-10">{{ post.desc }}</span>
        </p>

        <!-- Dynamic Content -->
        <div class="editorial-content max-w-3xl mx-auto">
          <div v-html="post.content"></div>
        </div>

        <!-- Article Footer / Tags & Social -->
        <div class="max-w-3xl mx-auto mt-24 pt-10 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div class="flex items-center flex-wrap gap-3">
            <span class="font-bold text-sm text-neutral-400 uppercase tracking-widest mr-2 block w-full md:w-auto text-center md:text-left">Tags</span>
            <span class="px-5 py-2 bg-neutral-50 text-neutral-600 rounded-full text-xs font-bold hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer border border-neutral-200">#{{ post.tag }}</span>
            <span class="px-5 py-2 bg-neutral-50 text-neutral-600 rounded-full text-xs font-bold hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer border border-neutral-200">#Health</span>
            <span class="px-5 py-2 bg-neutral-50 text-neutral-600 rounded-full text-xs font-bold hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer border border-neutral-200">#Superfoods</span>
          </div>
          
          <div class="flex items-center gap-4">
            <span class="font-bold text-sm text-neutral-400 uppercase tracking-widest">Share</span>
            <button class="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all shadow-sm hover:shadow-primary-600/30 hover:-translate-y-1">
              <Icon name="mynaui:share" class="text-[20px]" />
            </button>
            <button class="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-red-500 hover:bg-red-50 hover:border-red-500 transition-all shadow-sm hover:shadow-red-500/30 hover:-translate-y-1">
              <Icon name="mynaui:heart-solid" class="text-[20px]" />
            </button>
          </div>
        </div>
      </article>
      
      <!-- Read Next / Related Section -->
      <section class="mt-32 w-full max-w-screen-xl mx-auto fade-in-up" style="animation-delay: 600ms;">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-neutral-200 pb-4 gap-4">
          <h3 class="font-headline text-3xl font-extrabold text-neutral-900">บทความอื่นๆ ที่น่าสนใจ</h3>
          <NuxtLink to="/news" class="text-primary-600 font-bold hover:underline underline-offset-4 flex items-center gap-1">ดูทั้งหมด <Icon name="mynaui:arrow-long-right-solid" class="text-sm" /></NuxtLink>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
           <NuxtLink :to="`/news/${related.id}`" v-for="related in relatedPosts" :key="related.id" class="group block h-full flex flex-col bg-white rounded-[2rem] p-3 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
             <div class="rounded-[1.5rem] overflow-hidden aspect-[4/3] bg-neutral-100 mb-6 relative">
               <img :src="related.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out" />
               <div class="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/10 transition-colors duration-500"></div>
               <div class="absolute top-4 left-4">
                 <span class="bg-white/90 backdrop-blur-sm text-neutral-900 font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">{{ related.tag }}</span>
               </div>
             </div>
             <div class="px-3 pb-3 flex flex-col flex-grow">
               <h4 class="font-headline font-bold text-xl leading-[1.4] group-hover:text-primary-600 transition-colors line-clamp-2 mb-3 text-balance">{{ related.title }}</h4>
               <p class="text-neutral-500 font-body text-sm line-clamp-2 leading-relaxed mt-auto">{{ related.desc }}</p>
             </div>
           </NuxtLink>
        </div>
      </section>
    </main>
  </div>
  
  <!-- Fallback / Not Found -->
  <div v-else class="min-h-screen flex flex-col items-center justify-center font-headline text-neutral-500 gap-4 bg-neutral-50">
    <Icon name="mynaui:file-x" class="text-6xl text-neutral-300" />
    <h1 class="text-2xl font-bold">เนื้อหาถูกลบหรือไม่พบหน้านี้แล้ว</h1>
    <NuxtLink to="/news" class="mt-4 px-6 py-3 bg-primary-600 text-white rounded-full font-bold hover:bg-primary-500 transition-colors shadow-lg">
      กลับสู่ศูนย์รวมข่าวสาร
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { newsItems } from '~/assets/news'

const route = useRoute()
const post = computed(() => newsItems.find(n => n.id === route.params.id))

const relatedPosts = computed(() => {
  return newsItems.filter(p => p.id !== route.params.id).slice(0, 3)
})

useHead({
  title: post.value ? `${post.value.title} | Swizer Superfoods` : 'Article Not Found'
})
</script>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes kenburns {
  from { transform: scale(1.05); }
  to { transform: scale(1.15); }
}

.fade-in-up {
  opacity: 0;
  animation-name: fadeInUp;
  animation-fill-mode: forwards;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-duration: 0.8s;
}

/* Premium Typography for Dynamic Body */
.editorial-content :deep(h2) {
  font-family: 'Epilogue', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  margin-top: 3.5rem;
  margin-bottom: 1.5rem;
  color: #111827;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.editorial-content :deep(h3) {
  font-family: 'Epilogue', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  color: #1f2937;
}

.editorial-content :deep(p) {
  font-size: 1.125rem;
  line-height: 1.85;
  color: #4b5563;
  margin-bottom: 2rem;
}

.editorial-content :deep(ul) {
  list-style-type: disc;
  margin-left: 1.5rem;
  margin-bottom: 2.5rem;
  color: #4b5563;
  padding-left: 1rem;
}

.editorial-content :deep(ol) {
  list-style-type: decimal;
  margin-left: 1.5rem;
  margin-bottom: 2.5rem;
  color: #4b5563;
  padding-left: 1rem;
}

.editorial-content :deep(li) {
  font-size: 1.125rem;
  line-height: 1.85;
  margin-bottom: 0.75rem;
}

.editorial-content :deep(li::marker) {
  color: #16a34a;
  font-weight: bold;
}

.editorial-content :deep(a) {
  color: #16a34a;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: #bbf7d0;
  text-decoration-thickness: 3px;
  text-underline-offset: 4px;
  transition: all 0.2s;
}

.editorial-content :deep(a:hover) {
  color: #15803d;
  text-decoration-color: #16a34a;
}
</style>
