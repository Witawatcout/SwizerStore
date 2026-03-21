<template>
  <NuxtLink :to="`/news/${news.id}`" 
    class="group bg-white rounded-[2.5rem] overflow-hidden shadow-[0_12px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(66,105,0,0.15)] transition-all duration-700 hover:-translate-y-2 flex flex-col h-full transform-gpu border border-neutral-100/50 hover:border-primary-100/50"
  >
    <div class="aspect-[4/3] overflow-hidden relative">
      <img :src="news.image" :alt="news.title" class="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 will-change-transform" loading="lazy" />
      
      <!-- Glass Badge for News -->
      <div class="absolute top-5 left-5 px-4 py-1.5 bg-white/40 backdrop-blur-md border border-white/30 text-primary-900 rounded-full text-[10px] font-black tracking-[0.1em] uppercase shadow-sm">
        {{ news.tag }}
      </div>
    </div>

    <div class="p-8 flex flex-col flex-grow">
      <div class="flex items-center gap-2 mb-4">
        <span class="w-8 h-[1px] bg-primary-200"></span>
        <p class="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">{{ news.date }}</p>
      </div>

      <h3 class="font-headline text-2xl font-black mb-4 text-neutral-900 group-hover:text-primary-700 transition-colors line-clamp-2 leading-tight pr-4">
        {{ news.title }}
      </h3>
      
      <p class="text-neutral-500 leading-relaxed font-medium line-clamp-2 mb-8 text-sm opacity-80 group-hover:opacity-100 transition-opacity">
        {{ news.desc }}
      </p>

      <div class="mt-auto pt-6 border-t border-neutral-50 flex items-center gap-2 text-primary-600 font-black text-xs uppercase tracking-widest group-hover:text-primary-700 transition-colors">
        Read Story <Icon name="mynaui:arrow-long-right-solid" class="text-base group-hover:translate-x-2 transition-transform duration-500" />
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  news: {
    id: string
    title: string
    desc: string
    image: string
    tag: string
    date: string
  }
}>()
</script>
