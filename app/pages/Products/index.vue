<script setup lang="ts">
useHead({
  title: "สินค้า | Swizer Superfoods",
});

const { data: products, status } = useLazyFetch<any[]>("/api/products");
const { data: categoriesData, status: categoriesStatus } = useLazyFetch<any[]>("/api/categories");

const selectedCategory = ref<string>("all");
const searchText = ref("");
const sortBy = ref("name");

const isLoading = computed(() =>
  status.value === "pending" ||
  status.value === "idle" ||
  categoriesStatus.value === "pending" ||
  categoriesStatus.value === "idle"
);
const productList = computed(() => products.value || []);
const categoryList = computed(() => categoriesData.value || []);

const mainCategories = computed(() =>
  categoryList.value
    .filter((category: any) => !category.parent_id)
    .map((category: any) => ({
      ...category,
      children: categoryList.value.filter((child: any) => child.parent_id === category.id),
    }))
);

const categoryOptions = computed(() => [
  { label: `ทั้งหมด (${productList.value.length})`, value: "all" },
  ...mainCategories.value.flatMap((category: any) => [
    { label: `${category.name} (${categoryProductCount(category.id)})`, value: String(category.id) },
    ...category.children.map((child: any) => ({
      label: `- ${child.name} (${categoryProductCount(child.id)})`,
      value: String(child.id),
    })),
  ]),
]);

const sortItems = [
  { label: "เรียงตามชื่อ", value: "name" },
  { label: "ราคาต่ำไปสูง", value: "price_asc" },
  { label: "ราคาสูงไปต่ำ", value: "price_desc" },
  { label: "สินค้าใหม่ล่าสุด", value: "newest" },
];

const selectedCategoryName = computed(() => {
  if (selectedCategory.value === "all") return "สินค้าทั้งหมด";
  return categoryList.value.find((category: any) => String(category.id) === selectedCategory.value)?.name || "สินค้า";
});

const selectedCategoryIds = computed(() => {
  if (selectedCategory.value === "all") return [];

  const childIds = categoryList.value
    .filter((category: any) => String(category.parent_id) === selectedCategory.value)
    .map((category: any) => String(category.id));

  return [selectedCategory.value, ...childIds];
});

const filteredProducts = computed(() => {
  const keyword = searchText.value.trim().toLowerCase();
  const filtered = productList.value.filter((product: any) => {
    const matchesCategory =
      selectedCategory.value === "all" || selectedCategoryIds.value.includes(String(product.category_id));
    const matchesSearch =
      !keyword ||
      String(product.name || "").toLowerCase().includes(keyword) ||
      String(product.category_name || "").toLowerCase().includes(keyword);

    return matchesCategory && matchesSearch;
  });

  return [...filtered].sort((a: any, b: any) => {
    if (sortBy.value === "price_asc") return Number(a.price || 0) - Number(b.price || 0);
    if (sortBy.value === "price_desc") return Number(b.price || 0) - Number(a.price || 0);
    if (sortBy.value === "newest") return String(b.id).localeCompare(String(a.id));
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
});

function categoryProductCount(categoryId: string | number) {
  const id = String(categoryId);
  const childIds = categoryList.value
    .filter((category: any) => String(category.parent_id) === id)
    .map((category: any) => String(category.id));
  const ids = [id, ...childIds];

  return productList.value.filter((product: any) => ids.includes(String(product.category_id))).length;
}

function selectCategory(categoryId: string | number) {
  selectedCategory.value = String(categoryId);
}

function clearFilters() {
  selectedCategory.value = "all";
  searchText.value = "";
  sortBy.value = "name";
}
</script>

<template>
  <div class="bg-[#eff5e9] text-on-background font-body">
    <main class="pb-20 pt-10 md:pt-12">
      <section class="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-2xl fade-in-up">
            <span class="mb-2 block text-sm font-semibold uppercase tracking-widest text-primary-700">Swizer Pantry</span>
            <h1 class="text-4xl font-black tracking-normal text-neutral-950 md:text-5xl">สินค้า</h1>
            <p class="mt-3 text-sm leading-6 text-neutral-700">
              เลือกดูสินค้าตามหมวดหมู่ ค้นหาสินค้าที่ต้องการ และจัดเรียงรายการให้เหมาะกับการเลือกซื้อ
            </p>
          </div>

          <div v-if="isLoading" class="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_180px] lg:min-w-[520px]" aria-hidden="true">
            <USkeleton class="h-12 rounded-full" />
            <USkeleton class="h-12 rounded-full" />
          </div>

          <div v-else class="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_180px] lg:min-w-[520px]">
            <UInput
              v-model="searchText"
              icon="i-lucide-search"
              placeholder="ค้นหาสินค้า"
              size="lg"
            />
            <USelect v-model="sortBy" :items="sortItems" icon="i-lucide-arrow-up-down" size="lg" />
          </div>
        </div>

        <div v-if="isLoading" class="mb-5 lg:hidden" aria-hidden="true">
          <USkeleton class="h-12 rounded-full" />
        </div>

        <div v-else class="mb-5 lg:hidden">
          <USelect
            v-model="selectedCategory"
            :items="categoryOptions"
            icon="i-lucide-list-filter"
            size="lg"
            class="w-full"
          />
        </div>

        <div class="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside class="hidden lg:block">
            <div v-if="isLoading" class="sticky top-24 rounded-lg border border-primary-200 bg-[#fbfff6] p-4 shadow-sm shadow-primary-950/5" aria-hidden="true">
              <div class="mb-5 space-y-2">
                <USkeleton class="h-3 w-24 rounded-full" />
                <USkeleton class="h-6 w-40 rounded-full" />
              </div>
              <div class="space-y-3">
                <USkeleton class="h-10 rounded-md" />
                <USkeleton v-for="i in 6" :key="`category-skeleton-${i}`" class="h-9 rounded-md" />
              </div>
            </div>

            <div v-else class="sticky top-24 rounded-lg border border-primary-200 bg-[#fbfff6] p-4 shadow-sm shadow-primary-950/5">
              <div class="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p class="text-xs font-bold uppercase tracking-widest text-primary-700">Categories</p>
                  <h2 class="text-lg font-black text-neutral-950">หมวดหมู่สินค้า</h2>
                </div>
                <UButton
                  v-if="selectedCategory !== 'all' || searchText"
                  icon="i-lucide-x"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  @click="clearFilters"
                />
              </div>

              <button
                type="button"
                class="mb-2 flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-bold transition-colors"
                :class="selectedCategory === 'all' ? 'bg-primary-600 text-white shadow-sm shadow-primary-900/20' : 'text-neutral-800 hover:bg-primary-50 hover:text-primary-900'"
                @click="selectedCategory = 'all'"
              >
                <span>ทั้งหมด</span>
                <span
                  class="rounded-full px-2 py-0.5 text-xs"
                  :class="selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-800'"
                >
                  {{ productList.length }}
                </span>
              </button>

              <div class="space-y-2">
                <div v-for="category in mainCategories" :key="category.id">
                  <button
                    type="button"
                    class="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-bold transition-colors"
                    :class="selectedCategory === String(category.id) ? 'bg-primary-600 text-white shadow-sm shadow-primary-900/20' : 'text-neutral-800 hover:bg-primary-50 hover:text-primary-900'"
                    @click="selectCategory(category.id)"
                  >
                    <span class="truncate">{{ category.name }}</span>
                    <span
                      class="rounded-full px-2 py-0.5 text-xs"
                      :class="selectedCategory === String(category.id) ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-800'"
                    >
                      {{ categoryProductCount(category.id) }}
                    </span>
                  </button>

                  <div v-if="category.children.length" class="mt-1 space-y-1 pl-3">
                    <button
                      v-for="child in category.children"
                      :key="child.id"
                      type="button"
                      class="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-sm transition-colors"
                      :class="selectedCategory === String(child.id) ? 'bg-primary-100 font-bold text-primary-900' : 'text-neutral-600 hover:bg-primary-50 hover:text-primary-900'"
                      @click="selectCategory(child.id)"
                    >
                      <span class="truncate">{{ child.name }}</span>
                      <span class="text-xs">{{ categoryProductCount(child.id) }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section>
            <div v-if="isLoading" class="mb-5 flex flex-col gap-3 rounded-lg border border-primary-200 bg-[#fbfff6] px-4 py-3 shadow-sm shadow-primary-950/5 sm:flex-row sm:items-center sm:justify-between" aria-hidden="true">
              <div class="space-y-2">
                <USkeleton class="h-5 w-48 rounded-full" />
                <USkeleton class="h-4 w-32 rounded-full" />
              </div>
              <div class="flex flex-wrap gap-2">
                <USkeleton class="h-6 w-28 rounded-full" />
                <USkeleton class="h-6 w-24 rounded-full" />
              </div>
            </div>

            <div v-else class="mb-5 flex flex-col gap-3 rounded-lg border border-primary-200 bg-[#fbfff6] px-4 py-3 shadow-sm shadow-primary-950/5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="font-black text-neutral-950">{{ selectedCategoryName }}</p>
                <p class="text-sm text-neutral-700">
                  พบ {{ filteredProducts.length }} รายการ
                  <span v-if="searchText">สำหรับ "{{ searchText }}"</span>
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <UBadge :label="`${productList.length} สินค้าทั้งหมด`" color="neutral" variant="subtle" />
                <UBadge v-if="selectedCategory !== 'all'" :label="selectedCategoryName" color="primary" variant="subtle" />
              </div>
            </div>

            <div v-if="isLoading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              <ProductCardSkeleton v-for="i in 8" :key="`product-skeleton-${i}`" />
            </div>

            <div v-else-if="filteredProducts.length === 0" class="rounded-lg border border-primary-200 bg-[#fbfff6] px-6 py-16 text-center shadow-sm shadow-primary-950/5">
              <UIcon name="i-lucide-package-search" class="mx-auto mb-4 size-12 text-primary-300" />
              <h2 class="text-2xl font-black text-neutral-950">ไม่พบสินค้าในหมวดนี้</h2>
              <p class="mx-auto mt-2 max-w-md text-sm text-neutral-700">ลองเลือกหมวดหมู่อื่น หรือล้างคำค้นหาเพื่อดูสินค้าทั้งหมด</p>
              <UButton icon="i-lucide-rotate-ccw" label="ล้างตัวกรอง" color="neutral" variant="soft" class="mt-5" @click="clearFilters" />
            </div>

            <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              <ProductCard
                v-for="(product, index) in filteredProducts"
                :key="product.id"
                :product="product"
                class="fade-in-up"
                :style="{ animationDelay: `${120 + index * 45}ms` }"
              />
            </div>
          </section>
        </div>
      </section>
    </main>
  </div>
</template>
