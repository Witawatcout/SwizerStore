<script setup lang="ts">
import Logo from "@@/public/Swizer/SwizerMainLogo.png";
import { useAuthStore } from "@/store/auth";

definePageMeta({ layout: "default" });

useHead({ title: "สมัครสมาชิก | Swizer Superfoods" });

const auth = useAuthStore();
const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const acceptedTerms = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

function validateForm() {
  if (!username.value.trim() || !email.value.trim() || !password.value || !confirmPassword.value) {
    return "กรุณากรอกข้อมูลให้ครบ";
  }
  if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username.value.trim())) {
    return "Username ต้องมี 3-50 ตัว และใช้ได้เฉพาะ a-z, 0-9, จุด, ขีดกลาง, ขีดล่าง";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    return "รูปแบบอีเมลไม่ถูกต้อง";
  }
  if (password.value.length < 8) {
    return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  }
  if (password.value !== confirmPassword.value) {
    return "รหัสผ่านทั้งสองช่องไม่ตรงกัน";
  }
  if (!acceptedTerms.value) {
    return "กรุณายืนยันการสมัครสมาชิก";
  }
  return "";
}

async function handleRegister() {
  const validationError = validateForm();
  if (validationError) {
    errorMessage.value = validationError;
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const res: any = await $fetch("/api/auth/register", {
      method: "POST",
      body: {
        username: username.value.trim(),
        email: email.value.trim(),
        password: password.value,
        confirmPassword: confirmPassword.value,
      },
    });

    auth.user = {
      id: res.user.id,
      username: res.user.username,
      email: res.user.email,
      role: res.user.role,
    };
    auth.token = res.user.token;
    await navigateTo("/Profile");
  } catch (err: any) {
    const message = err.data?.statusMessage || err.message || "สมัครสมาชิกไม่สำเร็จ";
    if (message.includes("Username")) {
      errorMessage.value = "Username นี้ถูกใช้แล้ว";
    } else if (message.includes("Email")) {
      errorMessage.value = "อีเมลนี้ถูกใช้แล้ว";
    } else {
      errorMessage.value = message;
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <main class="min-h-screen bg-[#f1f7ec] px-4 py-28">
    <section class="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div class="space-y-6">
        <NuxtLink to="/" class="inline-flex">
          <img :src="Logo" alt="Swizer Logo" class="h-16 w-auto" />
        </NuxtLink>
        <div>
          <p class="text-sm font-bold uppercase tracking-widest text-primary-700">Swizer Account</p>
          <h1 class="mt-3 text-4xl font-black tracking-normal text-neutral-950 md:text-5xl">สมัครสมาชิก</h1>
          <p class="mt-4 max-w-xl text-base leading-7 text-neutral-600">
            สร้างบัญชีเพื่อบันทึกที่อยู่จัดส่ง ดูประวัติคำสั่งซื้อ ติดตามสถานะ และชำระเงินได้สะดวกขึ้น
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
          <div class="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <UIcon name="i-lucide-map-pin" class="mb-3 size-5 text-primary-600" />
            <p class="font-bold text-neutral-950">บันทึกที่อยู่</p>
            <p class="mt-1 text-sm text-neutral-600">ใช้ข้อมูลเดิมตอน checkout</p>
          </div>
          <div class="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <UIcon name="i-lucide-receipt-text" class="mb-3 size-5 text-primary-600" />
            <p class="font-bold text-neutral-950">ดูคำสั่งซื้อ</p>
            <p class="mt-1 text-sm text-neutral-600">ติดตามสถานะย้อนหลัง</p>
          </div>
          <div class="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <UIcon name="i-lucide-bell" class="mb-3 size-5 text-primary-600" />
            <p class="font-bold text-neutral-950">อัปเดตสถานะ</p>
            <p class="mt-1 text-sm text-neutral-600">รับข้อมูลผ่านอีเมล</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
        <div class="mb-6">
          <h2 class="text-2xl font-black text-neutral-950">สร้างบัญชีใหม่</h2>
          <p class="mt-1 text-sm text-neutral-600">
            มีบัญชีแล้ว?
            <NuxtLink to="/Login" class="font-bold text-primary-700 hover:text-primary-600">เข้าสู่ระบบ</NuxtLink>
          </p>
        </div>

        <form class="space-y-5" @submit.prevent="handleRegister">
          <UFormField label="Username" required>
            <UInput v-model="username" icon="i-lucide-user" placeholder="เช่น witawat" size="lg" />
          </UFormField>

          <UFormField label="อีเมล" required>
            <UInput v-model="email" icon="i-lucide-mail" type="email" placeholder="you@example.com" size="lg" />
          </UFormField>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="รหัสผ่าน" required>
              <UInput v-model="password" icon="i-lucide-lock" type="password" placeholder="อย่างน้อย 8 ตัวอักษร" size="lg" />
            </UFormField>

            <UFormField label="ยืนยันรหัสผ่าน" required>
              <UInput v-model="confirmPassword" icon="i-lucide-lock-keyhole" type="password" placeholder="กรอกอีกครั้ง" size="lg" />
            </UFormField>
          </div>

          <UCheckbox
            v-model="acceptedTerms"
            label="ฉันยืนยันว่าต้องการสมัครสมาชิก SwizerStore"
          />

          <Transition name="fade">
            <div v-if="errorMessage" class="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm font-medium text-error">
              {{ errorMessage }}
            </div>
          </Transition>

          <UButton
            type="submit"
            icon="i-lucide-user-plus"
            label="สมัครสมาชิก"
            color="primary"
            size="lg"
            block
            :loading="isLoading"
          />
        </form>
      </div>
    </section>
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
