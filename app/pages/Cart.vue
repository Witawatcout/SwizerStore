<script setup lang="ts">
import { useCartStore } from '~/store/cart'

const cart = useCartStore()

useHead({ title: 'ตะกร้าสินค้า | Swizer Superfoods' })

const shippingFee = computed(() => 0)
const total = computed(() => cart.totalPrice + shippingFee.value)

const formatPrice = (price: number) =>
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(price)
</script>

<template>
  <main class="min-h-screen bg-background pb-20 pt-24">
    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-sm font-bold uppercase tracking-widest text-primary-700">SwizerStore</p>
          <h1 class="mt-2 text-4xl font-black tracking-normal text-neutral-950">ตะกร้าสินค้า</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
            ตรวจสอบจำนวนสินค้าและยอดรวมก่อนดำเนินการชำระเงิน
          </p>
        </div>

        <UButton to="/products" icon="i-lucide-arrow-left" label="เลือกสินค้าต่อ" color="neutral" variant="soft" />
      </div>

      <div v-if="cart.items.length === 0" class="rounded-lg border border-neutral-200 bg-white p-12 text-center shadow-sm">
        <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
          <UIcon name="i-lucide-shopping-cart" class="size-8" />
        </div>
        <h2 class="mt-5 text-2xl font-black text-neutral-950">ยังไม่มีสินค้าในตะกร้า</h2>
        <p class="mx-auto mt-2 max-w-md text-sm text-neutral-600">เลือกสินค้า superfood ที่ต้องการ แล้วกลับมาชำระเงินได้ที่หน้านี้</p>
        <UButton to="/products" label="ดูสินค้าทั้งหมด" icon="i-lucide-shopping-bag" class="mt-6" size="lg" />
      </div>

      <div v-else class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section class="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div class="border-b border-neutral-200 bg-neutral-50 px-5 py-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-black text-neutral-950">สินค้าในตะกร้า</h2>
              <UBadge :label="`${cart.totalItems} ชิ้น`" color="primary" variant="subtle" />
            </div>
          </div>

          <div class="divide-y divide-neutral-100">
            <article v-for="item in cart.items" :key="item.id" class="grid gap-4 p-5 sm:grid-cols-[112px_1fr_auto] sm:items-center">
              <div class="overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50">
                <img v-if="item.image" :src="item.image" :alt="item.name" class="aspect-square w-full object-cover" />
                <div v-else class="flex aspect-square w-full items-center justify-center">
                  <UIcon name="i-lucide-image" class="size-8 text-neutral-300" />
                </div>
              </div>

              <div class="min-w-0 space-y-3">
                <div>
                  <h3 class="line-clamp-2 text-lg font-black text-neutral-950">{{ item.name }}</h3>
                  <p class="mt-1 font-black text-primary-700">{{ formatPrice(item.price) }}</p>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                  <div class="flex h-10 items-center rounded-lg border border-neutral-200 bg-white">
                    <UButton
                      icon="i-lucide-minus"
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      class="h-10 w-10 rounded-none"
                      :disabled="item.quantity <= 1"
                      @click="cart.updateQuantity(item.id, item.quantity - 1)"
                    />
                    <span class="w-10 text-center font-black text-neutral-950">{{ item.quantity }}</span>
                    <UButton
                      icon="i-lucide-plus"
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      class="h-10 w-10 rounded-none"
                      @click="cart.updateQuantity(item.id, item.quantity + 1)"
                    />
                  </div>

                  <UButton
                    icon="i-lucide-trash-2"
                    label="ลบ"
                    size="sm"
                    color="error"
                    variant="ghost"
                    @click="cart.removeItem(item.id)"
                  />
                </div>
              </div>

              <div class="text-left sm:text-right">
                <p class="text-xs font-bold uppercase tracking-widest text-neutral-400">รวม</p>
                <p class="mt-1 text-xl font-black text-neutral-950">{{ formatPrice(item.price * item.quantity) }}</p>
              </div>
            </article>
          </div>
        </section>

        <aside class="sticky top-28 space-y-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <UIcon name="i-lucide-receipt-text" class="size-5" />
            </div>
            <div>
              <h2 class="text-xl font-black text-neutral-950">สรุปคำสั่งซื้อ</h2>
              <p class="text-sm text-neutral-500">{{ cart.totalItems }} ชิ้นในตะกร้า</p>
            </div>
          </div>

          <div class="space-y-3 rounded-lg bg-neutral-50 p-4">
            <div class="flex justify-between text-sm text-neutral-600">
              <span>Subtotal</span>
              <span class="font-bold text-neutral-900">{{ formatPrice(cart.totalPrice) }}</span>
            </div>
            <div class="flex justify-between text-sm text-neutral-600">
              <span>Shipping</span>
              <span class="font-bold text-neutral-900">{{ shippingFee === 0 ? 'ฟรี' : formatPrice(shippingFee) }}</span>
            </div>
            <div class="flex justify-between border-t border-neutral-200 pt-3 text-xl font-black text-neutral-950">
              <span>Total</span>
              <span class="text-primary-700">{{ formatPrice(total) }}</span>
            </div>
          </div>

          <UButton to="/checkout" icon="i-lucide-credit-card" label="ดำเนินการชำระเงิน" block size="lg" class="h-12 font-black" />

          <UAlert
            color="neutral"
            variant="soft"
            icon="i-lucide-truck"
            title="จัดส่งฟรี"
            description="ระบบจะยืนยันคำสั่งซื้อหลังชำระเงินสำเร็จ"
          />
        </aside>
      </div>
    </section>
  </main>
</template>
