<script setup lang="ts">
import { useAuthStore } from '~/store/auth'
import { useCartStore } from '~/store/cart'

declare global {
  interface Window {
    OmiseCard?: any
  }
}

const config = useRuntimeConfig()
const auth = useAuthStore()
const cart = useCartStore()
const toast = useToast()

useHead({ title: 'Checkout | Swizer Superfoods' })

const paymentMethod = ref<'credit_card' | 'promptpay'>('promptpay')
const isSubmitting = ref(false)
const promptPayQr = ref('')
const orderId = ref('')
const countdown = ref(15 * 60)

const form = reactive({
  first_name: '',
  last_name: '',
  email: auth.user?.email || '',
  phone: '',
  address: '',
  address_line2: '',
  subdistrict: '',
  district: '',
  province: '',
  postal_code: '',
  delivery_note: '',
  note: '',
})

const paymentOptions = [
  {
    label: 'พร้อมเพย์',
    value: 'promptpay' as const,
    description: 'สแกน QR และชำระภายใน 15 นาที',
    icon: 'i-lucide-qr-code',
  },
  {
    label: 'บัตรเครดิต/เดบิต',
    value: 'credit_card' as const,
    description: 'ชำระผ่าน Omise โดยไม่เก็บข้อมูลบัตร',
    icon: 'i-lucide-credit-card',
  },
]

const formatPrice = (price: number) =>
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(price)

const countdownText = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

function validateForm() {
  return ['first_name', 'last_name', 'email', 'phone', 'address', 'district', 'province', 'postal_code']
    .every((field) => String((form as any)[field] || '').trim())
}

function checkoutPayload(token?: string) {
  return {
    token,
    paymentMethod: paymentMethod.value,
    customerData: {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      address_line2: form.address_line2,
      subdistrict: form.subdistrict,
      district: form.district,
      province: form.province,
      postal_code: form.postal_code,
      delivery_note: form.delivery_note,
    },
    orderData: {
      note: form.note,
      items: cart.items.map((item) => ({ id: item.id, quantity: item.quantity })),
    },
  }
}

async function loadOmiseCard() {
  if (window.OmiseCard) return
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.omise.co/omise.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Cannot load Omise.js'))
    document.head.appendChild(script)
  })
}

async function submitCheckout(token?: string) {
  isSubmitting.value = true
  try {
    const res = await $fetch<any>('/api/checkout', {
      method: 'POST',
      headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined,
      body: checkoutPayload(token),
    })

    orderId.value = res.orderId

    if (res.paymentStatus === 'success') {
      cart.clearCart()
      await navigateTo(res.redirectUrl || `/order/${res.orderId}/success`)
      return
    }

    promptPayQr.value = res.qrCodeUrl || ''
    countdown.value = res.expiresIn || 15 * 60
    toast.add({ title: 'สร้าง QR พร้อมเพย์แล้ว', color: 'success', icon: 'i-lucide-qr-code' })
  } catch (err: any) {
    toast.add({
      title: 'ชำระเงินไม่สำเร็จ',
      description: err.data?.statusMessage || err.message,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    isSubmitting.value = false
  }
}

async function handleSubmit() {
  if (cart.items.length === 0) return navigateTo('/cart')
  if (!validateForm()) {
    toast.add({ title: 'กรุณากรอกข้อมูลจัดส่งให้ครบ', color: 'error', icon: 'i-lucide-alert-circle' })
    return
  }

  if (paymentMethod.value === 'promptpay') {
    await submitCheckout()
    return
  }

  if (!config.public.omisePublicKey) {
    toast.add({ title: 'ยังไม่ได้ตั้งค่า OMISE_PUBLIC_KEY', color: 'error', icon: 'i-lucide-alert-circle' })
    return
  }

  isSubmitting.value = true
  try {
    await loadOmiseCard()
    window.OmiseCard.configure({ publicKey: config.public.omisePublicKey })
    window.OmiseCard.open({
      amount: Math.round(cart.totalPrice * 100),
      currency: 'THB',
      defaultPaymentMethod: 'credit_card',
      onCreateTokenSuccess: async (token: string) => {
        await submitCheckout(token)
      },
      onFormClosed: () => {
        isSubmitting.value = false
      },
    })
  } catch (err: any) {
    isSubmitting.value = false
    toast.add({
      title: 'ไม่สามารถเปิดฟอร์มบัตรได้',
      description: err.message,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  }
}

onMounted(() => {
  if (!cart.items.length) navigateTo('/cart')
  if (auth.token) {
    $authFetch<any>('/api/customers/latest')
      .then((res) => {
        if (res.customer) Object.assign(form, res.customer)
      })
      .catch(() => {})
  }
  const timer = window.setInterval(() => {
    if (promptPayQr.value && countdown.value > 0) countdown.value -= 1
  }, 1000)
  onBeforeUnmount(() => window.clearInterval(timer))
})
</script>

<template>
  <main class="min-h-screen bg-background pb-20 pt-24">
    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-sm font-bold uppercase tracking-widest text-primary-700">Checkout</p>
          <h1 class="mt-2 text-4xl font-black tracking-normal text-neutral-950">ชำระเงิน</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
            ตรวจสอบข้อมูลจัดส่ง เลือกช่องทางชำระเงิน และยืนยันคำสั่งซื้อของคุณ
          </p>
        </div>

        <div class="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-bold text-primary-900">
          <UIcon name="i-lucide-shield-check" class="size-5" />
          <span>ชำระเงินผ่าน Omise อย่างปลอดภัย</span>
        </div>
      </div>

      <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <form class="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm" @submit.prevent="handleSubmit">
          <div class="border-b border-neutral-200 bg-neutral-50 px-6 py-5">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-2xl font-black text-neutral-950">ข้อมูลจัดส่ง</h2>
                <p class="mt-1 text-sm text-neutral-600">กรอกข้อมูลผู้รับและที่อยู่สำหรับจัดส่งสินค้า</p>
              </div>
              <UButton
                v-if="auth.token"
                to="/profile"
                label="ตั้งค่าโปรไฟล์"
                icon="i-lucide-user-cog"
                color="neutral"
                variant="soft"
              />
            </div>
          </div>

          <div class="space-y-8 p-6">
            <section class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="flex size-9 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <UIcon name="i-lucide-user-round" class="size-5" />
                </div>
                <div>
                  <h3 class="font-black text-neutral-950">ผู้รับสินค้า</h3>
                  <p class="text-sm text-neutral-500">ใช้สำหรับติดต่อเรื่องการจัดส่ง</p>
                </div>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <UFormField label="ชื่อ" required>
                  <UInput v-model="form.first_name" autocomplete="given-name" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="นามสกุล" required>
                  <UInput v-model="form.last_name" autocomplete="family-name" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="อีเมล" required>
                  <UInput v-model="form.email" type="email" autocomplete="email" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="โทรศัพท์" required>
                  <UInput v-model="form.phone" autocomplete="tel" size="lg" class="w-full" />
                </UFormField>
              </div>
            </section>

            <USeparator />

            <section class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="flex size-9 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <UIcon name="i-lucide-map-pin" class="size-5" />
                </div>
                <div>
                  <h3 class="font-black text-neutral-950">ที่อยู่จัดส่ง</h3>
                  <p class="text-sm text-neutral-500">ระบุให้ละเอียดเพื่อช่วยให้จัดส่งได้เร็วขึ้น</p>
                </div>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <UFormField label="บ้านเลขที่ / หมู่บ้าน / ถนน" required class="md:col-span-2">
                  <UTextarea v-model="form.address" :rows="3" autocomplete="address-line1" size="lg" autoresize :maxrows="4" class="w-full" />
                </UFormField>
                <UFormField label="อาคาร / ชั้น / ห้อง / จุดสังเกต" class="md:col-span-2">
                  <UInput v-model="form.address_line2" autocomplete="address-line2" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="แขวง / ตำบล">
                  <UInput v-model="form.subdistrict" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="เขต / อำเภอ" required>
                  <UInput v-model="form.district" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="จังหวัด" required>
                  <UInput v-model="form.province" autocomplete="address-level1" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="รหัสไปรษณีย์" required>
                  <UInput v-model="form.postal_code" autocomplete="postal-code" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="หมายเหตุการจัดส่ง" class="md:col-span-2">
                  <UTextarea
                    v-model="form.delivery_note"
                    :rows="2"
                    autoresize
                    :maxrows="4"
                    placeholder="เช่น โทรก่อนส่ง, ฝากไว้ที่นิติ, ช่วงเวลาที่สะดวกรับสินค้า"
                    class="w-full"
                  />
                </UFormField>
                <UFormField label="หมายเหตุคำสั่งซื้อ" class="md:col-span-2">
                  <UInput v-model="form.note" size="lg" class="w-full" />
                </UFormField>
              </div>
            </section>

            <USeparator />

            <section class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="flex size-9 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <UIcon name="i-lucide-wallet-cards" class="size-5" />
                </div>
                <div>
                  <h3 class="font-black text-neutral-950">ช่องทางชำระเงิน</h3>
                  <p class="text-sm text-neutral-500">เลือกวิธีที่สะดวกสำหรับคำสั่งซื้อนี้</p>
                </div>
              </div>

              <div class="grid gap-3 md:grid-cols-2">
                <button
                  v-for="option in paymentOptions"
                  :key="option.value"
                  type="button"
                  class="flex min-h-24 items-start gap-4 rounded-lg border p-4 text-left transition"
                  :class="paymentMethod === option.value
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-100'
                    : 'border-neutral-200 bg-white hover:border-primary-300 hover:bg-primary-50/40'"
                  @click="paymentMethod = option.value"
                >
                  <span
                    class="flex size-11 shrink-0 items-center justify-center rounded-full"
                    :class="paymentMethod === option.value ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600'"
                  >
                    <UIcon :name="option.icon" class="size-5" />
                  </span>
                  <span class="min-w-0">
                    <span class="flex items-center gap-2 font-black text-neutral-950">
                      {{ option.label }}
                      <UIcon v-if="paymentMethod === option.value" name="i-lucide-check-circle-2" class="size-4 text-primary-700" />
                    </span>
                    <span class="mt-1 block text-sm leading-5 text-neutral-600">{{ option.description }}</span>
                  </span>
                </button>
              </div>
            </section>

            <div v-if="promptPayQr" class="rounded-lg border border-primary-200 bg-primary-50 p-5">
              <div class="grid gap-5 md:grid-cols-[240px_1fr] md:items-center">
                <img :src="promptPayQr" alt="PromptPay QR code" class="mx-auto w-60 max-w-full rounded-lg bg-white p-3 shadow-sm" />
                <div class="space-y-3 text-center md:text-left">
                  <UBadge label="รอชำระเงิน" color="warning" variant="subtle" />
                  <h3 class="text-2xl font-black text-primary-950">สแกน QR พร้อมเพย์</h3>
                  <p class="text-sm leading-6 text-primary-900">
                    ชำระภายใน <span class="font-black">{{ countdownText }}</span> หลังชำระแล้วระบบจะอัปเดตสถานะอัตโนมัติ
                  </p>
                  <div class="flex flex-wrap justify-center gap-2 md:justify-start">
                    <UButton :to="`/order/${orderId}/success`" label="ตรวจสอบสถานะ" icon="i-lucide-receipt-text" color="neutral" variant="soft" />
                    <UButton to="/orders" label="คำสั่งซื้อของฉัน" color="neutral" variant="ghost" />
                  </div>
                </div>
              </div>
            </div>

            <UButton
              v-if="!promptPayQr"
              type="submit"
              :loading="isSubmitting"
              icon="i-lucide-lock"
              label="ยืนยันคำสั่งซื้อ"
              size="xl"
              block
              class="h-12 font-black"
            />
          </div>
        </form>

        <aside class="sticky top-28 space-y-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-black text-neutral-950">สรุปรายการ</h2>
            <UBadge :label="`${cart.totalItems} ชิ้น`" color="primary" variant="subtle" />
          </div>

          <div class="divide-y divide-neutral-100 rounded-lg border border-neutral-100">
            <div v-for="item in cart.items" :key="item.id" class="flex items-start justify-between gap-4 p-4">
              <div class="min-w-0">
                <p class="line-clamp-2 font-bold text-neutral-900">{{ item.name }}</p>
                <p class="mt-1 text-sm text-neutral-500">จำนวน {{ item.quantity }}</p>
              </div>
              <span class="shrink-0 font-black text-neutral-950">{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>

          <div class="space-y-3 rounded-lg bg-neutral-50 p-4">
            <div class="flex justify-between text-sm text-neutral-600">
              <span>Subtotal</span>
              <span class="font-bold text-neutral-900">{{ formatPrice(cart.totalPrice) }}</span>
            </div>
            <div class="flex justify-between text-sm text-neutral-600">
              <span>Shipping</span>
              <span class="font-bold text-neutral-900">{{ formatPrice(0) }}</span>
            </div>
            <div class="flex justify-between border-t border-neutral-200 pt-3 text-xl font-black text-neutral-950">
              <span>Total</span>
              <span class="text-primary-700">{{ formatPrice(cart.totalPrice) }}</span>
            </div>
          </div>

          <UAlert
            color="neutral"
            variant="soft"
            icon="i-lucide-info"
            title="ยังไม่ตัดเงินจนกว่าจะชำระสำเร็จ"
            description="PromptPay จะกันรายการไว้ 15 นาที และสามารถกลับไปดู QR ได้ที่คำสั่งซื้อของฉัน"
          />
        </aside>
      </div>
    </section>
  </main>
</template>
