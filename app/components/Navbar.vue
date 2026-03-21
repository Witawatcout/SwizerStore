<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import Logo from '@@/public/Swizer/SwizerMainLogo.png'
import { useAuthStore } from "@/store/auth"

const auth = useAuthStore()

// Primary Navigation Items (No icons as requested)
const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'หน้าแรก',
    to: '/',
  },
  {
    label: 'ผลิตภัณฑ์',
    to: '/products',
  },
  {
    label: 'เกี่ยวกับเรา',
    to: '/about',
  },
  {
    label: 'ข่าวสาร',
    to: '/news',
  },
  {
    label: 'ติดต่อเรา',
    to: '/contact',
  }
])

// User Dropdown Items (if logged in)
const userMenuItems = computed(() => [
  [
    {
      label: auth.user?.username || 'บัญชีของฉัน',
      slot: 'account',
      disabled: true
    }
  ],
  [
    {
      label: 'โปรไฟล์',
      icon: 'mynaui:user-circle',
      to: '/profile'
    },
    {
      label: 'รายการสั่งซื้อ',
      icon: 'mynaui:shopping-bag',
      to: '/orders'
    }
  ],
  [
    {
      label: 'ออกจากระบบ',
      icon: 'mynaui:logout',
      click: () => auth.logout()
    }
  ]
])
</script>

<template>
  <UHeader 
    mode="slideover" 
    class="bg-neutral-950/95 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 transition-all duration-300"
  >
    <!-- Brand Logo -->
    <template #title>
      <NuxtLink to="/" class="flex items-center gap-3">
        <img :src="Logo" alt="Swizer Logo" class="h-10 md:h-12 w-auto" />
      </NuxtLink>
    </template>

    <!-- Desktop Navigation (Text only) -->
    <UNavigationMenu 
      :items="items" 
      class="hidden lg:flex text-white/70 hover:text-white transition-colors"
      :ui="{
        link: 'font-headline  hover:text-primary-400 transition-colors px-5 py-2 text-sm uppercase',
      }"
    />

    <!-- Right Actions: Icon-Only Auth & Search -->
    <template #right>
      <div class="flex items-center gap-1.5 md:gap-2">
        
        <!-- Search Icon (Always visible) -->
        <UTooltip text="ค้นหา">
          <UButton 
            variant="ghost" 
            icon="mynaui:search"
            size="xl"
            class="text-white hover:text-primary-400 hover:bg-white/5 rounded-full p-2.5"
            @click="() => {}"
          />
        </UTooltip>

        <!-- Auth State: Authenticated -->
        <UDropdown 
          v-if="auth.token" 
          :items="userMenuItems" 
          :popper="{ placement: 'bottom-end' }"
          class="z-50"
        >
          <UButton 
            color="neutral" 
            variant="ghost" 
            class="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <UAvatar 
              :alt="auth.user?.username" 
              size="sm" 
              class="ring-2 ring-primary-500/30"
            />
          </UButton>
          
          <template #account="{ item }">
            <div class="text-left py-1">
              <p class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-0.5">Signed in as</p>
              <p class="truncate font-black text-neutral-900">{{ auth.user?.email }}</p>
            </div>
          </template>
        </UDropdown>

        <!-- Auth State: Guest (Search & Login Only) -->
        <div v-else class="flex items-center">
          <UTooltip text="เข้าสู่ระบบ">
            <UButton 
              to="/login" 
              variant="ghost" 
              icon="mynaui:login"
              icon-class="text-xl"
              class="text-white hover:text-primary-400 hover:bg-white/5 rounded-full p-2.5"
            />
          </UTooltip>
        </div>
      </div>
    </template>

    <!-- Mobile Slideover Content -->
    <template #body>
      <div class="flex flex-col h-full py-10 px-6">
        <UNavigationMenu 
          :items="items" 
          orientation="vertical" 
          class="flex-1 space-y-4"
          :ui="{
            link: 'font-headline text-2xl font-black py-4 px-0 hover:text-primary-500 transition-all border-none bg-transparent active:scale-95',
          }"
        />
        
        <!-- Mobile Footer Auth -->
        <div v-if="!auth.token" class="border-t border-white/10 pt-8 flex gap-4">
          <BaseButton to="/login" variant="white" class="flex-1" size="sm">Log In</BaseButton>
          <BaseButton to="/register" variant="primary" class="flex-1" size="sm">Join</BaseButton>
        </div>
        <div v-else class="border-t border-white/10 pt-8">
          <BaseButton variant="dark" class="w-full" size="sm" @click="auth.logout()">Sign Out</BaseButton>
        </div>
      </div>
    </template>
  </UHeader>
</template>

<style scoped>
:deep(.u-header) {
  background-color: rgba(10, 10, 10, 0.8) !important;
  backdrop-filter: blur(12px);
}
</style>




