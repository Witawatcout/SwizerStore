<template>
  <div v-if="product" class="bg-background text-on-background font-body selection:bg-primary-container selection:text-on-primary-container">
    <main class="pt-32 pb-20">
      <div class="max-w-screen-2xl mx-auto px-8">
        <!-- Product Section: Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          <!-- Left: Product Gallery -->
          <div class="lg:col-span-7 space-y-8 fade-in-up" style="animation-duration: 0.6s;">
            <div class="relative aspect-square bg-neutral-100 rounded-xl overflow-hidden group">
              <img :alt="product.name" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" :src="product.image" />
              <div v-if="product.badge" class="absolute top-6 left-6 flex flex-col gap-3">
                <span class="bg-primary-500 text-white px-4 py-2 rounded-full text-xs font-bold font-label tracking-widest uppercase shadow-md">{{ product.badge }}</span>
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-6" v-if="product.gallery && product.gallery.length > 0">
              <div v-for="(img, idx) in product.gallery" :key="idx" class="aspect-square bg-neutral-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all shadow-sm hover:shadow-md">
                <img :alt="`${product.name} detail ${idx + 1}`" class="w-full h-full object-cover" :src="img" />
              </div>
            </div>
          </div>
          
          <!-- Right: Details & CTA -->
          <div class="lg:col-span-5 sticky top-28 fade-in-up" style="animation-duration: 0.8s;">
            <div class="space-y-2 mb-8">
              <span class="text-neutral-500 font-label font-semibold tracking-[0.2em] uppercase text-xs">The Living Pantry • Pure Essentials</span>
              <h1 class="text-4xl lg:text-5xl font-extrabold font-headline tracking-tight leading-tight">{{ product.name }}</h1>
              <p class="text-primary-700 font-headline font-bold text-3xl mt-4 tracking-tighter">฿{{ product.price }} <span class="text-sm font-label text-neutral-500 tracking-normal ml-2">/ {{ product.unit || 'ชิ้น' }}</span></p>
            </div>
            
            <div class="space-y-6 mb-10 text-neutral-600 leading-relaxed">
              <p class="text-lg">{{ product.description }}</p>
              <div class="flex flex-wrap gap-3">
                <div v-for="tag in product.tags" :key="tag" class="px-4 py-2 bg-neutral-100 rounded-full text-neutral-700 text-xs font-bold font-label border border-neutral-200 shadow-sm">{{ tag }}</div>
              </div>
            </div>
            
            <div class="space-y-4 pt-8 border-t border-neutral-200">
              <div class="flex flex-col sm:flex-row items-center gap-4">
                <div class="flex items-center bg-neutral-100 rounded-full px-2 py-1.5 w-full sm:w-auto justify-between sm:justify-center border border-neutral-200">
                  <BaseButton variant="ghost" size="sm" icon="mynaui:minus" @click="qty = Math.max(1, qty - 1)" />
                  <span class="px-6 font-bold text-lg select-none w-10 text-center">{{ qty }}</span>
                  <BaseButton variant="ghost" size="sm" icon="mynaui:plus" @click="qty++" />
                </div>
                <BaseButton 
                  variant="primary" 
                  size="lg" 
                  icon="mynaui:cart" 
                  class="flex-1 w-full"
                >
                  Add to Cart
                </BaseButton>
              </div>
            </div>
            
            <div class="mt-12 grid grid-cols-2 gap-6">
              <div class="p-6 bg-neutral-50 rounded-lg space-y-2 border border-neutral-100 transition-colors hover:bg-neutral-100">
                <Icon name="mynaui:truck" class="text-primary-600 text-2xl" />
                <h4 class="font-headline font-bold text-sm">Fast Shipping</h4>
                <p class="text-xs text-neutral-500">Arrives in 2-3 business days.</p>
              </div>
              <div class="p-6 bg-neutral-50 rounded-lg space-y-2 border border-neutral-100 transition-colors hover:bg-neutral-100">
                <Icon name="mynaui:badge-check" class="text-primary-600" />
                <h4 class="font-headline font-bold text-sm">Certified Quality</h4>
                <p class="text-xs text-neutral-500">Purity and potency guaranteed.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Health Benefits Section -->
        <section v-if="product.benefits && product.benefits.length" class="mt-32 space-y-12">
          <div class="text-center max-w-2xl mx-auto space-y-4 fade-in-up" style="animation-delay: 200ms; animation-duration: 1s;">
            <h2 class="text-4xl font-extrabold font-headline tracking-tight">The Bioactive Edge</h2>
            <p class="text-neutral-500">More than just a flavor profile—our products are functional powerhouses designed to support your body's vital systems from the inside out.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="(benefit, i) in product.benefits" :key="benefit.title" 
                 class="p-10 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-neutral-100 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 fade-in-up"
                 :style="{ 'animation-delay': `${300 + (i * 150)}ms`, 'animation-duration': '0.8s' }">
              <div class="w-14 h-14 bg-primary-100/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-100 transition-all duration-300">
                <Icon :name="benefit.icon" class="text-3xl text-primary-700" />
              </div>
              <h3 class="text-xl font-bold font-headline mb-3">{{ benefit.title }}</h3>
              <p class="text-neutral-500 text-sm leading-relaxed">{{ benefit.text }}</p>
            </div>
          </div>
        </section>

        <!-- How to Use Section -->
        <section v-if="product.rituals && product.rituals.length" class="mt-32 rounded-xl bg-neutral-100/70 p-12 lg:p-20 relative overflow-hidden fade-in-up" style="animation-delay: 600ms; animation-duration: 1s;">
          <div class="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div class="space-y-8">
              <h2 class="text-4xl font-extrabold font-headline tracking-tight text-neutral-900">Rituals for Vitality</h2>
              <div class="space-y-6">
                
                <div v-for="(ritual, i) in product.rituals" :key="ritual.step" class="flex gap-6 group">
                  <span class="text-3xl font-headline font-bold text-primary-500 opacity-40 italic group-hover:opacity-100 transition-opacity">{{ ritual.step }}</span>
                  <div>
                    <h4 class="font-bold text-lg mb-1 group-hover:text-primary-700 transition-colors">{{ ritual.title }}</h4>
                    <p class="text-neutral-600 text-sm leading-relaxed">{{ ritual.text }}</p>
                  </div>
                </div>

              </div>
            </div>
            <div class="relative group h-[500px]">
              <img alt="Rituals" class="w-full h-full object-cover rounded-xl shadow-2xl rotate-2 group-hover:rotate-0 transition-transform duration-700" :src="product.image" />
            </div>
          </div>
        </section>

        <!-- Related Products -->
        <section v-if="relatedProducts.length > 0" class="mt-32 space-y-12 fade-in-up" style="animation-delay: 800ms; animation-duration: 1s;">
          <div class="flex justify-between items-end border-b border-neutral-200 pb-4">
            <h2 class="text-3xl font-extrabold font-headline tracking-tight text-neutral-900">สินค้าแนะนำ</h2>
            <NuxtLink to="/products" class="text-primary-600 font-bold text-sm hover:underline underline-offset-8 transition-all">ดูสินค้าทั้งหมด</NuxtLink>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <ProductCard
              v-for="related in relatedProducts" 
              :key="related.id" 
              :product="related"
            />
          </div>
        </section>

      </div>
    </main>
  </div>
  
  <div v-else class="min-h-screen flex flex-col items-center justify-center font-headline text-neutral-500 gap-4 fade-in-up">
    <Icon name="mynaui:box" class="text-6xl text-neutral-300" />
    <h1 class="text-2xl font-bold">Product not found.</h1>
    <BaseButton 
      to="/products"
      variant="primary"
    >
      Back to Products
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const productId = computed(() => route.params.id as string)

// ดึงข้อมูลสินค้าจาก API
const { data: product, status } = useLazyFetch<any>(() => `/api/products/${productId.value}`)

// ดึงสินค้าทั้งหมดสำหรับ related products
const { data: allProducts } = useLazyFetch<any[]>('/api/products')

useHead({
  title: computed(() => product.value ? `${product.value.name} | Swizer Superfoods` : 'Product Details | Swizer Superfoods')
})

const relatedProducts = computed(() => {
  if (!allProducts.value) return []
  return allProducts.value.filter((p: any) => p.id !== productId.value).slice(0, 4)
})

const qty = ref(1)

// Reset qty when route changes
watch(productId, () => {
  qty.value = 1
})
</script>
