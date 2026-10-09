<script setup lang="ts">
definePageMeta({ layout: 'admin' })

useHead({ title: 'Where to Buy | Admin' })

type Retailer = {
  id?: number
  name: string
  image: string
  link: string | null
  sort_order: number
  is_active: number | boolean
}

const toast = useToast()
const { data, status, refresh } = useAuthFetch<Retailer[]>('/api/retailers?includeInactive=1')
const loading = computed(() => status.value === 'pending' || status.value === 'idle')

const isModalOpen = ref(false)
const isSaving = ref(false)
const isUploading = ref(false)
const form = reactive<Retailer>({ name: '', image: '', link: '', sort_order: 0, is_active: true })

function openForm(retailer?: Retailer) {
  Object.assign(form, retailer
    ? { ...retailer, link: retailer.link || '', is_active: Boolean(retailer.is_active) }
    : { id: undefined, name: '', image: '', link: '', sort_order: (data.value?.length || 0) + 1, is_active: true })
  isModalOpen.value = true
}

function showError(title: string, error: any) {
  toast.add({ title, description: error?.data?.statusMessage || error?.message, color: 'error', icon: 'i-lucide-circle-alert' })
}

const logoInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)

function onLogoSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) uploadLogo(file)
}

function onLogoDrop(event: DragEvent) {
  isDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) uploadLogo(file)
}

async function uploadLogo(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
    showError('ไฟล์ไม่ถูกต้อง', { message: 'รองรับ JPG, PNG หรือ WebP ขนาดไม่เกิน 5MB' })
    return
  }

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await $authFetch<{ url: string }>('/api/upload', { method: 'POST', body: formData })
    form.image = res.url
  } catch (error: any) {
    showError('อัปโหลดโลโก้ไม่สำเร็จ', error)
  } finally {
    isUploading.value = false
  }
}

async function save() {
  isSaving.value = true
  try {
    await $authFetch(form.id ? `/api/retailers/${form.id}` : '/api/retailers', {
      method: form.id ? 'PUT' : 'POST',
      body: form,
    })
    isModalOpen.value = false
    toast.add({ title: 'บันทึกร้านค้าแล้ว', color: 'success', icon: 'i-lucide-check-circle' })
    await refresh()
  } catch (error: any) {
    showError('บันทึกไม่สำเร็จ', error)
  } finally {
    isSaving.value = false
  }
}

async function remove(retailer: Retailer) {
  if (!confirm(`ลบร้าน "${retailer.name}" ใช่ไหม?`)) return
  try {
    await $authFetch(`/api/retailers/${retailer.id}`, { method: 'DELETE' })
    await refresh()
  } catch (error: any) {
    showError('ลบไม่สำเร็จ', error)
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Where to Buy">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" :loading="loading" @click="refresh()" />
          <UButton icon="i-lucide-plus" label="เพิ่มร้านค้า" @click="openForm()" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="mx-auto flex w-full max-w-4xl flex-col gap-3">
        <p class="text-sm text-muted">ร้านค้าที่เปิดใช้งานจะแสดงในส่วน Where to Buy ของหน้าเกี่ยวกับเรา เรียงตามลำดับจากน้อยไปมาก</p>

        <UCard v-for="retailer in data || []" :key="retailer.id" :ui="{ body: 'p-4 sm:p-4' }">
          <div class="flex items-center gap-4">
            <div class="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-default bg-white p-2">
              <img :src="retailer.image" :alt="retailer.name" class="max-h-full max-w-full object-contain" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <p class="font-semibold text-default">{{ retailer.name }}</p>
                <UBadge :label="retailer.is_active ? 'แสดง' : 'ซ่อน'" :color="retailer.is_active ? 'success' : 'neutral'" variant="subtle" size="sm" />
              </div>
              <a v-if="retailer.link" :href="retailer.link" target="_blank" rel="noopener" class="block truncate text-sm text-muted hover:underline">{{ retailer.link }}</a>
              <p class="text-xs text-dimmed">ลำดับ {{ retailer.sort_order }}</p>
            </div>
            <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" aria-label="แก้ไข" @click="openForm(retailer)" />
            <UButton icon="i-lucide-trash-2" color="error" variant="ghost" aria-label="ลบ" @click="remove(retailer)" />
          </div>
        </UCard>

        <p v-if="!loading && !data?.length" class="py-10 text-center text-muted">ยังไม่มีร้านค้า</p>
      </div>

      <UModal v-model:open="isModalOpen" :title="form.id ? 'แก้ไขร้านค้า' : 'เพิ่มร้านค้า'">
        <template #body>
          <form id="retailer-form" class="space-y-5" @submit.prevent="save">
            <UFormField label="โลโก้" required>
              <div
                class="relative flex h-40 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors"
                :class="isDragOver ? 'border-primary bg-primary/10' : 'border-default hover:border-primary hover:bg-primary/5'"
                @dragover.prevent="isDragOver = true"
                @dragleave.prevent="isDragOver = false"
                @drop.prevent="onLogoDrop"
              >
                <input ref="logoInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onLogoSelect" />

                <template v-if="form.image">
                  <div class="flex h-full w-full items-center justify-center bg-white p-6">
                    <img :src="form.image" :alt="form.name" class="max-h-full max-w-full object-contain" />
                  </div>
                  <div class="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all hover:bg-black/40 hover:opacity-100">
                    <UButton icon="i-lucide-refresh-cw" label="เปลี่ยนรูป" color="neutral" size="sm" @click="logoInput?.click()" />
                    <UButton icon="i-lucide-trash-2" label="ลบ" color="error" size="sm" @click="form.image = ''" />
                  </div>
                </template>
                <button v-else type="button" class="flex h-full w-full cursor-pointer items-center justify-center" @click="logoInput?.click()">
                  <div class="text-center">
                    <div class="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
                      <UIcon name="i-lucide-upload-cloud" class="size-6 text-primary" />
                    </div>
                    <p class="text-sm font-medium text-default">คลิกเพื่อเลือกรูป หรือลากวาง</p>
                    <p class="mt-1 text-xs text-muted">JPG, PNG หรือ WebP · ไม่เกิน 5MB</p>
                  </div>
                </button>

                <div v-if="isUploading" class="absolute inset-0 flex items-center justify-center bg-white/80">
                  <UIcon name="i-lucide-loader-circle" class="size-7 animate-spin text-primary" />
                </div>
              </div>
            </UFormField>

            <UFormField label="ชื่อร้าน" required>
              <UInput v-model="form.name" icon="i-lucide-store" placeholder="เช่น Shopee" class="w-full" />
            </UFormField>

            <UFormField label="ลิงก์ร้าน" description="ลูกค้ากดโลโก้แล้วจะเปิดลิงก์นี้ ปล่อยว่างได้">
              <UInput v-model="form.link" type="url" icon="i-lucide-link" placeholder="https://..." class="w-full" />
            </UFormField>

            <div class="grid grid-cols-1 gap-4 rounded-xl border border-default bg-elevated/50 p-4 sm:grid-cols-2">
              <UFormField label="ลำดับการแสดง" description="เลขน้อยแสดงก่อน">
                <UInput v-model.number="form.sort_order" type="number" min="0" class="w-full" />
              </UFormField>
              <UFormField label="แสดงบนหน้าเว็บ" :description="form.is_active ? 'ลูกค้าเห็นร้านนี้' : 'ซ่อนจากลูกค้า'">
                <USwitch v-model="form.is_active" class="mt-1.5" />
              </UFormField>
            </div>
          </form>
        </template>
        <template #footer>
          <div class="flex w-full justify-end gap-2">
            <UButton label="ยกเลิก" color="neutral" variant="soft" @click="isModalOpen = false" />
            <UButton type="submit" form="retailer-form" label="บันทึก" icon="i-lucide-save" :loading="isSaving" :disabled="isUploading" />
          </div>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
