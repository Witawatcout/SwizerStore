<script setup lang="ts">
defineProps<{
  title: string
  description: string
  icon: string
}>()

const policyLinks = [
  { label: 'การจัดส่ง', to: '/policies/shipping', icon: 'i-lucide-truck' },
  { label: 'ยกเลิกและคืนเงิน', to: '/policies/cancellation-refund', icon: 'i-lucide-rotate-ccw' },
  { label: 'ความเป็นส่วนตัว', to: '/policies/privacy', icon: 'i-lucide-shield-check' },
  { label: 'คุกกี้', to: '/policies/cookies', icon: 'i-lucide-cookie' },
]
</script>

<template>
  <main class="min-h-screen bg-background  text-default">
    <header class="border-b border-muted bg-neutral-950 text-white">
      <UContainer class="py-12 sm:py-16">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm font-bold text-white/70 transition hover:text-white">
          <UIcon name="i-lucide-arrow-left" class="size-4" />
          กลับหน้าร้าน
        </NuxtLink>
        <div class="mt-7 flex max-w-3xl items-start gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary-500/15 text-primary-300 ring-1 ring-primary-400/30">
            <UIcon :name="icon" class="size-6" />
          </div>
          <div>
            <p class="text-sm font-bold text-primary-300">นโยบายของ Swizer Superfoods</p>
            <h1 class="mt-2 text-3xl font-black tracking-normal sm:text-4xl">{{ title }}</h1>
            <p class="mt-3 text-sm leading-7 text-white/70 sm:text-base">{{ description }}</p>
            <p class="mt-3 text-xs text-white/50">ปรับปรุงล่าสุด 12 สิงหาคม 2569</p>
          </div>
        </div>
      </UContainer>
    </header>

    <nav class="border-b border-muted bg-default" aria-label="นโยบายร้านค้า">
      <UContainer class="flex gap-2 overflow-x-auto py-3">
        <UButton
          v-for="link in policyLinks"
          :key="link.to"
          :to="link.to"
          :label="link.label"
          :icon="link.icon"
          color="neutral"
          variant="ghost"
          class="shrink-0"
        />
      </UContainer>
    </nav>

    <UContainer class="py-10 sm:py-14">
      <article class="mx-auto max-w-4xl space-y-10 text-sm leading-7 text-muted sm:text-base">
        <slot />
      </article>
    </UContainer>
  </main>
</template>
