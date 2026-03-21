import { useAuthStore } from "@/store/auth";

const publicPages = ['/', '/login','/products','/about']

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (publicPages.includes(to.path)) {
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
