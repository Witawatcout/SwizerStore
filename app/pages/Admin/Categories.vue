<script setup lang="ts">
definePageMeta({ layout: 'admin' })

useHead({ title: 'จัดการหมวดหมู่ | Admin' })

const { data: categoriesData, status: categoriesStatus, refresh: refreshCategories } = useAuthFetch<any>('/api/categories')

const loading = computed(() => categoriesStatus.value === 'pending' || categoriesStatus.value === 'idle')
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Categories">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6">
        <AdminCategoryTable
          :data="categoriesData || []"
          :loading="loading"
          @save="refreshCategories()"
          @delete="refreshCategories()"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
