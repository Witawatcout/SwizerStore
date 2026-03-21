<template>
  <footer class="relative text-white font-body py-10 md:py-14 overflow-hidden">
    <!-- Background Image -->
    <div class="absolute inset-0 z-0 select-none pointer-events-none">
      <img src="@@/public/Home/Products-scaled.jpg" alt="Footer Background"
        class="w-full h-full object-cover object-bottom" />
      <div class="absolute inset-0 bg-neutral-950/85"></div> <!-- Dark Overlay -->
    </div>

    <!-- Content -->
    <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center">

      <!-- Top Row Features -->
      <div class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/20">

        <!-- Features Loop -->
        <div v-for="(feature, index) in footerFeatures" :key="index" class="flex items-center gap-4">
          <img :src="feature.icon" :alt="feature.title" class="w-12 h-12 rounded-full" />
          <div class="flex flex-col">
            <h4 class="font-bold text-sm tracking-wide mb-1">{{ feature.title }}</h4>
            <p class="text-[11px] text-neutral-400 leading-snug">{{ feature.description }}</p>
          </div>
        </div>

      </div>

      <!-- Phone Number Call to Action -->
      <div class="relative w-full flex justify-center -mt-6 mb-8 z-20">
        <div
          class="bg-gradient-to-r from-neutral-900 to-neutral-800 border-2 border-white/5 rounded-full px-2 py-1.5 flex items-center shadow-2xl backdrop-blur-md w-max min-w-[200px] hover:scale-105 transition-transform cursor-pointer">
          <div
            class="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-red-600/50 relative overflow-hidden group">
            <div
              class="absolute inset-0 bg-white/20 scale-0 rounded-full group-hover:scale-100 transition-transform duration-300">
            </div>
            <Icon name="lucide:phone" class="text-white text-lg relative z-10" />
          </div>
          <span
            class="text-base font-bold px-4 tracking-wide font-headline text-white drop-shadow-sm">084-3304444</span>
        </div>
      </div>

      <!-- Bottom Footer -->
      <div class="w-full flex flex-col md:flex-row items-center justify-between text-xs text-neutral-400 mt-2 gap-6">
        <div>
          Copyright © 2026 Swizer Superfoods อาหารสุขภาพ |
        </div>

        <!-- Payment Methods -->
        <div class="flex items-center justify-center gap-2">
          <div v-for="method in paymentMethods" :key="method.name" class="bg-white px-2 py-1 rounded flex items-center justify-center h-7 shadow-sm" :class="method.extraClass || ''">
            <Icon :name="method.icon" :class="method.iconClass" />
          </div>
        </div>
      </div>

    </div>
  </footer>
</template>

<script setup lang="ts">
import Shield from '@@/public/Home/shield-security.gif'
import Gift from '@@/public/Home/gift.gif'
import Truck from '@@/public/Home/truck-delivery.gif'
import Avatar from '@@/public/Home/avatar-calm-approved.gif'

const footerFeatures = [
  {
    icon: Avatar,
    title: 'Support',
    description: 'Our Support Team Always for You To 7 Days a Week'
  },
  {
    icon: Truck,
    title: 'Shipping',
    description: 'Mon to Fri 8.30 Am - 7.30 Pm'
  },
  {
    icon: Gift,
    title: '7 Days Easy Return',
    description: 'Product Any Fault Within 7 Days For An Exchange'
  },
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'If Your Product Arent Perfect Return For a Full Refund'
  }
]

const paymentMethods = [
  { name: 'Visa', icon: 'logos:visa', iconClass: 'text-2xl' },
  { name: 'PayPal', icon: 'logos:paypal', iconClass: 'text-xl' },
  { name: 'Mastercard', icon: 'logos:mastercard', iconClass: 'text-xl' },
  { name: 'Discover', icon: 'logos:discover', iconClass: 'text-2xl', extraClass: 'overflow-hidden' }
]
</script>
