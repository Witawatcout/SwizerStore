<template>
  <div class="bg-neutral-50/50 text-neutral-900 font-body min-h-screen relative">
    
    <!-- Top Ambient Glow -->
    <div class="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-primary-50/80 via-white/50 to-transparent z-0 pointer-events-none"></div>

    <main v-if="newsItems.length > 0" class="pt-32 pb-24 relative z-10">
      
      <!-- Section Title & Intro -->
      <div class="max-w-screen-2xl mx-auto px-6 md:px-8 mb-16 text-center fade-in-up">
        <h1 class="font-headline text-5xl md:text-6xl font-extrabold text-neutral-900 tracking-tight mb-6">
          เคล็ดลับสุขภาพ <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">&</span> ไลฟ์สไตล์
        </h1>
        <p class="text-neutral-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          อัปเดตบทความใหม่ล่าสุดจากผู้เชี่ยวชาญ เพื่อการดูแลตัวเองอย่างยั่งยืนในทุกๆ วัน
        </p>
      </div>

      <!-- Hero Section: Featured Article -->
      <section v-if="heroArticle" class="max-w-screen-2xl mx-auto px-6 md:px-8 mb-24 fade-in-up" style="animation-duration: 1s;">
        <div class="relative h-[550px] md:h-[650px] rounded-[2.5rem] overflow-hidden flex items-end shadow-2xl shadow-primary-900/10 group border border-white/50">
          <NuxtLink :to="`/news/${heroArticle.id}`" class="absolute inset-0 z-20"></NuxtLink>
          
          <img :alt="heroArticle.title" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" :src="heroArticle.image" />
          <div class="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-900/40 to-transparent z-0"></div>
          
          <div class="relative z-10 p-8 md:p-16 w-full max-w-5xl transition-transform duration-700 group-hover:-translate-y-2">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold tracking-widest uppercase shadow-lg">
              <span class="w-2 h-2 rounded-full bg-primary-400 animate-[pulse_2s_ease-in-out_infinite]"></span>
              {{ heroArticle.tag }}
            </div>
            <h1 class="font-headline text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-[1.15] mb-6 tracking-tight drop-shadow-lg" style="white-space: pre-line;">
              {{ heroArticle.title }}
            </h1>
            <p class="text-white/80 text-lg md:text-xl font-body max-w-3xl mb-10 leading-relaxed font-medium">
              {{ heroArticle.desc }}
            </p>
            <div class="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-primary-900 font-bold transition-all group-hover:bg-primary-50 group-hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)]">
              อ่านบทความนี้
              <Icon name="mynaui:arrow-long-right-solid" class="text-xl group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      <!-- Category Filter -->
      <section class="max-w-screen-2xl mx-auto px-6 md:px-8 mb-12 fade-in-up flex flex-col md:flex-row md:items-end justify-between gap-6" style="animation-delay: 200ms;">
        <div>
          <h2 class="text-4xl font-extrabold font-headline tracking-tight text-neutral-900 mb-2">บทความล่าสุด</h2>
        </div>
        
        <div class="flex flex-wrap items-center gap-2.5">
          <button v-for="(cat, idx) in categories" :key="cat"
            class="px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300"
            :class="idx === 0 
              ? 'bg-neutral-900 text-white shadow-md shadow-neutral-900/20 hover:scale-105' 
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-300'">
            {{ cat }}
          </button>
        </div>
      </section>

      <!-- Bento Grid Articles -->
      <section class="max-w-screen-2xl mx-auto px-6 md:px-8">
        <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          <!-- Large Post -->
          <NuxtLink v-if="largePost" :to="`/news/${largePost.id}`" class="block xl:col-span-8 group fade-in-up" style="animation-delay: 300ms;">
            <div class="bg-white rounded-[2rem] p-4 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 h-full flex flex-col">
              <div class="rounded-[1.5rem] overflow-hidden mb-8 relative aspect-[16/9] md:aspect-[21/9] xl:aspect-[2/1] w-full">
                <img :alt="largePost.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out" :src="largePost.image" />
                <div class="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/5 transition-colors duration-500"></div>
                <div class="absolute top-4 left-4">
                  <span class="bg-white/90 backdrop-blur-sm text-neutral-900 font-bold text-xs tracking-widest px-4 py-1.5 rounded-full shadow-sm uppercase">{{ largePost.tag }}</span>
                </div>
              </div>
              <div class="px-4 pb-4 flex flex-col flex-grow">
                <div class="flex items-center gap-3 mb-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  <span>{{ largePost.date }}</span>
                  <span class="w-1 h-1 rounded-full bg-neutral-300"></span>
                  <span class="flex items-center gap-1"><Icon name="mynaui:clock" class="text-[14px]" /> 4 Min Read</span>
                </div>
                <h2 class="font-headline text-3xl md:text-4xl font-extrabold mb-4 leading-[1.2] group-hover:text-primary-600 transition-colors text-balance">
                  {{ largePost.title }}
                </h2>
                <p class="text-neutral-500 font-body leading-relaxed text-lg line-clamp-2 md:line-clamp-3 mb-6">
                  {{ largePost.desc }}
                </p>
                <div class="mt-auto flex items-center justify-between text-neutral-400 group-hover:text-primary-600 transition-colors">
                  <span class="font-bold flex items-center gap-2 text-sm uppercase tracking-widest">อ่านต่อ <Icon name="mynaui:arrow-long-right-solid" class="text-[16px] group-hover:translate-x-1 transition-transform" /></span>
                </div>
              </div>
            </div>
          </NuxtLink>
          
          <!-- Side Column -->
          <div class="xl:col-span-4 flex flex-col gap-8 fade-in-up" style="animation-delay: 450ms;">
            <NuxtLink :to="`/news/${post.id}`" v-for="(post, index) in sidePosts" :key="post.title" 
              class="bg-white rounded-[2rem] p-8 md:p-10 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 flex-1 flex flex-col justify-between group relative overflow-hidden">
              <div class="absolute -right-10 -top-10 w-48 h-48 bg-primary-50 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div class="relative z-10">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 mb-6 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500 shadow-sm border border-primary-100">
                  <Icon :name="index === 0 ? 'mynaui:leaf' : 'mynaui:coffee'" class="text-2xl" />
                </div>
                <div class="flex items-center gap-3 mb-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  <span class="text-primary-600">{{ post.tag }}</span>
                </div>
                <h3 class="font-headline text-2xl font-extrabold mb-4 leading-tight group-hover:text-neutral-900 transition-colors text-balance text-neutral-800">
                  {{ post.title }}
                </h3>
                <p class="text-neutral-500 text-base font-body line-clamp-3 leading-relaxed">
                  {{ post.desc }}
                </p>
              </div>
              <div class="mt-8 w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:bg-primary-50 group-hover:border-primary-200 group-hover:text-primary-600 transition-all relative z-10 bg-white">
                <Icon name="mynaui:arrow-long-right-solid" class="text-sm -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
              </div>
            </NuxtLink>
          </div>
          
          <!-- Three Column Grid Below -->
          <NewsCard 
            v-for="(post, index) in bottomPosts" 
            :key="post.id" 
            :news="post"
            class="md:col-span-4 fade-in-up"
            :style="{ animationDelay: `${600 + index * 100}ms` }"
          />
          
        </div>
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { newsItems } from '~/assets/news'

useHead({
  title: 'News & Articles | Swizer Superfoods'
})

const categories = [
  'ทั้งหมด', 'สุขภาพองค์รวม', 'สูตรอาหารคลีน', 'เกษตรอินทรีย์', 'รีวิวผลิตภัณฑ์', 'Lifestyle'
]

const heroArticle = computed(() => newsItems[0] || null)
const largePost = computed(() => newsItems[1] || null)
const sidePosts = computed(() => newsItems.slice(2, 4))
const bottomPosts = computed(() => newsItems.slice(4))
</script>