<template>
  <div class="font-body text-neutral-950 overflow-x-hidden bg-neutral-50 pb-32">
    <!-- Header -->
    <section class="relative pt-32 pb-24 bg-primary-950 text-white overflow-hidden fade-in-up" style="animation-duration: 0.8s;">
      <div class="absolute inset-0 z-0">
        <!-- Abstract background elements -->
        <div class="absolute top-0 right-10 w-96 h-96 bg-primary-500 rounded-full mix-blend-screen opacity-20 blur-[80px]"></div>
        <div class="absolute bottom-0 left-10 w-64 h-64 bg-secondary-400 rounded-full mix-blend-screen opacity-20 blur-[60px]"></div>
      </div>
      <div class="max-w-4xl mx-auto px-8 relative z-10 text-center">
        <span class="inline-block px-4 py-1.5 rounded-full bg-primary-800/80 backdrop-blur-sm border border-primary-700 text-primary-200 font-label text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
          Shopping Guide
        </span>
        <h1 class="font-headline text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight text-white">
          วิธีการสั่งซื้อ<wbr />และชำระเงิน
        </h1>
        <p class="text-xl md:text-2xl text-primary-200 font-medium">
          6 ขั้นตอนง่ายๆ ในการเป็นเจ้าของผลิตภัณฑ์ Swizer Superfoods
        </p>
      </div>
    </section>

    <!-- Steps Timeline -->
    <section class="max-w-4xl mx-auto px-6 md:px-8 -mt-12 relative z-20">
      <div class="space-y-6 md:space-y-8">
        
        <!-- Step 1 -->
        <div class="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] flex flex-col md:flex-row gap-6 md:gap-10 items-start fade-in-up transition-all duration-500 hover:-translate-y-1 transform-gpu ring-1 ring-neutral-100" style="animation-delay: 100ms; animation-duration: 0.8s;">
          <div class="w-16 h-16 rounded-2xl bg-secondary-100 text-secondary-700 flex items-center justify-center shrink-0 shadow-inner">
            <span class="font-headline text-3xl font-black">1</span>
          </div>
          <div>
            <div class="flex items-center gap-3 mb-4">
              <Icon name="mynaui:cart" class="text-3xl text-primary-600" />
              <h3 class="font-headline text-2xl md:text-3xl font-black text-neutral-900">เลือกสินค้า</h3>
            </div>
            <p class="text-lg text-neutral-500 leading-relaxed font-medium">
              เลือกสินค้าที่คุณต้องการสั่งซื้อโดยคลิกที่ปุ่ม <strong class="text-primary-700">“เพิ่มสินค้าในตะกร้า”</strong> ทั้งนี้คุณต้องทำการ <strong class="text-neutral-900">เข้าสู่ระบบก่อน</strong> เพื่อดำเนินการ
            </p>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] flex flex-col md:flex-row gap-6 md:gap-10 items-start fade-in-up transition-all duration-500 hover:-translate-y-1 transform-gpu ring-1 ring-neutral-100" style="animation-delay: 200ms; animation-duration: 0.8s;">
          <div class="w-16 h-16 rounded-2xl bg-secondary-100 text-secondary-700 flex items-center justify-center shrink-0 shadow-inner">
            <span class="font-headline text-3xl font-black">2</span>
          </div>
          <div>
            <div class="flex items-center gap-3 mb-4">
              <Icon name="mynaui:list-check" class="text-3xl text-primary-600" />
              <h3 class="font-headline text-2xl md:text-3xl font-black text-neutral-900">ตรวจสอบรายการสินค้า</h3>
            </div>
            <p class="text-lg text-neutral-500 leading-relaxed font-medium">
              ตรวจสอบหรือแก้ไขรายการสินค้าในหน้า <strong class="text-neutral-900">“ตะกร้าสินค้า”</strong> แล้วคลิกที่ปุ่ม <strong class="text-primary-700 bg-primary-50 px-3 py-1 rounded-lg">“สั่งซื้อสินค้า”</strong> เพื่อดำเนินการต่อ
            </p>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] flex flex-col md:flex-row gap-6 md:gap-10 items-start fade-in-up transition-all duration-500 hover:-translate-y-1 transform-gpu ring-1 ring-neutral-100" style="animation-delay: 300ms; animation-duration: 0.8s;">
          <div class="w-16 h-16 rounded-2xl bg-secondary-100 text-secondary-700 flex items-center justify-center shrink-0 shadow-inner">
            <span class="font-headline text-3xl font-black">3</span>
          </div>
          <div>
            <div class="flex items-center gap-3 mb-4">
              <Icon name="mynaui:location" class="text-3xl text-primary-600" />
              <h3 class="font-headline text-2xl md:text-3xl font-black text-neutral-900">กรอกรายละเอียดจัดส่งสินค้า</h3>
            </div>
            <p class="text-lg text-neutral-500 leading-relaxed font-medium">
              การเรียกชำระเงิน และข้อมูลการจัดส่งสินค้าของคุณ จะสะดวกยิ่งขึ้นหากเป็นสมาชิก เพื่อให้ง่ายต่อการสั่งซื้อครั้งต่อไป และติดตามการสั่งซื้อ 
            </p>
            <div class="mt-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-blue-800 bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
              <div class="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 text-blue-600">
                <Icon name="mynaui:brand-facebook" class="text-3xl" />
              </div>
              <p class="text-sm font-bold">เคล็ดลับ: เข้าสู่ระบบผ่านบัญชี Facebook เพื่อรับจดหมายข่าวและโปรโมชั่นที่ดีที่สุดที่เรามอบให้</p>
            </div>
          </div>
        </div>

        <!-- Step 4 (Highlighted Bank Info) -->
        <div class="bg-gradient-to-br from-primary-900 to-primary-950 rounded-[2.5rem] p-8 md:p-12 shadow-[0_30px_60px_-15px_rgba(66,105,0,0.3)] flex flex-col md:flex-row gap-6 md:gap-10 items-start fade-in-up transition-all duration-500 hover:-translate-y-2 transform-gpu" style="animation-delay: 400ms; animation-duration: 0.8s;">
          <div class="w-16 h-16 rounded-2xl bg-primary-800/80 border border-primary-700 text-primary-200 flex items-center justify-center shrink-0 shadow-inner">
            <span class="font-headline text-3xl font-black">4</span>
          </div>
          <div class="w-full">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-primary-800 rounded-full flex items-center justify-center">
                <Icon name="mynaui:credit-card" class="text-2xl text-primary-300" />
              </div>
              <h3 class="font-headline text-2xl md:text-3xl font-black text-white">วิธีการชำระเงิน</h3>
            </div>
            
            <div class="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 md:p-8 border border-white/20 text-white shadow-xl shadow-black/10">
              <p class="text-lg md:text-xl font-medium mb-8 text-primary-100">รองรับการชำระเงินโดยโอนเงินเข้าบัญชีธนาคาร</p>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                <div>
                  <p class="text-xs text-primary-300 font-label uppercase tracking-widest font-bold mb-2">ธนาคาร</p>
                  <p class="font-bold text-xl md:text-2xl flex items-center gap-3 text-white">
                    <span class="w-5 h-5 rounded-full bg-[#4e2e7f] inline-block shadow-sm ring-2 ring-white/30"></span>
                    ธนาคารไทยพาณิชย์
                  </p>
                </div>
                <div>
                  <p class="text-xs text-primary-300 font-label uppercase tracking-widest font-bold mb-2">สาขา</p>
                  <p class="font-bold text-xl md:text-2xl text-white">บิ๊กซี เคหะร่มเกล้า</p>
                </div>
                <div class="md:col-span-2">
                  <p class="text-xs text-primary-300 font-label uppercase tracking-widest font-bold mb-2">ชื่อบัญชี</p>
                  <p class="font-bold text-xl md:text-2xl text-white">บริษัท พฤกษาธารา จำกัด</p>
                </div>
                <div class="md:col-span-2 pt-2 border-t border-white/10 mt-2">
                  <p class="text-xs text-primary-300 font-label uppercase tracking-widest font-bold mb-3">เลขที่บัญชี</p>
                  <div class="inline-block bg-primary-800/80 px-6 py-3 rounded-2xl border border-primary-700/50">
                    <p class="font-bold text-3xl md:text-4xl font-headline tracking-widest text-secondary-200">468-057048-7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 5 -->
        <div class="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] flex flex-col md:flex-row gap-6 md:gap-10 items-start fade-in-up transition-all duration-500 hover:-translate-y-1 transform-gpu ring-1 ring-neutral-100" style="animation-delay: 500ms; animation-duration: 0.8s;">
          <div class="w-16 h-16 rounded-2xl bg-secondary-100 text-secondary-700 flex items-center justify-center shrink-0 shadow-inner">
            <span class="font-headline text-3xl font-black">5</span>
          </div>
          <div class="w-full">
            <div class="flex items-center gap-3 mb-4">
              <Icon name="mynaui:envelope" class="text-3xl text-primary-600" />
              <h3 class="font-headline text-2xl md:text-3xl font-black text-neutral-900">ยืนยันคำสั่งซื้อ</h3>
            </div>
            <p class="text-lg text-neutral-500 leading-relaxed font-medium pb-6 border-b border-neutral-100">
              เมื่อได้รับอีเมลเพื่อยืนยันคำสั่งซื้อสินค้า กรุณาคลิกที่ <strong class="text-primary-700">“ยืนยันคำสั่งซื้อ”</strong> เพื่อคอมเฟิร์มรายการในระบบ
            </p>
            <div class="mt-6 flex gap-4 items-center text-tertiary-700 bg-tertiary-50/50 border border-tertiary-100 p-5 rounded-2xl">
              <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-tertiary-500">
                <Icon name="mynaui:danger-circle" class="text-2xl" />
              </div>
              <p class="font-bold text-sm leading-relaxed">หากคุณไม่ดำเนินการภายใน <span class="text-tertiary-600 bg-white px-2 py-0.5 rounded shadow-sm">24 ชม.</span> ตามเวลาที่กำหนด คำสั่งซื้อของคุณจะถูกยกเลิกโดยอัตโนมัติ</p>
            </div>
          </div>
        </div>

        <!-- Step 6 -->
        <div class="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] flex flex-col md:flex-row gap-6 md:gap-10 items-start fade-in-up transition-all duration-500 hover:-translate-y-1 transform-gpu ring-1 ring-neutral-100" style="animation-delay: 600ms; animation-duration: 0.8s;">
          <div class="w-16 h-16 rounded-2xl bg-secondary-100 text-secondary-700 flex items-center justify-center shrink-0 shadow-inner">
            <span class="font-headline text-3xl font-black">6</span>
          </div>
          <div>
            <div class="flex items-center gap-3 mb-4">
              <Icon name="mynaui:camera" class="text-3xl text-primary-600" />
              <h3 class="font-headline text-2xl md:text-3xl font-black text-neutral-900">แจ้งชำระเงิน</h3>
            </div>
            <p class="text-lg text-neutral-500 leading-relaxed font-medium">
              ส่งหลักฐานการโอนเงิน (สลิป) ผ่านช่องทางแจ้งชำระเงินในระบบ หรือติดต่อฝ่ายบริการลูกค้า หลังจากที่เราตรวจสอบยอดเรียบร้อยแล้ว สินค้าจะถูกแพ็คและจัดส่งถึงมือคุณโดยเร็วที่สุด
            </p>
            <div class="mt-8">
              <NuxtLink to="/contact" class="inline-flex items-center gap-3 bg-gradient-to-br from-primary-600 to-primary-500 text-white px-8 py-4 rounded-full font-bold hover:scale-105 active:scale-95 transition-transform shadow-[0_15px_30px_-10px_rgba(66,105,0,0.4)] group">
                แจ้งชำระเงิน / ติดต่อเรา <Icon name="mynaui:arrow-long-right-solid" class="group-hover:translate-x-1 transition-transform" />
              </NuxtLink>
            </div>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '#imports'

useHead({
  title: 'วิธีการสั่งซื้อและชำระเงิน | Swizer Superfoods',
  meta: [
    {
      name: 'description',
      content: 'ขั้นตอนการสั่งซื้อสินค้าและวิธีการชำระเงินของ Swizer Superfoods ลำดับอย่างละเอียด 6 ขั้นตอน'
    }
  ]
})
</script>