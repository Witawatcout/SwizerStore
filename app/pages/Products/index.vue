<template>
  <div class="bg-background text-on-background font-body">
    <main class="pt-32 pb-20">
      <!-- Hero Header -->
      <section class="max-w-screen-2xl mx-auto px-8 mb-16">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="max-w-2xl fade-in-up">
            <span class="font-label text-primary font-semibold tracking-widest uppercase text-sm block mb-2 opacity-60">Curated Nutrition</span>
            <h1 class="font-headline text-5xl md:text-6xl font-extrabold tracking-tight text-on-surface">Browse Pantry</h1>
          </div>
          <div class="flex flex-wrap gap-3 fade-in-up" style="animation-delay: 200ms;">
            <BaseButton 
              v-for="category in categories" 
              :key="category.name"
              :variant="category.active ? 'primary' : 'secondary'"
              size="sm"
            >
              {{ category.name }}
            </BaseButton>
          </div>
        </div>
      </section>
 
      <!-- Product Grid -->
      <section class="max-w-screen-2xl mx-auto px-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <ProductCard 
            v-for="(product, index) in products" 
            :key="product.id" 
            :product="product"
            class="fade-in-up"
            :style="{ 'animation-delay': `${300 + index * 100}ms` }"
          />
        </div>
      </section>
 
    </main>
  </div>
</template>
 
<script setup lang="ts">
useHead({
  title: 'สินค้า | Swizer Superfoods'
})
import { products } from '~/assets/data'
 
const categories = [
  { name: 'ธัญพืช', active: true },
  { name: 'กาแฟ', active: false },
  { name: 'โปรตีน', active: false },
  { name: 'อาหารเสริม', active: false },
  { name: 'สุขภาพ', active: false },
]
</script>
 
<style scoped>
/* Scoped styles removed in favor of global hardware-accelerated animations */
</style>