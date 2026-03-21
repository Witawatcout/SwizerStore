<script setup lang="ts">
import { useAuthStore } from "@/store/auth"
import Logo from '@@/public/Swizer/SwizerMainLogo.png'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'เข้าสู่ระบบ | Swizer Superfoods'
})

const auth = useAuthStore()
const username = ref("")
const password = ref("")
const isLoading = ref(false)
const errorMessage = ref("")

async function handleLogin() {
  if (!username.value || !password.value) {
    errorMessage.value = "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน"
    return
  }

  isLoading.value = true
  errorMessage.value = ""
  
  try {
    await auth.login(username.value, password.value)
    navigateTo("/")
  } catch (err) {
    errorMessage.value = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-950 flex items-center justify-center relative overflow-hidden">
    <!-- Immersive Background Orbs -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/20 blur-[120px] rounded-full"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full"></div>

    <!-- Login Card -->
    <div 
      class="w-full max-w-md bg-neutral-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 md:p-12 shadow-2xl relative z-10 fade-in-up font-headline"
    >
      <!-- Logo & Header -->
      <div class="text-center mb-10">
        <NuxtLink to="/" class="inline-block mb-6 fade-in-up" style="animation-delay: 100ms;">
          <img :src="Logo" alt="Swizer Logo" class="h-16 w-auto mx-auto" />
        </NuxtLink>
        <h1 class="text-3xl font-black text-white tracking-tight mb-2 fade-in-up" style="animation-delay: 200ms;">
          Welcome Back
        </h1>
        <p class="text-neutral-400 text-sm font-medium fade-in-up" style="animation-delay: 300ms;">
          Enter your details to access your account
        </p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="fade-in-up" style="animation-delay: 400ms;">
          <UFormGroup label="Username" class="text-neutral-400 font-bold text-xs uppercase tracking-widest mb-2 opacity-80">
            <UInput 
              v-model="username" 
              placeholder="Your username" 
              icon="mynaui:user"
              size="xl"
              class="w-full"
              :ui="{
                base: 'font-headline bg-white/5 border-white/10 text-white placeholder-neutral-600 focus:ring-primary-500 rounded-2xl'
              }"
            />
          </UFormGroup>
        </div>

        <div class="fade-in-up" style="animation-delay: 500ms;">
          <UFormGroup label="Password" class="text-neutral-400 font-bold text-xs uppercase tracking-widest mb-2 opacity-80">
            <UInput 
              v-model="password" 
              type="password" 
              placeholder="••••••••" 
              icon="mynaui:lock-password"
              size="xl"
              class="w-full"
              :ui="{
                base: 'font-headline bg-white/5 border-white/10 text-white placeholder-neutral-600 focus:ring-primary-500 rounded-2xl'
              }"
            />
          </UFormGroup>
        </div>

        <!-- Error Message -->
        <Transition name="fade">
          <div v-if="errorMessage" class="bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-3 px-4 rounded-xl flex items-center gap-3 font-medium">
            <Icon name="mynaui:danger" class="text-lg flex-shrink-0" />
            {{ errorMessage }}
          </div>
        </Transition>

        <div class="flex items-center justify-between text-xs fade-in-up font-bold" style="animation-delay: 600ms;">
          <UCheckbox label="Remember me" :ui="{ label: 'text-neutral-400 font-bold' }" />
          <NuxtLink to="/forgot-password" class="text-primary-400 hover:text-primary-300 transition-colors">
            ลืมรหัสผ่าน?
          </NuxtLink>
        </div>

        <div class="pt-4 fade-in-up" style="animation-delay: 700ms;">
          <BaseButton 
            type="submit" 
            variant="primary" 
            size="xl" 
            class="w-full justify-center text-lg font-black tracking-tight rounded-2xl"
            :loading="isLoading"
          >
            เข้าสู่ระบบ
          </BaseButton>
        </div>
      </form>

      <!-- Footer -->
      <div class="mt-10 text-center fade-in-up" style="animation-delay: 800ms;">
        <p class="text-neutral-500 text-sm font-medium">
          ยังไม่มีบัญชี? 
          <NuxtLink to="/register" class="text-white font-black hover:text-primary-400 transition-colors ml-1">
            สมัครสมาชิกใหม่
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

