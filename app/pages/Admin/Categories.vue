<script setup lang="ts">
definePageMeta({ layout: 'admin' })

useHead({ title: 'จัดการหมวดหมู่ | Admin' })

const { data: categoriesData, status: categoriesStatus, refresh: refreshCategories } = useAuthFetch<any>('/api/categories?includeInactive=1')

const loading = computed(() => categoriesStatus.value === 'pending' || categoriesStatus.value === 'idle')
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Categories">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-refresh-cw" label="รีเฟรช" color="neutral" variant="soft" :loading="loading" @click="refreshCategories()" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6 space-y-5">
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
