<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import Logo from '@@/public/Swizer/SwizerMainLogo.png'
import { useAuthStore } from "@/store/auth"
import { useCartStore } from "@/store/cart"

const auth = useAuthStore()
const cart = useCartStore()

const items = computed<NavigationMenuItem[]>(() => [
  { label: 'หน้าแรก', to: '/' },
  { label: 'ผลิตภัณฑ์', to: '/products' },
  { label: 'เกี่ยวกับเรา', to: '/about' },
  { label: 'ข่าวสาร', to: '/news' },
  { label: 'ติดต่อเรา', to: '/contact' },
])

const userMenuItems = computed(() => [
  [
    {
      label: auth.user?.username || 'บัญชีของฉัน',
      slot: 'account',
      disabled: true,
    },
  ],
  [
    { label: 'โปรไฟล์', icon: 'mynaui:user-circle', to: '/profile' },
    { label: 'รายการสั่งซื้อ', icon: 'mynaui:shopping-bag', to: '/orders' },
  ],
  [
    { label: 'ออกจากระบบ', icon: 'mynaui:logout', click: () => auth.logout() },
  ],
])
</script>

<template>
  <UHeader mode="slideover"
    class="bg-neutral-950/95 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 transition-all duration-300"
    :toggle="{ variant: 'ghost', class: 'text-white text-3xl p-3' }" :ui="{
      header: 'bg-neutral-950/95 backdrop-blur-md border-b border-white/5 shadow-xl shadow-neutral-900/30',
      body: 'bg-white',
    }">
    <!-- Brand Logo -->
    <template #title>
      <NuxtLink to="/" class="flex items-center gap-3">
        <img :src="Logo" alt="Swizer Logo" style="height: 48px; width: auto; object-fit: contain;" />
      </NuxtLink>
    </template>

    <!-- Desktop Navigation -->
    <UNavigationMenu :items="items" class="hidden lg:flex text-white/70" :ui="{
      link: 'font-headline hover:text-primary-400 transition-colors px-5 py-2 text-base uppercase bg-transparent hover:bg-transparent aria-[current=page]:bg-transparent aria-[current=page]:text-primary-400',
    }" />

    <!-- Right Actions -->
    <template #right>
      <div class="flex items-center gap-2 md:gap-3">

        <!-- Search -->
        <div class="hidden md:block">
          <UTooltip text="ค้นหา">
            <button class="text-white hover:text-primary-400 hover:bg-white/5 rounded-full p-3 transition-colors">
              <Icon name="mynaui:search" class="text-2xl block" />
            </button>
          </UTooltip>
        </div>

        <!-- Cart Button — badge ทำเองแทน UChip -->
        <UTooltip text="ตะกร้าสินค้า">
          <button data-cart-icon
            class="relative text-white hover:text-primary-400 hover:bg-white/5 rounded-full p-3 transition-colors"
            @click="cart.toggleCart()">
            <Icon name="i-heroicons-shopping-cart" class="text-2xl block" />

            <!-- Badge ตัวเลข -->
            <Transition name="badge">
              <span v-if="cart.totalItems > 0"
                class="absolute top-0.5 right-0.5 min-w-[20px] h-5 px-1 rounded-full bg-primary-500 text-white text-xs font-black flex items-center justify-center leading-none pointer-events-none">
                {{ cart.totalItems > 99 ? '99+' : cart.totalItems }}
              </span>
            </Transition>
          </button>
        </UTooltip>

        <!-- Auth: Authenticated -->
        <UDropdown v-if="auth.token" :items="userMenuItems" :popper="{ placement: 'bottom-end' }" class="z-50">
          <UButton color="neutral" variant="ghost" class="p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <UAvatar :alt="auth.user?.username" size="md" class="ring-2 ring-primary-500/30" />
          </UButton>

          <template #account="{ item }">
            <div class="text-left py-1">
              <p class="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-0.5">Signed in as</p>
              <p class="truncate font-black text-neutral-900">{{ auth.user?.email }}</p>
            </div>
          </template>
        </UDropdown>

        <!-- Auth: Guest -->
        <div v-else>
          <UTooltip text="เข้าสู่ระบบ">
            <button class="text-white hover:text-primary-400 hover:bg-white/5 rounded-full p-3 transition-colors"
              @click="navigateTo('/login')">
              <Icon name="mynaui:login" class="text-2xl block" />
            </button>
          </UTooltip>
        </div>

      </div>
    </template>

    <!-- Mobile Slideover -->
    <template #body>
      <div class="flex flex-col h-full fade-in-up">
        <UNavigationMenu :items="items" orientation="vertical" class="flex-1 space-y-2" :ui="{
          link: 'font-headline text-2xl font-black py-5 px-0 transition-all border-none active:scale-95 text-neutral-950 hover:text-primary-500 bg-transparent hover:bg-transparent aria-[current=page]:bg-transparent aria-[current=page]:text-primary-600',
        }" />
      </div>
    </template>
  </UHeader>
</template>

<style scoped>
:deep(header) {
  min-height: 72px !important;
  display: flex;
  align-items: center;
}

:deep(.u-header) {
  background-color: rgba(10, 10, 10, 0.8) !important;
  backdrop-filter: blur(12px);
}

/* Badge pop animation */
.badge-enter-active {
  animation: badge-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.badge-leave-active {
  animation: badge-pop 0.2s ease-in reverse;
}

@keyframes badge-pop {
  from {
    transform: scale(0);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Cart icon pulse เมื่อสินค้าบินมาถึง */
.cart-pulse {
  animation: cart-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cart-bounce {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.5);
  }

  100% {
    transform: scale(1);
  }
}
</style>