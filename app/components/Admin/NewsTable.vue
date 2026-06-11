<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import RichTextEditor from '~/components/RichTextEditor.vue'

const props = defineProps<{
  data: any[]
  loading: boolean
}>()

const emit = defineEmits<{
  save: [news: any, isEdit: boolean]
  delete: [id: string]
}>()

const toast = useToast()
const isModalOpen = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)

// === Form State ===
const form = reactive({
  id: '',
  tag: '',
  date: '',
  title: '',
  desc: '',
  image: '',
  content: ''
})

// File input refs
const mainImageInput = ref<HTMLInputElement>()

// Pending file uploads
const pendingMainImage = ref<File | null>(null)
const pendingMainImagePreview = ref('')
const isMainDragOver = ref(false)
const maxImageFileSize = 5 * 1024 * 1024
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp']

// === Upload ===
async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await $authFetch<{ url: string }>('/api/upload', {
    method: 'POST',
    body: formData
  })
  return res.url
}

function handleMainImageSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!validateImageFile(file)) {
    input.value = ''
    return
  }
  setMainImageFile(file)
  input.value = ''
}

function validateImageFile(file: File) {
  if (!allowedImageTypes.includes(file.type)) {
    toast.add({
      title: 'ไม่รองรับไฟล์นี้',
      description: 'กรุณาใช้ไฟล์ JPG, PNG หรือ WebP',
      color: 'warning',
      icon: 'i-lucide-image-off',
    })
    return false
  }

  if (file.size > maxImageFileSize) {
    toast.add({
      title: 'ไฟล์มีขนาดใหญ่เกินไป',
      description: 'รูปภาพต้องมีขนาดไม่เกิน 5MB',
      color: 'warning',
      icon: 'i-lucide-file-warning',
    })
    return false
  }

  return true
}

function setMainImageFile(file: File) {
  pendingMainImage.value = file
  pendingMainImagePreview.value = URL.createObjectURL(file)
  form.image = ''
}

function handleMainImageDrop(event: DragEvent) {
  isMainDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && validateImageFile(file)) {
    setMainImageFile(file)
  }
}

function removeMainImagePending() {
  if (pendingMainImagePreview.value) {
    URL.revokeObjectURL(pendingMainImagePreview.value)
  }
  pendingMainImage.value = null
  pendingMainImagePreview.value = ''
}

const displayMainImage = computed(() => pendingMainImagePreview.value || form.image)

const totalNews = computed(() => (props.data || []).length)
const withImageNews = computed(() => (props.data || []).filter((news: any) => Boolean(news.image)).length)
const taggedNews = computed(() => (props.data || []).filter((news: any) => Boolean(news.tag)).length)

const columns: TableColumn<any>[] = [
  { accessorKey: 'image', header: 'รูปภาพ' },
  { accessorKey: 'title', header: 'หัวข้อ' },
  { accessorKey: 'tag', header: 'Tag' },
  { accessorKey: 'date', header: 'วันที่' },
  { id: 'actions', header: '' }
]

function resetForm() {
  Object.assign(form, {
    id: '', tag: '', date: '', title: '', desc: '', image: '', content: ''
  })
  removeMainImagePending()
}

function openNew() {
  isEditing.value = false
  resetForm()
  // Generate random id for new news
  form.id = `news-${Date.now()}`
  isModalOpen.value = true
}

function openEdit(news: any) {
  isEditing.value = true
  resetForm()
  Object.assign(form, {
    id: news.id,
    tag: news.tag || '',
    date: news.date || '',
    title: news.title || '',
    desc: news.desc || '',
    image: news.image || '',
    content: news.content || ''
  })
  isModalOpen.value = true
}

// === Save / Delete ===
async function handleSave() {
  if (!form.id || !form.title) {
    toast.add({ title: 'กรุณากรอกข้อมูลให้ครบ', color: 'error', icon: 'i-lucide-alert-circle' })
    return
  }
  isSaving.value = true
  try {
    // 1) อัปโหลดรูปหลัก
    if (pendingMainImage.value) {
      form.image = await uploadFile(pendingMainImage.value)
      removeMainImagePending()
    }

    // 2) บันทึกข้อมูล
    const method = isEditing.value ? 'PUT' : 'POST'
    const url = isEditing.value ? `/api/news/${form.id}` : '/api/news'
    await $authFetch(url, { method, body: form })
    
    isModalOpen.value = false
    toast.add({ title: isEditing.value ? 'แก้ไขข่าวเรียบร้อย' : 'เพิ่มข่าวเรียบร้อย', color: 'success', icon: 'i-lucide-check-circle' })
    emit('save', form, isEditing.value)
  } catch (err: any) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: err.data?.statusMessage || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    isSaving.value = false
  }
}

async function handleDelete(id: string) {
  if (!confirm('คุณต้องการลบข่าวนี้ใช่หรือไม่?')) return
  try {
    await $authFetch(`/api/news/${id}`, { method: 'DELETE' })
    toast.add({ title: 'ลบข่าวเรียบร้อย', color: 'success', icon: 'i-lucide-check-circle' })
    emit('delete', id)
  } catch (err: any) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: err.data?.statusMessage || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
  }
}
</script>

<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="rounded-lg border border-default bg-default p-4 shadow-sm">
        <p class="text-sm font-medium text-muted">บทความทั้งหมด</p>
        <p class="mt-2 text-3xl font-black text-default">{{ totalNews }}</p>
      </div>
      <div class="rounded-lg border border-primary/30 bg-primary/10 p-4 shadow-sm">
        <p class="text-sm font-medium text-primary">มีรูปภาพปก</p>
        <p class="mt-2 text-3xl font-black text-default">{{ withImageNews }}</p>
      </div>
      <div class="rounded-lg border border-info/30 bg-info/10 p-4 shadow-sm">
        <p class="text-sm font-medium text-info">มี Tag</p>
        <p class="mt-2 text-3xl font-black text-default">{{ taggedNews }}</p>
      </div>
    </div>

    <div class="flex flex-col gap-3 rounded-lg border border-default bg-default p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-base font-bold">รายการข่าว / บทความ</h2>
        <p class="text-sm text-muted">ดู แก้ไข และลบบทความที่แสดงบนเว็บไซต์</p>
      </div>
      <UButton icon="i-lucide-plus" label="เพิ่มบทความ" color="primary" @click="openNew" />
    </div>

    <div class="rounded-lg border border-default bg-default">
      <UTable :data="data" :columns="columns" :loading="loading">
        <template #image-cell="{ row }">
          <div class="flex h-14 w-20 items-center justify-center overflow-hidden rounded-lg bg-elevated">
            <img v-if="row.original.image" :src="row.original.image" class="h-full w-full object-cover" />
            <UIcon v-else name="i-lucide-image" class="text-muted text-2xl" />
          </div>
        </template>
        <template #tag-cell="{ row }">
          <UBadge v-if="row.original.tag" :label="row.original.tag" color="primary" variant="subtle" size="sm" />
          <span v-else class="text-muted text-sm">—</span>
        </template>
        <template #date-cell="{ row }">
          <span class="text-sm text-muted">{{ row.original.date || '—' }}</span>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex items-center justify-end gap-2">
            <UButton icon="i-lucide-edit" label="แก้ไข" color="neutral" variant="soft" size="xs" @click="openEdit(row.original)" />
            <UButton icon="i-lucide-trash" color="error" variant="ghost" size="xs" @click="handleDelete(row.original.id)" />
          </div>
        </template>
        <template #empty>
          <div class="py-10 text-center">
            <UIcon name="i-lucide-newspaper" class="mx-auto mb-2 size-8 text-muted" />
            <p class="font-medium">ยังไม่มีบทความ</p>
            <p class="text-sm text-muted">เพิ่มบทความเพื่อแสดงข่าวสารบนเว็บไซต์</p>
          </div>
        </template>
      </UTable>

      <div class="flex flex-col gap-2 border-t border-default px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-muted">แสดง {{ totalNews }} บทความ</p>
        <p class="text-sm text-muted">มีรูปภาพปก {{ withImageNews }} / มี Tag {{ taggedNews }}</p>
      </div>
    </div>

    <!-- Modal Form -->
    <UModal
      v-model:open="isModalOpen"
      :title="isEditing ? 'แก้ไขบทความ' : 'เพิ่มบทความใหม่'"
      :description="isEditing ? 'แก้ไขรายละเอียดของบทความ' : 'สร้างบทความใหม่เพื่อแสดงบนเว็บไซต์'"
      :ui="{ content: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-4xl max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)] rounded-[calc(var(--ui-radius)*2)] shadow-lg ring ring-(--ui-border)' }"
    >
      <template #body>
        <form @submit.prevent="handleSave" class="space-y-6 max-h-[72vh] overflow-y-auto pr-1" autocomplete="off">
          
          <!-- รูปหลัก -->
          <div class="space-y-3">
            <div>
              <h4 class="font-semibold text-base text-default">
                <AdminFieldLabel
                  label="รูปภาพปก"
                  tooltip="แนะนำขนาด 1600 x 900 px สัดส่วน 16:9 ใช้ WebP หรือ JPG สำหรับภาพถ่าย และ PNG เมื่อจำเป็นต้องมีพื้นหลังโปร่งใส ขนาดไม่เกิน 5MB"
                />
              </h4>
              <p class="text-sm text-muted mt-1">รูปแนวนอนที่จะแสดงบนการ์ดข่าวและส่วนหัวของบทความ</p>
            </div>
            <div class="grid gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:grid-cols-3">
              <div class="flex items-start gap-2">
                <UIcon name="i-lucide-scan" class="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p class="text-sm font-semibold text-default">1600 x 900 px</p>
                  <p class="text-xs text-muted">สัดส่วน 16:9 ขั้นต่ำ 1200 x 675 px</p>
                </div>
              </div>
              <div class="flex items-start gap-2">
                <UIcon name="i-lucide-file-image" class="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p class="text-sm font-semibold text-default">WebP, JPG, PNG</p>
                  <p class="text-xs text-muted">แนะนำ WebP เพื่อให้บทความโหลดเร็ว</p>
                </div>
              </div>
              <div class="flex items-start gap-2">
                <UIcon name="i-lucide-weight" class="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p class="text-sm font-semibold text-default">ไม่เกิน 5MB</p>
                  <p class="text-xs text-muted">แนะนำ 300KB-1MB ต่อรูป</p>
                </div>
              </div>
            </div>
            <div
              class="border-2 border-dashed rounded-2xl transition-colors duration-200 overflow-hidden relative aspect-video"
              :class="isMainDragOver ? 'border-primary bg-primary/10' : 'border-default hover:border-primary hover:bg-primary/5'"
              @dragover.prevent="isMainDragOver = true"
              @dragleave.prevent="isMainDragOver = false"
              @drop.prevent="handleMainImageDrop"
            >
              <input type="file" ref="mainImageInput" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleMainImageSelect" />
              
              <template v-if="displayMainImage">
                <img :src="displayMainImage" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                  <UButton icon="i-lucide-refresh-cw" label="เปลี่ยนรูป" color="neutral" variant="solid" size="sm" @click="mainImageInput?.click()" />
                  <UButton icon="i-lucide-trash-2" label="ลบ" color="error" variant="solid" size="sm" @click="form.image = ''; removeMainImagePending()" />
                </div>
              </template>
              <template v-else>
                <div class="w-full h-full flex items-center justify-center cursor-pointer" @click="mainImageInput?.click()">
                  <div class="text-center">
                    <div class="size-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <UIcon name="i-lucide-upload-cloud" class="size-7 text-primary" />
                    </div>
                    <p class="text-sm font-medium">คลิกเพื่อเลือกรูป หรือลากวาง</p>
                    <p class="text-xs text-muted mt-1">JPG, PNG หรือ WebP · 16:9 · ไม่เกิน 5MB</p>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- ข้อมูลพื้นฐาน -->
          <div class="space-y-4">
            <div>
              <h4 class="font-semibold text-base text-default">ข้อมูลพื้นฐาน</h4>
              <p class="text-sm text-muted mt-1">รหัส หมวด วันที่ และหัวข้อของบทความ</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="ID (Slug)" name="id" class="w-full">
                <template #label>
                  <AdminFieldLabel
                    label="ID (Slug)"
                    tooltip="รหัสและ URL ของบทความ ควรใช้ภาษาอังกฤษตัวเล็ก ตัวเลข หรือขีดกลาง เช่น healthy-tips และไม่ควรเปลี่ยนหลังเผยแพร่"
                  />
                </template>
                <UInput v-model="form.id" placeholder="ex. healthy-tips" :disabled="isEditing" class="w-full" />
              </UFormField>
              <UFormField label="Tag" name="tag" class="w-full">
                <template #label>
                  <AdminFieldLabel
                    label="Tag"
                    tooltip="ป้ายหมวดหรือประเภทข่าวที่แสดงบนการ์ดบทความ เช่น HEALTH, PRODUCT หรือ LIFESTYLE"
                  />
                </template>
                <UInput v-model="form.tag" placeholder="ex. HEALTH" class="w-full" />
              </UFormField>
            </div>
            <UFormField label="วันที่ (แสดงผล)" name="date" class="w-full">
              <template #label>
                <AdminFieldLabel
                  label="วันที่ (แสดงผล)"
                  tooltip="ข้อความวันที่ที่ลูกค้าจะเห็นบนบทความ เช่น 20 May 2026 หรือ 20 พฤษภาคม 2569"
                />
              </template>
              <UInput v-model="form.date" placeholder="ex. 20 May 2026" class="w-full" />
            </UFormField>
            <UFormField label="หัวข้อบทความ" name="title" class="w-full">
              <template #label>
                <AdminFieldLabel
                  label="หัวข้อบทความ"
                  tooltip="ชื่อหลักของข่าวหรือบทความ ควรสั้น ชัดเจน และสื่อสารเนื้อหาสำคัญให้ลูกค้าเข้าใจทันที"
                />
              </template>
              <UInput v-model="form.title" placeholder="พิมพ์หัวข้อบทความ" class="w-full" />
            </UFormField>
          </div>

          <!-- เนื้อหา -->
          <div class="space-y-4">
            <div>
              <h4 class="font-semibold text-base text-default">เนื้อหา</h4>
              <p class="text-sm text-muted mt-1">คำอธิบายสั้นและเนื้อหาฉบับเต็มของบทความ</p>
            </div>
            <UFormField label="คำอธิบายสั้นๆ (Desc)" name="desc" class="w-full">
              <template #label>
                <AdminFieldLabel
                  label="คำอธิบายสั้น ๆ (Desc)"
                  tooltip="ข้อความสรุปประมาณ 1-2 ประโยค ใช้แสดงบนการ์ดข่าวและช่วยให้ลูกค้าตัดสินใจกดอ่าน"
                />
              </template>
              <UTextarea v-model="form.desc" :rows="3" placeholder="พิมพ์คำอธิบาย" class="w-full" />
            </UFormField>
            <UFormField label="เนื้อหา" name="content" class="w-full">
              <template #label>
                <AdminFieldLabel
                  label="เนื้อหา"
                  tooltip="เนื้อหาฉบับเต็มของบทความ รองรับหัวข้อ ตัวหนา รายการ ลิงก์ และการจัดย่อหน้า"
                />
              </template>
              <RichTextEditor v-model="form.content" placeholder="พิมพ์เนื้อหาบทความที่นี่..." class="w-full" />
            </UFormField>
          </div>

        </form>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton label="ยกเลิก" color="neutral" variant="ghost" @click="isModalOpen = false" />
          <UButton label="บันทึก" color="primary" @click="handleSave" :loading="isSaving" />
        </div>
      </template>
    </UModal>
  </div>
</template>
