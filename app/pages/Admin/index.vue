<script setup lang="ts">
definePageMeta({ layout: 'admin' })

useHead({ title: 'Admin Dashboard | Swizer Superfoods' })

const { data: productsData } = useAuthFetch<any>('/api/products')
const { data: categoriesData } = useAuthFetch<any>('/api/categories')

const totalProducts = computed(() => productsData.value?.length || 0)
const totalCategories = computed(() => categoriesData.value?.length || 0)
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6 space-y-6">
        <div>
          <h1 class="text-2xl font-bold">ยินดีต้อนรับ Admin</h1>
          <p class="text-muted mt-1">ภาพรวมของระบบจัดการสินค้า</p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <UCard>
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-xl bg-primary/10">
                <UIcon name="i-lucide-package" class="text-primary size-6" />
              </div>
              <div>
                <p class="text-sm text-muted">สินค้าทั้งหมด</p>
                <p class="text-2xl font-bold">{{ totalProducts }}</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-xl bg-success/10">
                <UIcon name="i-lucide-folder-tree" class="text-success size-6" />
              </div>
              <div>
                <p class="text-sm text-muted">หมวดหมู่ทั้งหมด</p>
                <p class="text-2xl font-bold">{{ totalCategories }}</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-xl bg-warning/10">
                <UIcon name="i-lucide-activity" class="text-warning size-6" />
              </div>
              <div>
                <p class="text-sm text-muted">สถานะระบบ</p>
                <p class="text-2xl font-bold text-success">Active</p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Quick links -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">เมนูด่วน</h3>
          </template>
          <div class="flex flex-wrap gap-3">
            <UButton to="/Admin/Products" icon="i-lucide-package" label="จัดการสินค้า" color="primary" variant="soft" />
            <UButton to="/Admin/Categories" icon="i-lucide-folder-tree" label="จัดการหมวดหมู่" color="primary" variant="soft" />
            <UButton to="/" icon="i-lucide-globe" label="ดูหน้าเว็บไซต์" color="neutral" variant="soft" />
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>