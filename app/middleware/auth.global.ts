import { useAuthStore } from "@/store/auth";
import { isAdminRole, isSuperAdminRole } from "@/utils/adminAccess";

const publicPages = ['/', '/login', '/products', '/about', '/contact', '/news', '/cart', '/checkout', '/register', '/forgot-password', '/reset-password', '/verify-email']

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

  const adminPath = to.path.toLowerCase();

  if (adminPath.startsWith("/admin") && !isAdminRole(auth.user?.role)) {
    return navigateTo("/")
  }

  const superAdminOnlyPages = ["/admin/orders", "/admin/admins"];
  if (superAdminOnlyPages.some((path) => adminPath.startsWith(path)) && !isSuperAdminRole(auth.user?.role)) {
    return navigateTo("/Admin")
  }
})
