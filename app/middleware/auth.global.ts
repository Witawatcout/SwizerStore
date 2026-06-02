import { useAuthStore } from "@/store/auth";

const publicPages = ['/', '/login', '/products', '/about', '/contact', '/news', '/cart', '/checkout', '/register', '/forgot-password', '/reset-password']

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  // Check if it's an exact public page or starts with a public prefix (for dynamic routes)
  const isPublic = publicPages.includes(to.path.toLowerCase()) ||
    to.path.toLowerCase().startsWith('/products/') ||
    to.path.toLowerCase().startsWith('/news/') ||
    to.path.toLowerCase().startsWith('/order/')

  if (isPublic) {
    return
  }

  if (!auth.token) {
    return navigateTo("/login")
  }

  // ✅ ถ้า path เริ่มด้วย /admin → ต้อง role = admin
  if (to.path.toLowerCase().startsWith("/admin") && auth.user?.role !== "admin") {
    return navigateTo("/") // หรือ navigateTo("/403")
  }
})
