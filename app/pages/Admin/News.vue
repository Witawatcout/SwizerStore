<script setup lang="ts">
definePageMeta({ layout: 'admin' })

useHead({ title: 'จัดการข่าวสาร | Admin' })

const { data: newsData, status: newsStatus, refresh: refreshNews } = useAuthFetch<any>('/api/news')

const loading = computed(() => newsStatus.value === 'pending' || newsStatus.value === 'idle')
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="News & Articles">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6">
        <AdminNewsTable
          :data="newsData || []"
          :loading="loading"
          @save="refreshNews()"
          @delete="refreshNews()"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
