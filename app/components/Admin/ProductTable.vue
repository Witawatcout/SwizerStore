<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import RichTextEditor from '~/components/RichTextEditor.vue'

const props = defineProps<{
  data: any[]
  categories: any[]
  loading: boolean
}>()

const emit = defineEmits<{
  save: [product: any, isEdit: boolean]
  delete: [id: string]
}>()

const toast = useToast()
const isModalOpen = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const selectedCategory = ref('all')
const selectedStatus = ref('all')

// === Form State ===
const form = reactive({
  id: '', categoryId: '', name: '', description: '',
  price: 0, stock: 0, is_active: true, unit: '', image: '', badge: '',
  tags: [] as string[],
  benefits: [] as { icon: string; title: string; text: string }[],
  rituals: [] as { step: string; title: string; text: string }[],
  gallery: [] as string[]
})

// Temp inputs for adding items
const newTag = ref('')
const newGalleryUrl = ref('')

const benefitIconOptions = [
  { icon: 'i-lucide-heart-pulse', label: 'หัวใจ' },
  { icon: 'i-lucide-leaf', label: 'ธรรมชาติ' },
  { icon: 'i-lucide-shield-check', label: 'ภูมิคุ้มกัน' },
  { icon: 'i-lucide-sparkles', label: 'ผิวพรรณ' },
  { icon: 'i-lucide-brain', label: 'สมอง' },
  { icon: 'i-lucide-dumbbell', label: 'พลังงาน' },
  { icon: 'i-lucide-flame', label: 'เผาผลาญ' },
  { icon: 'i-lucide-droplets', label: 'ความชุ่มชื้น' },
  { icon: 'i-lucide-wheat', label: 'ไฟเบอร์' },
  { icon: 'i-lucide-bone', label: 'กระดูก' },
  { icon: 'i-lucide-smile', label: 'อารมณ์' },
  { icon: 'i-lucide-sun', label: 'วิตามิน' }
]

// File input refs
const mainImageInput = ref<HTMLInputElement>()
const galleryImageInput = ref<HTMLInputElement>()

// Pending file uploads — เก็บไฟล์ไว้ก่อน ยังไม่ upload จนกว่าจะกดบันทึก
const pendingMainImage = ref<File | null>(null)
const pendingMainImagePreview = ref('')
const pendingGalleryFiles = ref<{ file: File; preview: string }[]>([])

// Main image drag state
const isMainDragOver = ref(false)

// === Upload (เรียกตอนบันทึกเท่านั้น) ===
async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await $authFetch<{ url: string }>('/api/upload', {
    method: 'POST',
    body: formData
  })
  return res.url
}

// === เลือกรูป → preview ในเครื่องก่อน (ยังไม่ upload) ===
function handleMainImageSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  setMainImageFile(file)
  input.value = ''
}

function setMainImageFile(file: File) {
  pendingMainImage.value = file
  pendingMainImagePreview.value = URL.createObjectURL(file)
  // เคลียร์ URL เก่า เพราะจะใช้รูปใหม่แทน
  form.image = ''
}

function handleMainImageDrop(event: DragEvent) {
  isMainDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    setMainImageFile(file)
  }
}

function handleGalleryImageSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files?.length) return
  for (const file of Array.from(files)) {
    pendingGalleryFiles.value.push({
      file,
      preview: URL.createObjectURL(file)
    })
  }
  input.value = ''
}

function removeMainImagePending() {
  if (pendingMainImagePreview.value) {
    URL.revokeObjectURL(pendingMainImagePreview.value)
  }
  pendingMainImage.value = null
  pendingMainImagePreview.value = ''
}

function removePendingGalleryImage(index: number) {
  const item = pendingGalleryFiles.value[index]
  if (item) URL.revokeObjectURL(item.preview)
  pendingGalleryFiles.value.splice(index, 1)
}

// รูป main ที่แสดง (pending preview หรือ URL ที่มีอยู่แล้ว)
const displayMainImage = computed(() => pendingMainImagePreview.value || form.image)

const filteredData = computed(() => {
  return (props.data || []).filter((product: any) => {
    const matchesCategory = selectedCategory.value === 'all' || product.category_id === selectedCategory.value
    const active = Number(product.is_active ?? 1) === 1
    const matchesStatus =
      selectedStatus.value === 'all' ||
      (selectedStatus.value === 'active' && active) ||
      (selectedStatus.value === 'inactive' && !active)
    return matchesCategory && matchesStatus
  })
})

const totalProducts = computed(() => (props.data || []).length)
const activeProducts = computed(() => (props.data || []).filter((product: any) => Number(product.is_active ?? 1) === 1).length)
const inactiveProducts = computed(() => Math.max(0, totalProducts.value - activeProducts.value))
const outOfStockProducts = computed(() => (props.data || []).filter((product: any) => Number(product.stock || 0) <= 0).length)

const columns: TableColumn<any>[] = [
  { accessorKey: 'image', header: 'รูปภาพ' },
  { accessorKey: 'name', header: 'ชื่อสินค้า' },
  { accessorKey: 'category_name', header: 'หมวดหมู่' },
  { accessorKey: 'price', header: 'ราคา' },
  { accessorKey: 'stock', header: 'Stock' },
  { accessorKey: 'is_active', header: 'Status' },
  { accessorKey: 'unit', header: 'หน่วย' },
  { accessorKey: 'badge', header: 'Badge' },
  { id: 'actions', header: '' }
]

function resetForm() {
  Object.assign(form, {
    id: '', categoryId: '', name: '', description: '',
    price: 0, stock: 0, is_active: true, unit: '', image: '', badge: '',
    tags: [], benefits: [], rituals: [], gallery: []
  })
  newTag.value = ''
  newGalleryUrl.value = ''
  removeMainImagePending()
  pendingGalleryFiles.value.forEach(p => URL.revokeObjectURL(p.preview))
  pendingGalleryFiles.value = []
}

function openNew() {
  isEditing.value = false
  resetForm()
  isModalOpen.value = true
}

function openEdit(product: any) {
  isEditing.value = true
  resetForm()
  Object.assign(form, {
    id: product.id,
    categoryId: product.category_id || '',
    name: product.name,
    description: product.description || '',
    price: product.price,
    stock: Number(product.stock || 0),
    is_active: Number(product.is_active ?? 1) === 1,
    unit: product.unit || '',
    image: product.image || '',
    badge: product.badge || '',
    tags: Array.isArray(product.tags) ? [...product.tags] : [],
    benefits: Array.isArray(product.benefits) ? product.benefits.map((b: any) => ({ ...b })) : [],
    rituals: Array.isArray(product.rituals) ? product.rituals.map((r: any) => ({ ...r })) : [],
    gallery: Array.isArray(product.gallery) ? [...product.gallery] : []
  })
  isModalOpen.value = true
}

// === Tags ===
function addTag() {
  const value = newTag.value.trim()
  if (!value) return
  const exists = form.tags.some(tag => tag.toLowerCase() === value.toLowerCase())
  if (exists) {
    toast.add({ title: 'Tag นี้ถูกเพิ่มแล้ว', color: 'warning', icon: 'i-lucide-tag' })
    return
  }
  form.tags.push(value)
  newTag.value = ''
}
function removeTag(index: number) {
  form.tags.splice(index, 1)
}

// === Benefits ===
function addBenefit() {
  form.benefits.push({ icon: benefitIconOptions[0].icon, title: '', text: '' })
}
function removeBenefit(index: number) {
  form.benefits.splice(index, 1)
}
function selectBenefitIcon(index: number, icon: string) {
  form.benefits[index].icon = icon
}

// === Rituals ===
function addRitual() {
  const step = String(form.rituals.length + 1).padStart(2, '0')
  form.rituals.push({ step, title: '', text: '' })
}
function removeRitual(index: number) {
  form.rituals.splice(index, 1)
  // Re-number steps
  form.rituals.forEach((r, i) => { r.step = String(i + 1).padStart(2, '0') })
}

// === Gallery ===
function addGalleryImage() {
  const url = newGalleryUrl.value.trim()
  if (url) {
    form.gallery.push(url)
  }
  newGalleryUrl.value = ''
}
function removeGalleryImage(index: number) {
  form.gallery.splice(index, 1)
}

// === Save / Delete ===
async function handleSave() {
  if (!form.id || !form.name || Number(form.price) <= 0 || Number(form.stock) < 0) {
    toast.add({ title: 'กรุณากรอกข้อมูลให้ครบ', color: 'error', icon: 'i-lucide-alert-circle' })
    return
  }
  isSaving.value = true
  try {
    // 1) อัปโหลดรูปหลัก (ถ้ามี pending)
    if (pendingMainImage.value) {
      form.image = await uploadFile(pendingMainImage.value)
      removeMainImagePending()
    }

    // 2) อัปโหลดรูป gallery (ถ้ามี pending)
    for (const pending of pendingGalleryFiles.value) {
      const url = await uploadFile(pending.file)
      form.gallery.push(url)
      URL.revokeObjectURL(pending.preview)
    }
    pendingGalleryFiles.value = []

    // 3) บันทึกข้อมูลสินค้า
    const method = isEditing.value ? 'PUT' : 'POST'
    const url = isEditing.value ? `/api/products/${form.id}` : '/api/products'
    await $authFetch(url, { method, body: form })
    isModalOpen.value = false
    toast.add({ title: isEditing.value ? 'แก้ไขสินค้าเรียบร้อย' : 'เพิ่มสินค้าเรียบร้อย', color: 'success', icon: 'i-lucide-check-circle' })
    emit('save', form, isEditing.value)
  } catch (err: any) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: err.data?.statusMessage || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    isSaving.value = false
  }
}

async function handleDelete(id: string) {
  if (!confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) return
  try {
    const result = await $authFetch<{ message?: string; deleted?: boolean; deactivated?: boolean }>(`/api/products/${id}`, { method: 'DELETE' })
    toast.add({
      title: result.deactivated ? 'ปิดการขายสินค้าแทน' : 'ลบสินค้าเรียบร้อย',
      description: result.message,
      color: result.deactivated ? 'warning' : 'success',
      icon: result.deactivated ? 'i-lucide-circle-alert' : 'i-lucide-check-circle',
    })
    emit('delete', id)
  } catch (err: any) {
    toast.add({ title: 'ลบสินค้าไม่สำเร็จ', description: err.data?.statusMessage || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
  }
}
</script>

<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-lg border border-default bg-default p-4 shadow-sm">
        <p class="text-sm font-medium text-muted">สินค้าทั้งหมด</p>
        <p class="mt-2 text-3xl font-black text-default">{{ totalProducts }}</p>
      </div>
      <div class="rounded-lg border border-success/30 bg-success/10 p-4 shadow-sm">
        <p class="text-sm font-medium text-success">เปิดขาย</p>
        <p class="mt-2 text-3xl font-black text-default">{{ activeProducts }}</p>
      </div>
      <div class="rounded-lg border border-warning/30 bg-warning/10 p-4 shadow-sm">
        <p class="text-sm font-medium text-warning">ปิดใช้งาน</p>
        <p class="mt-2 text-3xl font-black text-default">{{ inactiveProducts }}</p>
      </div>
      <div class="rounded-lg border border-error/30 bg-error/10 p-4 shadow-sm">
        <p class="text-sm font-medium text-error">สินค้าหมด</p>
        <p class="mt-2 text-3xl font-black text-default">{{ outOfStockProducts }}</p>
      </div>
    </div>

    <div class="flex flex-col gap-3 rounded-lg border border-default bg-default p-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
        <USelect
          v-model="selectedCategory"
          :items="[{ label: 'ทุกหมวดหมู่', value: 'all' }, ...(categories || []).map((c: any) => ({ label: c.name, value: c.id }))]"
          icon="i-lucide-folder"
          class="w-full"
        />
        <USelect
          v-model="selectedStatus"
          :items="[
            { label: 'ทุกสถานะ', value: 'all' },
            { label: 'เปิดขาย', value: 'active' },
            { label: 'ปิดใช้งาน', value: 'inactive' }
          ]"
          icon="i-lucide-toggle-left"
          class="w-full"
        />
      </div>
      <UButton icon="i-lucide-plus" label="เพิ่มสินค้า" color="primary" @click="openNew" />
    </div>

    <div class="rounded-lg border border-default bg-default">
      <UTable :data="filteredData" :columns="columns" :loading="loading">
        <template #image-cell="{ row }">
          <img v-if="row.original.image" :src="row.original.image" class="h-10 w-10 rounded-lg object-cover" />
          <div v-else class="h-10 w-10 rounded-lg bg-elevated flex items-center justify-center">
            <UIcon name="i-lucide-image" class="text-muted" />
          </div>
        </template>
        <template #price-cell="{ row }">
          <span class="font-medium">{{ Number(row.original.price).toLocaleString() }} ฿</span>
        </template>
        <template #stock-cell="{ row }">
          <UBadge :label="String(row.original.stock || 0)" :color="Number(row.original.stock || 0) > 0 ? 'neutral' : 'warning'" variant="subtle" size="sm" />
        </template>
        <template #is_active-cell="{ row }">
          <UBadge :label="Number(row.original.is_active ?? 1) === 1 ? 'เปิดขาย' : 'ปิดใช้งาน'" :color="Number(row.original.is_active ?? 1) === 1 ? 'success' : 'neutral'" variant="subtle" size="sm" />
        </template>
        <template #badge-cell="{ row }">
          <UBadge v-if="row.original.badge" :label="row.original.badge" variant="subtle" size="sm" />
          <span v-else class="text-muted text-sm">—</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-2">
            <UButton icon="i-lucide-pencil" label="แก้ไข" size="xs" color="neutral" variant="soft" @click="openEdit(row.original)" />
            <UButton icon="i-lucide-trash-2" size="xs" color="error" variant="ghost" @click="handleDelete(row.original.id)" />
          </div>
        </template>

        <template #empty>
          <div class="py-10 text-center">
            <UIcon name="i-lucide-package-open" class="mx-auto mb-2 size-8 text-muted" />
            <p class="font-medium">ไม่พบสินค้า</p>
            <p class="text-sm text-muted">ลองเปลี่ยนหมวดหมู่หรือสถานะสินค้า</p>
          </div>
        </template>
      </UTable>

      <div class="flex flex-col gap-2 border-t border-default px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-muted">แสดง {{ filteredData.length }} จาก {{ totalProducts }} สินค้า</p>
        <p class="text-sm text-muted">จัดการสถานะและข้อมูลสินค้าจากตารางนี้</p>
      </div>
    </div>

    <!-- ═══════════ Modal เพิ่ม/แก้ไขสินค้า ═══════════ -->
    <UModal
      v-model:open="isModalOpen"
      :title="isEditing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'"
      :description="isEditing ? 'แก้ไขข้อมูลสินค้าในระบบ' : 'กรอกข้อมูลสินค้าที่ต้องการเพิ่มในระบบ'"
      :ui="{ content: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-4xl max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)] rounded-[calc(var(--ui-radius)*2)] shadow-lg ring ring-(--ui-border)' }"
    >
      <template #body>
        <form id="product-form" @submit.prevent="handleSave" class="space-y-8 max-h-[72vh] overflow-y-auto pr-1" autocomplete="off">

          <!-- ═══════════ ข้อมูลพื้นฐาน ═══════════ -->
          <div class="space-y-4">
            <div>
              <h4 class="font-semibold text-base text-default">ข้อมูลพื้นฐาน</h4>
              <p class="text-sm text-muted mt-1">รหัส ชื่อ ราคา และรายละเอียดทั่วไปของสินค้า</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Product ID" required class="w-full">
                <UInput v-model="form.id" :disabled="isEditing" placeholder="e.g. chia-seeds" icon="i-lucide-hash" autocomplete="off" class="w-full" />
              </UFormField>
              <UFormField label="หมวดหมู่" class="w-full">
                <USelect
                  v-model="form.categoryId"
                  :items="(categories || []).map((c: any) => ({ label: c.name, value: c.id }))"
                  placeholder="เลือกหมวดหมู่"
                  icon="i-lucide-folder"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="ชื่อสินค้า" required class="col-span-2 w-full">
                <UInput v-model="form.name" placeholder="ชื่อสินค้าภาษาไทยหรืออังกฤษ" icon="i-lucide-type" autocomplete="off" class="w-full" />
              </UFormField>

              <UFormField label="ราคา" required class="w-full">
                <UInput v-model="form.price" type="number" placeholder="0" icon="i-lucide-banknote" autocomplete="off" class="w-full" />
              </UFormField>
              <UFormField label="Stock" required class="w-full">
                <UInput v-model="form.stock" type="number" min="0" placeholder="0" icon="i-lucide-box" autocomplete="off" class="w-full" />
              </UFormField>
              <UFormField label="หน่วย" class="w-full">
                <UInput v-model="form.unit" placeholder="e.g. ซอง" icon="i-lucide-ruler" autocomplete="off" class="w-full" />
              </UFormField>
              <UFormField label="Status" class="w-full">
                <USwitch v-model="form.is_active" label="Active" />
              </UFormField>

              <UFormField label="Badge" class="col-span-2 w-full" hint="ไม่บังคับ">
                <UInput v-model="form.badge" placeholder="BEST SELLER" icon="i-lucide-award" autocomplete="off" class="w-full" />
              </UFormField>

            </div>
          </div>

          <USeparator />

          <!-- ═══════════ เนื้อหารายละเอียดสินค้า ═══════════ -->
          <div class="space-y-4">
            <div>
              <h4 class="font-semibold text-base text-default">เนื้อหา</h4>
              <p class="text-sm text-muted mt-1">รายละเอียดสินค้าแบบเต็ม รองรับหัวข้อ ตัวหนา ลิสต์ ลิงก์ และการจัดย่อหน้าเหมือนหน้า News</p>
            </div>
            <UFormField label="รายละเอียดสินค้า" name="description" class="w-full" hint="ไม่บังคับ">
              <RichTextEditor v-model="form.description" placeholder="พิมพ์รายละเอียดสินค้า เช่น จุดเด่น วิธีใช้ ส่วนผสม หรือข้อมูลเพิ่มเติม..." class="w-full" />
            </UFormField>
          </div>

          <USeparator />

          <!-- ═══════════ รูปภาพหลัก ═══════════ -->
          <div class="space-y-4">
            <div>
              <h4 class="font-semibold text-base text-default">รูปภาพหลัก</h4>
              <p class="text-sm text-muted mt-1">รูปที่จะแสดงเป็นภาพปกของสินค้า แนะนำใช้ภาพสัดส่วน 1:1</p>
            </div>
            <div class="space-y-4">
              <!-- มีรูปแล้ว — แสดง preview -->
              <div v-if="displayMainImage" class="relative group rounded-xl overflow-hidden border border-default bg-elevated">
                <img :src="displayMainImage" class="w-full h-56 object-cover" />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <UButton icon="i-lucide-refresh-cw" label="เปลี่ยนรูป" color="neutral" variant="solid" size="sm" @click="mainImageInput?.click()" />
                  <UButton icon="i-lucide-trash-2" label="ลบ" color="error" variant="solid" size="sm" @click="form.image = ''; removeMainImagePending()" />
                </div>
                <UBadge v-if="pendingMainImagePreview" label="รอบันทึก" color="warning" variant="solid" size="xs" class="absolute top-3 left-3" />
              </div>

              <!-- ยังไม่มีรูป — แสดง drop zone -->
              <button
                v-else
                type="button"
                class="w-full rounded-xl border-2 border-dashed p-10 flex flex-col items-center gap-3 transition-all cursor-pointer"
                :class="isMainDragOver
                  ? 'border-primary bg-primary/10 scale-[1.01]'
                  : 'border-default hover:border-primary hover:bg-primary/5'"
                @click="mainImageInput?.click()"
                @dragover.prevent="isMainDragOver = true"
                @dragleave.prevent="isMainDragOver = false"
                @drop.prevent="handleMainImageDrop"
              >
                <div class="size-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <UIcon name="i-lucide-upload-cloud" class="size-7 text-primary" />
                </div>
                <div class="text-center">
                  <p class="text-sm font-medium">คลิกเพื่อเลือกรูป หรือลากวาง</p>
                  <p class="text-xs text-muted mt-1">รองรับ JPG, PNG, WebP ขนาดไม่เกิน 5MB</p>
                </div>
              </button>

              <UInput v-model="form.image" placeholder="หรือวาง URL รูปภาพ" icon="i-lucide-link" autocomplete="off" class="w-full" />
              <input ref="mainImageInput" type="file" accept="image/*" class="hidden" @change="handleMainImageSelect" />
            </div>
          </div>

          <USeparator />

          <!-- ═══════════ Tags ═══════════ -->
          <div class="space-y-4">
            <div>
              <h4 class="font-semibold text-base text-default">Tags</h4>
              <p class="text-sm text-muted mt-1">คำค้นหาและแท็กที่เกี่ยวข้อง เพื่อเพิ่มประสิทธิภาพการค้นหา</p>
            </div>
            <div>
              <UFormField label="ป้ายกำกับสินค้า" hint="พิมพ์ tag แล้วกดปุ่มเพิ่ม" class="w-full">
                <div class="space-y-3">
                  <div class="flex gap-2">
                    <UInput
                      v-model="newTag"
                      placeholder="เช่น Non-GMO, Organic"
                      icon="i-lucide-tag"
                      autocomplete="off"
                      class="flex-1"
                      @keydown.enter.prevent
                    />
                    <UButton
                      type="button"
                      icon="i-lucide-plus"
                      label="เพิ่ม"
                      color="neutral"
                      variant="soft"
                      @click="addTag"
                    />
                  </div>
                  <div v-if="form.tags.length" class="flex flex-wrap gap-2">
                    <span
                      v-for="(tag, index) in form.tags"
                      :key="`${tag}-${index}`"
                      class="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      <UIcon name="i-lucide-tag" class="size-3" />
                      {{ tag }}
                      <button
                        type="button"
                        class="ml-1 rounded-full p-0.5 text-muted hover:bg-white hover:text-error"
                        @click="removeTag(index)"
                      >
                        <UIcon name="i-lucide-x" class="size-3" />
                      </button>
                    </span>
                  </div>
                  <p v-else class="text-xs text-muted">ยังไม่มี tag กรอกข้อความแล้วกดปุ่มเพิ่ม</p>
                </div>
              </UFormField>
            </div>
          </div>

          <USeparator />

          <!-- ═══════════ Benefits ═══════════ -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-semibold text-base text-default">Benefits</h4>
                <p class="text-sm text-muted mt-1">คุณสมบัติพิเศษและจุดเด่นของสินค้า (แสดงเป็นรายการ)</p>
              </div>
              <UBadge :label="`${form.benefits.length}`" variant="subtle" size="sm" rounded="full" />
            </div>
            <div class="space-y-4">
              <div v-if="form.benefits.length === 0" class="text-center py-8 border border-dashed border-default rounded-xl">
                <UIcon name="i-lucide-sparkles" class="size-8 text-muted mx-auto mb-2" />
                <p class="text-sm text-muted">ยังไม่มี Benefit</p>
                <p class="text-xs text-muted">เพิ่มคุณประโยชน์ของสินค้าเพื่อให้ลูกค้าตัดสินใจง่ายขึ้น</p>
              </div>

              <div v-for="(benefit, i) in form.benefits" :key="i" class="p-4 bg-elevated rounded-xl space-y-4 relative group border border-default/50 hover:border-primary/50 transition-colors">
                <UButton icon="i-lucide-x" color="error" variant="ghost" size="2xs"
                  class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="removeBenefit(i)"
                />
                <div class="grid grid-cols-2 gap-4 pr-6">
                  <UFormField label="Icon" class="w-full">
                    <UInput v-model="benefit.icon" placeholder="เลือก icon ด้านล่าง" icon="i-lucide-smile" autocomplete="off" class="w-full" />
                  </UFormField>
                  <UFormField label="Title" class="w-full">
                    <UInput v-model="benefit.title" placeholder="Heart Health" autocomplete="off" class="w-full" />
                  </UFormField>
                </div>
                <div class="rounded-lg border border-default/60 bg-default/30 p-3">
                  <p class="mb-2 text-xs font-medium text-muted">เลือก icon สำหรับ Benefit นี้</p>
                  <div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    <button
                      v-for="option in benefitIconOptions"
                      :key="option.icon"
                      type="button"
                      class="flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-center transition"
                      :class="benefit.icon === option.icon
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-default bg-white hover:border-primary/60 hover:bg-primary/5'"
                      @click="selectBenefitIcon(i, option.icon)"
                    >
                      <UIcon :name="option.icon" class="size-5" />
                      <span class="text-[11px] leading-tight">{{ option.label }}</span>
                    </button>
                  </div>
                </div>
                <UFormField label="รายละเอียด" class="w-full">
                  <UInput v-model="benefit.text" placeholder="คำอธิบายสั้นๆ" autocomplete="off" class="w-full" />
                </UFormField>
              </div>

              <UButton icon="i-lucide-plus" label="เพิ่ม Benefit" color="primary" variant="soft" size="sm" block @click="addBenefit" />
            </div>
          </div>

          <USeparator />

          <!-- ═══════════ Rituals ═══════════ -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-semibold text-base text-default">Rituals</h4>
                <p class="text-sm text-muted mt-1">ขั้นตอนการใช้งานหรือวิธีรับประทาน (แสดงตามลำดับ)</p>
              </div>
              <UBadge :label="`${form.rituals.length}`" variant="subtle" size="sm" rounded="full" />
            </div>
            <div class="space-y-4">
              <div v-if="form.rituals.length === 0" class="text-center py-8 border border-dashed border-default rounded-xl">
                <UIcon name="i-lucide-list-checks" class="size-8 text-muted mx-auto mb-2" />
                <p class="text-sm text-muted">ยังไม่มีขั้นตอน</p>
              </div>

              <div v-for="(ritual, i) in form.rituals" :key="i" class="p-4 bg-elevated rounded-xl relative group border border-default/50 hover:border-primary/50 transition-colors">
                <UButton icon="i-lucide-x" color="error" variant="ghost" size="2xs"
                  class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="removeRitual(i)"
                />
                <div class="flex items-start gap-4 pr-6">
                  <div class="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0 mt-1">
                    {{ ritual.step }}
                  </div>
                  <div class="flex-1 space-y-4">
                    <UFormField label="Title" class="w-full">
                      <UInput v-model="ritual.title" placeholder="e.g. ผสมเครื่องดื่ม" autocomplete="off" class="w-full" />
                    </UFormField>
                    <UFormField label="รายละเอียด" class="w-full">
                      <UTextarea v-model="ritual.text" placeholder="คำอธิบายขั้นตอน" :rows="2" autoresize autocomplete="off" class="w-full" />
                    </UFormField>
                  </div>
                </div>
              </div>

              <UButton icon="i-lucide-plus" label="เพิ่ม Ritual" color="primary" variant="soft" size="sm" block @click="addRitual" />
            </div>
          </div>

          <USeparator />

          <!-- ═══════════ Gallery ═══════════ -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-semibold text-base text-default">Gallery</h4>
                <p class="text-sm text-muted mt-1">รูปภาพมุมอื่นๆ ของสินค้าเพื่อประกอบการตัดสินใจ</p>
              </div>
              <UBadge :label="`${form.gallery.length + pendingGalleryFiles.length}`" variant="subtle" size="sm" rounded="full" />
            </div>
            <div class="space-y-5">
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-4">
                <!-- รูปที่บันทึกแล้ว (URL) -->
                <div v-for="(img, i) in form.gallery" :key="'saved-' + i" class="relative group aspect-square">
                  <img :src="img" class="size-full rounded-xl object-cover border border-default shadow-sm" />
                  <UButton icon="i-lucide-x" color="error" variant="solid" size="2xs"
                    class="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    @click="removeGalleryImage(i)"
                  />
                </div>

                <!-- รูปที่เลือกไว้แต่ยังไม่ได้ upload (pending) -->
                <div v-for="(pending, i) in pendingGalleryFiles" :key="'pending-' + i" class="relative group aspect-square">
                  <img :src="pending.preview" class="size-full rounded-xl object-cover border-2 border-dashed border-primary/50" />
                  <UButton icon="i-lucide-x" color="error" variant="solid" size="2xs"
                    class="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    @click="removePendingGalleryImage(i)"
                  />
                  <UBadge label="รอบันทึก" color="warning" variant="solid" size="xs" class="absolute bottom-2 left-2" />
                </div>

                <!-- ปุ่มเพิ่มรูป -->
                <button type="button" @click="galleryImageInput?.click()"
                  class="aspect-square rounded-xl border-2 border-dashed border-default flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all hover:scale-[1.02]"
                >
                  <UIcon name="i-lucide-plus" class="size-6 text-muted" />
                  <span class="text-[10px] text-muted font-medium">เพิ่มรูป</span>
                </button>
              </div>

              <div class="flex gap-2 items-center">
                <USeparator class="flex-1" />
                <span class="text-xs text-muted font-medium px-2">หรือ</span>
                <USeparator class="flex-1" />
              </div>

              <div class="flex gap-2">
                <UInput v-model="newGalleryUrl" placeholder="วาง URL รูปภาพตรงนี้" class="flex-1" icon="i-lucide-link" autocomplete="off" @keydown.enter.prevent="addGalleryImage" />
                <UButton icon="i-lucide-plus" label="เพิ่ม" color="neutral" variant="soft" @click="addGalleryImage" />
              </div>
              <input ref="galleryImageInput" type="file" accept="image/*" multiple class="hidden" @change="handleGalleryImageSelect" />
            </div>
          </div>

        </form>
      </template>

      <template #footer="{ close }">
        <div class="flex items-center justify-between w-full">
          <UButton label="ยกเลิก" color="neutral" variant="ghost" @click="close" />
          <UButton type="submit" form="product-form" :label="isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'" color="primary" icon="i-lucide-check" :loading="isSaving" />
        </div>
      </template>
    </UModal>
  </div>
</template>
