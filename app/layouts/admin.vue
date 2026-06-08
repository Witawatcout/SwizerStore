<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { useAuthStore } from '@/store/auth'
import { isSuperAdminRole } from '@/utils/adminAccess'

const auth = useAuthStore()
const isSuperAdmin = computed(() => isSuperAdminRole(auth.user?.role))

const items = computed<NavigationMenuItem[]>(() => {
  const baseItems: NavigationMenuItem[] = [{
    label: 'Dashboard',
    icon: 'i-lucide-layout-dashboard',
    to: '/Admin'
  }, {
    label: 'Products',
    icon: 'i-lucide-package',
    to: '/Admin/Products'
  }, {
    label: 'Categories',
    icon: 'i-lucide-folder-tree',
    to: '/Admin/Categories'
  }, {
    label: 'News',
    icon: 'i-lucide-newspaper',
    to: '/Admin/News'
  }]

  if (!isSuperAdmin.value) return baseItems

  return [
    ...baseItems,
    {
      label: 'Orders',
      icon: 'i-lucide-receipt-text',
      to: '/Admin/Orders'
    },
    {
      label: 'Admins',
      icon: 'i-lucide-shield-check',
      to: '/Admin/Admins'
    }
  ]
})
</script>

<template>
  <UDashboardGroup class="admin-shell">
    <UDashboardSidebar collapsible resizable>
      <template #header="{ collapsed }">
        <div class="flex items-center gap-2 px-2 py-1">
          <UIcon name="i-lucide-shield-check" class="text-primary size-6 shrink-0" />
          <span v-if="!collapsed" class="font-bold text-sm truncate">Admin Panel</span>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="items"
          orientation="vertical"
        />
      </template>

      <template #footer="{ collapsed }">
        <div class="flex flex-col gap-2 px-2">
          <UButton
            :icon="collapsed ? 'i-lucide-arrow-left' : undefined"
            :label="collapsed ? undefined : '← Back to Site'"
            to="/"
            color="neutral"
            variant="ghost"
            block
            size="sm"
          />
          <UButton
            :icon="collapsed ? 'i-lucide-log-out' : undefined"
            :label="collapsed ? undefined : 'Sign Out'"
            color="neutral"
            variant="ghost"
            block
            size="sm"
            @click="auth.logout()"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
