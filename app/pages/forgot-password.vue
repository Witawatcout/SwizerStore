<script setup lang="ts">
import Logo from "@@/public/Swizer/SwizerMainLogo.png"

definePageMeta({
  layout: "default",
})

useHead({
  title: "ลืมรหัสผ่าน | Swizer Superfoods",
})

const email = ref("")
const isLoading = ref(false)
const isSubmitted = ref(false)
const errorMessage = ref("")

async function handleSubmit() {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    errorMessage.value = "กรุณากรอกอีเมลให้ถูกต้อง"
    return
  }

  isLoading.value = true
  errorMessage.value = ""

  try {
    await $fetch("/api/auth/forgot-password", {
      method: "POST",
      body: {
        email: email.value.trim(),
      },
    })
    isSubmitted.value = true
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || err.message || "ส่งคำขอไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
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
          ลืมรหัสผ่าน
        </h1>
        <p class="mt-2 text-sm leading-6 text-neutral-600">
          กรอกอีเมลที่ใช้สมัครบัญชี แล้วระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ
        </p>
      </div>

      <Transition name="fade" mode="out-in">
        <div v-if="isSubmitted" class="space-y-5">
          <UAlert
            color="success"
            variant="soft"
            icon="i-lucide-mail-check"
            title="รับคำขอเรียบร้อย"
            description="หากอีเมลนี้มีอยู่ในระบบ คุณจะได้รับลิงก์สำหรับตั้งรหัสผ่านใหม่ทางอีเมล"
          />

          <UButton
            to="/Login"
            icon="i-lucide-arrow-left"
            label="กลับไปหน้าเข้าสู่ระบบ"
            color="neutral"
            size="lg"
            block
            class="min-h-12 !bg-[#83c63d] font-black !text-white shadow-lg shadow-[#83c63d]/20 hover:!bg-[#72b334]"
          />
        </div>

        <form v-else class="fade-in-up space-y-5" style="animation-delay: 200ms; animation-duration: 0.8s;" @submit.prevent="handleSubmit">
          <UFormField label="อีเมล" required>
            <UInput
              v-model="email"
              icon="i-lucide-mail"
              type="email"
              placeholder="you@example.com"
              size="lg"
              autocomplete="email"
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
            icon="i-lucide-send"
            label="ส่งคำขอตั้งรหัสผ่านใหม่"
            color="neutral"
            size="lg"
            block
            :loading="isLoading"
            class="min-h-12 !bg-[#83c63d] font-black !text-white shadow-lg shadow-[#83c63d]/20 hover:!bg-[#72b334]"
          />

          <p class="text-center text-sm text-neutral-600">
            จำรหัสผ่านได้แล้ว?
            <NuxtLink to="/Login" class="font-black text-primary-700 hover:text-primary-600">
              เข้าสู่ระบบ
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
