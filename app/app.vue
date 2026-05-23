<template>
  <div>
    <UApp>
      <NuxtRouteAnnouncer />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
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