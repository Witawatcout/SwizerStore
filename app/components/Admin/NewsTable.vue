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
  setMainImageFile(file)
  input.value = ''
}

function setMainImageFile(file: File) {
  pendingMainImage.value = file
  pendingMainImagePreview.value = URL.createObjectURL(file)
  form.image = ''
}

function handleMainImageDrop(event: DragEvent) {
  isMainDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
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
  <div>
    <!-- Table Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold font-headline">จัดการข่าว / บทความ</h2>
      <UButton icon="i-lucide-plus" label="เพิ่มบทความ" color="primary" @click="openNew" />
    </div>

    <!-- Data Table -->
    <UTable :data="data" :columns="columns" :loading="loading" class="bg-white rounded-xl shadow-sm border border-default">
      <template #image-cell="{ row }">
        <div class="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center">
          <img v-if="row.original.image" :src="row.original.image" class="w-full h-full object-cover" />
          <UIcon v-else name="i-lucide-image" class="text-neutral-400 text-2xl" />
        </div>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex items-center gap-2 justify-end">
          <UButton icon="i-lucide-edit" color="neutral" variant="ghost" size="sm" @click="openEdit(row.original)" />
          <UButton icon="i-lucide-trash" color="error" variant="ghost" size="sm" @click="handleDelete(row.original.id)" />
        </div>
      </template>
    </UTable>

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
              <h4 class="font-semibold text-base text-default">รูปภาพปก</h4>
              <p class="text-sm text-muted mt-1">รูปที่จะแสดงเป็นภาพปกของบทความ แนะนำสัดส่วน 16:9</p>
            </div>
            <div
              class="border-2 border-dashed rounded-2xl transition-colors duration-200 overflow-hidden relative aspect-video"
              :class="isMainDragOver ? 'border-primary bg-primary/10' : 'border-default hover:border-primary hover:bg-primary/5'"
              @dragover.prevent="isMainDragOver = true"
              @dragleave.prevent="isMainDragOver = false"
              @drop.prevent="handleMainImageDrop"
            >
              <input type="file" ref="mainImageInput" accept="image/*" class="hidden" @change="handleMainImageSelect" />
              
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
                    <p class="text-xs text-muted mt-1">รองรับ JPG, PNG, WebP ขนาดไม่เกิน 5MB</p>
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
                <UInput v-model="form.id" placeholder="ex. healthy-tips" :disabled="isEditing" class="w-full" />
              </UFormField>
              <UFormField label="Tag" name="tag" class="w-full">
                <UInput v-model="form.tag" placeholder="ex. HEALTH" class="w-full" />
              </UFormField>
            </div>
            <UFormField label="วันที่ (แสดงผล)" name="date" class="w-full">
              <UInput v-model="form.date" placeholder="ex. 20 May 2026" class="w-full" />
            </UFormField>
            <UFormField label="หัวข้อบทความ" name="title" class="w-full">
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
              <UTextarea v-model="form.desc" :rows="3" placeholder="พิมพ์คำอธิบาย" class="w-full" />
            </UFormField>
            <UFormField label="เนื้อหา" name="content" class="w-full">
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