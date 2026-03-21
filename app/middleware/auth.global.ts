import { useAuthStore } from "@/store/auth";

const publicPages = ['/', '/login', '/products', '/about', '/contact', '/news']

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  // case-insensitive path check
  if (publicPages.includes(to.path.toLowerCase())) {
    return
  }

  if (!auth.token) {
    return navigateTo("/login")
  }

  // ✅ ถ้า path เริ่มด้วย /admin → ต้อง role = admin
  if (to.path.startsWith("/admin") && auth.user?.role !== "admin") {
    return navigateTo("/") // หรือ navigateTo("/403")
  }
})
