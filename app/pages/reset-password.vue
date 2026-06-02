<script setup lang="ts">
import Logo from "@@/public/Swizer/SwizerMainLogo.png"

definePageMeta({
  layout: "default",
})

useHead({
  title: "ตั้งรหัสผ่านใหม่ | Swizer Superfoods",
})

const route = useRoute()
const token = computed(() => String(route.query.token || ""))
const password = ref("")
const confirmPassword = ref("")
const isLoading = ref(false)
const isSubmitted = ref(false)
const errorMessage = ref("")

async function handleSubmit() {
  if (!token.value) {
    errorMessage.value = "ลิงก์ตั้งรหัสผ่านไม่ถูกต้อง หรือไม่มี token"
    return
  }
  if (password.value.length < 8) {
    errorMessage.value = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = "รหัสผ่านทั้งสองช่องไม่ตรงกัน"
    return
  }

  isLoading.value = true
  errorMessage.value = ""

  try {
    await $fetch("/api/auth/reset-password", {
      method: "POST",
      body: {
        token: token.value,
        password: password.value,
        confirmPassword: confirmPassword.value,
      },
    })
    isSubmitted.value = true
  } catch (err: any) {
    const message = err.data?.statusMessage || err.message || "ตั้งรหัสผ่านใหม่ไม่สำเร็จ"
    if (message.includes("invalid") || message.includes("expired")) {
      errorMessage.value = "ลิงก์ตั้งรหัสผ่านไม่ถูกต้อง หรือหมดอายุแล้ว"
    } else {
      errorMessage.value = message
    }
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
          ตั้งรหัสผ่านใหม่
        </h1>
        <p class="mt-2 text-sm leading-6 text-neutral-600">
          กรอกรหัสผ่านใหม่สำหรับบัญชีของคุณ
        </p>
      </div>

      <Transition name="fade" mode="out-in">
        <div v-if="isSubmitted" class="space-y-5">
          <UAlert
            color="success"
            variant="soft"
            icon="i-lucide-check-circle"
            title="ตั้งรหัสผ่านใหม่เรียบร้อย"
            description="คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว"
          />

          <UButton
            to="/Login"
            icon="i-lucide-log-in"
            label="ไปหน้าเข้าสู่ระบบ"
            color="neutral"
            size="lg"
            block
            class="min-h-12 !bg-[#83c63d] font-black !text-white shadow-lg shadow-[#83c63d]/20 hover:!bg-[#72b334]"
          />
        </div>

        <form v-else class="fade-in-up space-y-5" style="animation-delay: 200ms; animation-duration: 0.8s;" @submit.prevent="handleSubmit">
          <UAlert
            v-if="!token"
            color="warning"
            variant="soft"
            icon="i-lucide-link-2-off"
            description="ลิงก์นี้ไม่มี token กรุณาขอลิงก์ตั้งรหัสผ่านใหม่อีกครั้ง"
          />

          <UFormField label="รหัสผ่านใหม่" required>
            <UInput
              v-model="password"
              icon="i-lucide-lock"
              type="password"
              placeholder="อย่างน้อย 8 ตัวอักษร"
              size="lg"
              autocomplete="new-password"
              class="w-full"
            />
          </UFormField>

          <UFormField label="ยืนยันรหัสผ่านใหม่" required>
            <UInput
              v-model="confirmPassword"
              icon="i-lucide-lock-keyhole"
              type="password"
              placeholder="กรอกอีกครั้ง"
              size="lg"
              autocomplete="new-password"
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

          <UButton
            type="submit"
            icon="i-lucide-key-round"
            label="ตั้งรหัสผ่านใหม่"
            color="neutral"
            size="lg"
            block
            :loading="isLoading"
            class="min-h-12 !bg-[#83c63d] font-black !text-white shadow-lg shadow-[#83c63d]/20 hover:!bg-[#72b334]"
          />

          <p class="text-center text-sm text-neutral-600">
            ต้องการขอลิงก์ใหม่?
            <NuxtLink to="/forgot-password" class="font-black text-primary-700 hover:text-primary-600">
              ลืมรหัสผ่าน
            </NuxtLink>
          </p>
        </form>
      </Transition>
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
