<script setup lang="ts">
definePageMeta({ layout: "admin" });

useHead({ title: "Admin Dashboard | Swizer Superfoods" });

const { data: productsData } = useAuthFetch<any[]>("/api/products?includeInactive=1");
const { data: categoriesData } = useAuthFetch<any[]>("/api/categories");
const { data: ordersData, status: ordersStatus, refresh: refreshOrders } = useAuthFetch<any[]>("/api/admin/orders");
const {
  data: notificationData,
  pending: notificationsPending,
  refresh: refreshNotifications,
} = useAuthFetch<any>("/api/admin/notifications/orders");

const products = computed(() => productsData.value || []);
const categories = computed(() => categoriesData.value || []);
const orders = computed(() => ordersData.value || []);
const loadingOrders = computed(() => ordersStatus.value === "pending" || ordersStatus.value === "idle");

const totalProducts = computed(() => products.value.length);
const activeProducts = computed(() => products.value.filter((product) => Number(product.is_active ?? 1) === 1).length);
const totalCategories = computed(() => categories.value.length);
const lowStockProducts = computed(() =>
  products.value
    .filter((product) => Number(product.is_active ?? 1) === 1 && Number(product.stock || 0) <= 5)
    .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
    .slice(0, 6)
);

const newOrderCount = computed(() => Number(notificationData.value?.count || 0));
const recentPaidOrders = computed(() => notificationData.value?.recent || []);
const recentOrders = computed(() => orders.value.slice(0, 6));
const isMarkingSeen = ref(false);

const orderSummary = computed(() => {
  const paidOrders = orders.value.filter((order) => order.payment_status === "success");
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.value.filter((order) => new Date(order.created_at).toISOString().slice(0, 10) === today);
  const todayPaidOrders = todayOrders.filter((order) => order.payment_status === "success");

  return {
    total: orders.value.length,
    paid: paidOrders.length,
    pendingPayment: orders.value.filter((order) => order.payment_status === "pending").length,
    failedPayment: orders.value.filter((order) => order.payment_status === "failed").length,
    revenue: paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    todayOrders: todayOrders.length,
    todayRevenue: todayPaidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    averageOrder: paidOrders.length
      ? paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0) / paidOrders.length
      : 0,
  };
});

const statusBreakdown = computed(() => {
  const items = [
    { key: "pending", label: "รอดำเนินการ", color: "neutral" },
    { key: "paid", label: "ชำระเงินแล้ว", color: "primary" },
    { key: "processing", label: "กำลังเตรียมสินค้า", color: "warning" },
    { key: "shipped", label: "จัดส่งแล้ว", color: "info" },
    { key: "delivered", label: "ส่งสำเร็จแล้ว", color: "success" },
    { key: "cancelled", label: "ยกเลิกแล้ว", color: "error" },
  ];

  return items.map((item) => ({
    ...item,
    count: orders.value.filter((order) => order.status === item.key).length,
  }));
});

const paymentBreakdown = computed(() => [
  {
    label: "พร้อมเพย์",
    count: orders.value.filter((order) => order.payment_method === "promptpay").length,
    total: orders.value
      .filter((order) => order.payment_method === "promptpay" && order.payment_status === "success")
      .reduce((sum, order) => sum + Number(order.total || 0), 0),
  },
  {
    label: "บัตรเครดิต/เดบิต",
    count: orders.value.filter((order) => order.payment_method === "credit_card").length,
    total: orders.value
      .filter((order) => order.payment_method === "credit_card" && order.payment_status === "success")
      .reduce((sum, order) => sum + Number(order.total || 0), 0),
  },
]);

let notificationTimer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  notificationTimer = setInterval(() => {
    refreshNotifications();
    refreshOrders();
  }, 30000);
});

onBeforeUnmount(() => {
  if (notificationTimer) clearInterval(notificationTimer);
});

function formatMoney(value: number | string) {
  return `฿${Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusLabel(value: string) {
  const labels: Record<string, string> = {
    pending: "รอดำเนินการ",
    paid: "ชำระเงินแล้ว",
    processing: "กำลังเตรียมสินค้า",
    shipped: "จัดส่งแล้ว",
    delivered: "ส่งสำเร็จแล้ว",
    cancelled: "ยกเลิกแล้ว",
  };
  return labels[value] || value;
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

function paymentMethodLabel(value: string) {
  if (value === "promptpay") return "พร้อมเพย์";
  if (value === "credit_card") return "บัตรเครดิต/เดบิต";
  return value || "-";
}

function percent(count: number) {
  if (!orderSummary.value.total) return 0;
  return Math.round((count / orderSummary.value.total) * 100);
}

async function markNotificationsSeen() {
  if (!newOrderCount.value || isMarkingSeen.value) return;

  isMarkingSeen.value = true;
  try {
    await $authFetch("/api/admin/notifications/orders/seen", { method: "POST" });
    await refreshNotifications();
  } finally {
    isMarkingSeen.value = false;
  }
}

async function refreshDashboard() {
  await Promise.all([refreshOrders(), refreshNotifications()]);
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            to="/Admin/Orders"
            icon="i-lucide-bell"
            :label="newOrderCount ? `${newOrderCount} คำสั่งซื้อใหม่` : 'ไม่มีคำสั่งซื้อใหม่'"
            :color="newOrderCount ? 'warning' : 'neutral'"
            variant="soft"
            :loading="notificationsPending || isMarkingSeen"
            @click="markNotificationsSeen"
          />
          <UButton icon="i-lucide-refresh-cw" label="รีเฟรช" color="neutral" variant="soft" :loading="loadingOrders" @click="refreshDashboard" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6 space-y-6">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-sm font-semibold tracking-wide text-primary uppercase">SwizerStore</p>
            <h1 class="text-2xl font-bold text-default">ภาพรวมระบบจัดการ</h1>
            <p class="text-muted mt-1">สรุปยอดขาย คำสั่งซื้อ สถานะจัดส่ง และข้อมูลสินค้าในที่เดียว</p>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton to="/Admin/Orders" icon="i-lucide-receipt-text" label="ดูคำสั่งซื้อ" color="primary" />
            <UButton to="/Admin/Products" icon="i-lucide-package" label="จัดการสินค้า" color="neutral" variant="soft" />
            <UButton to="/" icon="i-lucide-store" label="กลับหน้าเว็บ" color="neutral" variant="soft" />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <UCard>
            <div class="flex items-center gap-4">
              <div class="rounded-lg bg-primary/10 p-3">
                <UIcon name="i-lucide-banknote" class="size-6 text-primary" />
              </div>
              <div>
                <p class="text-sm text-muted">ยอดขายที่ชำระแล้ว</p>
                <p class="text-2xl font-bold text-default">{{ formatMoney(orderSummary.revenue) }}</p>
                <p class="text-xs text-muted">เฉลี่ย {{ formatMoney(orderSummary.averageOrder) }} / order</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center gap-4">
              <div class="rounded-lg bg-success/10 p-3">
                <UIcon name="i-lucide-calendar-check" class="size-6 text-success" />
              </div>
              <div>
                <p class="text-sm text-muted">วันนี้</p>
                <p class="text-2xl font-bold text-default">{{ orderSummary.todayOrders }} orders</p>
                <p class="text-xs text-muted">ยอดชำระแล้ว {{ formatMoney(orderSummary.todayRevenue) }}</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center gap-4">
              <div class="rounded-lg bg-warning/10 p-3">
                <UIcon name="i-lucide-clock" class="size-6 text-warning" />
              </div>
              <div>
                <p class="text-sm text-muted">รอชำระเงิน</p>
                <p class="text-2xl font-bold text-default">{{ orderSummary.pendingPayment }}</p>
                <p class="text-xs text-muted">ชำระไม่สำเร็จ {{ orderSummary.failedPayment }}</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center gap-4">
              <div class="rounded-lg bg-info/10 p-3">
                <UIcon name="i-lucide-package" class="size-6 text-info" />
              </div>
              <div>
                <p class="text-sm text-muted">สินค้าใช้งานอยู่</p>
                <p class="text-2xl font-bold text-default">{{ activeProducts }} / {{ totalProducts }}</p>
                <p class="text-xs text-muted">{{ totalCategories }} หมวดหมู่ · stock ต่ำ {{ lowStockProducts.length }}</p>
              </div>
            </div>
          </UCard>
        </div>

        <div class="grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h2 class="font-semibold text-default">ภาพรวมคำสั่งซื้อ</h2>
                  <p class="text-sm text-muted">แยกตามสถานะที่ admin ใช้จัดการงานประจำวัน</p>
                </div>
                <UBadge :label="`${orderSummary.total} orders`" color="neutral" variant="subtle" />
              </div>
            </template>

            <div class="space-y-4">
              <div v-for="item in statusBreakdown" :key="item.key" class="space-y-2">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <UBadge :label="item.label" :color="item.color as any" variant="subtle" />
                    <span class="text-sm text-muted">{{ percent(item.count) }}%</span>
                  </div>
                  <span class="font-bold text-default">{{ item.count }}</span>
                </div>
                <div class="h-2 overflow-hidden rounded-full bg-muted">
                  <div class="h-full rounded-full bg-primary" :style="{ width: `${percent(item.count)}%` }" />
                </div>
              </div>
            </div>
          </UCard>

          <div class="grid gap-4">
            <UCard>
              <template #header>
                <h2 class="font-semibold text-default">ช่องทางชำระเงิน</h2>
              </template>

              <div class="space-y-3">
                <div v-for="item in paymentBreakdown" :key="item.label" class="rounded-lg border border-muted p-3">
                  <div class="flex items-center justify-between">
                    <p class="font-medium text-default">{{ item.label }}</p>
                    <p class="font-bold text-default">{{ item.count }}</p>
                  </div>
                  <p class="mt-1 text-sm text-muted">ยอดชำระแล้ว {{ formatMoney(item.total) }}</p>
                </div>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <h2 class="font-semibold text-default">สินค้า stock ต่ำ</h2>
              </template>

              <div v-if="lowStockProducts.length" class="space-y-3">
                <div v-for="product in lowStockProducts" :key="product.id" class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate font-medium text-default">{{ product.name }}</p>
                    <p class="text-xs text-muted">{{ product.category_name || "ไม่มีหมวดหมู่" }}</p>
                  </div>
                  <UBadge :label="`${product.stock} ชิ้น`" :color="Number(product.stock) <= 0 ? 'error' : 'warning'" variant="subtle" />
                </div>
              </div>

              <div v-else class="rounded-lg border border-dashed border-muted p-5 text-center">
                <UIcon name="i-lucide-check-circle" class="mx-auto mb-2 size-7 text-success" />
                <p class="font-medium text-default">stock ยังดูดี</p>
                <p class="text-sm text-muted">ไม่มีสินค้าที่เหลือ 5 ชิ้นหรือน้อยกว่า</p>
              </div>
            </UCard>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h2 class="font-semibold text-default">Noti คำสั่งซื้อใหม่</h2>
                  <p class="text-sm text-muted">คำสั่งซื้อที่ชำระเงินสำเร็จและ admin ยังไม่รับทราบ</p>
                </div>
                <UButton
                  icon="i-lucide-check-check"
                  label="รับทราบทั้งหมด"
                  color="neutral"
                  variant="soft"
                  :disabled="!newOrderCount"
                  :loading="isMarkingSeen"
                  @click="markNotificationsSeen"
                />
              </div>
            </template>

            <div v-if="recentPaidOrders.length" class="divide-y divide-muted">
              <div
                v-for="order in recentPaidOrders"
                :key="order.id"
                class="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <NuxtLink :to="`/Admin/Orders?id=${encodeURIComponent(order.id)}`" class="font-semibold text-default hover:text-primary">
                    {{ order.id }}
                  </NuxtLink>
                  <p class="text-sm text-muted">{{ order.customer_name }} · {{ formatDate(order.created_at) }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <UBadge color="success" variant="soft" label="ชำระแล้ว" />
                  <span class="font-bold text-primary">{{ formatMoney(order.total) }}</span>
                </div>
              </div>
            </div>

            <div v-else class="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-muted">
              <div class="text-center">
                <UIcon name="i-lucide-inbox" class="mx-auto mb-2 size-8 text-muted" />
                <p class="font-medium text-default">ยังไม่มีคำสั่งซื้อใหม่</p>
                <p class="text-sm text-muted">รายการใหม่จะขึ้นที่นี่หลังลูกค้าชำระเงินสำเร็จ</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="font-semibold text-default">คำสั่งซื้อล่าสุด</h2>
                <UButton to="/Admin/Orders" label="ดูทั้งหมด" icon="i-lucide-arrow-right" color="neutral" variant="ghost" size="sm" />
              </div>
            </template>

            <div v-if="recentOrders.length" class="divide-y divide-muted">
              <div
                v-for="order in recentOrders"
                :key="order.id"
                class="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="min-w-0">
                  <NuxtLink :to="`/Admin/Orders?id=${encodeURIComponent(order.id)}`" class="font-semibold text-default hover:text-primary">
                    {{ order.id }}
                  </NuxtLink>
                  <p class="text-sm text-muted">{{ order.customer_name }} · {{ paymentMethodLabel(order.payment_method) }}</p>
                </div>
                <div class="flex flex-wrap items-center gap-2 sm:justify-end">
                  <UBadge :label="paymentStatusLabel(order.payment_status)" :color="paymentStatusColor(order.payment_status)" variant="subtle" />
                  <UBadge :label="statusLabel(order.status)" color="neutral" variant="subtle" />
                  <span class="font-bold text-default">{{ formatMoney(order.total) }}</span>
                </div>
              </div>
            </div>

            <div v-else class="rounded-lg border border-dashed border-muted p-8 text-center">
              <UIcon name="i-lucide-receipt-text" class="mx-auto mb-2 size-8 text-muted" />
              <p class="font-medium text-default">ยังไม่มีคำสั่งซื้อ</p>
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
