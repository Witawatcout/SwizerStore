<script setup lang="ts">
useHead({ title: 'นโยบายคุกกี้ | Swizer Superfoods' })

const openCookieSettings = () => {
  window.dispatchEvent(new CustomEvent('swizer-open-cookie-settings'))
}
</script>

<template>
  <PolicyDocument
    title="นโยบายคุกกี้"
    description="อธิบายข้อมูลที่เว็บไซต์จัดเก็บไว้ในเบราว์เซอร์ วัตถุประสงค์ และวิธีเลือกหรือเปลี่ยนความยินยอม"
    icon="i-lucide-cookie"
  >
    <section>
      <h2 class="text-xl font-black text-default">1. คุกกี้และพื้นที่จัดเก็บในเบราว์เซอร์คืออะไร</h2>
      <p class="mt-3">เว็บไซต์อาจใช้คุกกี้หรือ local storage เพื่อจดจำข้อมูลขนาดเล็กบนอุปกรณ์ เช่น ตะกร้าสินค้า สถานะเข้าสู่ระบบ ภาษาที่เลือก และการตัดสินใจเกี่ยวกับคุกกี้ ข้อมูลเหล่านี้ช่วยให้บริการทำงานต่อเนื่องเมื่อเปลี่ยนหน้าหรือกลับมาใช้งานอีกครั้ง</p>
    </section>

    <section>
      <h2 class="text-xl font-black text-default">2. ประเภทที่เราใช้</h2>
      <div class="mt-4 divide-y divide-muted border-y border-muted">
        <div class="grid gap-2 py-5 sm:grid-cols-[180px_1fr]">
          <p class="font-black text-default">จำเป็น</p>
          <p>ใช้เก็บตะกร้าสินค้า สถานะบัญชี ภาษา ความปลอดภัย และการเลือกความยินยอม ไม่สามารถปิดผ่านแบนเนอร์ได้เพราะจำเป็นต่อบริการที่ผู้ใช้ร้องขอ</p>
        </div>
        <div class="grid gap-2 py-5 sm:grid-cols-[180px_1fr]">
          <p class="font-black text-default">วิเคราะห์</p>
          <p>ใช้วัดจำนวนผู้เข้าชมและประสิทธิภาพหน้าเว็บไซต์ หากเปิดใช้ในอนาคตจะเริ่มทำงานหลังผู้ใช้เลือก “ยอมรับทั้งหมด” เท่านั้น</p>
        </div>
        <div class="grid gap-2 py-5 sm:grid-cols-[180px_1fr]">
          <p class="font-black text-default">การตลาด</p>
          <p>ใช้วัดผลโฆษณาหรือปรับข้อเสนอให้เหมาะกับความสนใจ หากเปิดใช้ในอนาคตจะเริ่มทำงานหลังได้รับความยินยอมเท่านั้น</p>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-black text-default">3. รายการจัดเก็บหลัก</h2>
      <ul class="mt-3 list-disc space-y-2 pl-6">
        <li><span class="font-bold text-default">swizer-cookie-consent:</span> บันทึกตัวเลือกคุกกี้จนกว่าผู้ใช้เปลี่ยนการตั้งค่าหรือล้างข้อมูลเว็บไซต์</li>
        <li><span class="font-bold text-default">swizer-language:</span> จดจำภาษาที่ผู้ใช้เลือกจนกว่าจะเปลี่ยนหรือล้างข้อมูลเว็บไซต์</li>
        <li><span class="font-bold text-default">ข้อมูล Pinia ของบัญชีและตะกร้า:</span> รักษาสถานะเข้าสู่ระบบและรายการสินค้าในตะกร้าจนกว่าจะออกจากระบบ ลบสินค้า หรือล้างข้อมูลเว็บไซต์</li>
      </ul>
    </section>

    <section>
      <h2 class="text-xl font-black text-default">4. การควบคุมความยินยอม</h2>
      <p class="mt-3">คุณเลือกใช้เฉพาะข้อมูลที่จำเป็นหรือยอมรับทั้งหมดได้ และกลับมาเปลี่ยนตัวเลือกได้ทุกเมื่อ การเลือกเฉพาะที่จำเป็นไม่กระทบการดูสินค้า ตะกร้า การเข้าสู่ระบบ หรือการชำระเงิน</p>
      <UButton
        label="ตั้งค่าคุกกี้"
        icon="i-lucide-settings-2"
        color="primary"
        class="mt-5"
        @click="openCookieSettings"
      />
    </section>
  </PolicyDocument>
</template>
