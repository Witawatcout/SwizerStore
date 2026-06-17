<template>
  <div class="font-body text-neutral-950 overflow-x-hidden">

    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center overflow-hidden pt-8 md:pt-10 lg:pt-12">
      <div class="max-w-screen-2xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        <div class="lg:col-span-6 z-10 fade-in-up" style="animation-duration: 0.8s;">
          <span
            class="inline-block px-4 py-1.5 rounded-full bg-secondary-200 text-secondary-900 font-label text-xs font-bold uppercase tracking-widest mb-6 shadow-sm border border-secondary-300">
            {{ hero.badge }}
          </span>
          <h1
            class="font-headline text-5xl md:text-7xl lg:text-8xl font-extrabold text-neutral-950 leading-[1.05] tracking-tighter mb-8 text-balance">
            {{ hero.titleLine1 }} <br /><span class="text-primary-700 italic">{{ hero.titleHighlight }}</span>
          </h1>
          <p class="text-lg md:text-xl text-neutral-500 max-w-md mb-10 leading-relaxed font-medium">
            {{ hero.description }}
          </p>
          <NuxtLink to="/products">
            <div class="flex gap-4">
              <BaseButton size="lg" icon="mynaui:arrow-long-right-solid"
                class="shadow-xl shadow-primary-600/20 cursor-pointer">
                {{ hero.cta }}
              </BaseButton>
            </div>
          </NuxtLink>

        </div>

        <!-- Stacked image carousel -->
        <div class="lg:col-span-6 relative h-[60vh] lg:h-auto fade-in-up"
          style="animation-duration: 1s; animation-delay: 150ms;">
          <div class="relative aspect-[4/5] mx-auto max-w-lg lg:max-w-none">
            <!-- Non-animated backdrops for performance -->
            <div
              class="absolute inset-0 rounded-[2rem] bg-primary-200/40 transform-gpu rotate-6 scale-95 translate-x-4 translate-y-2">
            </div>
            <div
              class="absolute inset-0 rounded-[2rem] bg-secondary-300/50 transform-gpu -rotate-3 scale-[0.97] -translate-x-2 translate-y-1">
            </div>

            <div v-for="(image, index) in heroImages" :key="index"
              class="absolute inset-0 rounded-[2rem] overflow-hidden editorial-shadow transition-all duration-[800ms] ease-out border border-white/50 carousel-item"
              :class="getImageClass(index)">
              <img :alt="image.alt" class="w-full h-full object-cover" :src="image.src" loading="eager" />
            </div>

            <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              <button v-for="(_, index) in heroImages" :key="index"
                class="rounded-full transition-all duration-300 h-2.5 shadow-sm transform-gpu"
                :class="activeImage === index ? 'bg-white w-8 shadow-md' : 'bg-white/60 hover:bg-white/90 w-2.5'"
                @click="goToImage(index)"></button>
            </div>
          </div>

          <div
            class="hidden md:block absolute -bottom-10 lg:-bottom-18 left-8 lg:-left-20 p-6 md:p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-30 fade-in-up hover:-translate-y-2 transition-transform duration-300 transform-gpu"
            style="animation-delay: 300ms; animation-duration: 1s;">
            <div class="flex items-center gap-5">
              <div
                class="w-14 h-14 rounded-2xl bg-tertiary-100 flex items-center justify-center text-tertiary-700 shadow-inner">
                <Icon :name="hero.infoCard.icon" class="text-3xl" />
              </div>
              <div>
                <p class="text-base font-bold font-headline text-neutral-900">{{ hero.infoCard.title }}</p>
                <p class="text-sm text-neutral-500 font-medium">{{ hero.infoCard.subtitle }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- The Superfoods Section -->
    <section class="py-24 md:py-32 bg-neutral-50 border-t border-neutral-100">
      <div class="max-w-screen-2xl mx-auto px-8">
        <div class="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-20 gap-8 fade-in-up">
          <div class="max-w-2xl">
            <h2 class="font-headline text-4xl md:text-5xl lg:text-6xl font-black text-neutral-950 mb-4 tracking-tight">
              {{ productsSection.title }}</h2>
            <p class="text-neutral-500 text-lg md:text-xl font-medium">{{ productsSection.subtitle }}</p>
          </div>
          <NuxtLink to="/products" class="flex gap-4">
            <BaseButton variant="white" icon="mynaui:arrow-long-right-solid" class="cursor-pointer">
              ดูผลิตภัณฑ์ทั้งหมด
            </BaseButton>
          </NuxtLink>

        </div>

        <div v-if="isProductsSectionLoading" class="space-y-20" aria-hidden="true">
          <div v-for="section in 2" :key="`home-category-section-skeleton-${section}`" class="space-y-8">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div class="space-y-3">
                <USkeleton class="h-5 w-28 rounded-full" />
                <USkeleton class="h-10 w-56 rounded-full" />
              </div>
              <USkeleton class="h-11 w-36 rounded-full" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
              <ProductCardSkeleton v-for="i in 3" :key="`home-product-skeleton-${section}-${i}`" class="fade-in-up"
                :style="{ animationDelay: `${100 + i * 80}ms`, animationDuration: '0.8s' }" />
            </div>
          </div>
        </div>

        <div v-else-if="featuredProducts.length || homeCategorySections.length" class="space-y-12">
          <section v-if="featuredProducts.length"
            class="-mx-4 space-y-8 border-y border-warning/30 bg-warning/10 px-4 py-12 fade-in-up md:-mx-8 md:px-8 md:py-14">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div class="flex items-stretch gap-4">
                <span class="w-1.5 shrink-0 rounded-full bg-warning" aria-hidden="true" />
                <div>
                  <span
                    class="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-warning">
                    <UIcon name="i-lucide-star" class="size-4" /> Selected by Swizer
                  </span>
                  <h3 class="font-headline text-3xl font-black tracking-tight text-neutral-950 md:text-4xl">สินค้าแนะนำ
                  </h3>
                </div>
              </div>
              <NuxtLink :to="{ path: '/products', query: { category: 'featured' } }"
                class="inline-flex items-center gap-2 self-start rounded-full border border-warning/30 bg-white px-5 py-3 text-sm font-black text-warning shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-warning hover:text-white sm:self-auto">
                ดูสินค้าแนะนำ
                <Icon name="mynaui:arrow-long-right-solid" />
              </NuxtLink>
            </div>
            <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-12">
              <ProductCard v-for="(product, idx) in featuredProducts" :key="`featured-${product.id}`" :product="product"
                class="fade-in-up" :style="{ animationDelay: `${100 + idx * 80}ms`, animationDuration: '0.8s' }" />
            </div>
          </section>

          <section v-for="(section, sectionIndex) in homeCategorySections" :key="section.category.id"
            class="category-section -mx-4 space-y-8 border-y px-4 py-12 fade-in-up md:-mx-8 md:px-8 md:py-14" :style="{
              animationDelay: `${sectionIndex * 80}ms`,
              animationDuration: '0.8s',
              '--category-color': getCategoryColor(section.category.color),
              '--category-soft': categoryColorWithAlpha(section.category.color, 0.1),
              '--category-border': categoryColorWithAlpha(section.category.color, 0.3),
              '--category-background': categoryColorWithAlpha(section.category.color, 0.1),
            }">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div class="flex items-stretch gap-4">
                <span class="w-1.5 shrink-0 rounded-full bg-[var(--category-color)]" aria-hidden="true" />
                <div>
                  <span class="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-[var(--category-color)]">
                    {{ section.total }} products
                  </span>
                  <h3 class="font-headline text-3xl md:text-4xl font-black text-neutral-950 tracking-tight">
                    {{ section.category.name }}
                  </h3>
                </div>
              </div>
              <NuxtLink :to="{ path: '/products', query: { category: String(section.category.id) } }"
                class="category-link inline-flex items-center gap-2 self-start rounded-full border px-5 py-3 text-sm font-black shadow-sm transition-all duration-300 hover:-translate-y-0.5 sm:self-auto">
                ดูหมวดนี้
                <Icon name="mynaui:arrow-long-right-solid" />
              </NuxtLink>
            </div>

            <div v-if="section.products.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
              <ProductCard v-for="(product, idx) in section.products" :key="`${section.category.id}-${product.id}`"
                :product="product" class="fade-in-up"
                :style="{ animationDelay: `${100 + idx * 80}ms`, animationDuration: '0.8s' }" />
            </div>

            <div v-else class="rounded-[2rem] border border-primary-100 bg-white p-8 text-neutral-500">
              ยังไม่มีสินค้าในหมวดนี้
            </div>
          </section>
        </div>

        <div v-else class="rounded-[2rem] border border-primary-100 bg-white p-10 text-center fade-in-up">
          <Icon name="mynaui:sparkles" class="mx-auto mb-4 text-4xl text-primary-600" />
          <h3 class="font-headline text-2xl font-black text-neutral-950">ยังไม่มีสินค้าแสดง</h3>
          <p class="mt-2 text-neutral-500">เมื่อเพิ่มสินค้าในระบบแล้ว รายการจะแสดงที่หน้าแรกอัตโนมัติ</p>
        </div>
      </div>
    </section>

    <!-- Brand Story Section -->
    <section class="py-24 md:py-32 bg-white overflow-hidden">
      <div class="max-w-screen-2xl mx-auto px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div class="relative order-2 lg:order-1 fade-in-up" style="animation-delay: 200ms; animation-duration: 0.8s;">
            <div class="rounded-[3rem] overflow-hidden aspect-video lg:aspect-square editorial-shadow relative group">
              <img :alt="story.imageAlt"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1s] ease-out will-change-transform transform-gpu"
                :src="story.image" loading="lazy" />
            </div>
            <div
              class="absolute -top-10 -right-10 w-48 h-48 bg-primary-300 rounded-full opacity-30 hidden lg:block blur-[40px] pointer-events-none">
            </div>
            <div
              class="absolute -bottom-10 -left-10 w-64 h-64 bg-secondary-300 rounded-full opacity-30 hidden lg:block blur-[50px] pointer-events-none">
            </div>
          </div>

          <div class="order-1 lg:order-2 fade-in-up" style="animation-delay: 300ms; animation-duration: 0.8s;">
            <div
              class="inline-flex items-center gap-3 font-label text-primary-600 tracking-[0.2em] mb-6 text-sm font-bold uppercase">
              <span class="w-8 h-[2px] bg-primary-600 block"></span>
              SWIZER SUPERFOODS
            </div>
            <h2
              class="font-headline text-5xl md:text-6xl lg:text-7xl font-black text-neutral-950 mb-8 leading-[1.1] tracking-tight">
              {{ story.titleLine1 }} <br /><span
                class="text-secondary-600 italic underline decoration-secondary-300 decoration-4 underline-offset-8">{{
                  story.titleHighlight }}</span>
            </h2>
            <div class="space-y-6 text-lg md:text-xl text-neutral-500 leading-relaxed font-medium">
              <p v-for="(para, i) in story.paragraphs" :key="i">{{ para }}</p>
            </div>
            <div class="mt-14 pt-12 border-t border-neutral-100 grid grid-cols-2 gap-8">
              <div v-for="stat in story.stats" :key="stat.label" class="group">
                <h4
                  class="font-headline font-black text-5xl md:text-6xl text-primary-700 mb-2 group-hover:scale-105 transition-transform origin-left transform-gpu">
                  {{ stat.value }}</h4>
                <p
                  class="text-sm font-bold uppercase tracking-widest text-neutral-400 group-hover:text-primary-600 transition-colors">
                  {{ stat.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest News Section -->
    <section class="py-24 md:py-32 bg-neutral-50 border-t border-neutral-100">
      <div class="max-w-screen-2xl mx-auto px-8">
        <div class="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-20 gap-8 fade-in-up"
          style="animation-delay: 200ms;">
          <div class="max-w-2xl">
            <h2 class="font-headline text-4xl md:text-5xl lg:text-6xl font-black text-neutral-950 mb-4 tracking-tight">
              Latest News</h2>
            <p class="text-neutral-500 text-lg md:text-xl font-medium">อัปเดตบทความเพื่อสุขภาพและข่าวสารล่าสุดจากเรา</p>
          </div>
          <NuxtLink to="/news" class="flex gap-4">
            <BaseButton variant="white" icon="mynaui:arrow-long-right-solid" class="cursor-pointer">
              ดูบทความทั้งหมด
            </BaseButton>
          </NuxtLink>
        </div>

        <div v-if="isHomeLoading" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="i in 3" :key="`home-news-skeleton-${i}`"
            class="overflow-hidden rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] fade-in-up"
            :style="{ animationDelay: `${300 + i * 100}ms` }" aria-hidden="true">
            <USkeleton class="aspect-[4/3] rounded-none" />
            <div class="space-y-4 p-8">
              <USkeleton class="h-4 w-24 rounded-full" />
              <USkeleton class="h-7 w-full rounded-full" />
              <USkeleton class="h-7 w-3/4 rounded-full" />
              <div class="space-y-2">
                <USkeleton class="h-4 w-full rounded-full" />
                <USkeleton class="h-4 w-2/3 rounded-full" />
              </div>
              <USkeleton class="h-5 w-28 rounded-full" />
            </div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <NuxtLink v-for="(news, idx) in latestNews" :key="news.id" :to="`/news/${news.id}`"
            class="group bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 flex flex-col fade-in-up transform-gpu"
            :style="{ animationDelay: `${300 + idx * 100}ms` }">
            <div class="aspect-[4/3] overflow-hidden relative">
              <img :src="news.image" :alt="news.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1s] ease-out will-change-transform"
                loading="lazy" />
              <div
                class="absolute top-5 left-5 px-4 py-1.5 bg-white/90 backdrop-blur-sm text-primary-700 rounded-full text-xs font-bold font-label tracking-widest uppercase shadow-sm">
                {{ news.tag }}
              </div>
            </div>
            <div class="p-8 flex flex-col flex-grow">
              <p class="text-sm font-bold text-neutral-400 mb-3">{{ news.date }}</p>
              <h3
                class="font-headline text-2xl font-black mb-4 text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight pr-4">
                {{ news.title }}</h3>
              <p class="text-neutral-500 leading-relaxed font-medium line-clamp-2 mb-6">{{ news.desc }}</p>
              <div class="mt-auto flex items-center gap-2 text-primary-600 font-bold group-hover:text-primary-700">
                อ่านต่อ
                <Icon name="mynaui:arrow-long-right-solid" class="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import Img1 from '@@/public/Home/1200x600-1-scaled.jpg'
import Img2 from '@@/public/Home/1200x600-2-scaled.jpg'
import Img3 from '@@/public/Home/1200x600-3-scaled.jpg'
import Img4 from '@@/public/Home/1200x600-4-scaled.jpg'
import Img5 from '@@/public/Home/1200x600-6-scaled.jpg'
import Img6 from '@@/public/Home/1200x600-7-scaled.jpg'
import StoryImg from '@@/public/Home/Products-scaled.jpg'

import { newsItems } from '../assets/news'

useHead({
  title: 'Swizer Superfoods'
})

// ===== DATA =====

const hero = {
  badge: 'Premium Superfoods',
  titleLine1: 'Give Beyond',
  titleHighlight: 'Health.',
  description: 'Swizer (สไวเซอร์) คือแบรนด์ผู้พัฒนาและจัดจำหน่ายผลิตภัณฑ์ในกลุ่ม Superfoods นำเข้าวัตถุดิบชั้นเลิศจากต้นตำรับ เพื่อผู้บริโภคชาวไทย',
  cta: 'ซื้อสินค้า',
  infoCard: {
    icon: 'mynaui:lightning',
    title: 'สุขภาพดี เริ่มต้นที่นี่',
    subtitle: 'นำเสนอสิ่งที่ดีที่สุดเพื่อคุณและคนที่คุณรัก',
  },
}

const heroImages = [
  { alt: 'Smoothie bowl with acai and chia', src: Img1 },
  { alt: 'Premium organic acai powder', src: Img2 },
  { alt: 'Artisanal roasted coffee beans', src: Img3 },
  { alt: 'Organic farmer in the field', src: Img4 },
  { alt: 'Superfood collection', src: Img5 },
  { alt: 'Natural ingredients', src: Img6 },
]

const productsSection = {
  title: 'Our Products',
  subtitle: 'ผลิตภัณฑ์อาหารเสริมและเพื่อสุขภาพที่คัดสรรมาอย่างดี',
}

const { data: homeProductsData, status: homeProductsStatus } = useLazyFetch<any[]>('/api/products')
const { data: homeCategoriesData, status: homeCategoriesStatus } = useLazyFetch<any[]>('/api/categories')

const homeProducts = computed(() => homeProductsData.value || [])
const homeCategories = computed(() => homeCategoriesData.value || [])
const featuredProducts = computed(() =>
  homeProducts.value
    .filter((product: any) => Number(product.is_featured ?? 0) === 1)
    .sort(compareFeaturedProducts)
    .slice(0, 3)
)
const homeCategorySections = computed(() =>
  homeCategories.value
    .filter((category: any) => !category.parent_id)
    .map((category: any) => {
      const id = String(category.id)
      const childIds = homeCategories.value
        .filter((child: any) => String(child.parent_id) === id)
        .map((child: any) => String(child.id))
      const ids = [id, ...childIds]
      const products = homeProducts.value.filter((product: any) =>
        Number(product.is_featured ?? 0) !== 1 &&
        productCategoryIds(product).some(categoryId => ids.includes(categoryId))
      )

      return {
        category,
        products: products.slice(0, 3),
        total: products.length,
      }
    })
)

function getCategoryColor(value: unknown) {
  const color = String(value || '').trim().toUpperCase()
  return /^#[0-9A-F]{6}$/.test(color) ? color : '#65A30D'
}

function productCategoryIds(product: any) {
  const ids = Array.isArray(product?.category_ids) ? product.category_ids.map(String) : []
  return [...new Set([String(product?.category_id || ''), ...ids].filter(Boolean))]
}

function compareFeaturedProducts(a: any, b: any) {
  const aOrder = Number(a.featured_order || 0) || Number.MAX_SAFE_INTEGER
  const bOrder = Number(b.featured_order || 0) || Number.MAX_SAFE_INTEGER
  return aOrder - bOrder || String(a.name || '').localeCompare(String(b.name || ''), 'th')
}

function categoryColorWithAlpha(value: unknown, alpha: number) {
  const color = getCategoryColor(value)
  const red = Number.parseInt(color.slice(1, 3), 16)
  const green = Number.parseInt(color.slice(3, 5), 16)
  const blue = Number.parseInt(color.slice(5, 7), 16)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}
const isProductsSectionLoading = computed(() =>
  isHomeLoading.value ||
  homeProductsStatus.value === 'pending' ||
  homeProductsStatus.value === 'idle' ||
  homeCategoriesStatus.value === 'pending' ||
  homeCategoriesStatus.value === 'idle'
)

const latestNews = newsItems.slice(0, 3)

const story = {
  titleLine1: 'SWIZER',
  titleHighlight: 'Story.',
  imageAlt: 'Swizer product presentation',
  image: StoryImg,
  paragraphs: [
    "เพราะเราเชื่อว่าการมีสุขภาพที่ดี คือจุดเริ่มต้นของสิ่งดีๆ เราจึงตั้งใจที่จะส่งมอบอาหารเพื่อสุขภาพที่เป็นมากกว่าคำว่า 'ดี' แต่ต้องทำให้คุณ 'ดูดี' จากภายในสู่ภายนอก",
    "เราคัดสรรวัตถุดิบชั้นเลิศจากต้นตำรับในต่างประเทศ เพื่อผู้บริโภคชาวไทย มั่นใจว่าคุณจะได้รับประโยชน์สูงสุดจากธรรมชาติ 100%",
  ],
  stats: [
    { value: 'Premium', label: 'Quality' },
    { value: '100%', label: 'Natural & Safe' },
  ],
}

// ===== CAROUSEL LOGIC =====

const activeImage = ref(0)
const isHomeLoading = ref(true)
let interval: ReturnType<typeof setInterval> | null = null
let loadingTimer: ReturnType<typeof setTimeout> | null = null

function getImageClass(index: number) {
  const total = heroImages.length
  const prev = (activeImage.value - 1 + total) % total

  if (index === activeImage.value) {
    return 'opacity-100 scale-100 rotate-2 z-20 shadow-[-20px_40px_60px_-15px_rgba(0,0,0,0.15)] translate3d(0,0,0)'
  } else if (index === prev) {
    return 'opacity-40 scale-[0.93] -rotate-3 z-10 translate-x-4 translate3d(0,0,0)'
  } else {
    return 'opacity-0 scale-[0.85] rotate-6 z-0 -translate-y-4 translate3d(0,0,0)'
  }
}

function goToImage(index: number) {
  activeImage.value = index
  resetInterval()
}

function resetInterval() {
  if (interval) clearInterval(interval)
  interval = setInterval(() => {
    activeImage.value = (activeImage.value + 1) % heroImages.length
  }, 4000)
}

onMounted(() => {
  resetInterval()
  loadingTimer = setTimeout(() => {
    isHomeLoading.value = false
  }, 450)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
  if (loadingTimer) clearTimeout(loadingTimer)
})
</script>

<style scoped>
.editorial-shadow {
  box-shadow: 0 40px 60px -20px rgba(66, 105, 0, 0.15);
}

.carousel-item {
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform-style: preserve-3d;
}

.category-link {
  color: var(--category-color);
  background-color: var(--category-soft);
  border-color: var(--category-border);
}

.category-section {
  background-color: var(--category-background);
  border-color: var(--category-border);
}

.category-link:hover {
  background-color: var(--category-color);
  border-color: var(--category-color);
  color: white;
}
</style>
