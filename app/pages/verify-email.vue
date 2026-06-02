<script setup lang="ts">
import Logo from "@@/public/Swizer/SwizerMainLogo.png"

definePageMeta({
  layout: "default",
})

useHead({
  title: "ยืนยันอีเมล | Swizer Superfoods",
})

const route = useRoute()
const token = computed(() => String(route.query.token || ""))
const isLoading = ref(true)
const isVerified = ref(false)
const errorMessage = ref("")

async function verifyEmail() {
  if (!token.value) {
    errorMessage.value = "ลิงก์ยืนยันอีเมลไม่ถูกต้อง หรือไม่มี token"
    isLoading.value = false
    return
  }

  try {
    await $fetch("/api/auth/verify-email", {
      method: "POST",
      body: {
        token: token.value,
      },
    })
    isVerified.value = true
  } catch (err: any) {
    const message = err.data?.statusMessage || err.message || ""
    if (message.includes("invalid") || message.includes("expired")) {
      errorMessage.value = "ลิงก์ยืนยันอีเมลไม่ถูกต้อง หรือหมดอายุแล้ว"
    } else {
      errorMessage.value = "ยืนยันอีเมลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  verifyEmail()
})
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
          ยืนยันอีเมล
        </h1>
        <p class="mt-2 text-sm leading-6 text-neutral-600">
          ระบบกำลังตรวจสอบลิงก์ยืนยันอีเมลของคุณ
        </p>
      </div>

      <div class="fade-in-up space-y-5" style="animation-delay: 200ms; animation-duration: 0.8s;">
        <UAlert
          v-if="isLoading"
          color="neutral"
          variant="soft"
          icon="i-lucide-loader-circle"
          title="กำลังยืนยันอีเมล"
          description="กรุณารอสักครู่"
        />

        <UAlert
          v-else-if="isVerified"
          color="success"
          variant="soft"
          icon="i-lucide-check-circle"
          title="ยืนยันอีเมลเรียบร้อย"
          description="บัญชีของคุณพร้อมใช้งานแล้ว สามารถเข้าสู่ระบบได้ทันที"
        />

        <UAlert
          v-else
          color="error"
          variant="soft"
          icon="i-lucide-circle-alert"
          title="ยืนยันอีเมลไม่สำเร็จ"
          :description="errorMessage"
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
    </div>
  </main>
</template>
