<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

definePageMeta({ layout: "admin" });
useHead({ title: "คำสั่งซื้อ | Admin" });

const toast = useToast();
const route = useRoute();

const selectedStatus = ref("all");
const selectedPaymentMethod = ref("all");
const selectedCategory = ref("all");
const selectedDate = ref("");
const searchInput = ref("");
const searchQuery = ref("");
const selectedOrder = ref<any>(null);
const isDetailOpen = ref(false);
const isSendingEmail = ref(false);
const trackingNumberForm = ref("");
const page = ref(1);
const pageSize = ref(10);
let searchTimer: ReturnType<typeof setTimeout> | undefined;

const statusItems = [
  { label: "ทุกสถานะ", value: "all" },
  { label: "รอดำเนินการ", value: "pending" },
  { label: "ชำระเงินแล้ว", value: "paid" },
  { label: "กำลังเตรียมสินค้า", value: "processing" },
  { label: "จัดส่งแล้ว", value: "shipped" },
  { label: "ส่งสำเร็จแล้ว", value: "delivered" },
  { label: "ยกเลิกแล้ว", value: "cancelled" },
];

const editableStatusItems = statusItems.filter((item) => item.value !== "all");

const paymentItems = [
  { label: "ทุกช่องทาง", value: "all" },
  { label: "บัตรเครดิต/เดบิต", value: "credit_card" },
  { label: "พร้อมเพย์", value: "promptpay" },
];

const { data: categoriesData } = useAuthFetch<any[]>("/api/categories?includeInactive=1");
const categoryItems = computed(() => [
  { label: "ทุกหมวดหมู่", value: "all" },
  ...(categoriesData.value || []).map((category) => ({
    label: Number(category.is_active ?? 1) === 1 ? category.name : `${category.name} (ปิดใช้งาน)`,
    value: String(category.id),
  })),
]);

const pageSizeItems = [
  { label: "10 รายการ/หน้า", value: 10 },
  { label: "20 รายการ/หน้า", value: 20 },
  { label: "50 รายการ/หน้า", value: 50 },
];

const queryParams = computed(() => {
  const params = new URLSearchParams();
  if (selectedStatus.value !== "all") params.set("status", selectedStatus.value);
  if (selectedPaymentMethod.value !== "all") params.set("payment_method", selectedPaymentMethod.value);
  if (selectedCategory.value !== "all") params.set("category_id", selectedCategory.value);
  if (selectedDate.value) params.set("date", selectedDate.value);
  if (searchQuery.value) params.set("search", searchQuery.value);
  params.set("page", String(page.value));
  params.set("page_size", String(pageSize.value));
  const query = params.toString();
  return `/api/admin/orders${query ? `?${query}` : ""}`;
});

const { data: orders, status, refresh } = useAuthFetch<any>(queryParams);
const loading = computed(() => status.value === "pending" || status.value === "idle");
const orderList = computed(() => orders.value?.items || []);
const totalOrders = computed(() => Number(orders.value?.pagination?.total || 0));
const totalPages = computed(() => Number(orders.value?.pagination?.totalPages || 1));
const startItem = computed(() => (totalOrders.value ? (page.value - 1) * Number(pageSize.value) + 1 : 0));
const endItem = computed(() => Math.min(page.value * Number(pageSize.value), totalOrders.value));

const columns: TableColumn<any>[] = [
  { accessorKey: "id", header: "เลขคำสั่งซื้อ" },
  { accessorKey: "customer_name", header: "ลูกค้า" },
  { accessorKey: "payment_method", header: "ช่องทางชำระเงิน" },
  { accessorKey: "payment_status", header: "สถานะชำระเงิน" },
  { accessorKey: "status", header: "สถานะคำสั่งซื้อ" },
  { accessorKey: "tracking_number", header: "เลขพัสดุ" },
  { accessorKey: "total", header: "ยอดรวม" },
  { accessorKey: "created_at", header: "วันที่สั่งซื้อ" },
  { id: "actions", header: "" },
];

watch([selectedStatus, selectedPaymentMethod, selectedCategory, selectedDate, pageSize, searchQuery], () => {
  page.value = 1;
});

watch(searchInput, (value) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQuery.value = value.trim();
  }, 350);
});

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer);
});

watch(totalPages, (value) => {
  if (page.value > value) page.value = value;
});

function statusLabel(value: string) {
  return statusItems.find((item) => item.value === value)?.label || value;
}

function statusColor(value: string) {
  if (value === "delivered") return "success";
  if (value === "cancelled") return "error";
  if (value === "shipped") return "info";
  if (value === "processing") return "warning";
  if (value === "paid") return "primary";
  return "neutral";
}

function paymentMethodLabel(value: string) {
  if (value === "promptpay") return "พร้อมเพย์";
  if (value === "credit_card") return "บัตรเครดิต/เดบิต";
  return value || "-";
}

function paymentStatusLabel(value: string) {
  if (value === "success") return "ชำระเงินแล้ว";
  if (value === "failed") return "ชำระเงินไม่สำเร็จ";
  return "รอชำระเงิน";
}

function paymentStatusColor(value: string) {
  if (value === "success") return "success";
  if (value === "failed") return "error";
  return "warning";
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(Number(price || 0));

function formatDate(value: string) {
  return new Date(value).toLocaleString("th-TH");
}

function goToPage(nextPage: number) {
  page.value = Math.min(Math.max(nextPage, 1), totalPages.value);
}

function pageNumbers() {
  const pages: number[] = [];
  const first = Math.max(1, page.value - 2);
  const last = Math.min(totalPages.value, page.value + 2);
  for (let current = first; current <= last; current++) pages.push(current);
  return pages;
}

async function openDetail(id: string) {
  selectedOrder.value = await $authFetch(`/api/admin/orders/${id}`);
  trackingNumberForm.value = selectedOrder.value?.tracking_number || "";
  isDetailOpen.value = true;
}

async function updateStatus(id: string, nextStatus: string, trackingNumber?: string) {
  try {
    let nextTrackingNumber = trackingNumber;
    if (nextStatus === "shipped" && nextTrackingNumber === undefined) {
      const currentTrackingNumber = selectedOrder.value?.id === id ? selectedOrder.value?.tracking_number || "" : "";
      const prompted = window.prompt("กรอกเลขพัสดุ/เลขติดตามสำหรับคำสั่งซื้อนี้", currentTrackingNumber);
      if (prompted === null) return;
      nextTrackingNumber = prompted;
    }

    const body: { status: string; tracking_number?: string } = { status: nextStatus };
    if (nextTrackingNumber !== undefined) body.tracking_number = nextTrackingNumber;

    const res = await $authFetch<any>(`/api/admin/orders/${id}/status`, { method: "PUT", body });
    toast.add({ title: "อัปเดตสถานะแล้ว", description: statusLabel(nextStatus), color: "success", icon: "i-lucide-check" });
    await refresh();
    if (selectedOrder.value?.id === id) {
      selectedOrder.value.status = nextStatus;
      if (nextTrackingNumber !== undefined) {
        selectedOrder.value.tracking_number = res.tracking_number ?? nextTrackingNumber;
        trackingNumberForm.value = selectedOrder.value.tracking_number || "";
      }
    }
  } catch (err: any) {
    toast.add({
      title: "อัปเดตสถานะไม่สำเร็จ",
      description: err.data?.statusMessage || err.message,
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
}
async function verifyPayment(id: string) {
  try {
    const res = await $authFetch<any>(`/api/admin/orders/${id}/verify-payment`, { method: "POST" });
    toast.add({
      title: res.paymentStatus === "success" ? "ยืนยันการชำระเงินแล้ว" : "ตรวจสอบกับ Omise แล้ว",
      description: `สถานะจาก Omise: ${res.chargeStatus || "-"}`,
      color: res.paymentStatus === "success" ? "success" : "neutral",
      icon: "i-lucide-shield-check",
    });
    await refresh();
    if (selectedOrder.value?.id === id) {
      selectedOrder.value = await $authFetch(`/api/admin/orders/${id}`);
      trackingNumberForm.value = selectedOrder.value?.tracking_number || "";
    }
  } catch (err: any) {
    toast.add({
      title: "ตรวจสอบ payment ไม่สำเร็จ",
      description: err.data?.statusMessage || err.message,
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
}

async function resendOrderEmail(id: string) {
  isSendingEmail.value = true;
  try {
    const res = await $authFetch<any>(`/api/admin/orders/${id}/send-email`, { method: "POST" });
    toast.add({
      title: res.sent ? "ส่งอีเมลแล้ว" : "ยังไม่ได้ส่งอีเมล",
      description: res.reason || "ส่งอีเมลอัปเดตสถานะให้ลูกค้าแล้ว",
      color: res.sent ? "success" : "warning",
      icon: res.sent ? "i-lucide-mail-check" : "i-lucide-mail-warning",
    });
    selectedOrder.value = await $authFetch(`/api/admin/orders/${id}`);
    trackingNumberForm.value = selectedOrder.value?.tracking_number || "";
  } catch (err: any) {
    toast.add({
      title: "ส่งอีเมลไม่สำเร็จ",
      description: err.data?.statusMessage || err.message,
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    isSendingEmail.value = false;
  }
}

const openedQueryOrder = ref("");

watch(
  () => route.query.id,
  (id) => {
    if (typeof id === "string" && id && id !== openedQueryOrder.value) {
      openedQueryOrder.value = id;
      openDetail(id);
    }
  },
  { immediate: true }
);
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="คำสั่งซื้อ">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-refresh-cw" label="รีเฟรช" color="neutral" variant="soft" :loading="loading" @click="refresh()" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6 space-y-5">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(18rem,1.4fr)_1fr_1fr_1fr_1fr_auto]">
          <UInput
            v-model="searchInput"
            icon="i-lucide-search"
            placeholder="ค้นหา Order, ลูกค้า, สินค้า, หมวดหมู่ หรือเลขพัสดุ"
            class="w-full"
          >
            <template v-if="searchInput" #trailing>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="xs"
                aria-label="ล้างคำค้นหา"
                @click="searchInput = ''"
              />
            </template>
          </UInput>
          <USelect v-model="selectedStatus" :items="statusItems" icon="i-lucide-list-filter" />
          <USelect v-model="selectedPaymentMethod" :items="paymentItems" icon="i-lucide-credit-card" />
          <USelect v-model="selectedCategory" :items="categoryItems" icon="i-lucide-tags" />
          <UInput v-model="selectedDate" type="date" icon="i-lucide-calendar" />
          <USelect v-model="pageSize" :items="pageSizeItems" icon="i-lucide-rows-3" class="xl:w-44" />
        </div>

        <div class="rounded-lg border border-default bg-default">
          <UTable :data="orderList" :columns="columns" :loading="loading">
            <template #payment_method-cell="{ row }">
              <span class="text-sm">{{ paymentMethodLabel(row.original.payment_method) }}</span>
            </template>

            <template #payment_status-cell="{ row }">
              <UBadge
                :label="paymentStatusLabel(row.original.payment_status)"
                :color="paymentStatusColor(row.original.payment_status)"
                variant="subtle"
              />
            </template>

            <template #status-cell="{ row }">
              <div class="flex items-center gap-2">
                <UBadge :label="statusLabel(row.original.status)" :color="statusColor(row.original.status)" variant="subtle" />
                <USelect
                  :model-value="row.original.status"
                  :items="editableStatusItems"
                  size="sm"
                  class="w-44"
                  @update:model-value="updateStatus(row.original.id, String($event))"
                />
              </div>
            </template>

            <template #tracking_number-cell="{ row }">
              <span v-if="row.original.tracking_number" class="text-sm font-semibold text-default">{{ row.original.tracking_number }}</span>
              <span v-else class="text-sm text-muted">-</span>
            </template>

            <template #total-cell="{ row }">
              <span class="font-bold">{{ formatPrice(row.original.total) }}</span>
            </template>

            <template #created_at-cell="{ row }">
              <span class="text-sm text-muted">{{ formatDate(row.original.created_at) }}</span>
            </template>

            <template #actions-cell="{ row }">
              <UButton icon="i-lucide-eye" label="รายละเอียด" size="xs" color="neutral" variant="soft" @click="openDetail(row.original.id)" />
            </template>

            <template #empty>
              <div class="py-10 text-center">
                <UIcon name="i-lucide-inbox" class="mx-auto mb-2 size-8 text-muted" />
                <p class="font-medium">ไม่พบคำสั่งซื้อ</p>
                <p class="text-sm text-muted">ลองเปลี่ยนคำค้นหา ตัวกรอง หรือวันที่</p>
              </div>
            </template>
          </UTable>

          <div class="flex flex-col gap-3 border-t border-default px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm text-muted">
              แสดง {{ startItem }}-{{ endItem }} จาก {{ totalOrders }} คำสั่งซื้อ
            </p>
            <div class="flex flex-wrap items-center gap-2">
              <UButton icon="i-lucide-chevron-left" label="ก่อนหน้า" color="neutral" variant="soft" size="sm" :disabled="page <= 1" @click="goToPage(page - 1)" />
              <UButton
                v-for="pageNumber in pageNumbers()"
                :key="pageNumber"
                :label="String(pageNumber)"
                :color="pageNumber === page ? 'primary' : 'neutral'"
                :variant="pageNumber === page ? 'solid' : 'soft'"
                size="sm"
                @click="goToPage(pageNumber)"
              />
              <UButton icon="i-lucide-chevron-right" label="ถัดไป" color="neutral" variant="soft" size="sm" :disabled="page >= totalPages" @click="goToPage(page + 1)" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <UModal v-model:open="isDetailOpen" title="รายละเอียดคำสั่งซื้อ" :ui="{ content: 'max-w-3xl' }">
    <template #body>
      <div v-if="selectedOrder" class="space-y-5">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-lg bg-elevated p-4">
            <p class="text-xs text-muted">เลขคำสั่งซื้อ</p>
            <p class="font-black">{{ selectedOrder.id }}</p>
            <p class="mt-2 text-sm text-muted">{{ formatDate(selectedOrder.created_at) }}</p>
          </div>

          <div class="rounded-lg bg-elevated p-4">
            <p class="text-xs text-muted">สถานะคำสั่งซื้อ</p>
            <USelect
              v-model="selectedOrder.status"
              :items="editableStatusItems"
              class="mt-2"
              @update:model-value="updateStatus(selectedOrder.id, String($event), trackingNumberForm)"
            />
            <UFormField label="เลขพัสดุ / เลขติดตาม" class="mt-4">
              <UInput
                v-model="trackingNumberForm"
                icon="i-lucide-truck"
                placeholder="เช่น EMS123456789TH"
              />
            </UFormField>
            <UButton
              class="mt-3"
              icon="i-lucide-save"
              label="บันทึกเลขพัสดุ"
              color="neutral"
              variant="soft"
              block
              @click="updateStatus(selectedOrder.id, selectedOrder.status, trackingNumberForm)"
            />
          </div>
        </div>

        <div v-if="selectedOrder.payment_status === 'success'" class="flex flex-col justify-between gap-3 rounded-lg border border-success/30 bg-success/10 p-4 sm:flex-row sm:items-center">
          <div>
            <p class="font-bold">ชำระเงินสำเร็จแล้ว</p>
            <p class="text-sm text-muted">กดส่งอีเมลเพื่อแจ้งสถานะล่าสุดให้ลูกค้าอีกครั้ง</p>
          </div>
          <UButton
            icon="i-lucide-mail-check"
            label="ส่งอีเมลให้ลูกค้า"
            color="success"
            variant="soft"
            :loading="isSendingEmail"
            @click="resendOrderEmail(selectedOrder.id)"
          />
        </div>

        <div v-if="selectedOrder.payment_status === 'pending' && selectedOrder.omise_charge_id" class="flex flex-col justify-between gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 sm:flex-row sm:items-center">
          <div>
            <p class="font-bold">ยังรอชำระเงิน</p>
            <p class="text-sm text-muted">ตรวจสอบสถานะจริงจาก Omise ก่อนยืนยันการชำระเงิน</p>
          </div>
          <UButton icon="i-lucide-shield-check" label="Verify with Omise" color="warning" variant="soft" @click="verifyPayment(selectedOrder.id)" />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-lg border border-default p-4">
            <h3 class="mb-2 font-bold">ลูกค้า</h3>
            <p>{{ selectedOrder.first_name }} {{ selectedOrder.last_name }}</p>
            <p class="text-sm text-muted">{{ selectedOrder.email }}</p>
            <p class="text-sm text-muted">{{ selectedOrder.phone }}</p>
          </div>

          <div class="rounded-lg border border-default p-4">
            <h3 class="mb-2 font-bold">สถานะ</h3>
            <div class="flex flex-wrap gap-2">
              <UBadge :label="paymentStatusLabel(selectedOrder.payment_status)" :color="paymentStatusColor(selectedOrder.payment_status)" variant="subtle" />
              <UBadge :label="statusLabel(selectedOrder.status)" :color="statusColor(selectedOrder.status)" variant="subtle" />
              <UBadge :label="paymentMethodLabel(selectedOrder.payment_method)" color="neutral" variant="subtle" />
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-default p-4">
          <h3 class="mb-2 font-bold">ที่อยู่จัดส่ง</h3>
          <p class="text-sm text-muted">{{ selectedOrder.address }}</p>
          <p v-if="selectedOrder.address_line2" class="text-sm text-muted">{{ selectedOrder.address_line2 }}</p>
          <p class="text-sm text-muted">
            {{ selectedOrder.subdistrict || "" }}
            {{ selectedOrder.district }}
            {{ selectedOrder.province }}
            {{ selectedOrder.postal_code }}
          </p>
          <p v-if="selectedOrder.delivery_note" class="mt-2 text-sm text-muted">หมายเหตุจัดส่ง: {{ selectedOrder.delivery_note }}</p>
        </div>

        <div class="divide-y divide-default rounded-lg border border-default">
          <div v-for="item in selectedOrder.items" :key="item.product_id" class="flex justify-between gap-3 p-4">
            <span>{{ item.product_name }} x {{ item.quantity }}</span>
            <span class="font-bold">{{ formatPrice(item.subtotal) }}</span>
          </div>
        </div>

        <div class="flex justify-between text-lg font-black">
          <span>ยอดรวม</span>
          <span>{{ formatPrice(selectedOrder.total) }}</span>
        </div>
      </div>
    </template>
  </UModal>
</template>
