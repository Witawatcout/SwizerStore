<script setup lang="ts">
const route = useRoute()
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
