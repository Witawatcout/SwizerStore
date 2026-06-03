<template>
  <div class="bg-neutral-50/50 text-neutral-900 font-body min-h-screen relative overflow-hidden">
    <!-- Top Ambient Glow -->
    <div class="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-primary-50/80 via-white/50 to-transparent -z-10 pointer-events-none"></div>

    <main class="pt-32 pb-24 px-6 max-w-screen-2xl mx-auto relative z-10">
      
      <!-- Header Section -->
      <div class="mb-16 md:mb-24 text-center md:text-left fade-in-up">
        <span class="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary-50 text-primary-700 text-xs font-bold tracking-widest uppercase shadow-sm border border-primary-100">
          Get in Touch
        </span>
        <h1 class="font-headline text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-900 mb-6">
          ติดต่อเรา
        </h1>
        <p class="text-neutral-500 text-lg md:text-xl max-w-2xl leading-relaxed">
          เรายินดีรับฟังทุกข้อเสนอแนะและพร้อมให้คำปรึกษาเกี่ยวกับสุขภาพและผลิตภัณฑ์ของเรา
        </p>
      </div>

      <!-- Contact Split Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        
        <!-- Left Side: Info & Map -->
        <div class="space-y-12 fade-in-up" style="animation-delay: 200ms;">
          <div class="space-y-6">
            <div 
              v-for="(method, idx) in contactMethods" 
              :key="idx" 
              class="flex items-start gap-5 md:gap-6 group p-6 shrink-0 rounded-[2.5rem] bg-white border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 transform-gpu fade-in-up"
              :style="{ animationDelay: `${200 + idx * 100}ms` }"
            >
              <div class="w-14 h-14 rounded-2xl bg-neutral-50 flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:bg-primary-50 shadow-inner">
                <Icon :name="method.icon" class="text-2xl text-neutral-400 group-hover:text-primary-600 transition-colors" />
              </div>
              <div class="flex flex-col justify-center">
                <h3 class="text-xl font-headline font-black mb-2 text-neutral-900 group-hover:text-primary-600 transition-colors">{{ method.title }}</h3>
                
                <p v-for="(line, lIdx) in method.content" :key="lIdx" class="text-neutral-500 leading-relaxed font-medium">
                  {{ line }}
                </p>
                
                <div v-if="method.links && method.links.length > 0" class="flex flex-col gap-3 mt-2">
                  <a v-for="(lItem, lnum) in method.links" :key="'lnk-'+lnum" :href="lItem.url" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 text-primary-600 font-bold hover:text-primary-800 transition-colors group/link w-fit">
                    <Icon v-if="lItem.icon" :name="lItem.icon" class="text-xl text-primary-500 group-hover/link:text-primary-700 transition-colors" />
                    <span class="group-hover/link:underline underline-offset-4 decoration-primary-300">{{ lItem.text }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Interactive Map Container -->
          <div class="relative overflow-hidden rounded-[2rem] bg-neutral-200 aspect-video shadow-lg group border border-neutral-100 fade-in-up" style="animation-delay: 500ms;">
            <img alt="Location Map" class="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100 transition-all duration-[1.5s]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt44a1Smdd0XnGlXmDJWmoAZV4AU369CbFEn1mtAQ7YVp7cVaBIOu-QhMwrtV9_PO8cwFEBYjWssXHv2ZkraKpNgldaOIbyjMjgzfaRFXMpb5C1H21ECjuGxboV75NYbqPz4CciClVoZbsCnMBDcTBayGOq6A-0w0ac5fPKCK9HZzKocknL-7zBOtYKS0t6UGemllTMLme-_Uk_Z_PYoRmKswxy-f9UXXg44FrTueZhZ12FpPmA2FuxNi8nUZhfdHBNZ20c5IZQSDf" />
            <div class="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-transparent pointer-events-none transition-opacity group-hover:opacity-60"></div>
            
            <div class="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/50">
              <div class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
              </div>
              <span class="text-sm font-bold text-neutral-800 tracking-wide">Swizer</span>
            </div>
          </div>
        </div>

        <!-- Right Side: Contact Form -->
        <div class="bg-white p-8 md:p-12 lg:p-14 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-neutral-100 relative fade-in-up" style="animation-delay: 400ms;">
          <!-- decorative blur behind form -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-[60px] opacity-60 -z-10 pointer-events-none"></div>

          <div class="mb-10">
            <h2 class="font-headline text-3xl font-extrabold mb-4 tracking-tight text-neutral-900">ส่งข้อความหาเรา</h2>
            <p class="text-neutral-500 leading-relaxed font-medium">กรอกแบบฟอร์มด้านล่าง ทีมงานของเราจะรีบติดต่อกลับให้เร็วที่สุดครับ</p>
          </div>

          <form @submit.prevent="submitForm" class="space-y-6 relative z-10">
            <UAlert
              v-if="successMessage"
              color="primary"
              variant="soft"
              icon="i-lucide-check-circle-2"
              :description="successMessage"
              class="rounded-2xl"
            />
            <UAlert
              v-if="errorMessage"
              color="error"
              variant="soft"
              icon="i-lucide-circle-alert"
              :description="errorMessage"
              class="rounded-2xl"
            />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2.5 fade-in-up" style="animation-delay: 500ms;">
                <label class="block text-xs font-bold uppercase tracking-widest text-neutral-500 ml-2">ชื่อ-นามสกุล</label>
                <input v-model="form.name" :disabled="sending" required class="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all outline-none text-neutral-800 font-medium translate-y-0 disabled:opacity-60" placeholder="ชื่อของคุณ" type="text" />
              </div>
              <div class="space-y-2.5 fade-in-up" style="animation-delay: 600ms;">
                <label class="block text-xs font-bold uppercase tracking-widest text-neutral-500 ml-2">อีเมล</label>
                <input v-model="form.email" :disabled="sending" required class="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all outline-none text-neutral-800 font-medium disabled:opacity-60" placeholder="email@example.com" type="email" />
              </div>
            </div>
            
            <div class="space-y-2.5 fade-in-up" style="animation-delay: 700ms;">
              <label class="block text-xs font-bold uppercase tracking-widest text-neutral-500 ml-2">หัวข้อ</label>
              <input v-model="form.subject" :disabled="sending" required class="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all outline-none text-neutral-800 font-medium disabled:opacity-60" placeholder="เรื่องที่ต้องการติดต่อ" type="text" />
            </div>
            
            <div class="space-y-2.5 fade-in-up" style="animation-delay: 800ms;">
              <label class="block text-xs font-bold uppercase tracking-widest text-neutral-500 ml-2">ข้อความ</label>
              <textarea v-model="form.message" :disabled="sending" required class="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all outline-none resize-none text-neutral-800 font-medium disabled:opacity-60" placeholder="พิมพ์ข้อความรายละเอียดที่นี่..." rows="5"></textarea>
            </div>
            
            <BaseButton 
              type="submit" 
              variant="primary" 
              size="xl" 
              icon="mynaui:send" 
              :loading="sending"
              :disabled="sending"
              class="w-full mt-4"
            >
              {{ sending ? 'กำลังส่งข้อความ...' : 'ส่งข้อความ' }}
            </BaseButton>
          </form>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: 'ติดต่อเรา | Swizer Superfoods'
})

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})
const sending = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const contactMethods = [
  {
    icon: 'mynaui:location-solid',
    title: 'PRUEK - SAA TARA CO.,LTD.',
    content: ['45/7 SOI KHEHA ROMKLAO 64 KHLONG SONG TON NUN LAT KRABANG BANGKOK 10520']
  },  
  {
    icon: 'mynaui:telephone',
    title: 'โทรศัพท์',
    content: ['Office Tel: +6684 330 4444', 'Fax. +662 041 5951']
  },
  {
    icon: 'mynaui:users-group',
    title: 'ช่องทางสื่อสาร',
    content: [],
    links: [
      { text: 'info@swizerstore.com', url: 'mailto:info@swizerstore.com', icon: 'mynaui:envelope' },
      { text: '@swizer_superfood', url: 'https://line.me/R/ti/p/@swizer_superfood', icon: 'mynaui:chat-messages' },
      { text: 'Swizersuperfood', url: 'https://www.facebook.com/Swizersuperfood', icon: 'mynaui:brand-facebook' },
      { text: 'swizer_official', url: 'https://instagram.com/swizer_official', icon: 'mynaui:brand-instagram' }
    ]
  }
]

const submitForm = async () => {
  if (sending.value) return

  successMessage.value = ''
  errorMessage.value = ''
  sending.value = true

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: form.value.name.trim(),
        email: form.value.email.trim(),
        subject: form.value.subject.trim(),
        message: form.value.message.trim()
      }
    })

    successMessage.value = `ขอบคุณคุณ ${form.value.name.trim()} เราได้รับข้อความแล้ว และจะติดต่อกลับทางอีเมล ${form.value.email.trim()} โดยเร็วที่สุดครับ`
    form.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || error?.message || 'ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
  } finally {
    sending.value = false
  }
}
</script>
