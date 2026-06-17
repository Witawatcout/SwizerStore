<script setup lang="ts">
definePageMeta({ layout: 'admin' })

useHead({ title: 'จัดการสินค้า | Admin' })

const { data: productsData, status: productsStatus, refresh: refreshProducts } = useAuthFetch<any>('/api/products?includeInactive=1')
const { data: categoriesData } = useAuthFetch<any>('/api/categories?includeInactive=1')

const loading = computed(() => productsStatus.value === 'pending' || productsStatus.value === 'idle')
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Products">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-refresh-cw" label="รีเฟรช" color="neutral" variant="soft" :loading="loading" @click="refreshProducts()" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6 space-y-5">
        <AdminProductTable
          :data="productsData || []"
          :categories="categoriesData || []"
          :loading="loading"
          @save="refreshProducts()"
          @delete="refreshProducts()"
          @bulk-status-updated="refreshProducts()"
          @bulk-deleted="refreshProducts()"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
