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
    <CartSlideover />
  </div>
</template>
