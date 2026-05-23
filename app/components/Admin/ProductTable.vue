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
const newTag = ref('')
const newGalleryUrl = ref('')

// File input refs
const mainImageInput = ref<HTMLInputElement>()
const galleryImageInput = ref<HTMLInputElement>()

// Pending file uploads — เก็บไฟล์ไว้ก่อน ยังไม่ upload จนกว่าจะกดบันทึก
const pendingMainImage = ref<File | null>(null)
const pendingMainImagePreview = ref('')
const pendingGalleryFiles = ref<{ file: File; preview: string }[]>([])

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
  pendingMainImage.value = file
  pendingMainImagePreview.value = URL.createObjectURL(file)
  // เคลียร์ URL เก่า เพราะจะใช้รูปใหม่แทน
  form.image = ''
  input.value = ''
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
  const tag = newTag.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
  }
  newTag.value = ''
}
function removeTag(index: number) {
  form.tags.splice(index, 1)
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
        <span v-else class="text-muted text-sm">-</span>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex gap-1 justify-end">
          <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" size="xs" @click="openEdit(row.original)" />
          <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="handleDelete(row.original.id)" />
        </div>
      </template>
    </UTable>

    <!-- Modal -->
    <UModal v-model:open="isModalOpen" :title="isEditing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'" :ui="{ width: 'sm:max-w-2xl' }">
      <template #body>
        <form id="product-form" @submit.prevent="handleSave" class="space-y-5 max-h-[70vh] overflow-y-auto pr-1" autocomplete="off">
          
          <!-- ข้อมูลพื้นฐาน -->
          <div class="space-y-1 mb-2">
            <h4 class="font-semibold text-sm text-muted flex items-center gap-2">
              <UIcon name="i-lucide-info" class="size-4" /> ข้อมูลพื้นฐาน
            </h4>
            <USeparator />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Product ID" required>
              <UInput v-model="form.id" :disabled="isEditing" placeholder="e.g. chia-seeds" autocomplete="off" />
            </UFormField>
            <UFormField label="หมวดหมู่">
              <USelect
                v-model="form.categoryId"
                :items="(categories || []).map((c: any) => ({ label: c.name, value: c.id }))"
                placeholder="เลือกหมวดหมู่"
              />
            </UFormField>
          </div>

          <UFormField label="ชื่อสินค้า" required>
            <UInput v-model="form.name" autocomplete="off" />
          </UFormField>

          <div class="grid grid-cols-3 gap-4">
            <UFormField label="ราคา" required>
              <UInput v-model="form.price" type="number" autocomplete="off" />
            </UFormField>
            <UFormField label="หน่วย">
              <UInput v-model="form.unit" placeholder="e.g. ซอง" autocomplete="off" />
            </UFormField>
            <UFormField label="Badge">
              <UInput v-model="form.badge" placeholder="e.g. BEST SELLER" autocomplete="off" />
            </UFormField>
          </div>

          <UFormField label="รูปภาพหลัก">
            <div class="flex items-center gap-3">
              <div v-if="displayMainImage" class="relative group shrink-0">
                <img :src="displayMainImage" class="h-16 w-16 rounded-lg object-cover border border-default" />
                <UButton icon="i-lucide-x" color="error" variant="solid" size="2xs"
                  class="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="form.image = ''; removeMainImagePending()"
                />
              </div>
              <div class="flex-1 flex gap-2">
                <UInput v-model="form.image" placeholder="URL หรือกดเลือกรูป" class="flex-1" autocomplete="off" />
                <UButton icon="i-lucide-upload" label="เลือกรูป" color="neutral" variant="soft" size="sm" @click="mainImageInput?.click()" />
              </div>
            </div>
            <input ref="mainImageInput" type="file" accept="image/*" class="hidden" @change="handleMainImageSelect" />
          </UFormField>

          <UFormField label="รายละเอียด">
            <UTextarea v-model="form.description" :rows="3" autocomplete="off" />
          </UFormField>

          <!-- Tags -->
          <div class="space-y-1 mt-6 mb-2">
            <h4 class="font-semibold text-sm text-muted flex items-center gap-2">
              <UIcon name="i-lucide-tag" class="size-4" /> Tags
            </h4>
            <USeparator />
          </div>

          <div class="flex flex-wrap gap-2 mb-2">
            <UBadge v-for="(tag, i) in form.tags" :key="i" :label="tag" variant="subtle" size="sm" class="pr-1">
              <template #trailing>
                <UButton icon="i-lucide-x" color="neutral" variant="link" size="2xs" @click="removeTag(i)" />
              </template>
            </UBadge>
            <span v-if="form.tags.length === 0" class="text-xs text-muted">ยังไม่มี tag</span>
          </div>
          <div class="flex gap-2">
            <UInput v-model="newTag" placeholder="เพิ่ม tag เช่น Non-GMO" class="flex-1" autocomplete="off" @keydown.enter.prevent="addTag" />
            <UButton icon="i-lucide-plus" color="neutral" variant="soft" size="sm" @click="addTag" />
          </div>

          <!-- Benefits -->
          <div class="space-y-1 mt-6 mb-2">
            <h4 class="font-semibold text-sm text-muted flex items-center gap-2">
              <UIcon name="i-lucide-heart" class="size-4" /> Benefits
            </h4>
            <USeparator />
          </div>

          <div v-for="(benefit, i) in form.benefits" :key="i" class="p-3 border border-default rounded-lg space-y-3 relative">
            <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="2xs" class="absolute top-2 right-2" @click="removeBenefit(i)" />
            <div class="grid grid-cols-2 gap-3">
              <UFormField label="Icon">
                <UInput v-model="benefit.icon" placeholder="e.g. mynaui:heart" autocomplete="off" />
              </UFormField>
              <UFormField label="Title">
                <UInput v-model="benefit.title" placeholder="e.g. Heart Health" autocomplete="off" />
              </UFormField>
            </div>
            <UFormField label="รายละเอียด">
              <UInput v-model="benefit.text" autocomplete="off" />
            </UFormField>
          </div>
          <UButton icon="i-lucide-plus" label="เพิ่ม Benefit" color="neutral" variant="soft" size="sm" block @click="addBenefit" />

          <!-- Rituals -->
          <div class="space-y-1 mt-6 mb-2">
            <h4 class="font-semibold text-sm text-muted flex items-center gap-2">
              <UIcon name="i-lucide-list-ordered" class="size-4" /> Rituals (วิธีใช้)
            </h4>
            <USeparator />
          </div>

          <div v-for="(ritual, i) in form.rituals" :key="i" class="p-3 border border-default rounded-lg space-y-3 relative">
            <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="2xs" class="absolute top-2 right-2" @click="removeRitual(i)" />
            <div class="flex items-center gap-3">
              <span class="text-lg font-bold text-primary w-8 text-center shrink-0">{{ ritual.step }}</span>
              <UFormField label="Title" class="flex-1">
                <UInput v-model="ritual.title" placeholder="e.g. ผสมเครื่องดื่ม" autocomplete="off" />
              </UFormField>
            </div>
            <UFormField label="รายละเอียด">
              <UInput v-model="ritual.text" autocomplete="off" />
            </UFormField>
          </div>
          <UButton icon="i-lucide-plus" label="เพิ่ม Ritual" color="neutral" variant="soft" size="sm" block @click="addRitual" />

          <!-- Gallery -->
          <div class="space-y-1 mt-6 mb-2">
            <h4 class="font-semibold text-sm text-muted flex items-center gap-2">
              <UIcon name="i-lucide-images" class="size-4" /> Gallery
            </h4>
            <USeparator />
          </div>

          <div class="flex flex-wrap gap-3 mb-3">
            <!-- รูปที่บันทึกแล้ว (URL) -->
            <div v-for="(img, i) in form.gallery" :key="'saved-' + i" class="relative group">
              <img :src="img" class="h-20 w-20 rounded-lg object-cover border border-default" />
              <UButton icon="i-lucide-x" color="error" variant="solid" size="2xs" 
                class="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity" 
                @click="removeGalleryImage(i)" 
              />
            </div>

            <!-- รูปที่เลือกไว้แต่ยังไม่ได้ upload (pending) -->
            <div v-for="(pending, i) in pendingGalleryFiles" :key="'pending-' + i" class="relative group">
              <img :src="pending.preview" class="h-20 w-20 rounded-lg object-cover border-2 border-dashed border-primary/50" />
              <UButton icon="i-lucide-x" color="error" variant="solid" size="2xs" 
                class="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity" 
                @click="removePendingGalleryImage(i)" 
              />
              <span class="absolute bottom-0.5 left-0.5 right-0.5 text-[9px] text-center bg-black/60 text-white rounded-b-md py-0.5">รอบันทึก</span>
            </div>

            <!-- ปุ่มเพิ่มรูป -->
            <button type="button" @click="galleryImageInput?.click()"
              class="h-20 w-20 rounded-lg border-2 border-dashed border-default flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <UIcon name="i-lucide-plus" class="size-5 text-muted" />
              <span class="text-[10px] text-muted">เลือกรูป</span>
            </button>
          </div>
          <div class="flex gap-2">
            <UInput v-model="newGalleryUrl" placeholder="หรือวาง URL รูปภาพ" class="flex-1" autocomplete="off" @keydown.enter.prevent="addGalleryImage" />
            <UButton icon="i-lucide-plus" color="neutral" variant="soft" size="sm" @click="addGalleryImage" />
          </div>
          <input ref="galleryImageInput" type="file" accept="image/*" multiple class="hidden" @change="handleGalleryImageSelect" />
          
        </form>
      </template>
      <template #footer="{ close }">
        <UButton label="ยกเลิก" color="neutral" variant="outline" @click="close" />
        <UButton type="submit" form="product-form" label="บันทึก" color="primary" :loading="isSaving" />
      </template>
    </UModal>
  </div>
</template>
