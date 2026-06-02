<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import Logo from '@@/public/Swizer/SwizerMainLogo.png'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'

const auth = useAuthStore()
const cart = useCartStore()
const route = useRoute()

const isLoggedIn = computed(() => Boolean(auth.token))
const isAdmin = computed(() => auth.user?.role === 'admin')
const isNavVisible = ref(true)
const lastScrollY = ref(0)
let scrollTicking = false

const navShellStyle = computed(() => ({
  transform: isNavVisible.value ? 'translate3d(0, 0, 0)' : 'translate3d(0, -100%, 0)',
  opacity: isNavVisible.value ? '1' : '0',
  transition: 'transform 520ms cubic-bezier(0.16, 1, 0.3, 1), opacity 320ms ease',
}))

const mainItems = computed<NavigationMenuItem[]>(() => [
  { label: 'หน้าแรก', to: '/' },
  { label: 'ผลิตภัณฑ์', to: '/products' },
  { label: 'เกี่ยวกับเรา', to: '/about' },
  { label: 'ข่าวสาร', to: '/news' },
  { label: 'ติดต่อเรา', to: '/contact' },
])

const mobileItems = computed<NavigationMenuItem[]>(() => {
  const items = [...mainItems.value]

  if (isLoggedIn.value) {
    items.push(
      { label: 'ตั้งค่าโปรไฟล์', icon: 'i-lucide-user-cog', to: '/profile' },
      { label: 'คำสั่งซื้อของฉัน', icon: 'i-lucide-shopping-bag', to: '/orders' },
    )
  }

  if (isAdmin.value) {
    items.push(
      { label: 'Admin Dashboard', icon: 'i-lucide-layout-dashboard', to: '/Admin' },
      { label: 'จัดการคำสั่งซื้อ', icon: 'i-lucide-receipt-text', to: '/Admin/Orders' },
      { label: 'จัดการสินค้า', icon: 'i-lucide-package', to: '/Admin/Products' },
    )
  }

  return items
})

const accountMenuItems = computed(() => {
  if (!isLoggedIn.value) return []

  const groups = [
    [
      {
        label: auth.user?.username || 'บัญชีของฉัน',
        icon: 'i-lucide-user-circle',
        disabled: true,
      },
    ],
    [
      { label: 'ตั้งค่าโปรไฟล์', icon: 'i-lucide-user-cog', to: '/profile' },
      { label: 'คำสั่งซื้อของฉัน', icon: 'i-lucide-shopping-bag', to: '/orders' },
      { label: 'ตะกร้าสินค้า', icon: 'i-lucide-shopping-cart', to: '/cart' },
    ],
  ]

  if (isAdmin.value) {
    groups.push([
      { label: 'Admin Dashboard', icon: 'i-lucide-layout-dashboard', to: '/Admin' },
      { label: 'คำสั่งซื้อทั้งหมด', icon: 'i-lucide-receipt-text', to: '/Admin/Orders' },
      { label: 'จัดการสินค้า', icon: 'i-lucide-package', to: '/Admin/Products' },
    ])
  }

  groups.push([
    {
      label: 'ออกจากระบบ',
      icon: 'i-lucide-log-out',
      onSelect: () => signOut(),
    },
  ])

  return groups
})

function signOut() {
  auth.logout()
  navigateTo('/')
}

function updateNavbarVisibility() {
  const currentY = window.scrollY || 0
  const diff = currentY - lastScrollY.value

  if (currentY < 24 || diff < -8) {
    isNavVisible.value = true
  } else if (diff > 8 && currentY > 96) {
    isNavVisible.value = false
  }

  lastScrollY.value = currentY
  scrollTicking = false
}

function handleScroll() {
  if (scrollTicking) return
  scrollTicking = true
  window.requestAnimationFrame(updateNavbarVisibility)
}

onMounted(() => {
  lastScrollY.value = window.scrollY || 0
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(
  () => route.fullPath,
  () => {
    isNavVisible.value = true
    lastScrollY.value = 0
  }
)
</script>

<template>
  <div
    class="fixed inset-x-0 top-0 z-50 will-change-transform"
    :class="isNavVisible ? 'pointer-events-auto' : 'pointer-events-none'"
    :style="navShellStyle"
  >
  <UHeader
    mode="slideover"
    class="border-b border-white/5 bg-neutral-950/95 shadow-xl shadow-neutral-900/30 backdrop-blur-md"
    :toggle="{ variant: 'ghost', class: 'p-3 text-3xl text-white lg:p-4 lg:text-4xl' }"
    :ui="{
      header: 'bg-neutral-950/95 backdrop-blur-md border-b border-white/5 shadow-xl shadow-neutral-900/30',
      body: 'bg-white',
    }"
  >
    <template #title>
      <NuxtLink to="/" class="flex items-center gap-3" aria-label="Swizer Store">
        <img :src="Logo" alt="Swizer Logo" class="h-11 w-auto object-contain sm:h-12 lg:h-14" />
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="mainItems"
      class="hidden text-white/70 lg:flex"
      :ui="{
        link: 'font-headline hover:text-primary-400 transition-colors px-5 xl:px-6 py-3 text-base xl:text-lg uppercase bg-transparent hover:bg-transparent aria-[current=page]:bg-transparent aria-[current=page]:text-primary-400',
      }"
    />

    <template #right>
      <div class="flex items-center gap-2 md:gap-3 lg:gap-4">
        <UTooltip v-if="isAdmin" text="Admin">
          <UButton
            to="/Admin"
            icon="i-lucide-shield-check"
            color="primary"
            variant="ghost"
            class="hidden rounded-full text-white hover:bg-white/5 hover:text-primary-400 md:inline-flex lg:size-12"
            aria-label="Admin"
          />
        </UTooltip>

        <UTooltip text="ตะกร้าสินค้า">
          <button
            data-cart-icon
            class="relative rounded-full p-3 text-white transition-colors hover:bg-white/5 hover:text-primary-400 lg:p-4"
            @click="cart.toggleCart()"
          >
            <Icon name="i-lucide-shopping-cart" class="block text-2xl lg:text-3xl" />

            <Transition name="badge">
              <span
                v-if="cart.totalItems > 0"
                class="pointer-events-none absolute right-0.5 top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-500 px-1 text-xs font-black leading-none text-white"
              >
                {{ cart.totalItems > 99 ? '99+' : cart.totalItems }}
              </span>
            </Transition>
          </button>
        </UTooltip>

        <UDropdownMenu v-if="isLoggedIn" :items="accountMenuItems" :ui="{ content: 'w-64' }">
          <UButton
            color="neutral"
            variant="ghost"
            class="rounded-full p-1.5 transition-colors hover:bg-white/10"
          >
            <UAvatar :alt="auth.user?.username" size="md" class="ring-2 ring-primary-500/30 lg:size-12" />
          </UButton>
        </UDropdownMenu>

        <div v-else class="flex items-center gap-2">
          <UButton
            to="/Login"
            icon="i-lucide-log-in"
            label="เข้าสู่ระบบ"
            color="neutral"
            variant="solid"
            size="lg"
            class="hidden min-h-12 rounded-full px-5 text-base font-black !bg-[#83c63d] !text-white shadow-lg shadow-[#83c63d]/20 transition hover:-translate-y-0.5 hover:!bg-[#72b334] md:inline-flex lg:min-h-[52px] lg:px-6 lg:text-lg"
          />
          <UTooltip text="เข้าสู่ระบบ">
            <button
              class="rounded-full p-3 text-white transition-colors hover:bg-white/5 hover:text-primary-400 md:hidden"
              @click="navigateTo('/Login')"
            >
              <Icon name="i-lucide-log-in" class="block text-2xl" />
            </button>
          </UTooltip>
        </div>
      </div>
    </template>

    <template #body>
      <div class="flex h-full flex-col gap-6">
        <UNavigationMenu
          :items="mobileItems"
          orientation="vertical"
          class="flex-1 space-y-2"
          :ui="{
            link: 'font-headline text-2xl font-black py-5 px-0 transition-all border-none active:scale-95 text-neutral-950 hover:text-primary-500 bg-transparent hover:bg-transparent aria-[current=page]:bg-transparent aria-[current=page]:text-primary-600',
          }"
        />

        <div class="border-t border-neutral-200 pt-4">
          <div v-if="isLoggedIn" class="space-y-3">
            <div class="text-sm text-neutral-500">
              เข้าสู่ระบบด้วย
              <span class="block truncate font-bold text-neutral-950">{{ auth.user?.email }}</span>
            </div>
            <UButton
              label="ออกจากระบบ"
              icon="i-lucide-log-out"
              color="neutral"
              variant="outline"
              block
              @click="signOut"
            />
          </div>

          <UButton
            v-else
            label="เข้าสู่ระบบ"
            icon="i-lucide-log-in"
            to="/login"
            color="primary"
            block
          />
        </div>
      </div>
    </template>
  </UHeader>
  </div>
  <div class="h-[76px] shrink-0 lg:h-[88px]" aria-hidden="true" />
</template>

<style scoped>
:deep(header) {
  min-height: 76px !important;
  display: flex;
  align-items: center;
}

@media (min-width: 1024px) {
  :deep(header) {
    min-height: 88px !important;
  }
}

:deep(.u-header) {
  background-color: rgba(10, 10, 10, 0.8) !important;
  backdrop-filter: blur(12px);
}

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
