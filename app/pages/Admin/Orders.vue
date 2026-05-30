<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Orders | Admin' })

const toast = useToast()
const selectedStatus = ref('all')
const selectedPaymentMethod = ref('all')
const selectedDate = ref('')
const selectedOrder = ref<any>(null)
const isDetailOpen = ref(false)

const queryParams = computed(() => {
  const params = new URLSearchParams()
  if (selectedStatus.value !== 'all') params.set('status', selectedStatus.value)
  if (selectedPaymentMethod.value !== 'all') params.set('payment_method', selectedPaymentMethod.value)
  if (selectedDate.value) params.set('date', selectedDate.value)
  const query = params.toString()
  return `/api/admin/orders${query ? `?${query}` : ''}`
})

const { data: orders, status, refresh } = useAuthFetch<any[]>(queryParams)
const loading = computed(() => status.value === 'pending' || status.value === 'idle')

const statusItems = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

const paymentItems = [
  { label: 'ทุกช่องทาง', value: 'all' },
  { label: 'Credit card', value: 'credit_card' },
  { label: 'PromptPay', value: 'promptpay' },
]

const columns: TableColumn<any>[] = [
  { accessorKey: 'id', header: 'Order' },
  { accessorKey: 'customer_name', header: 'Customer' },
  { accessorKey: 'payment_method', header: 'Payment' },
  { accessorKey: 'payment_status', header: 'Payment status' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'total', header: 'Total' },
  { accessorKey: 'created_at', header: 'Date' },
  { id: 'actions', header: '' },
]

const formatPrice = (price: number) =>
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(price || 0))

async function openDetail(id: string) {
  selectedOrder.value = await $authFetch(`/api/admin/orders/${id}`)
  isDetailOpen.value = true
}

async function updateStatus(id: string, status: string) {
  try {
    await $authFetch(`/api/admin/orders/${id}/status`, { method: 'PUT', body: { status } })
    toast.add({ title: 'อัปเดตสถานะแล้ว', color: 'success', icon: 'i-lucide-check' })
    await refresh()
    if (selectedOrder.value?.id === id) selectedOrder.value.status = status
  } catch (err: any) {
    toast.add({ title: 'อัปเดตไม่สำเร็จ', description: err.data?.statusMessage || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
  }
}

async function verifyPayment(id: string) {
  try {
    const res = await $authFetch<any>(`/api/admin/orders/${id}/verify-payment`, { method: 'POST' })
    toast.add({
      title: res.paymentStatus === 'success' ? 'ยืนยันการชำระเงินแล้ว' : 'ตรวจสอบกับ Omise แล้ว',
      description: `Charge status: ${res.chargeStatus || '-'}`,
      color: res.paymentStatus === 'success' ? 'success' : 'neutral',
      icon: 'i-lucide-shield-check'
    })
    await refresh()
    if (selectedOrder.value?.id === id) {
      selectedOrder.value = await $authFetch(`/api/admin/orders/${id}`)
    }
  } catch (err: any) {
    toast.add({ title: 'ตรวจสอบ payment ไม่สำเร็จ', description: err.data?.statusMessage || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Orders">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6 space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <USelect v-model="selectedStatus" :items="statusItems" icon="i-lucide-list-filter" />
          <USelect v-model="selectedPaymentMethod" :items="paymentItems" icon="i-lucide-credit-card" />
          <UInput v-model="selectedDate" type="date" icon="i-lucide-calendar" />
        </div>

        <UTable :data="orders || []" :columns="columns" :loading="loading">
          <template #payment_status-cell="{ row }">
            <UBadge :label="row.original.payment_status" :color="row.original.payment_status === 'success' ? 'success' : row.original.payment_status === 'failed' ? 'error' : 'warning'" variant="subtle" />
          </template>
          <template #status-cell="{ row }">
            <USelect
              :model-value="row.original.status"
              :items="statusItems.filter(item => item.value !== 'all')"
              size="sm"
              class="w-36"
              @update:model-value="updateStatus(row.original.id, String($event))"
            />
          </template>
          <template #total-cell="{ row }">
            <span class="font-bold">{{ formatPrice(row.original.total) }}</span>
          </template>
          <template #created_at-cell="{ row }">
            <span class="text-sm text-muted">{{ new Date(row.original.created_at).toLocaleString('th-TH') }}</span>
          </template>
          <template #actions-cell="{ row }">
            <UButton icon="i-lucide-eye" size="xs" color="neutral" variant="ghost" @click="openDetail(row.original.id)" />
          </template>
        </UTable>
      </div>
    </template>
  </UDashboardPanel>

  <UModal v-model:open="isDetailOpen" title="รายละเอียดคำสั่งซื้อ" :ui="{ content: 'max-w-3xl' }">
    <template #body>
      <div v-if="selectedOrder" class="space-y-5">
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="rounded-lg bg-elevated p-4">
            <p class="text-xs text-muted">Order</p>
            <p class="font-black">{{ selectedOrder.id }}</p>
          </div>
          <div class="rounded-lg bg-elevated p-4">
            <p class="text-xs text-muted">Status</p>
            <USelect
              v-model="selectedOrder.status"
              :items="statusItems.filter(item => item.value !== 'all')"
              class="mt-2"
              @update:model-value="updateStatus(selectedOrder.id, String($event))"
            />
          </div>
        </div>

        <div v-if="selectedOrder.payment_status === 'pending' && selectedOrder.omise_charge_id" class="rounded-lg border border-warning/30 bg-warning/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p class="font-bold">Payment ยัง pending</p>
            <p class="text-sm text-muted">ตรวจสอบสถานะจริงจาก Omise ก่อน mark paid</p>
          </div>
          <UButton icon="i-lucide-shield-check" label="Verify with Omise" color="warning" variant="soft" @click="verifyPayment(selectedOrder.id)" />
        </div>

        <div class="rounded-lg border border-default p-4">
          <h3 class="font-bold mb-2">ลูกค้า</h3>
          <p>{{ selectedOrder.first_name }} {{ selectedOrder.last_name }}</p>
          <p class="text-sm text-muted">{{ selectedOrder.email }} · {{ selectedOrder.phone }}</p>
          <p class="text-sm text-muted mt-2">{{ selectedOrder.address }}</p>
          <p v-if="selectedOrder.address_line2" class="text-sm text-muted">{{ selectedOrder.address_line2 }}</p>
          <p class="text-sm text-muted">
            {{ selectedOrder.subdistrict || '' }}
            {{ selectedOrder.district }}
            {{ selectedOrder.province }}
            {{ selectedOrder.postal_code }}
          </p>
          <p v-if="selectedOrder.delivery_note" class="text-sm text-muted mt-2">หมายเหตุจัดส่ง: {{ selectedOrder.delivery_note }}</p>
        </div>

        <div class="rounded-lg border border-default divide-y divide-default">
          <div v-for="item in selectedOrder.items" :key="item.product_id" class="p-4 flex justify-between gap-3">
            <span>{{ item.product_name }} x {{ item.quantity }}</span>
            <span class="font-bold">{{ formatPrice(item.subtotal) }}</span>
          </div>
        </div>

        <div class="flex justify-between text-lg font-black">
          <span>Total</span>
          <span>{{ formatPrice(selectedOrder.total) }}</span>
        </div>
      </div>
    </template>
  </UModal>
</template>
