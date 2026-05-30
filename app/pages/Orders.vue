<script setup lang="ts">
useHead({ title: 'คำสั่งซื้อของฉัน | SwizerStore' })

const toast = useToast()
const { data: orders, status, refresh } = useAuthFetch<any[]>('/api/orders')
const loading = computed(() => status.value === 'pending' || status.value === 'idle')
const activeQrOrderId = ref('')
const qrLoading = ref('')
const cancelingOrderId = ref('')
const paymentQr = reactive<Record<string, string>>({})
const now = ref(Date.now())

const orderStats = computed(() => {
  const list = orders.value || []
  return {
    total: list.length,
    pending: list.filter((order) => order.payment_status === 'pending').length,
    paid: list.filter((order) => order.payment_status === 'success').length,
    cancelled: list.filter((order) => order.status === 'cancelled').length,
  }
})

const formatPrice = (price: number) =>
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(price || 0))

function paymentColor(status: string) {
  if (status === 'success') return 'success'
  if (status === 'failed') return 'error'
  return 'warning'
}

function paymentLabel(status: string) {
  if (status === 'success') return 'ชำระแล้ว'
  if (status === 'failed') return 'ไม่สำเร็จ'
  return 'รอชำระ'
}

function orderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'รอดำเนินการ',
    paid: 'ชำระแล้ว',
    processing: 'กำลังจัดเตรียม',
    shipped: 'จัดส่งแล้ว',
    delivered: 'สำเร็จ',
    cancelled: 'ยกเลิกแล้ว',
  }
  return labels[status] || status
}

function canShowPromptPayQr(order: any) {
  return order.payment_method === 'promptpay' && order.payment_status === 'pending' && !isExpired(order)
}

function canCancel(order: any) {
  return order.payment_status === 'pending' && order.status !== 'cancelled'
}

function isExpired(order: any) {
  return Boolean(order.expires_at && new Date(order.expires_at).getTime() <= now.value)
}

function remainingText(order: any) {
  if (!order.expires_at) return ''
  const diff = Math.max(0, Math.floor((new Date(order.expires_at).getTime() - now.value) / 1000))
  const minutes = Math.floor(diff / 60)
  const seconds = diff % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

async function showQr(order: any) {
  activeQrOrderId.value = activeQrOrderId.value === order.id ? '' : order.id
  if (!activeQrOrderId.value || paymentQr[order.id] || order.promptpay_qr_url) {
    if (order.promptpay_qr_url) paymentQr[order.id] = order.promptpay_qr_url
    return
  }

  qrLoading.value = order.id
  try {
    const res = await $authFetch<any>(`/api/orders/${order.id}/payment`)
    if (res.qrCodeUrl) {
      paymentQr[order.id] = res.qrCodeUrl
    } else {
      toast.add({ title: 'ไม่พบ QR ของคำสั่งซื้อนี้', color: 'warning', icon: 'i-lucide-qr-code' })
    }
    await refresh()
  } catch (err: any) {
    toast.add({
      title: 'ดึง QR ไม่สำเร็จ',
      description: err.data?.statusMessage || err.message,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    qrLoading.value = ''
  }
}

async function cancelOrder(order: any) {
  if (!window.confirm(`ยืนยันยกเลิกคำสั่งซื้อ ${order.id}?`)) return

  cancelingOrderId.value = order.id
  try {
    await $authFetch(`/api/orders/${order.id}/cancel`, { method: 'POST' })
    if (activeQrOrderId.value === order.id) activeQrOrderId.value = ''
    delete paymentQr[order.id]
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
    cancelingOrderId.value = ''
  }
}

onMounted(() => {
  const timer = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
  onBeforeUnmount(() => window.clearInterval(timer))
})
</script>

<template>
  <main class="min-h-screen bg-background pb-20 pt-24">
    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-sm font-bold uppercase tracking-widest text-primary-700">SwizerStore</p>
          <h1 class="mt-2 text-4xl font-black tracking-normal text-neutral-950">คำสั่งซื้อของฉัน</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
            ติดตามสถานะคำสั่งซื้อ ดู QR พร้อมเพย์ และยกเลิกรายการที่ยังไม่ชำระเงิน
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton icon="i-lucide-refresh-cw" label="รีเฟรช" color="neutral" variant="soft" @click="refresh()" />
          <UButton to="/products" icon="i-lucide-shopping-bag" label="เลือกสินค้า" />
        </div>
      </div>

      <div v-if="!loading && orders?.length" class="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-widest text-neutral-500">ทั้งหมด</p>
          <p class="mt-2 text-2xl font-black text-neutral-950">{{ orderStats.total }}</p>
        </div>
        <div class="rounded-lg border border-warning/30 bg-warning/10 p-4">
          <p class="text-xs font-bold uppercase tracking-widest text-warning">รอชำระ</p>
          <p class="mt-2 text-2xl font-black text-neutral-950">{{ orderStats.pending }}</p>
        </div>
        <div class="rounded-lg border border-success/30 bg-success/10 p-4">
          <p class="text-xs font-bold uppercase tracking-widest text-success">ชำระแล้ว</p>
          <p class="mt-2 text-2xl font-black text-neutral-950">{{ orderStats.paid }}</p>
        </div>
        <div class="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-widest text-neutral-500">ยกเลิก</p>
          <p class="mt-2 text-2xl font-black text-neutral-950">{{ orderStats.cancelled }}</p>
        </div>
      </div>

      <div v-if="loading" class="grid gap-4">
        <USkeleton v-for="i in 4" :key="i" class="h-36 rounded-lg" />
      </div>

      <div v-else-if="!orders?.length" class="rounded-lg border border-neutral-200 bg-white p-12 text-center shadow-sm">
        <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
          <UIcon name="i-lucide-receipt-text" class="size-8" />
        </div>
        <h2 class="mt-5 text-2xl font-black text-neutral-950">ยังไม่มีคำสั่งซื้อ</h2>
        <p class="mx-auto mt-2 max-w-md text-sm text-neutral-600">เริ่มเลือกสินค้า แล้วคำสั่งซื้อของคุณจะแสดงที่นี่</p>
        <UButton to="/products" label="เลือกสินค้า" icon="i-lucide-shopping-bag" class="mt-6" size="lg" />
      </div>

      <div v-else class="space-y-4">
        <article
          v-for="order in orders"
          :key="order.id"
          class="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-colors hover:border-primary-300"
        >
          <div class="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="font-black text-neutral-950">{{ order.id }}</h2>
                <UBadge :label="paymentLabel(order.payment_status)" :color="paymentColor(order.payment_status)" variant="subtle" />
                <UBadge :label="orderStatusLabel(order.status)" color="neutral" variant="subtle" />
              </div>
              <p class="mt-2 text-sm text-neutral-500">
                {{ new Date(order.created_at).toLocaleString('th-TH') }} · {{ order.item_count }} รายการ · {{ order.payment_method === 'promptpay' ? 'PromptPay' : 'Credit card' }}
              </p>
              <p v-if="canShowPromptPayQr(order)" class="mt-2 inline-flex items-center gap-1 text-sm font-bold text-warning">
                <UIcon name="i-lucide-clock" class="size-4" />
                QR พร้อมเพย์เหลือเวลา {{ remainingText(order) }}
              </p>
              <p v-else-if="order.payment_method === 'promptpay' && order.payment_status === 'pending'" class="mt-2 inline-flex items-center gap-1 text-sm font-bold text-error">
                <UIcon name="i-lucide-clock-alert" class="size-4" />
                QR พร้อมเพย์หมดเวลาแล้ว
              </p>
            </div>

            <div class="flex flex-col gap-3 lg:items-end">
              <p class="text-2xl font-black text-primary-700">{{ formatPrice(order.total) }}</p>
              <div class="flex flex-wrap gap-2 lg:justify-end">
                <UButton
                  :to="`/order/${order.id}/success`"
                  label="ดูรายละเอียด"
                  icon="i-lucide-file-text"
                  color="neutral"
                  variant="soft"
                  size="sm"
                />
                <UButton
                  v-if="canShowPromptPayQr(order)"
                  :label="activeQrOrderId === order.id ? 'ซ่อน QR' : 'แสดง QR'"
                  icon="i-lucide-qr-code"
                  color="primary"
                  variant="soft"
                  size="sm"
                  :loading="qrLoading === order.id"
                  @click="showQr(order)"
                />
                <UButton
                  v-if="canCancel(order)"
                  label="ยกเลิก"
                  icon="i-lucide-x-circle"
                  color="error"
                  variant="soft"
                  size="sm"
                  :loading="cancelingOrderId === order.id"
                  @click="cancelOrder(order)"
                />
              </div>
            </div>
          </div>

          <div
            v-if="activeQrOrderId === order.id && canShowPromptPayQr(order)"
            class="border-t border-primary-100 bg-primary-50 p-5"
          >
            <div class="grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
              <img
                v-if="paymentQr[order.id] || order.promptpay_qr_url"
                :src="paymentQr[order.id] || order.promptpay_qr_url"
                alt="PromptPay QR code"
                class="mx-auto w-52 rounded-lg bg-white p-3 shadow-sm"
              />
              <USkeleton v-else class="mx-auto h-52 w-52 rounded-lg" />
              <div class="space-y-3 text-center md:text-left">
                <UBadge label="รอชำระเงิน" color="warning" variant="subtle" />
                <h3 class="text-2xl font-black text-primary-950">สแกนเพื่อชำระเงิน</h3>
                <p class="text-sm leading-6 text-primary-900">
                  เปิดแอปธนาคารแล้วสแกน QR นี้ ระบบจะอัปเดตสถานะอัตโนมัติผ่าน Omise webhook หลังชำระสำเร็จ
                </p>
                <p class="font-black text-primary-900">เหลือเวลา {{ remainingText(order) }}</p>
                <UButton
                  :to="`/order/${order.id}/success`"
                  label="ไปหน้าตรวจสอบสถานะ"
                  icon="i-lucide-arrow-right"
                  color="neutral"
                  variant="soft"
                />
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
