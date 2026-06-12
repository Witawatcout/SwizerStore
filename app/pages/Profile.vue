<script setup lang="ts">
import { useAuthStore } from '@/store/auth'

useHead({ title: 'ตั้งค่าโปรไฟล์ | SwizerStore' })

const auth = useAuthStore()
const toast = useToast()
const loading = ref(true)
const saving = ref(false)

const account = reactive({
  username: '',
  email: '',
  password: '',
})

const shipping = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  address_line2: '',
  subdistrict: '',
  district: '',
  province: '',
  postal_code: '',
  delivery_note: '',
})

function applyProfile(data: any) {
  account.username = data.user?.username || ''
  account.email = data.user?.email || auth.user?.email || ''

  const profile = data.shipping || {}
  Object.assign(shipping, {
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    email: profile.email || account.email,
    phone: profile.phone || '',
    address: profile.address || '',
    address_line2: profile.address_line2 || '',
    subdistrict: profile.subdistrict || '',
    district: profile.district || '',
    province: profile.province || '',
    postal_code: profile.postal_code || '',
    delivery_note: profile.delivery_note || '',
  })
}

function validateShipping() {
  return ['first_name', 'last_name', 'email', 'phone', 'address', 'district', 'province', 'postal_code']
    .every((field) => String((shipping as any)[field] || '').trim())
}

async function loadProfile() {
  loading.value = true
  try {
    const data = await $authFetch<any>('/api/users/profile')
    applyProfile(data)
  } catch (err: any) {
    toast.add({
      title: 'โหลดโปรไฟล์ไม่สำเร็จ',
      description: err.data?.statusMessage || err.message,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  if (!account.email.trim()) {
    toast.add({ title: 'กรุณากรอกอีเมลบัญชี', color: 'error', icon: 'i-lucide-alert-circle' })
    return
  }
  if (!validateShipping()) {
    toast.add({ title: 'กรุณากรอกข้อมูลจัดส่งหลักให้ครบ', color: 'error', icon: 'i-lucide-alert-circle' })
    return
  }

  saving.value = true
  try {
    await $authFetch('/api/users/profile', {
      method: 'PUT',
      body: {
        email: account.email,
        password: account.password || undefined,
        shipping,
      },
    })
    account.password = ''
    await auth.fetchUser()
    toast.add({ title: 'บันทึกโปรไฟล์แล้ว', color: 'success', icon: 'i-lucide-check' })
  } catch (err: any) {
    toast.add({
      title: 'บันทึกไม่สำเร็จ',
      description: err.data?.statusMessage || err.message,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    saving.value = false
  }
}

onMounted(loadProfile)
</script>

<template>
  <main class="min-h-screen bg-background pb-20 pt-24">
    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-sm font-bold uppercase tracking-widest text-primary-700">Account</p>
          <h1 class="mt-2 text-4xl font-black tracking-normal text-neutral-950">ตั้งค่าโปรไฟล์</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
            จัดการข้อมูลบัญชีและที่อยู่จัดส่งหลักสำหรับเติมอัตโนมัติในหน้า checkout
          </p>
        </div>

        <UButton
          to="/orders"
          label="คำสั่งซื้อของฉัน"
          icon="i-lucide-receipt-text"
          color="neutral"
          variant="soft"
        />
      </div>

      <div v-if="loading" class="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <USkeleton class="h-80 rounded-lg" />
        <USkeleton class="h-[620px] rounded-lg" />
      </div>

      <form v-else class="grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]" @submit.prevent="saveProfile">
        <aside class="space-y-5 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
          <div class="flex items-center gap-4">
            <UAvatar :alt="account.username" size="xl" class="ring-2 ring-primary-500/20" />
            <div class="min-w-0">
              <p class="truncate text-lg font-black text-neutral-950">{{ account.username }}</p>
              <div class="mt-1 flex items-center gap-2">
                <UBadge :label="auth.user?.role || 'user'" color="primary" variant="subtle" />
                <span class="text-xs text-neutral-500">Swizer member</span>
              </div>
            </div>
          </div>

          <USeparator />

          <section class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="flex size-9 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <UIcon name="i-lucide-user-cog" class="size-5" />
              </div>
              <div>
                <h2 class="font-black text-neutral-950">บัญชี</h2>
                <p class="text-sm text-neutral-500">อีเมลและรหัสผ่าน</p>
              </div>
            </div>

            <UFormField label="อีเมลบัญชี" required>
              <UInput v-model="account.email" type="email" autocomplete="email" size="lg" class="w-full" />
            </UFormField>

            <UFormField label="รหัสผ่านใหม่" hint="ไม่บังคับ">
              <UInput
                v-model="account.password"
                type="password"
                placeholder="เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน"
                autocomplete="new-password"
                size="lg"
                class="w-full"
              />
            </UFormField>
          </section>

          <UButton
            type="submit"
            :loading="saving"
            icon="i-lucide-save"
            label="บันทึกทั้งหมด"
            size="lg"
            block
            class="font-black"
          />
        </aside>

        <section class="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div class="border-b border-neutral-200 bg-neutral-50 px-6 py-5">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-2xl font-black text-neutral-950">รายละเอียดการจัดส่งหลัก</h2>
                <p class="mt-1 text-sm text-neutral-600">ข้อมูลนี้จะถูกคัดลอกเป็น snapshot ของแต่ละคำสั่งซื้อ</p>
              </div>
              <UButton to="/checkout" icon="i-lucide-shopping-cart" label="ไปชำระเงิน" color="neutral" variant="soft" />
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
                  <p class="text-sm text-neutral-500">ใช้สำหรับติดต่อเมื่อจัดส่ง</p>
                </div>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <UFormField label="ชื่อ" required>
                  <UInput v-model="shipping.first_name" autocomplete="given-name" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="นามสกุล" required>
                  <UInput v-model="shipping.last_name" autocomplete="family-name" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="อีเมลสำหรับจัดส่ง" required>
                  <UInput v-model="shipping.email" type="email" autocomplete="email" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="เบอร์โทรผู้รับ" required>
                  <UInput v-model="shipping.phone" autocomplete="tel" size="lg" class="w-full" />
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
                  <p class="text-sm text-neutral-500">ระบุรายละเอียดให้ครบเพื่อช่วยให้จัดส่งได้แม่นยำ</p>
                </div>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <UFormField label="บ้านเลขที่ / หมู่บ้าน / ถนน" required class="md:col-span-2">
                  <UTextarea v-model="shipping.address" :rows="3" autocomplete="address-line1" autoresize :maxrows="4" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="อาคาร / ชั้น / ห้อง / จุดสังเกต" class="md:col-span-2">
                  <UInput v-model="shipping.address_line2" autocomplete="address-line2" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="แขวง / ตำบล">
                  <UInput v-model="shipping.subdistrict" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="เขต / อำเภอ" required>
                  <UInput v-model="shipping.district" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="จังหวัด" required>
                  <UInput v-model="shipping.province" autocomplete="address-level1" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="รหัสไปรษณีย์" required>
                  <UInput v-model="shipping.postal_code" autocomplete="postal-code" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="หมายเหตุการจัดส่ง" class="md:col-span-2">
                  <UTextarea
                    v-model="shipping.delivery_note"
                    :rows="3"
                    autoresize
                    :maxrows="5"
                    placeholder="เช่น โทรก่อนส่ง, ฝากไว้ที่นิติ, ช่วงเวลาที่สะดวกรับสินค้า"
                    class="w-full"
                  />
                </UFormField>
              </div>
            </section>

            <div class="flex flex-wrap gap-3 border-t border-neutral-200 pt-6">
              <UButton type="submit" :loading="saving" icon="i-lucide-save" label="บันทึกโปรไฟล์" size="lg" class="font-black" />
              <UButton to="/checkout" icon="i-lucide-shopping-cart" label="ไปชำระเงิน" color="neutral" variant="soft" size="lg" />
            </div>
          </div>
        </section>
      </form>
    </section>
  </main>
</template>
