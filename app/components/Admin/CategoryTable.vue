<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const props = defineProps<{
  data: any[]
  loading: boolean
}>()

const emit = defineEmits<{
  save: [category: any, isEdit: boolean]
  delete: [id: string]
}>()

const toast = useToast()
const isModalOpen = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)

const form = reactive({
  id: '', name: '', slug: '', parentId: null as string | null
})

const totalCategories = computed(() => (props.data || []).length)
const mainCategories = computed(() => (props.data || []).filter((category: any) => !category.parent_id).length)
const childCategories = computed(() => Math.max(0, totalCategories.value - mainCategories.value))

const columns: TableColumn<any>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'ชื่อหมวดหมู่' },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'parent_id', header: 'หมวดหมู่หลัก' },
  { id: 'actions', header: '' }
]

function openNew() {
  isEditing.value = false
  Object.assign(form, { id: '', name: '', slug: '', parentId: null })
  isModalOpen.value = true
}

function openEdit(category: any) {
  isEditing.value = true
  Object.assign(form, {
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentId: category.parent_id || null
  })
  isModalOpen.value = true
}

async function handleSave() {
  if (!form.id || !form.name || !form.slug) {
    toast.add({ title: 'กรุณากรอกข้อมูลให้ครบ', color: 'error', icon: 'i-lucide-alert-circle' })
    return
  }
  isSaving.value = true
  try {
    const method = isEditing.value ? 'PUT' : 'POST'
    const url = isEditing.value ? `/api/categories/${form.id}` : '/api/categories'
    await $authFetch(url, { method, body: form })
    isModalOpen.value = false
    toast.add({ title: isEditing.value ? 'แก้ไขหมวดหมู่เรียบร้อย' : 'เพิ่มหมวดหมู่เรียบร้อย', color: 'success', icon: 'i-lucide-check-circle' })
    emit('save', form, isEditing.value)
  } catch (err: any) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: err.data?.statusMessage || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    isSaving.value = false
  }
}

async function handleDelete(id: string) {
  if (!confirm('คุณต้องการลบหมวดหมู่นี้ใช่หรือไม่?')) return
  try {
    await $authFetch(`/api/categories/${id}`, { method: 'DELETE' })
    toast.add({ title: 'ลบหมวดหมู่เรียบร้อย', color: 'success', icon: 'i-lucide-check-circle' })
    emit('delete', id)
  } catch (err: any) {
    toast.add({ title: 'เกิดข้อผิดพลาด', description: err.data?.statusMessage || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
  }
}

// ดึงชื่อ parent category จาก id
function getParentName(parentId: string | null) {
  if (!parentId) return '-'
  const parent = props.data?.find((c: any) => c.id === parentId)
  return parent?.name || parentId
}
</script>

<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="rounded-lg border border-default bg-default p-4 shadow-sm">
        <p class="text-sm font-medium text-muted">หมวดหมู่ทั้งหมด</p>
        <p class="mt-2 text-3xl font-black text-default">{{ totalCategories }}</p>
      </div>
      <div class="rounded-lg border border-primary/30 bg-primary/10 p-4 shadow-sm">
        <p class="text-sm font-medium text-primary">หมวดหมู่หลัก</p>
        <p class="mt-2 text-3xl font-black text-default">{{ mainCategories }}</p>
      </div>
      <div class="rounded-lg border border-info/30 bg-info/10 p-4 shadow-sm">
        <p class="text-sm font-medium text-info">หมวดหมู่ย่อย</p>
        <p class="mt-2 text-3xl font-black text-default">{{ childCategories }}</p>
      </div>
    </div>

    <div class="flex flex-col gap-3 rounded-lg border border-default bg-default p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-base font-bold">รายการหมวดหมู่</h2>
        <p class="text-sm text-muted">ดูและจัดการโครงสร้างหมวดหมู่สินค้า</p>
      </div>
      <UButton icon="i-lucide-plus" label="เพิ่มหมวดหมู่" color="primary" @click="openNew" />
    </div>

    <div class="rounded-lg border border-default bg-default">
      <UTable :data="data" :columns="columns" :loading="loading">
        <template #parent_id-cell="{ row }">
          <UBadge v-if="row.original.parent_id" :label="getParentName(row.original.parent_id)" variant="subtle" color="neutral" size="sm" />
          <UBadge v-else label="หมวดหมู่หลัก" variant="subtle" color="primary" size="sm" />
        </template>
        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-2">
            <UButton icon="i-lucide-pencil" label="แก้ไข" color="neutral" variant="soft" size="xs" @click="openEdit(row.original)" />
            <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="handleDelete(row.original.id)" />
          </div>
        </template>
        <template #empty>
          <div class="py-10 text-center">
            <UIcon name="i-lucide-folder-open" class="mx-auto mb-2 size-8 text-muted" />
            <p class="font-medium">ยังไม่มีหมวดหมู่</p>
            <p class="text-sm text-muted">เพิ่มหมวดหมู่เพื่อจัดกลุ่มสินค้าในร้าน</p>
          </div>
        </template>
      </UTable>

      <div class="flex flex-col gap-2 border-t border-default px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-muted">แสดง {{ totalCategories }} หมวดหมู่</p>
        <p class="text-sm text-muted">หมวดหมู่หลัก {{ mainCategories }} / หมวดหมู่ย่อย {{ childCategories }}</p>
      </div>
    </div>

    <!-- Modal -->
    <UModal v-model:open="isModalOpen" :title="isEditing ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'">
      <template #body>
        <form id="category-form" @submit.prevent="handleSave" class="space-y-4" autocomplete="off">
          <UFormField label="Category ID" required>
            <UInput v-model="form.id" :disabled="isEditing" placeholder="e.g. food" autocomplete="off" />
          </UFormField>

          <UFormField label="ชื่อหมวดหมู่" required>
            <UInput v-model="form.name" placeholder="e.g. อาหาร" autocomplete="off" />
          </UFormField>

          <UFormField label="Slug" required>
            <UInput v-model="form.slug" placeholder="e.g. food" autocomplete="off" />
          </UFormField>

          <UFormField label="หมวดหมู่หลัก">
            <USelect
              v-model="form.parentId"
              :items="[
                { label: 'ไม่มี (เป็นหมวดหมู่หลัก)', value: null },
                ...(data || []).filter((c: any) => c.id !== form.id).map((c: any) => ({ label: c.name, value: c.id }))
              ]"
              placeholder="เลือกหมวดหมู่หลัก"
            />
          </UFormField>
        </form>
      </template>
      <template #footer="{ close }">
        <UButton label="ยกเลิก" color="neutral" variant="outline" @click="close" />
        <UButton type="submit" form="category-form" label="บันทึก" color="primary" :loading="isSaving" />
      </template>
    </UModal>
  </div>
</template>
