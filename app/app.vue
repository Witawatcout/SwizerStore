<script setup lang="ts">
const route = useRoute()
const { $swizerTranslate } = useNuxtApp() as any
const isTranslating = computed(() => Boolean($swizerTranslate?.loading?.value))
const siteUrl = 'https://www.swizerstore.com'

const canonicalUrl = computed(() => {
  const path = route.path === '/' ? '' : route.path
  return `${siteUrl}${path}`
})

useHead({
  link: [
    { rel: 'canonical', href: canonicalUrl },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${siteUrl}/#website`,
            name: 'Swizer Store',
            alternateName: ['Swizer', 'Swizer Superfoods', 'สไวเซอร์'],
            url: siteUrl,
            inLanguage: 'th-TH',
          },
          {
            '@type': 'Organization',
            '@id': `${siteUrl}/#organization`,
            name: 'Swizer Store (บริษัท พฤกษาธารา จำกัด)',
            url: siteUrl,
            logo: {
              '@type': 'ImageObject',
              url: `${siteUrl}/icon-512x512.png`,
              width: 512,
              height: 512,
            },
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+66-84-330-4444',
              contactType: 'customer service',
              email: 'info@swizerstore.com',
              areaServed: 'TH',
              availableLanguage: ['Thai', 'English'],
            },
            sameAs: [
              'https://www.facebook.com/Swizersuperfood',
              'https://instagram.com/swizer_official',
              'https://shopee.co.th/swizer_store',
              'https://www.lazada.co.th/shop/swizer-store',
            ],
          },
        ],
      }),
    },
  ],
})
</script>

<template>
  <div>
    <UApp>
      <NuxtRouteAnnouncer />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <CookieConsent />
      <Transition
        enter-active-class="transition-opacity duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isTranslating"
          class="notranslate fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-3 bg-black/55 backdrop-blur-sm select-none"
          translate="no"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div class="flex flex-col items-center gap-3 rounded-2xl bg-neutral-900/90 px-7 py-5 text-white shadow-2xl ring-1 ring-white/15">
            <span class="size-9 animate-spin rounded-full border-3 border-white/25 border-t-[#83c63d]" />
            <p class="text-sm font-semibold tracking-wide text-white/95">
              กำลังเปลี่ยนภาษา...
            </p>
          </div>
        </div>
      </Transition>
    </UApp>
  </div>
</template>

<style>
.cart-pulse {
  animation: cart-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cart-bounce {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.4);
  }

  100% {
    transform: scale(1);
  }
}
</style>
