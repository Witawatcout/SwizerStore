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
              variant="secondary"
              size="sm"
              :class="{ '!bg-primary-500 !text-white': !selectedCategory }"
              @click="selectedCategory = null"
            >
              ทั้งหมด
            </BaseButton>
            <BaseButton 
              v-for="category in categories" 
              :key="category.id"
              :variant="category.active ? 'primary' : 'secondary'"
              size="sm"
              @click="toggleCategory(category.id)"
            >
              {{ category.name }}
            </BaseButton>
          </div>
        </div>
      </section>
 
      <!-- Product Grid -->
      <section class="max-w-screen-2xl mx-auto px-8">
        <!-- Loading state -->
        <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div v-for="i in 4" :key="i" class="aspect-[3/4] bg-neutral-100 rounded-xl animate-pulse" />
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredProducts.length === 0" class="text-center py-20">
          <Icon name="mynaui:box" class="text-6xl text-neutral-300 mb-4" />
          <p class="text-neutral-500 text-lg">ไม่พบสินค้าในหมวดหมู่นี้</p>
        </div>

        <!-- Products -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <ProductCard 
            v-for="(product, index) in filteredProducts" 
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

const { data: products, status } = useLazyFetch<any[]>('/api/products')
const { data: categoriesData } = useLazyFetch<any[]>('/api/categories')

// สร้าง category filter จาก API (เฉพาะ main categories)
const selectedCategory = ref<string | null>(null)

const categories = computed(() => {
  if (!categoriesData.value) return []
  return categoriesData.value
    .filter((c: any) => !c.parent_id)
    .map((c: any) => ({
      id: c.id,
      name: c.name,
      active: selectedCategory.value === c.id
    }))
})

function toggleCategory(catId: string) {
  selectedCategory.value = selectedCategory.value === catId ? null : catId
}

// กรองสินค้าตาม category (รวม sub-categories)
const filteredProducts = computed(() => {
  if (!products.value) return []
  if (!selectedCategory.value) return products.value

  // หา sub-category ids ที่อยู่ภายใต้ selected category
  const subCatIds = (categoriesData.value || [])
    .filter((c: any) => c.parent_id === selectedCategory.value)
    .map((c: any) => c.id)

  const allCatIds = [selectedCategory.value, ...subCatIds]

  return products.value.filter((p: any) => allCatIds.includes(p.category_id))
})

const isLoading = computed(() => status.value === 'pending' || status.value === 'idle')
</script>
 
<style scoped>
/* Scoped styles removed in favor of global hardware-accelerated animations */
</style>