<template>
  <NuxtLink :to="`/products/${product.id}`" 
    class="group relative bg-white rounded-[2.5rem] p-4 transition-all duration-500 hover:-translate-y-2 transform-gpu border border-neutral-100 hover:border-primary-200/50 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(66,105,0,0.15)] flex flex-col h-full overflow-hidden"
  >
    <!-- Image Wrapper with subtle inner shadow -->
    <div class="relative aspect-square rounded-[2.2rem] bg-neutral-50/50 overflow-hidden mb-8 shadow-inner group-hover:shadow-none transition-all duration-700">
      <img
        :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110 will-change-transform"
        :src="product.image"
        loading="lazy"
      />
      
      <!-- Premium Glass Badge -->
      <div v-if="product.badge" class="absolute top-4 left-4 z-10">
        <span class="px-4 py-1.5 bg-primary-600/10 backdrop-blur-md border border-primary-600/20 text-primary-700 rounded-full text-[10px] font-black tracking-[0.1em] uppercase shadow-sm">
          {{ product.badge }}
        </span>
      </div>

      <!-- Quick Hover Overlay -->
      <div class="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10 hidden md:block">
        <div class="w-full py-3 bg-white/90 backdrop-blur-xl rounded-2xl text-center text-xs font-bold text-neutral-900 shadow-xl border border-white/20">
          QUICK VIEW
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="px-2 flex flex-col flex-grow">
      <div class="mb-4">
        <span class="text-[10px] font-bold text-primary-500 uppercase tracking-[0.2em] mb-2 block">Premium Superfood</span>
        <h3 class="font-headline text-2xl font-black text-neutral-950 leading-[1.2] group-hover:text-primary-700 transition-colors line-clamp-2 min-h-[58px]">
          {{ product.name }}
        </h3>
      </div>
      
      <p class="text-neutral-500 text-sm leading-relaxed line-clamp-2 font-medium mb-8 flex-grow opacity-80 group-hover:opacity-100 transition-opacity">
        {{ product.description }}
      </p>

      <!-- Bottom Bar -->
      <div class="pt-6 border-t border-neutral-100/80 flex items-center justify-between">
        <div class="flex flex-col">
          <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Price</span>
          <span class="text-2xl font-black text-neutral-900 tracking-tighter">
            <span class="text-primary-600 text-sm mr-0.5 font-bold italic">฿</span>{{ product.price.toLocaleString() }}
          </span>
        </div>
        
        <div class="w-14 h-14 rounded-2xl bg-neutral-950 text-white flex items-center justify-center group-hover:bg-primary-600 group-hover:scale-110 shadow-lg shadow-neutral-950/10 group-hover:shadow-primary-600/20 transition-all duration-500 transform-gpu pointer-events-none">
          <Icon name="mynaui:plus" class="text-2xl" />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  product: {
    id: string
    name: string
    description: string
    price: number
    image: string
    badge?: string
    unit?: string
  }
}>()
</script>
