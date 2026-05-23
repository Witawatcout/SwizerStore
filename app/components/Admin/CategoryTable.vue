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
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-xl font-bold">จัดการหมวดหมู่</h2>
        <p class="text-sm text-muted mt-1">เพิ่ม แก้ไข และลบหมวดหมู่สินค้า</p>
      </div>
      <UButton icon="i-lucide-plus" label="เพิ่มหมวดหมู่" color="primary" @click="openNew" />
    </div>

    <!-- Table -->
    <UTable :data="data" :columns="columns" :loading="loading">
      <template #parent_id-cell="{ row }">
        <UBadge v-if="row.original.parent_id" :label="getParentName(row.original.parent_id)" variant="subtle" color="neutral" size="sm" />
        <UBadge v-else label="Main Category" variant="subtle" color="primary" size="sm" />
      </template>
      <template #actions-cell="{ row }">
        <div class="flex gap-1 justify-end">
          <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" size="xs" @click="openEdit(row.original)" />
          <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="handleDelete(row.original.id)" />
        </div>
      </template>
    </UTable>

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
