<script setup lang="ts">
definePageMeta({ layout: 'admin' })

useHead({ title: 'จัดการสินค้า | Admin' })

const { data: productsData, status: productsStatus, refresh: refreshProducts } = useAuthFetch<any>('/api/products?includeInactive=1')
const { data: categoriesData } = useAuthFetch<any>('/api/categories')

const loading = computed(() => productsStatus.value === 'pending' || productsStatus.value === 'idle')
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Products">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6">
        <AdminProductTable
          :data="productsData || []"
          :categories="categoriesData || []"
          :loading="loading"
          @save="refreshProducts()"
          @delete="refreshProducts()"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
