<script setup lang="ts">
import Logo from "@@/public/Swizer/SwizerMainLogo.png"

definePageMeta({
  layout: "default",
})

useHead({
  title: "สมัครสมาชิก | Swizer Superfoods",
})

const username = ref("")
const email = ref("")
const password = ref("")
const confirmPassword = ref("")
const acceptedTerms = ref(false)
const isLoading = ref(false)
const isSubmitted = ref(false)
const registeredEmail = ref("")
const errorMessage = ref("")

function validateForm() {
  if (!username.value.trim() || !email.value.trim() || !password.value || !confirmPassword.value) {
    return "กรุณากรอกข้อมูลให้ครบ"
  }
  if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username.value.trim())) {
    return "Username ต้องมี 3-50 ตัว และใช้ได้เฉพาะ a-z, 0-9, จุด, ขีดกลาง, ขีดล่าง"
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    return "รูปแบบอีเมลไม่ถูกต้อง"
  }
  if (password.value.length < 8) {
    return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
  }
  if (password.value !== confirmPassword.value) {
    return "รหัสผ่านทั้งสองช่องไม่ตรงกัน"
  }
  if (!acceptedTerms.value) {
    return "กรุณายืนยันการสมัครสมาชิก"
  }
  return ""
}

async function handleRegister() {
  const validationError = validateForm()
  if (validationError) {
    errorMessage.value = validationError
    return
  }

  isLoading.value = true
  errorMessage.value = ""

  try {
    await $fetch("/api/auth/register", {
      method: "POST",
      body: {
        username: username.value.trim(),
        email: email.value.trim(),
        password: password.value,
        confirmPassword: confirmPassword.value,
      },
    })

    registeredEmail.value = email.value.trim()
    isSubmitted.value = true
  } catch (err: any) {
    const message = err.data?.statusMessage || err.message || "สมัครสมาชิกไม่สำเร็จ"
    if (message.includes("Username")) {
      errorMessage.value = "Username นี้ถูกใช้แล้ว"
    } else if (message.includes("Email")) {
      errorMessage.value = "อีเมลนี้ถูกใช้แล้ว"
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
      class="fade-in-up w-full max-w-lg rounded-lg border border-primary-100 bg-white p-8 shadow-xl shadow-primary-950/10 md:p-10"
      style="animation-duration: 0.8s;"
    >
      <div class="fade-in-up mb-8 text-center" style="animation-delay: 100ms; animation-duration: 0.8s;">
        <NuxtLink to="/" class="mb-6 inline-block" aria-label="Swizer Store">
          <img :src="Logo" alt="Swizer Logo" class="mx-auto h-16 w-auto" />
        </NuxtLink>
        <p class="text-sm font-black uppercase tracking-widest text-primary-700">Swizer Account</p>
        <h1 class="mt-3 text-3xl font-black tracking-normal text-neutral-950">
          สมัครสมาชิก
        </h1>
        <p class="mt-2 text-sm leading-6 text-neutral-600">
          สร้างบัญชีเพื่อบันทึกข้อมูลจัดส่งและติดตามคำสั่งซื้อ
        </p>
      </div>

      <Transition name="fade" mode="out-in">
        <div v-if="isSubmitted" class="fade-in-up space-y-5 text-center" style="animation-delay: 200ms; animation-duration: 0.8s;">
          <UAlert
            color="success"
            variant="soft"
            icon="i-lucide-mail-check"
            title="สมัครสมาชิกเรียบร้อย"
            :description="`เราได้ส่งลิงก์ยืนยันอีเมลไปที่ ${registeredEmail} แล้ว กรุณากดยืนยันก่อนเข้าสู่ระบบ`"
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

        <form v-else class="fade-in-up space-y-5" style="animation-delay: 200ms; animation-duration: 0.8s;" @submit.prevent="handleRegister">
        <UFormField label="Username" required>
          <UInput
            v-model="username"
            icon="i-lucide-user"
            placeholder="เช่น witawat"
            size="lg"
            autocomplete="username"
            class="w-full"
          />
        </UFormField>

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

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="รหัสผ่าน" required>
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

          <UFormField label="ยืนยันรหัสผ่าน" required>
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
        </div>

        <UCheckbox
          v-model="acceptedTerms"
          label="ฉันยืนยันว่าต้องการสมัครสมาชิก SwizerStore"
        />

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
          icon="i-lucide-user-plus"
          label="สมัครสมาชิก"
          color="neutral"
          size="lg"
          block
          :loading="isLoading"
          class="min-h-12 !bg-[#83c63d] font-black !text-white shadow-lg shadow-[#83c63d]/20 hover:!bg-[#72b334]"
        />
        </form>
      </Transition>

      <p class="fade-in-up mt-8 text-center text-sm text-neutral-600" style="animation-delay: 300ms; animation-duration: 0.8s;">
        มีบัญชีแล้ว?
        <NuxtLink to="/Login" class="font-black text-primary-700 hover:text-primary-600">
          เข้าสู่ระบบ
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
