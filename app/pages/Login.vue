<script setup lang="ts">
import { useAuthStore } from "@/store/auth"
import Logo from "@@/public/Swizer/SwizerMainLogo.png"

definePageMeta({
  layout: "default",
})

useHead({
  title: "เข้าสู่ระบบ | Swizer Superfoods",
})

const auth = useAuthStore()
const username = ref("")
const password = ref("")
const rememberMe = ref(false)
const isLoading = ref(false)
const errorMessage = ref("")

async function handleLogin() {
  if (!username.value.trim() || !password.value) {
    errorMessage.value = "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน"
    return
  }

  isLoading.value = true
  errorMessage.value = ""

  try {
    await auth.login(username.value.trim(), password.value)
    await navigateTo("/")
  } catch {
    errorMessage.value = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-[#eef6e9] px-4 py-12">
    <div
      class="fade-in-up w-full max-w-md rounded-lg border border-primary-100 bg-white p-8 shadow-xl shadow-primary-950/10 md:p-10"
      style="animation-duration: 0.8s;"
    >
      <div class="fade-in-up mb-8 text-center" style="animation-delay: 100ms; animation-duration: 0.8s;">
        <NuxtLink to="/" class="mb-6 inline-block" aria-label="Swizer Store">
          <img :src="Logo" alt="Swizer Logo" class="mx-auto h-16 w-auto" />
        </NuxtLink>
        <p class="text-sm font-black uppercase tracking-widest text-primary-700">Swizer Account</p>
        <h1 class="mt-3 text-3xl font-black tracking-normal text-neutral-950">
          เข้าสู่ระบบ
        </h1>
        <p class="mt-2 text-sm leading-6 text-neutral-600">
          เข้าสู่บัญชีเพื่อดูคำสั่งซื้อและจัดการข้อมูลจัดส่ง
        </p>
      </div>

      <form class="fade-in-up space-y-5" style="animation-delay: 200ms; animation-duration: 0.8s;" @submit.prevent="handleLogin">
        <UFormField label="Username" required>
          <UInput
            v-model="username"
            icon="i-lucide-user"
            placeholder="กรอกชื่อผู้ใช้"
            size="lg"
            autocomplete="username"
            class="w-full"
          />
        </UFormField>

        <UFormField label="รหัสผ่าน" required>
          <UInput
            v-model="password"
            icon="i-lucide-lock"
            type="password"
            placeholder="กรอกรหัสผ่าน"
            size="lg"
            autocomplete="current-password"
            class="w-full"
          />
        </UFormField>

        <Transition name="fade">
          <UAlert
            v-if="errorMessage"
            color="error"
            variant="soft"
            icon="i-lucide-circle-alert"
            :description="errorMessage"
          />
        </Transition>

        <div class="flex items-center justify-between gap-4 text-sm">
          <UCheckbox v-model="rememberMe" label="จำฉันไว้" />
          <NuxtLink to="/forgot-password" class="font-bold text-primary-700 hover:text-primary-600">
            ลืมรหัสผ่าน?
          </NuxtLink>
        </div>

        <UButton
          type="submit"
          icon="i-lucide-log-in"
          label="เข้าสู่ระบบ"
          color="neutral"
          size="lg"
          block
          :loading="isLoading"
          class="min-h-12 !bg-[#83c63d] font-black !text-white shadow-lg shadow-[#83c63d]/20 hover:!bg-[#72b334]"
        />
      </form>

      <p class="fade-in-up mt-8 text-center text-sm text-neutral-600" style="animation-delay: 300ms; animation-duration: 0.8s;">
        ยังไม่มีบัญชี?
        <NuxtLink to="/Register" class="font-black text-primary-700 hover:text-primary-600">
          สมัครสมาชิกใหม่
        </NuxtLink>
      </p>
    </div>
  </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
