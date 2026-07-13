<script setup lang="ts">
const { paymentEnabled } = useStorefrontSettings()
</script>

<template>
  <div>
    <div class=" shadow-xl shadow-neutral-900/30">
      <Navbar />
    </div>
    <main>
      <slot />
    </main>
    <div class=" shadow-xl shadow-neutral-900/30">
      <Footer />
    </div>
    <CartSlideover v-if="paymentEnabled" />
  </div>
</template>
