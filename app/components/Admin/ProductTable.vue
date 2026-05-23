<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

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

// === Form State ===
const form = reactive({
  id: '', categoryId: '', name: '', description: '',
  price: 0, unit: '', image: '', badge: '',
  tags: [] as string[],
  benefits: [] as { icon: string; title: string; text: string }[],
  rituals: [] as { step: string; title: string; text: string }[],
  gallery: [] as string[]
})

// Temp inputs for adding items
const newGalleryUrl = ref('')

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

const columns: TableColumn<any>[] = [
  { accessorKey: 'image', header: 'รูปภาพ' },
  { accessorKey: 'name', header: 'ชื่อสินค้า' },
  { accessorKey: 'category_name', header: 'หมวดหมู่' },
  { accessorKey: 'price', header: 'ราคา' },
  { accessorKey: 'unit', header: 'หน่วย' },
  { accessorKey: 'badge', header: 'Badge' },
  { id: 'actions', header: '' }
]

function resetForm() {
  Object.assign(form, {
    id: '', categoryId: '', name: '', description: '',
    price: 0, unit: '', image: '', badge: '',
    tags: [], benefits: [], rituals: [], gallery: []
  })
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

// === Benefits ===
function addBenefit() {
  form.benefits.push({ icon: 'mynaui:heart', title: '', text: '' })
}
function removeBenefit(index: number) {
  form.benefits.splice(index, 1)
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
  if (!form.id || !form.name || !form.price) {
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
    await $authFetch(`/api/products/${id}`, { method: 'DELETE' })
    toast.add({ title: 'ลบสินค้าเรียบร้อย', color: 'success', icon: 'i-lucide-check-circle' })
    emit('delete', id)
  } catch (err: any) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: err.data?.statusMessage || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-xl font-bold">จัดการสินค้า</h2>
        <p class="text-sm text-muted mt-1">เพิ่ม แก้ไข และลบสินค้าในระบบ</p>
      </div>
      <UButton icon="i-lucide-plus" label="เพิ่มสินค้า" color="primary" @click="openNew" />
    </div>

    <!-- Table -->
    <UTable :data="data" :columns="columns" :loading="loading">
      <template #image-cell="{ row }">
        <img v-if="row.original.image" :src="row.original.image" class="h-10 w-10 rounded-lg object-cover" />
        <div v-else class="h-10 w-10 rounded-lg bg-elevated flex items-center justify-center">
          <UIcon name="i-lucide-image" class="text-muted" />
        </div>
      </template>
      <template #price-cell="{ row }">
        <span class="font-medium">{{ Number(row.original.price).toLocaleString() }} ฿</span>
      </template>
      <template #badge-cell="{ row }">
        <UBadge v-if="row.original.badge" :label="row.original.badge" variant="subtle" size="sm" />
        <span v-else class="text-muted text-sm">—</span>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex gap-2">
          <UButton icon="i-lucide-pencil" size="xs" color="neutral" variant="ghost" @click="openEdit(row.original)" />
          <UButton icon="i-lucide-trash-2" size="xs" color="error" variant="ghost" @click="handleDelete(row.original.id)" />
        </div>
      </template>
    </UTable>

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
              <UFormField label="หน่วย" class="w-full">
                <UInput v-model="form.unit" placeholder="e.g. ซอง" icon="i-lucide-ruler" autocomplete="off" class="w-full" />
              </UFormField>

              <UFormField label="Badge" class="col-span-2 w-full" hint="ไม่บังคับ">
                <UInput v-model="form.badge" placeholder="BEST SELLER" icon="i-lucide-award" autocomplete="off" class="w-full" />
              </UFormField>

              <UFormField label="รายละเอียด" class="col-span-2 w-full" hint="ไม่บังคับ">
                <UTextarea v-model="form.description" :rows="3" placeholder="รายละเอียดสินค้าโดยย่อ..." autoresize :maxrows="6" autocomplete="off" class="w-full" />
              </UFormField>
            </div>
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
              <UFormField label="ป้ายกำกับสินค้า" hint="กด Enter เพื่อเพิ่ม" class="w-full">
                <UInputTags v-model="form.tags" placeholder="พิมพ์แล้วกด Enter เช่น Non-GMO, Organic" class="w-full" />
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
                    <UInput v-model="benefit.icon" placeholder="mynaui:heart" icon="i-lucide-smile" autocomplete="off" class="w-full" />
                  </UFormField>
                  <UFormField label="Title" class="w-full">
                    <UInput v-model="benefit.title" placeholder="Heart Health" autocomplete="off" class="w-full" />
                  </UFormField>
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