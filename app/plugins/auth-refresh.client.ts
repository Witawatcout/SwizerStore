import { useAuthStore } from "@/store/auth";

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore();
  if (!auth.token) return;

  await auth.fetchUser();
});
