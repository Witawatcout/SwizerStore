<script setup lang="ts">
import { useAuthStore } from "@/store/auth";
import type { NavigationMenuItem } from "@nuxt/ui";

const auth = useAuthStore()
const router = useRouter()

const items = computed<NavigationMenuItem[]>(() => {
  const menu: NavigationMenuItem[] = [
    { label: "Home", to: "/", icon: "i-lucide-book-open" },
    { label: "Product", to: "/products" },
    { label: "About", to: "/about" },
  ]

  if (auth.token && auth.user?.role === "admin") {
    menu.push({ label: "Admin", to: "/admin" })
    menu.push({ 
      label: "Logout", 
      onSelect: () => {
        auth.logout()
      },
      to: "/login",
      icon: "i-lucide-log-out"
    })
  }

  return menu
})
</script>


<template>
  <UHeader mode="slideover" class="bg-white">
    <template #title>
      <div class="text-mred">Nuxt JWT Mysql</div>
    </template>

    <!-- Desktop -->
    <template #right>
      <UNavigationMenu :items="items" class="hidden lg:flex" />
    </template>

    <!-- Mobile -->
    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
