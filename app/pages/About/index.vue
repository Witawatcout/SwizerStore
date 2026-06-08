<template>
  <div class="bg-neutral-50/50 text-neutral-900 font-body min-h-screen relative overflow-hidden">
    <main class="w-full">

      <!-- Hero Section -->
      <section
        class="relative h-[80vh] min-h-[600px] max-h-[900px] w-full flex items-center justify-center overflow-hidden fade-in-up"
        style="animation-duration: 1s;">
        <!-- Background Image Parallax -->
        <div class="absolute inset-0 z-0 bg-neutral-900">
          <img alt="Lush green rainforest landscape"
            class="w-full h-full object-cover animate-[kenburns_20s_ease-out_forwards] opacity-80 mix-blend-overlay"
            :src="Bgimage" />
          <!-- overlay gradient -->
          <div class="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900/70 to-transparent"></div>
        </div>
        <div class="relative z-10 w-full max-w-screen-2xl mx-auto px-8 md:px-20 fade-in-up"
          style="animation-delay: 300ms;">
          <div class="max-w-4xl">
            <span
              class="inline-flex items-center gap-3 font-label text-primary-400 tracking-[0.2em] mb-8 text-sm font-bold uppercase drop-shadow-md">
              <span class="w-8 h-[2px] bg-primary-400 block"></span>
              สุดยอดอาหารจากธรรมชาติ
            </span>
            <h1
              class="font-headline text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tighter mb-8 drop-shadow-xl text-balance">
              SWIZER <br /><span class="text-primary-500">SUPERFOODS</span>
            </h1>
            <p
              class="text-neutral-200 text-lg md:text-2xl max-w-2xl font-medium leading-relaxed mb-10 drop-shadow-md text-balance">
              Swizer (สไวเซอร์) คือแบรนด์ผู้พัฒนาและจัดจำหน่ายผลิตภัณฑ์ในกลุ่ม Superfoods
              นำเข้าวัตถุดิบชั้นเลิศจากต้นตำรับ เพื่อผู้บริโภคชาวไทย
            </p>
            <NuxtLink to="/products"
              class="w-full sm:w-auto bg-primary-600 text-white font-bold text-lg px-12 py-5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary-600/30 hover:bg-primary-500 whitespace-nowrap truncate inline-block text-center mt-4 group">
              ดูผลิตภัณฑ์ของเรา
              <Icon name="mynaui:arrow-long-right-solid"
                class="group-hover:translate-x-1 transition-transform inline-block ml-1" />
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Our Story Section -->
      <section class="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-neutral-50 relative z-10 fade-in-up"
        style="animation-delay: 500ms;">
        <div class="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">

          <div class="flex-1 space-y-8">
            <div class="flex items-center gap-4">
              <div class="h-[3px] w-12 bg-primary-600 rounded-full"></div>
              <span class="text-primary-600 font-bold tracking-widest uppercase text-sm">เรื่องราวของเรา</span>
            </div>
            <h2
              class="font-headline text-4xl lg:text-5xl font-black text-neutral-900 leading-tight tracking-tighter text-balance">
              ส่งมอบสิ่งที่ดีที่สุด ผ่านผลิตภัณฑ์ระดับพรีเมียม
            </h2>
            <div class="space-y-6 text-neutral-600 text-lg leading-relaxed max-w-2xl font-medium">
              <p>
                เพราะเราเชื่อว่าการคัดสรรสิ่งที่ดีที่สุด
                คือคำมั่นสัญญาที่เราจะส่งมอบของขวัญอันทรงคุณค่าให้กับผู้บริโภคและคนรอบข้างที่คุณรัก
              </p>
              <p>
                ผลิตภัณฑ์ของเราเริ่มต้นจากการคัดสรรวัตถุดิบที่มีคุณภาพสูงสุดจากแหล่งกำเนิดตามธรรมชาติ
                ผ่านกรรมวิธีการผลิตและการแปรรูปน้อยที่สุด เพื่อรักษาสารอาหารที่สำคัญไว้อย่างครบถ้วน
              </p>
              <p>
                เราใส่ใจในทุกขั้นตอนการผลิตที่ได้มาตรฐานและปลอดภัย นำเสนอในรูปแบบที่ทานง่าย ตอบโจทย์ไลฟ์สไตล์คนยุคใหม่
                ให้คุณสามารถดูแลสุขภาพของคุณและคนในครอบครัวได้อย่างยั่งยืน
              </p>
            </div>
          </div>

          <!-- Bento Grid Style Images -->
          <div class="flex-1 w-full grid grid-cols-2 gap-4 md:gap-6 h-[500px] md:h-[650px] transform-gpu">
            <div class="bg-neutral-200 rounded-[2rem] overflow-hidden relative group shadow-lg">
              <img alt="Purple acai bowl"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out will-change-transform"
                :src="Product2" />
              <div
                class="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/10 transition-colors duration-500">
              </div>
              <div
                class="absolute bottom-4 left-4 md:bottom-6 md:left-6 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 shadow-lg">
                <span class="text-white font-bold text-[10px] md:text-xs tracking-widest uppercase shadow-sm">Amazonian
                  Acai</span>
              </div>
            </div>

            <div class="flex flex-col gap-4 md:gap-6 h-full">
              <div
                class="h-1/2 bg-neutral-200 rounded-[2rem] overflow-hidden relative group shadow-md hover:shadow-xl transition-shadow duration-500 transform-gpu">
                <img alt="Andean mountains"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out will-change-transform"
                  :src="Product3" />
                <div
                  class="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/10 transition-colors duration-500">
                </div>
              </div>
              <div
                class="h-1/2 bg-neutral-200 rounded-[2rem] overflow-hidden relative group shadow-md hover:shadow-xl transition-shadow duration-500 transform-gpu">
                <img alt="Green coffee beans"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out will-change-transform"
                  :src="Product1" />
                <div
                  class="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/10 transition-colors duration-500">
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- The Where to Buy section -->
      <section class="py-32 bg-neutral-900 overflow-hidden relative fade-in-up" style="animation-delay: 300ms;">
        <!-- Ambient Background Glow -->
        <div class="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div class="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-primary-600/20 rounded-full blur-[150px]">
          </div>
          <div
            class="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-800/20 rounded-full blur-[120px]">
          </div>
        </div>

        <div class="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-20 relative z-10">
          <div class="text-center mb-20 fade-in-up" style="animation-delay: 400ms;">
            <h2 class="font-headline text-5xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-lg">
              Where to Buy</h2>
            <p class="text-neutral-300 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
              คุณสามารถหาซื้อผลิตภัณฑ์ Swizer Superfoods ได้ผ่านช่องทางออนไลน์ และร้านค้าชั้นนำทั่วประเทศ
            </p>
          </div>

          <div
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 items-center justify-center fade-in-up"
            style="animation-delay: 500ms;">
            <div v-for="(logo, idx) in partnerLogos" :key="idx"
              class="bg-white rounded-[2rem] p-6 lg:p-8 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] transition-all duration-500 flex items-center justify-center aspect-[4/3] group relative overflow-hidden cursor-pointer transform-gpu hover:-translate-y-2">
              <div
                class="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/5 transition-colors duration-500">
              </div>
              <img :src="logo.src" :alt="logo.alt"
                class="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500 will-change-transform" />
            </div>
          </div>
        </div>
      </section>

      <!-- Our Promise Section -->
      <!-- <section class="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-neutral-100 fade-in-up" style="animation-delay: 300ms;">
        <div class="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-stretch gap-8 md:gap-12">

          <div
            class="flex-1 bg-white p-12 md:p-16 lg:p-20 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-neutral-100 flex flex-col justify-center">
            <div class="flex items-center gap-4 mb-12">
              <Icon name="mynaui:badge-check" class="text-neutral-400 text-5xl" />
              <h2 class="font-headline text-4xl lg:text-5xl font-black tracking-tight text-neutral-900">คำมั่นสัญญา<br>ด้านคุณภาพ</h2>
            </div>
            <ul class="space-y-8">
              <li class="flex items-start gap-5 group transform-gpu transition-transform hover:translate-x-2 duration-300">
                <div
                  class="rounded-full bg-primary-50 w-12 h-12 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors shadow-inner">
                  <Icon name="mynaui:check-circle-solid" class="text-primary-600 text-[28px]" />
                </div>
                <div>
                  <h4 class="font-bold text-xl text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
                    ผ่านการทดสอบอย่างเข้มงวด</h4>
                  <p class="text-neutral-500 font-medium text-lg leading-relaxed">ตรวจสอบความบริสุทธิ์และสารตกค้างทุกรอบการผลิต เพื่อให้ได้คุณค่าทางโภชนาการสูงสุด</p>
                </div>
              </li>
              <li class="flex items-start gap-5 group transform-gpu transition-transform hover:translate-x-2 duration-300">
                <div
                  class="rounded-full bg-primary-50 w-12 h-12 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors shadow-inner">
                  <Icon name="mynaui:check-circle-solid" class="text-primary-600 text-[28px]" />
                </div>
                <div>
                  <h4 class="font-bold text-xl text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
                    สนับสนุนเกษตรกรและชุมชน</h4>
                  <p class="text-neutral-500 font-medium text-lg leading-relaxed">รับซื้อและเจรจาโดยตรงกับกลุ่มแหล่งปลูก เพื่อรายได้ที่เป็นธรรมและการเติบโตของชุมชน</p>
                </div>
              </li>
              <li class="flex items-start gap-5 group transform-gpu transition-transform hover:translate-x-2 duration-300">
                <div
                  class="rounded-full bg-primary-50 w-12 h-12 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors shadow-inner">
                  <Icon name="mynaui:check-circle-solid" class="text-primary-600 text-[28px]" />
                </div>
                <div>
                  <h4 class="font-bold text-xl text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
                    คัดสรรจากธรรมชาติ 100%</h4>
                  <p class="text-neutral-500 font-medium text-lg leading-relaxed">ผลิตภัณฑ์ของเราไร้การปรุงแต่ง ปราศจากการดัดแปลงพันธุกรรม ปลอดภัยต่อร่างกาย</p>
                </div>
              </li>
            </ul>
          </div>

          <div class="flex-1 rounded-[3rem] overflow-hidden relative group shadow-lg min-h-[500px] transform-gpu">
            <div class="absolute inset-0 bg-neutral-950"></div>
            <img alt="Fresh harvest in sun"
              class="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-90 transition-transform duration-[2s] ease-out group-hover:scale-105 will-change-transform"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrn3vx-489KTTDxqyesWjsJ-HCvcuC-BS-WoecTC6sXglR-KSzPFkJCGT73DB18mS6elCmEm3H83QtlvpU01PIuLHeoPap8kwMYdZo_lLQUK60NyhYIFYWodMI6f4kLU3Z7UxKKrPa6LcIgqBOKyuBNqd9gP5yh1vRXd-qW2NoYsC0AumrD1TShdvYoaic2LqoxIxe6DhGg0R_bnHrXNDm7iuyMcpwe0QwS3VqlktaGlBYePqOvMGtJ_i7aeu3rTPUt2iohW-rS9-s" />
            <div
              class="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/30 to-transparent mix-blend-multiply opacity-80 group-hover:opacity-60 transition-opacity duration-700">
            </div>

            <div
              class="absolute bottom-12 left-10 right-10 md:bottom-16 md:left-14 md:right-14 z-10 transition-transform duration-700 group-hover:-translate-y-2 transform-gpu">
              <h3 class="font-headline text-4xl lg:text-5xl text-white font-black mb-6 leading-tight drop-shadow-md">
                ฟื้นฟู มากกว่ารักษา</h3>
              <p class="text-white/90 font-medium text-lg leading-relaxed drop-shadow-sm max-w-xl">
                 เราไม่เพียงตั้งเป้าหมายแค่การอนุรักษ์ธรรมชาติให้อยู่รอด แต่เราร่วมมุ่งมั่นเพื่อ <span
                  class="font-bold underline decoration-primary-400 decoration-2 underline-offset-4">ฟื้นฟูแผ่นดิน</span>
                ทุกยอดการสั่งซื้อของคุณ มีส่วนช่วยเหลือการปลูกป่าทดแทนและการพัฒนาเกษตรกรรมในชุมชนแหล่งผลิตของเรา
              </p>
            </div>
          </div>

        </div>
      </section> -->

      <!-- CTA Section -->
      <section class="py-32 px-6 md:px-12 text-center bg-white fade-in-up" style="animation-delay: 200ms;">
        <div class="max-w-4xl mx-auto space-y-10">
          <h2
            class="font-headline text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-neutral-900 leading-[1.1]">
            พร้อมเริ่มต้น<br class="hidden sm:block" /><span class="text-primary-600">สุขภาพดีไปกับ Swizer</span>
          </h2>
          <div
            class="flex flex-col sm:flex-row gap-5 justify-center pt-8 items-center w-full max-w-lg mx-auto sm:max-w-none">
            <NuxtLink to="/products"
              class="w-full sm:w-auto bg-primary-600 text-white font-bold text-lg px-12 py-5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary-600/30 hover:bg-primary-500 whitespace-nowrap truncate inline-block text-center mt-2 group">
              เลือกซื้อผลิตภัณฑ์
              <Icon name="mynaui:arrow-long-right-solid"
                class="group-hover:translate-x-1 transition-transform inline-block ml-1" />
            </NuxtLink>
            <NuxtLink to="/contact"
              class="w-full sm:w-auto bg-white border-2 border-neutral-200 text-neutral-800 font-bold text-lg px-12 py-5 rounded-full hover:bg-neutral-50 hover:border-neutral-300 hover:scale-105 active:scale-95 transition-all whitespace-nowrap truncate shadow-sm mt-2 text-center inline-block">
              ติดต่อเรา
            </NuxtLink>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import Bgimage from '@@/public/Home/1200x600-1-scaled.jpg'

import Baimiang from '@@/public/Swizer/Baimiang.png'
import FoodlandLogo from '@@/public/Swizer/FoodlandLogo.png'
import Gourmet from '@@/public/Swizer/Gourmet.png'
import HealthyPlanet from '@@/public/Swizer/Healthy Planet.png'
import TokyuDepartmentStoreLogo from '@@/public/Swizer/TokyuDepartmentStoreLogo.png'
import TopLogo from '@@/public/Swizer/TopLogo.png'
import Lazada from '@@/public/Swizer/Lazada_(2019).svg.png'
import Shopee from '@@/public/Swizer/Shopee.png'
import Watsons_logotype from '@@/public/Swizer/Watsons.png'

import Product1 from '@@/public/Home/Untitled-6.jpg'
import Product2 from '@@/public/Home/Untitled-3.jpg'
import Product3 from '@@/public/Home/Untitled-4.jpg'
const partnerLogos = [
  // { src: TopLogo, alt: 'Tops Supermarket' },
  // { src: Gourmet, alt: 'Gourmet Market' },
  // { src: FoodlandLogo, alt: 'Foodland' },
  // { src: TokyuDepartmentStoreLogo, alt: 'Tokyu Department Store' },
  // { src: Baimiang, alt: 'Baimiang' },
  // { src: HealthyPlanet, alt: 'Healthy Planet' },
  // { src: Watsons_logotype, alt: 'Watsons' },
  { src: Shopee, alt: 'Shopee' },
  { src: Lazada, alt: 'Lazada' },
]

useHead({
  title: 'เกี่ยวกับเรา | Swizer Superfoods'
})
</script>

<style scoped>
@keyframes kenburns {
  from {
    transform: scale(1.05);
  }

  to {
    transform: scale(1.15);
  }
}
</style>