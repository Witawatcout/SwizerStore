<script setup lang="ts">
const storageKey = 'swizer-cookie-consent'
const isVisible = ref(false)

type CookieConsentChoice = 'necessary' | 'all'

const openSettings = () => {
  isVisible.value = true
}

onMounted(() => {
  isVisible.value = !localStorage.getItem(storageKey)
  window.addEventListener('swizer-open-cookie-settings', openSettings)
})

onBeforeUnmount(() => {
  window.removeEventListener('swizer-open-cookie-settings', openSettings)
})

const saveConsent = (choice: CookieConsentChoice) => {
  const consent = {
    choice,
    necessary: true,
    analytics: choice === 'all',
    marketing: choice === 'all',
    acceptedAt: new Date().toISOString()
  }

  localStorage.setItem(storageKey, JSON.stringify(consent))
  window.dispatchEvent(new CustomEvent('swizer-cookie-consent', { detail: consent }))
  isVisible.value = false
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="isVisible"
      class="fixed inset-x-0 bottom-0 z-50 border-t border-primary-500/40 bg-neutral-950/95 px-4 py-4 text-white shadow-2xl shadow-neutral-950/30 backdrop-blur-md sm:px-6"
    >
      <div class="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-start gap-3 sm:gap-4">
          <div class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-primary-300 ring-1 ring-primary-400/30 sm:size-12">
            <UIcon name="i-lucide-shield-check" class="size-5 sm:size-6" />
          </div>
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-headline text-base font-black sm:text-lg">การใช้คุกกี้ของ Swizer</p>
              <span class="rounded-full bg-secondary-200 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-secondary-950">
                Privacy Notice
              </span>
            </div>
            <p class="max-w-3xl text-sm leading-6 text-white/75 sm:text-base">
              เราใช้คุกกี้ที่จำเป็นเพื่อให้ระบบตะกร้า การเข้าสู่ระบบ และการชำระเงินทำงานได้ถูกต้อง
              และขอความยินยอมสำหรับคุกกี้วิเคราะห์หรือการตลาดเพื่อพัฒนาเว็บไซต์และข้อเสนอให้เหมาะกับคุณ
              อ่านรายละเอียดใน
              <NuxtLink to="/policies/cookies" class="font-bold text-primary-300 underline underline-offset-4">นโยบายคุกกี้</NuxtLink>
              และ
              <NuxtLink to="/policies/privacy" class="font-bold text-primary-300 underline underline-offset-4">นโยบายความเป็นส่วนตัว</NuxtLink>
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:shrink-0">
          <UButton
            label="ใช้เฉพาะที่จำเป็น"
            color="neutral"
            variant="outline"
            size="lg"
            class="justify-center border-white/20 bg-white/5 text-white hover:bg-white/10"
            @click="saveConsent('necessary')"
          />
          <UButton
            icon="i-lucide-check"
            label="ยอมรับทั้งหมด"
            color="primary"
            size="lg"
            class="justify-center font-black shadow-lg shadow-primary-700/25"
            @click="saveConsent('all')"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>
