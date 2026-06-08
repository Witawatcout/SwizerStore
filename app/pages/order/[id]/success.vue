<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { useCartStore } from '~/store/cart'

const route = useRoute()
const cart = useCartStore()
const auth = useAuthStore()
const toast = useToast()
const orderId = computed(() => route.params.id as string)
const { data: order, refresh } = useLazyFetch<any>(() => `/api/orders/${orderId.value}`)
const now = ref(Date.now())
const canceling = ref(false)

useHead({ title: computed(() => `Order ${orderId.value} | SwizerStore`) })

const formatPrice = (price: number) =>
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(price)

const isExpired = computed(() =>
  Boolean(order.value?.expires_at && new Date(order.value.expires_at).getTime() <= now.value)
)

const isPromptPayPending = computed(() =>
  order.value?.payment_method === 'promptpay' &&
  order.value?.payment_status === 'pending' &&
  order.value?.promptpay_qr_url &&
  !isExpired.value
)

const canCancel = computed(() =>
  Boolean(auth.token && order.value?.payment_status === 'pending' && order.value?.status !== 'cancelled')
)

const countdownText = computed(() => {
  if (!order.value?.expires_at) return ''
  const diff = Math.max(0, Math.floor((new Date(order.value.expires_at).getTime() - now.value) / 1000))
  const minutes = Math.floor(diff / 60)
  const seconds = diff % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

async function cancelOrder() {
  if (!window.confirm(`ยืนยันยกเลิกคำสั่งซื้อ ${orderId.value}?`)) return

  canceling.value = true
  try {
    await $authFetch(`/api/orders/${orderId.value}/cancel`, { method: 'POST' })
    toast.add({ title: 'ยกเลิกคำสั่งซื้อแล้ว', color: 'success', icon: 'i-lucide-check' })
    await refresh()
  } catch (err: any) {
    toast.add({
      title: 'ยกเลิกคำสั่งซื้อไม่สำเร็จ',
      description: err.data?.statusMessage || err.message,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    canceling.value = false
  }
}

onMounted(() => {
  const statusTimer = window.setInterval(async () => {
    now.value = Date.now()
    await refresh()
    if (order.value?.payment_status === 'success') {
      cart.clearCart()
      window.clearInterval(statusTimer)
    }
  }, 5000)

  const clock = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)

  onBeforeUnmount(() => {
    window.clearInterval(statusTimer)
    window.clearInterval(clock)
  })
})
</script>

<template>
  <main class="min-h-screen bg-background pb-20 pt-32">
    <section class="mx-auto max-w-3xl px-6">
      <div class="space-y-6 rounded-lg border border-neutral-200 bg-white p-8">
        <div class="flex items-start gap-4">
          <div class="flex size-12 items-center justify-center rounded-full bg-primary-100">
            <UIcon
              :name="order?.payment_status === 'success' ? 'i-lucide-check' : order?.status === 'cancelled' ? 'i-lucide-x' : 'i-lucide-clock'"
              class="size-6 text-primary-700"
            />
          </div>
          <div>
            <p class="text-sm font-bold uppercase tracking-widest text-primary-700">Order {{ orderId }}</p>
            <h1 class="mt-1 text-3xl font-black">
              <span v-if="order?.payment_status === 'success'">ชำระเงินสำเร็จ</span>
              <span v-else-if="order?.status === 'cancelled'">ยกเลิกคำสั่งซื้อแล้ว</span>
              <span v-else>รอตรวจสอบการชำระเงิน</span>
            </h1>
            <p class="mt-2 text-neutral-500">สถานะคำสั่งซื้อ: {{ order?.status || 'pending' }}</p>
          </div>
        </div>

        <div v-if="isPromptPayPending" class="rounded-lg border border-primary-200 bg-primary-50 p-5 text-center">
          <img :src="order.promptpay_qr_url" alt="PromptPay QR code" class="mx-auto w-64 max-w-full rounded bg-white p-3" />
          <p class="mt-3 font-black text-primary-900">สแกน QR เพื่อชำระเงินภายใน {{ countdownText }}</p>
          <p class="mt-1 text-sm text-primary-900">หลังชำระแล้วหน้านี้จะอัปเดตสถานะให้อัตโนมัติ</p>
        </div>

        <UAlert
          v-else-if="order?.payment_method === 'promptpay' && order?.payment_status === 'pending' && isExpired"
          color="error"
          variant="soft"
          icon="i-lucide-clock-alert"
          title="QR พร้อมเพย์หมดเวลาแล้ว"
          description="กรุณาสร้างคำสั่งซื้อใหม่ หรือเลือกสินค้าซ้ำเพื่อชำระอีกครั้ง"
        />

        <UAlert
          v-else-if="order?.status === 'cancelled'"
          color="neutral"
          variant="soft"
          icon="i-lucide-x-circle"
          title="คำสั่งซื้อนี้ถูกยกเลิกแล้ว"
          description="หากยังต้องการสินค้า สามารถเลือกสินค้าและสร้างคำสั่งซื้อใหม่ได้"
        />

        <div class="grid gap-3 sm:grid-cols-3">
          <div class="rounded-lg bg-neutral-50 p-4">
            <p class="text-xs text-neutral-500">Payment</p>
            <p class="font-black">{{ order?.payment_status || '-' }}</p>
          </div>
          <div class="rounded-lg bg-neutral-50 p-4">
            <p class="text-xs text-neutral-500">Method</p>
            <p class="font-black">{{ order?.payment_method || '-' }}</p>
          </div>
          <div class="rounded-lg bg-neutral-50 p-4">
            <p class="text-xs text-neutral-500">Total</p>
            <p class="font-black">{{ formatPrice(order?.total || 0) }}</p>
          </div>
        </div>

        <UAlert
          v-if="order?.tracking_number"
          color="primary"
          variant="soft"
          icon="i-lucide-truck"
          title="เลขพัสดุ / เลขติดตาม"
          :description="order.tracking_number"
        />

        <div class="divide-y divide-neutral-100 rounded-lg border border-neutral-100">
          <div v-for="item in order?.items || []" :key="item.product_id" class="flex justify-between gap-3 p-4">
            <span>{{ item.product_name }} x {{ item.quantity }}</span>
            <span class="font-bold">{{ formatPrice(Number(item.subtotal)) }}</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <UButton to="/products" icon="i-lucide-shopping-bag" label="เลือกสินค้าต่อ" />
          <UButton to="/orders" icon="i-lucide-receipt-text" label="คำสั่งซื้อของฉัน" color="neutral" variant="soft" />
          <UButton icon="i-lucide-refresh-cw" label="รีเฟรชสถานะ" color="neutral" variant="soft" @click="refresh()" />
          <UButton
            v-if="canCancel"
            icon="i-lucide-x-circle"
            label="ยกเลิกคำสั่งซื้อ"
            color="error"
            variant="soft"
            :loading="canceling"
            @click="cancelOrder"
          />
        </div>
      </div>
    </section>
  </main>
</template>
