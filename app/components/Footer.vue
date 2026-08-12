<script setup lang="ts">
import Shield from '@@/public/Home/shield-security.gif'
import Gift from '@@/public/Home/gift.gif'
import Truck from '@@/public/Home/truck-delivery.gif'
import Avatar from '@@/public/Home/avatar-calm-approved.gif'

const footerFeatures = [
  {
    icon: Avatar,
    title: 'ดูแลลูกค้า',
    description: 'ติดต่อทีมงานได้ทางโทรศัพท์ อีเมล และ LINE',
  },
  {
    icon: Truck,
    title: 'จัดส่งทั่วไทย',
    description: 'เตรียมสินค้าภายใน 1–3 วันทำการหลังชำระเงิน',
  },
  {
    icon: Gift,
    title: 'แจ้งปัญหาภายใน 7 วัน',
    description: 'รองรับกรณีสินค้าชำรุด เสียหาย หรือส่งผิดรายการ',
  },
  {
    icon: Shield,
    title: 'ชำระเงินอย่างปลอดภัย',
    description: 'ประมวลผลบัตรและพร้อมเพย์ผ่านระบบ Omise',
  },
]

const policyLinks = [
  { label: 'นโยบายการจัดส่ง', to: '/policies/shipping' },
  { label: 'การยกเลิก คืนสินค้า และคืนเงิน', to: '/policies/cancellation-refund' },
  { label: 'นโยบายความเป็นส่วนตัว', to: '/policies/privacy' },
  { label: 'นโยบายคุกกี้', to: '/policies/cookies' },
]

const paymentMethods = [
  { name: 'Visa', icon: 'logos:visa', iconClass: 'text-2xl' },
  { name: 'Mastercard', icon: 'logos:mastercard', iconClass: 'text-xl' },
  { name: 'PromptPay', icon: 'i-lucide-qr-code', iconClass: 'size-5 text-neutral-900' },
]

const openCookieSettings = () => {
  window.dispatchEvent(new CustomEvent('swizer-open-cookie-settings'))
}
</script>

<template>
  <footer class="relative overflow-hidden bg-neutral-950 py-10 font-body text-white md:py-14">
    <div class="pointer-events-none absolute inset-0 select-none">
      <img src="@@/public/Home/Products-scaled.jpg" alt="ผลิตภัณฑ์ Swizer Superfoods" class="size-full object-cover object-bottom opacity-20" />
      <div class="absolute inset-0 bg-neutral-950/85" />
    </div>

    <div class="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-7 border-b border-white/15 pb-10 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="feature in footerFeatures" :key="feature.title" class="flex items-center gap-4">
          <img :src="feature.icon" :alt="feature.title" class="size-12 shrink-0 rounded-full" />
          <div>
            <h3 class="text-sm font-bold">{{ feature.title }}</h3>
            <p class="mt-1 text-xs leading-5 text-white/55">{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <div class="grid gap-10 py-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <section>
          <h2 class="text-lg font-black">บริษัท พฤกษาธารา จำกัด</h2>
          <p class="mt-3 max-w-md text-sm leading-6 text-white/60">
            45/7 ซอยเคหะร่มเกล้า 64 แขวงคลองสองต้นนุ่น เขตลาดกระบัง กรุงเทพมหานคร 10520
          </p>
          <div class="mt-4 flex flex-col gap-2 text-sm">
            <a href="tel:+66843304444" class="inline-flex w-fit items-center gap-2 text-white/80 transition hover:text-primary-300">
              <UIcon name="i-lucide-phone" class="size-4" /> 084-330-4444
            </a>
            <a href="mailto:info@swizerstore.com" class="inline-flex w-fit items-center gap-2 text-white/80 transition hover:text-primary-300">
              <UIcon name="i-lucide-mail" class="size-4" /> info@swizerstore.com
            </a>
          </div>
        </section>

        <section>
          <h2 class="text-sm font-black">ข้อมูลและนโยบาย</h2>
          <nav class="mt-4 flex flex-col gap-2.5 text-sm" aria-label="ลิงก์นโยบายร้านค้า">
            <NuxtLink v-for="link in policyLinks" :key="link.to" :to="link.to" class="w-fit text-white/60 transition hover:text-primary-300">
              {{ link.label }}
            </NuxtLink>
            <button type="button" class="w-fit text-left text-white/60 transition hover:text-primary-300" @click="openCookieSettings">
              ตั้งค่าความยินยอมคุกกี้
            </button>
          </nav>
        </section>

        <section>
          <h2 class="text-sm font-black">ช่องทางชำระเงิน</h2>
          <p class="mt-3 text-xs leading-5 text-white/55">บัตรเครดิต/เดบิตและพร้อมเพย์ ประมวลผลอย่างปลอดภัยโดย Omise</p>
          <div class="mt-4 flex flex-wrap items-center gap-2">
            <div v-for="method in paymentMethods" :key="method.name" class="flex h-8 min-w-12 items-center justify-center rounded bg-white px-2" :title="method.name">
              <Icon :name="method.icon" :class="method.iconClass" />
            </div>
          </div>
        </section>
      </div>

      <div class="flex flex-col gap-2 border-t border-white/15 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
        <p>Copyright © 2026 Swizer Superfoods</p>
        <NuxtLink to="/contact" class="transition hover:text-primary-300">ติดต่อร้านค้า</NuxtLink>
      </div>
    </div>
  </footer>
</template>
