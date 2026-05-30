<script setup lang="ts">
import { useCartStore } from '~/store/cart'

const cartStore = useCartStore()

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(price)
}
</script>

<template>
  <USlideover v-model:open="cartStore.isOpen" :ui="{
    header: 'border-b border-neutral-100 px-6 py-5',
    body: 'px-6 py-5',
    footer: 'border-t border-neutral-100 px-6 py-5',
  }">
    <!-- Header -->
    <template #title>
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
          <Icon name="i-heroicons-shopping-cart" class="text-primary-600 text-lg" />
        </div>
        <div>
          <h2 class="text-lg font-black text-neutral-900 leading-none">ตะกร้าสินค้า</h2>
          <p class="text-xs text-neutral-400 font-medium mt-0.5">
            {{ cartStore.totalItems }} รายการ
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <!-- Empty State -->
      <div v-if="cartStore.items.length === 0" class="flex flex-col items-center justify-center h-full py-20 gap-4">
        <div class="w-24 h-24 rounded-3xl bg-neutral-50 border border-neutral-100 flex items-center justify-center">
          <Icon name="i-heroicons-shopping-cart" class="text-4xl text-neutral-300" />
        </div>
        <div class="text-center">
          <p class="font-black text-neutral-800 text-lg">ตะกร้าว่างเปล่า</p>
          <p class="text-neutral-400 text-sm mt-1">เริ่มเลือกสินค้าที่คุณชื่นชอบได้เลย</p>
        </div>
        <button
          class="mt-2 px-6 py-2.5 rounded-full bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors"
          @click="cartStore.closeCart(); navigateTo('/products')">
          ดูสินค้าทั้งหมด
        </button>
      </div>

      <!-- Cart Items -->
      <TransitionGroup v-else name="cart-item" tag="ul" class="space-y-3">
        <li v-for="item in cartStore.items" :key="item.id"
          class="flex gap-4 p-3 rounded-2xl bg-neutral-50 border border-neutral-100 hover:border-primary-100 hover:bg-primary-50/30 transition-all duration-200">
          <!-- Product Image -->
          <div class="flex-shrink-0">
            <img v-if="item.image" :src="item.image" :alt="item.name"
              class="w-20 h-20 object-cover rounded-xl shadow-sm" />
            <div v-else class="w-20 h-20 rounded-xl bg-neutral-200 flex items-center justify-center">
              <Icon name="i-lucide-image" class="text-2xl text-neutral-400" />
            </div>
          </div>

          <!-- Product Info -->
          <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <h4 class="text-sm font-bold text-neutral-900 line-clamp-2 leading-snug">{{ item.name }}</h4>
              <p class="text-primary-600 font-black text-base mt-1">{{ formatPrice(item.price) }}</p>
            </div>

            <div class="flex items-center justify-between mt-2">
              <!-- Quantity Controls -->
              <div class="flex items-center bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                <button type="button"
                  class="w-8 h-8 flex items-center justify-center text-neutral-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  @click="cartStore.updateQuantity(item.id, item.quantity - 1)">
                  <Icon name="i-lucide-minus" class="text-xs" />
                </button>
                <span class="w-8 text-center text-sm font-black text-neutral-900">{{ item.quantity }}</span>
                <button type="button"
                  class="w-8 h-8 flex items-center justify-center text-neutral-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  @click="cartStore.updateQuantity(item.id, item.quantity + 1)">
                  <Icon name="i-lucide-plus" class="text-xs" />
                </button>
              </div>

              <!-- Subtotal + Remove -->
              <div class="flex items-center gap-2">
                <span class="text-xs text-neutral-400 font-medium">
                  {{ formatPrice(item.price * item.quantity) }}
                </span>
                <button type="button"
                  class="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                  @click="cartStore.removeItem(item.id)">
                  <Icon name="i-lucide-trash-2" class="text-sm" />
                </button>
              </div>
            </div>
          </div>
        </li>
      </TransitionGroup>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="w-full space-y-4">

        <!-- Summary -->
        <div class="bg-neutral-50 rounded-2xl p-4 space-y-2">
          <div class="flex justify-between items-center text-sm text-neutral-500">
            <span>สินค้า {{ cartStore.totalItems }} รายการ</span>
            <span>{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm text-neutral-500">
            <span>ค่าจัดส่ง</span>
            <span class="text-primary-600 font-bold">ฟรี</span>
          </div>
          <div class="border-t border-neutral-200 pt-2 flex justify-between items-center">
            <span class="font-bold text-neutral-900">ยอดรวมทั้งหมด</span>
            <span class="text-xl font-black text-primary-600">{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>
        </div>

        <!-- Checkout Button -->
        <button :disabled="cartStore.items.length === 0"
          class="w-full py-4 rounded-2xl bg-neutral-950 text-white font-black text-base tracking-wide hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-neutral-950/20 hover:shadow-primary-600/20"
          @click="cartStore.closeCart(); navigateTo('/cart')">
          ดำเนินการสั่งซื้อ →
        </button>

        <!-- Continue Shopping -->
        <button
          class="w-full py-3 rounded-2xl text-neutral-500 font-semibold text-sm hover:text-neutral-800 hover:bg-neutral-50 transition-colors"
          @click="cartStore.closeCart()">
          ← เลือกสินค้าต่อ
        </button>

      </div>
    </template>
  </USlideover>
</template>

<style scoped>
/* Cart item enter/leave animation */
.cart-item-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cart-item-leave-active {
  transition: all 0.2s ease-in;
}

.cart-item-enter-from {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

.cart-item-leave-to {
  opacity: 0;
  transform: translateX(-20px) scale(0.95);
}

.cart-item-move {
  transition: transform 0.3s ease;
}
</style>
