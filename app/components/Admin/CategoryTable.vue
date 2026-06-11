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
  id: '', name: '', slug: '', parentId: null as string | null, is_active: true
})

const totalCategories = computed(() => (props.data || []).length)
const activeCategories = computed(() => (props.data || []).filter((category: any) => Number(category.is_active ?? 1) === 1).length)
const inactiveCategories = computed(() => Math.max(0, totalCategories.value - activeCategories.value))
const mainCategories = computed(() => (props.data || []).filter((category: any) => !category.parent_id).length)
const childCategories = computed(() => Math.max(0, totalCategories.value - mainCategories.value))
const visibleParentOptions = computed(() =>
  (props.data || [])
    .filter((category: any) => category.id !== form.id)
    .map((category: any) => ({
      label: category.name,
      value: category.id,
      disabled: Number(category.is_active ?? 1) !== 1
    }))
)

const columns: TableColumn<any>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'ชื่อหมวดหมู่' },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'parent_id', header: 'หมวดหมู่หลัก' },
  { accessorKey: 'is_active', header: 'สถานะ' },
  { id: 'actions', header: '' }
]

function openNew() {
  isEditing.value = false
  Object.assign(form, { id: '', name: '', slug: '', parentId: null, is_active: true })
  isModalOpen.value = true
}

function openEdit(category: any) {
  isEditing.value = true
  Object.assign(form, {
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentId: category.parent_id || null,
    is_active: Number(category.is_active ?? 1) === 1
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
    await $authFetch(url, { method, body: { ...form, is_active: form.is_active } })
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
  const category = props.data?.find((item: any) => item.id === id)
  const categoryName = category?.name || id

  if (!confirm(`คุณต้องการลบหมวดหมู่ "${categoryName}" ใช่หรือไม่?`)) return
  try {
    await $authFetch(`/api/categories/${id}`, { method: 'DELETE' })
    toast.add({ title: 'ลบหมวดหมู่เรียบร้อย', color: 'success', icon: 'i-lucide-check-circle' })
    emit('delete', id)
  } catch (err: any) {
    const statusCode = err?.data?.statusCode || err?.statusCode
    const message = err?.data?.statusMessage || err?.message || 'ลบหมวดหมู่ไม่สำเร็จ'

    toast.add({
      title: statusCode === 409 ? 'ยังลบหมวดหมู่นี้ไม่ได้' : 'ลบหมวดหมู่ไม่สำเร็จ',
      description: message,
      color: 'error',
      icon: statusCode === 409 ? 'i-lucide-circle-alert' : 'i-lucide-alert-circle',
    })
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
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-lg border border-default bg-default p-4 shadow-sm">
        <p class="text-sm font-medium text-muted">หมวดหมู่ทั้งหมด</p>
        <p class="mt-2 text-3xl font-black text-default">{{ totalCategories }}</p>
      </div>
      <div class="rounded-lg border border-success/30 bg-success/10 p-4 shadow-sm">
        <p class="text-sm font-medium text-success">เปิดใช้งาน</p>
        <p class="mt-2 text-3xl font-black text-default">{{ activeCategories }}</p>
      </div>
      <div class="rounded-lg border border-warning/30 bg-warning/10 p-4 shadow-sm">
        <p class="text-sm font-medium text-warning">ปิดใช้งาน</p>
        <p class="mt-2 text-3xl font-black text-default">{{ inactiveCategories }}</p>
      </div>
      <div class="rounded-lg border border-primary/30 bg-primary/10 p-4 shadow-sm">
        <p class="text-sm font-medium text-primary">หมวดหมู่หลัก</p>
        <p class="mt-2 text-3xl font-black text-default">{{ mainCategories }}</p>
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
        <template #is_active-cell="{ row }">
          <UBadge
            :label="Number(row.original.is_active ?? 1) === 1 ? 'เปิดใช้งาน' : 'ปิดใช้งาน'"
            :color="Number(row.original.is_active ?? 1) === 1 ? 'success' : 'neutral'"
            variant="subtle"
            size="sm"
          />
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
        <p class="text-sm text-muted">เปิดใช้งาน {{ activeCategories }} / ปิดใช้งาน {{ inactiveCategories }} / หมวดหมู่ย่อย {{ childCategories }}</p>
      </div>
    </div>

    <!-- Modal -->
    <UModal
      v-model:open="isModalOpen"
      :title="isEditing ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'"
      :description="isEditing ? 'ปรับข้อมูลหมวดหมู่และสถานะการแสดงผลบนหน้าร้าน' : 'สร้างหมวดหมู่ใหม่เพื่อจัดกลุ่มสินค้าในร้าน'"
      :ui="{ content: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-2xl max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)] rounded-[calc(var(--ui-radius)*2)] shadow-lg ring ring-(--ui-border)' }"
    >
      <template #body>
        <form id="category-form" @submit.prevent="handleSave" class="max-h-[68vh] space-y-6 overflow-y-auto pr-1" autocomplete="off">
          <div class="space-y-4">
            <div>
              <h4 class="text-base font-semibold text-default">ข้อมูลหมวดหมู่</h4>
              <p class="mt-1 text-sm text-muted">กำหนดรหัส ชื่อ และ URL slug สำหรับใช้จัดกลุ่มสินค้า</p>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <UFormField label="Category ID" required class="w-full">
                <template #label>
                  <AdminFieldLabel
                    label="Category ID"
                    tooltip="รหัสภายในระบบสำหรับอ้างอิงหมวดหมู่ ควรใช้ภาษาอังกฤษตัวเล็ก ตัวเลข หรือขีดกลาง และไม่ควรเปลี่ยนหลังสร้างแล้ว"
                  />
                </template>
                <UInput
                  v-model="form.id"
                  :disabled="isEditing"
                  placeholder="e.g. fast-food"
                  icon="i-lucide-hash"
                  autocomplete="off"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Slug" required class="w-full">
                <template #label>
                  <AdminFieldLabel
                    label="Slug"
                    tooltip="ข้อความที่ใช้เป็นส่วนหนึ่งของ URL เช่น fast-food ควรสั้น อ่านง่าย และไม่เว้นวรรค"
                  />
                </template>
                <UInput
                  v-model="form.slug"
                  placeholder="e.g. fast-food"
                  icon="i-lucide-link"
                  autocomplete="off"
                  class="w-full"
                />
              </UFormField>
            </div>

            <UFormField label="ชื่อหมวดหมู่" required class="w-full">
              <template #label>
                <AdminFieldLabel
                  label="ชื่อหมวดหมู่"
                  tooltip="ชื่อที่ลูกค้าจะเห็นในหน้าสินค้าและตัวกรองหมวดหมู่ เช่น เครื่องดื่ม หรือ โปรตีน"
                />
              </template>
              <UInput
                v-model="form.name"
                placeholder="เช่น Fast Food"
                icon="i-lucide-folder"
                autocomplete="off"
                class="w-full"
              />
            </UFormField>
          </div>

          <USeparator />

          <div class="space-y-4">
            <div>
              <h4 class="text-base font-semibold text-default">โครงสร้างหมวดหมู่</h4>
              <p class="mt-1 text-sm text-muted">เลือกหมวดหมู่หลัก หากต้องการให้หมวดหมู่นี้เป็นหมวดหมู่ย่อย</p>
            </div>

            <UFormField label="หมวดหมู่หลัก" class="w-full">
              <template #label>
                <AdminFieldLabel
                  label="หมวดหมู่หลัก"
                  tooltip="เลือกเมื่อต้องการให้หมวดนี้เป็นหมวดย่อย หากเป็นหมวดหลักให้เลือก ไม่มี"
                />
              </template>
              <USelect
                v-model="form.parentId"
                :items="[
                  { label: 'ไม่มี (เป็นหมวดหมู่หลัก)', value: null },
                  ...visibleParentOptions
                ]"
                placeholder="เลือกหมวดหมู่หลัก"
                icon="i-lucide-folder-tree"
                class="w-full"
              />
            </UFormField>
          </div>

          <USeparator />

          <div class="space-y-4">
            <div>
              <h4 class="text-base font-semibold text-default">
                <AdminFieldLabel
                  label="สถานะการแสดงผล"
                  tooltip="เปิดเพื่อให้หมวดหมู่และสินค้าในหมวดแสดงแก่ลูกค้า ปิดเพื่อซ่อนจากหน้าร้านชั่วคราว"
                />
              </h4>
              <p class="mt-1 text-sm text-muted">ควบคุมว่าหมวดหมู่นี้จะปรากฏบนหน้าสินค้าฝั่งลูกค้าหรือไม่</p>
            </div>

            <button
              type="button"
              class="flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors"
              :class="form.is_active ? 'border-success/40 bg-success/10' : 'border-warning/40 bg-warning/10'"
              @click="form.is_active = !form.is_active"
            >
              <div
                class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full"
                :class="form.is_active ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'"
              >
                <UIcon :name="form.is_active ? 'i-lucide-eye' : 'i-lucide-eye-off'" class="size-5" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-3">
                  <p class="font-semibold text-default">{{ form.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</p>
                  <USwitch v-model="form.is_active" @click.stop />
                </div>
                <p class="mt-1 text-sm text-muted">
                  {{ form.is_active
                    ? 'หมวดหมู่นี้จะแสดงในหน้าสินค้าฝั่งลูกค้า'
                    : 'หมวดหมู่นี้จะถูกซ่อนจากหน้าสินค้าฝั่งลูกค้า รวมถึงสินค้าที่อยู่ภายใต้หมวดหมู่นี้'
                  }}
                </p>
              </div>
            </button>
          </div>
        </form>
      </template>
      <template #footer="{ close }">
        <div class="flex w-full items-center justify-between">
          <UButton label="ยกเลิก" color="neutral" variant="ghost" @click="close" />
          <UButton type="submit" form="category-form" :label="isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'" color="primary" icon="i-lucide-check" :loading="isSaving" />
        </div>
      </template>
    </UModal>
  </div>
</template>
