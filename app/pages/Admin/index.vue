<script setup lang="ts">
import { useAuthStore } from "@/store/auth";
import { isAdminRole, isSuperAdminRole } from "@/utils/adminAccess";

definePageMeta({ layout: "admin" });

useHead({ title: "Admin Dashboard | Swizer Superfoods" });

interface AdminEmailRecipient {
  id: number;
  name: string;
  email: string;
  is_active: number | boolean;
  created_at: string;
  updated_at: string;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const toast = useToast();
const auth = useAuthStore();
const isSuperAdmin = computed(() => isSuperAdminRole(auth.user?.role));
const activeDashboardTab = ref<"overview" | "admin">("overview");
const dashboardTabs = [
  { key: "overview", label: "ภาพรวม", icon: "i-lucide-layout-dashboard" },
  { key: "admin", label: "จัดการแอดมิน", icon: "i-lucide-shield-check" },
] as const;
const { data: productsData, refresh: refreshProducts } = useAuthFetch<any[]>("/api/products?includeInactive=1");
const { data: categoriesData, refresh: refreshCategories } = useAuthFetch<any[]>("/api/categories?includeInactive=1");
const { data: newsData, refresh: refreshNews } = useAuthFetch<any[]>("/api/news");
const { data: ordersData, status: ordersStatus, refresh: refreshOrders } = useAuthFetch<any[]>("/api/admin/orders", {
  immediate: false,
});
const {
  data: usersData,
  status: usersStatus,
  refresh: refreshUsers,
} = useAuthFetch<{ users: AdminUser[] }>("/api/admin/users", { immediate: false });
const {
  data: notificationData,
  pending: notificationsPending,
  refresh: refreshNotifications,
} = useAuthFetch<any>("/api/admin/notifications/orders", { immediate: false });
const {
  data: emailRecipientsData,
  status: emailRecipientsStatus,
  refresh: refreshEmailRecipients,
} = useAuthFetch<AdminEmailRecipient[]>("/api/admin/email-recipients", { immediate: false });

const products = computed(() => productsData.value || []);
const categories = computed(() => categoriesData.value || []);
const news = computed(() => newsData.value || []);
const orders = computed(() => ordersData.value || []);
const loadingOrders = computed(() => isSuperAdmin.value && (ordersStatus.value === "pending" || ordersStatus.value === "idle"));
const users = computed(() => usersData.value?.users || []);
const adminUsers = computed(() => users.value.filter((user) => isAdminRole(user.role)));
const loadingUsers = computed(() => usersStatus.value === "pending" || usersStatus.value === "idle");
const emailRecipients = computed(() => emailRecipientsData.value || []);
const loadingEmailRecipients = computed(() => emailRecipientsStatus.value === "pending" || emailRecipientsStatus.value === "idle");
const activeEmailRecipientCount = computed(() =>
  emailRecipients.value.filter((recipient) => Boolean(Number(recipient.is_active))).length
);

const totalProducts = computed(() => products.value.length);
const activeProducts = computed(() => products.value.filter((product) => Number(product.is_active ?? 1) === 1).length);
const inactiveProducts = computed(() => Math.max(totalProducts.value - activeProducts.value, 0));
const totalCategories = computed(() => categories.value.length);
const activeCategories = computed(() => categories.value.filter((category) => Number(category.is_active ?? 1) === 1).length);
const inactiveCategories = computed(() => Math.max(totalCategories.value - activeCategories.value, 0));
const totalNews = computed(() => news.value.length);
const recentNews = computed(() => news.value.slice(0, 5));
const latestProducts = computed(() => products.value.slice(0, 5));
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
const isCreatingAdminUser = ref(false);
const isSavingEmailRecipient = ref(false);
const deletingEmailRecipientId = ref<number | null>(null);
const adminUserForm = reactive({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});
const emailRecipientForm = reactive({
  id: null as number | null,
  name: "",
  email: "",
  is_active: true,
});
const isEditingEmailRecipient = computed(() => Boolean(emailRecipientForm.id));

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

function stopSuperAdminDashboardPolling() {
  if (!notificationTimer) return;
  clearInterval(notificationTimer);
  notificationTimer = undefined;
}

function loadSuperAdminDashboard() {
  refreshOrders();
  refreshNotifications();
  refreshEmailRecipients();
  refreshUsers();

  if (notificationTimer) return;
  notificationTimer = setInterval(() => {
    refreshNotifications();
    refreshOrders();
  }, 30000);
}

onMounted(() => {
  if (isSuperAdmin.value) loadSuperAdminDashboard();
});

watch(isSuperAdmin, (value) => {
  if (value) {
    loadSuperAdminDashboard();
    return;
  }

  stopSuperAdminDashboardPolling();
});

onBeforeUnmount(() => {
  stopSuperAdminDashboardPolling();
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
  if (!isSuperAdmin.value || !newOrderCount.value || isMarkingSeen.value) return;

  isMarkingSeen.value = true;
  try {
    await $authFetch("/api/admin/notifications/orders/seen", { method: "POST" });
    await refreshNotifications();
  } finally {
    isMarkingSeen.value = false;
  }
}

async function refreshDashboard() {
  if (!isSuperAdmin.value) {
    await Promise.all([refreshProducts(), refreshCategories(), refreshNews()]);
    return;
  }

  await Promise.all([
    refreshProducts(),
    refreshCategories(),
    refreshNews(),
    refreshOrders(),
    refreshNotifications(),
    refreshEmailRecipients(),
    refreshUsers(),
  ]);
}

function resetAdminUserForm() {
  adminUserForm.username = "";
  adminUserForm.email = "";
  adminUserForm.password = "";
  adminUserForm.confirmPassword = "";
}

async function createAdminUser() {
  if (!adminUserForm.username.trim() || !adminUserForm.email.trim() || !adminUserForm.password) {
    toast.add({
      title: "กรุณากรอกข้อมูล admin ให้ครบ",
      color: "warning",
      icon: "i-lucide-user-round-plus",
    });
    return;
  }

  if (adminUserForm.password !== adminUserForm.confirmPassword) {
    toast.add({
      title: "รหัสผ่านไม่ตรงกัน",
      color: "warning",
      icon: "i-lucide-lock-keyhole",
    });
    return;
  }

  isCreatingAdminUser.value = true;
  try {
    await $authFetch("/api/admin/users", {
      method: "POST",
      body: {
        username: adminUserForm.username.trim(),
        email: adminUserForm.email.trim(),
        password: adminUserForm.password,
        confirmPassword: adminUserForm.confirmPassword,
      },
    });

    toast.add({
      title: "เพิ่ม user admin แล้ว",
      description: "บัญชีนี้สามารถเข้าสู่ระบบหลังบ้านได้ทันที",
      color: "success",
      icon: "i-lucide-shield-check",
    });
    resetAdminUserForm();
    await refreshUsers();
  } catch (error: any) {
    toast.add({
      title: "เพิ่ม user admin ไม่สำเร็จ",
      description: emailErrorMessage(error, "กรุณาลองใหม่อีกครั้ง"),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    isCreatingAdminUser.value = false;
  }
}

function resetEmailRecipientForm() {
  emailRecipientForm.id = null;
  emailRecipientForm.name = "";
  emailRecipientForm.email = "";
  emailRecipientForm.is_active = true;
}

function editEmailRecipient(recipient: AdminEmailRecipient) {
  emailRecipientForm.id = recipient.id;
  emailRecipientForm.name = recipient.name || "";
  emailRecipientForm.email = recipient.email || "";
  emailRecipientForm.is_active = Boolean(Number(recipient.is_active));
}

function emailErrorMessage(error: any, fallback: string) {
  return error?.data?.statusMessage || error?.statusMessage || error?.message || fallback;
}

async function saveEmailRecipient() {
  if (!emailRecipientForm.email.trim()) {
    toast.add({
      title: "กรุณากรอกอีเมล",
      color: "warning",
      icon: "i-lucide-mail-warning",
    });
    return;
  }

  isSavingEmailRecipient.value = true;
  try {
    const body = {
      name: emailRecipientForm.name.trim(),
      email: emailRecipientForm.email.trim(),
      is_active: emailRecipientForm.is_active,
    };

    if (emailRecipientForm.id) {
      await $authFetch(`/api/admin/email-recipients/${emailRecipientForm.id}`, {
        method: "PUT",
        body,
      });
    } else {
      await $authFetch("/api/admin/email-recipients", {
        method: "POST",
        body,
      });
    }

    toast.add({
      title: emailRecipientForm.id ? "บันทึกผู้รับอีเมลแล้ว" : "เพิ่มผู้รับอีเมลแล้ว",
      color: "success",
      icon: "i-lucide-check-circle",
    });
    resetEmailRecipientForm();
    await refreshEmailRecipients();
  } catch (error: any) {
    toast.add({
      title: "บันทึกผู้รับอีเมลไม่สำเร็จ",
      description: emailErrorMessage(error, "กรุณาลองใหม่อีกครั้ง"),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    isSavingEmailRecipient.value = false;
  }
}

async function toggleEmailRecipient(recipient: AdminEmailRecipient, isActive: boolean) {
  try {
    await $authFetch(`/api/admin/email-recipients/${recipient.id}`, {
      method: "PUT",
      body: {
        name: recipient.name || "",
        email: recipient.email,
        is_active: isActive,
      },
    });
    await refreshEmailRecipients();
  } catch (error: any) {
    toast.add({
      title: "เปลี่ยนสถานะผู้รับอีเมลไม่สำเร็จ",
      description: emailErrorMessage(error, "กรุณาลองใหม่อีกครั้ง"),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
}

async function deleteEmailRecipient(recipient: AdminEmailRecipient) {
  if (!window.confirm(`ลบผู้รับอีเมล ${recipient.email} ใช่ไหม?`)) return;

  deletingEmailRecipientId.value = recipient.id;
  try {
    await $authFetch(`/api/admin/email-recipients/${recipient.id}`, { method: "DELETE" });
    if (emailRecipientForm.id === recipient.id) resetEmailRecipientForm();
    toast.add({
      title: "ลบผู้รับอีเมลแล้ว",
      color: "success",
      icon: "i-lucide-trash-2",
    });
    await refreshEmailRecipients();
  } catch (error: any) {
    toast.add({
      title: "ลบผู้รับอีเมลไม่สำเร็จ",
      description: emailErrorMessage(error, "กรุณาลองใหม่อีกครั้ง"),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    deletingEmailRecipientId.value = null;
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template v-if="isSuperAdmin" #right>
          <UButton
            v-if="isSuperAdmin"
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

          <div v-if="isSuperAdmin" class="flex flex-wrap gap-2">
            <UButton to="/Admin/Orders" icon="i-lucide-receipt-text" label="ดูคำสั่งซื้อ" color="primary" />
            <UButton to="/Admin/Products" icon="i-lucide-package" label="จัดการสินค้า" color="neutral" variant="soft" />
            <UButton to="/" icon="i-lucide-store" label="กลับหน้าเว็บ" color="neutral" variant="soft" />
          </div>
        </div>

        <UAlert
          v-if="!isSuperAdmin"
          icon="i-lucide-eye"
          color="neutral"
          variant="soft"
          title="Dashboard สำหรับ admin ปกติเป็นโหมดดูข้อมูล"
          description="บัญชีนี้ดูภาพรวมได้อย่างเดียว และสามารถจัดการได้เฉพาะเมนู Products, Categories และ News จาก sidebar"
        />

        <div v-if="!isSuperAdmin" class="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-package" class="size-5 text-primary" />
                <h2 class="font-semibold text-default">สินค้าล่าสุด</h2>
              </div>
            </template>

            <div v-if="latestProducts.length" class="divide-y divide-muted">
              <div v-for="product in latestProducts" :key="product.id" class="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div class="min-w-0">
                  <p class="truncate font-medium text-default">{{ product.name }}</p>
                  <p class="text-xs text-muted">{{ product.category_name || "ไม่มีหมวดหมู่" }}</p>
                </div>
                <div class="flex shrink-0 items-center gap-2">
                  <UBadge :label="Number(product.is_active ?? 1) === 1 ? 'เปิดขาย' : 'ปิดขาย'" :color="Number(product.is_active ?? 1) === 1 ? 'success' : 'neutral'" variant="subtle" />
                  <span class="text-sm font-semibold text-default">{{ product.stock || 0 }}</span>
                </div>
              </div>
            </div>

            <div v-else class="rounded-lg border border-dashed border-muted p-6 text-center">
              <p class="font-medium text-default">ยังไม่มีสินค้า</p>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-folder-tree" class="size-5 text-success" />
                <h2 class="font-semibold text-default">สถานะหมวดหมู่</h2>
              </div>
            </template>

            <div v-if="categories.length" class="divide-y divide-muted">
              <div v-for="category in categories.slice(0, 6)" :key="category.id" class="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div class="min-w-0">
                  <p class="truncate font-medium text-default">{{ category.name }}</p>
                  <p class="text-xs text-muted">{{ category.parent_id ? "หมวดย่อย" : "หมวดหลัก" }}</p>
                </div>
                <UBadge :label="Number(category.is_active ?? 1) === 1 ? 'เปิดใช้งาน' : 'ปิดใช้งาน'" :color="Number(category.is_active ?? 1) === 1 ? 'success' : 'neutral'" variant="subtle" />
              </div>
            </div>

            <div v-else class="rounded-lg border border-dashed border-muted p-6 text-center">
              <p class="font-medium text-default">ยังไม่มีหมวดหมู่</p>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-newspaper" class="size-5 text-warning" />
                <h2 class="font-semibold text-default">ข่าวล่าสุด</h2>
              </div>
            </template>

            <div v-if="recentNews.length" class="divide-y divide-muted">
              <div v-for="item in recentNews" :key="item.id" class="py-3 first:pt-0 last:pb-0">
                <p class="line-clamp-1 font-medium text-default">{{ item.title }}</p>
                <p class="text-xs text-muted">{{ item.created_at ? formatDate(item.created_at) : "-" }}</p>
              </div>
            </div>

            <div v-else class="rounded-lg border border-dashed border-muted p-6 text-center">
              <p class="font-medium text-default">ยังไม่มีข่าวสาร</p>
            </div>
          </UCard>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <UCard v-if="isSuperAdmin">
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

          <UCard v-if="isSuperAdmin">
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

          <UCard v-if="isSuperAdmin">
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

          <UCard v-if="!isSuperAdmin">
            <div class="flex items-center gap-4">
              <div class="rounded-lg bg-success/10 p-3">
                <UIcon name="i-lucide-folder-tree" class="size-6 text-success" />
              </div>
              <div>
                <p class="text-sm text-muted">หมวดหมู่ที่เปิดใช้งาน</p>
                <p class="text-2xl font-bold text-default">{{ activeCategories }} / {{ totalCategories }}</p>
                <p class="text-xs text-muted">ปิดใช้งาน {{ inactiveCategories }} หมวดหมู่</p>
              </div>
            </div>
          </UCard>

          <UCard v-if="!isSuperAdmin">
            <div class="flex items-center gap-4">
              <div class="rounded-lg bg-warning/10 p-3">
                <UIcon name="i-lucide-newspaper" class="size-6 text-warning" />
              </div>
              <div>
                <p class="text-sm text-muted">ข่าวสารทั้งหมด</p>
                <p class="text-2xl font-bold text-default">{{ totalNews }}</p>
                <p class="text-xs text-muted">แสดงข้อมูลจากหน้า News</p>
              </div>
            </div>
          </UCard>

          <UCard v-if="!isSuperAdmin">
            <div class="flex items-center gap-4">
              <div class="rounded-lg bg-error/10 p-3">
                <UIcon name="i-lucide-triangle-alert" class="size-6 text-error" />
              </div>
              <div>
                <p class="text-sm text-muted">สินค้า stock ต่ำ</p>
                <p class="text-2xl font-bold text-default">{{ lowStockProducts.length }}</p>
                <p class="text-xs text-muted">สินค้าเหลือ 5 ชิ้นหรือน้อยกว่า</p>
              </div>
            </div>
          </UCard>
        </div>

        <UCard v-show="activeDashboardTab === 'admin'">
          <template #header>
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 class="font-semibold text-default">ผู้รับอีเมลแอดมิน</h2>
                <p class="text-sm text-muted">
                  กำหนดว่าเมื่อมีคำสั่งซื้อที่ชำระเงินสำเร็จ หรือมีข้อความติดต่อจากลูกค้า ระบบต้องส่งอีเมลหาใครบ้าง
                </p>
              </div>
              <UBadge
                :label="`${activeEmailRecipientCount} คนกำลังรับอีเมล`"
                :color="activeEmailRecipientCount ? 'success' : 'warning'"
                variant="subtle"
              />
            </div>
          </template>

          <div class="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <form class="rounded-xl border border-muted bg-elevated/40 p-4" @submit.prevent="saveEmailRecipient">
              <div class="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 class="font-semibold text-default">
                    {{ isEditingEmailRecipient ? "แก้ไขผู้รับอีเมล" : "เพิ่มผู้รับอีเมล" }}
                  </h3>
                  <p class="text-sm text-muted">ใช้สำหรับเมลแจ้งเตือนฝั่ง admin</p>
                </div>
                <UButton
                  v-if="isEditingEmailRecipient"
                  icon="i-lucide-x"
                  label="ยกเลิกแก้ไข"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  @click="resetEmailRecipientForm"
                />
              </div>

              <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <UFormField label="ชื่อ">
                  <UInput
                    v-model="emailRecipientForm.name"
                    icon="i-lucide-user"
                    placeholder="เช่น Witawat"
                    size="lg"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="อีเมล" required>
                  <UInput
                    v-model="emailRecipientForm.email"
                    icon="i-lucide-mail"
                    type="email"
                    placeholder="admin@example.com"
                    size="lg"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <button
                type="button"
                class="mt-4 flex w-full items-center justify-between gap-4 rounded-xl border border-muted bg-default p-4 text-left"
                @click="emailRecipientForm.is_active = !emailRecipientForm.is_active"
              >
                <div>
                  <p class="font-semibold text-default">
                    {{ emailRecipientForm.is_active ? "เปิดรับอีเมล" : "ปิดรับอีเมล" }}
                  </p>
                  <p class="text-sm text-muted">ปิดไว้ได้ถ้าไม่ต้องการให้คนนี้รับอีเมลแจ้งเตือน</p>
                </div>
                <USwitch v-model="emailRecipientForm.is_active" @click.stop />
              </button>

              <UButton
                type="submit"
                :label="isEditingEmailRecipient ? 'บันทึกการแก้ไข' : 'เพิ่มผู้รับอีเมล'"
                :icon="isEditingEmailRecipient ? 'i-lucide-save' : 'i-lucide-plus'"
                color="primary"
                block
                class="mt-4"
                :loading="isSavingEmailRecipient"
              />
            </form>

            <div class="rounded-xl border border-muted bg-default">
              <div class="flex items-center justify-between gap-3 border-b border-muted px-4 py-3">
                <div>
                  <h3 class="font-semibold text-default">รายชื่อผู้รับ</h3>
                  <p class="text-sm text-muted">รายชื่อที่เปิดใช้งานจะได้รับเมลพร้อมกัน</p>
                </div>
                <UButton
                  icon="i-lucide-refresh-cw"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :loading="loadingEmailRecipients"
                  @click="refreshEmailRecipients"
                />
              </div>

              <div v-if="loadingEmailRecipients" class="space-y-3 p-4" aria-hidden="true">
                <USkeleton v-for="i in 3" :key="`admin-email-skeleton-${i}`" class="h-16 rounded-xl" />
              </div>

              <div v-else-if="emailRecipients.length" class="divide-y divide-muted">
                <div
                  v-for="recipient in emailRecipients"
                  :key="recipient.id"
                  class="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <p class="truncate font-semibold text-default">{{ recipient.name || "Admin" }}</p>
                      <UBadge
                        :label="Number(recipient.is_active) ? 'รับอีเมล' : 'ปิดอยู่'"
                        :color="Number(recipient.is_active) ? 'success' : 'neutral'"
                        variant="subtle"
                      />
                    </div>
                    <p class="truncate text-sm text-muted">{{ recipient.email }}</p>
                  </div>

                  <div class="flex items-center gap-2">
                    <USwitch
                      :model-value="Boolean(Number(recipient.is_active))"
                      @update:model-value="(value) => toggleEmailRecipient(recipient, Boolean(value))"
                    />
                    <UButton
                      icon="i-lucide-pencil"
                      color="neutral"
                      variant="ghost"
                      size="sm"
                      @click="editEmailRecipient(recipient)"
                    />
                    <UButton
                      icon="i-lucide-trash-2"
                      color="error"
                      variant="ghost"
                      size="sm"
                      :loading="deletingEmailRecipientId === recipient.id"
                      @click="deleteEmailRecipient(recipient)"
                    />
                  </div>
                </div>
              </div>

              <div v-else class="p-8 text-center">
                <UIcon name="i-lucide-mails" class="mx-auto mb-3 size-9 text-muted" />
                <p class="font-medium text-default">ยังไม่มีผู้รับอีเมลแอดมิน</p>
                <p class="text-sm text-muted">เพิ่มอีเมลอย่างน้อย 1 คน เพื่อรับแจ้งเตือนคำสั่งซื้อใหม่</p>
              </div>
            </div>
          </div>
        </UCard>

        <UCard v-show="activeDashboardTab === 'admin'">
          <template #header>
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 class="font-semibold text-default">User Admin</h2>
                <p class="text-sm text-muted">เพิ่มบัญชีสำหรับเข้าใช้งานหลังบ้าน และดูรายชื่อ admin ที่มีอยู่</p>
              </div>
              <UBadge :label="`${adminUsers.length} admin users`" color="primary" variant="subtle" />
            </div>
          </template>

          <div class="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <form class="rounded-xl border border-muted bg-elevated/40 p-4" @submit.prevent="createAdminUser">
              <div class="mb-4">
                <h3 class="font-semibold text-default">เพิ่ม admin user</h3>
                <p class="text-sm text-muted">บัญชีที่เพิ่มจากตรงนี้จะเข้าสู่ระบบ admin ได้ทันที</p>
              </div>

              <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <UFormField label="Username" required>
                  <UInput
                    v-model="adminUserForm.username"
                    icon="i-lucide-user"
                    placeholder="admin-name"
                    size="lg"
                    autocomplete="username"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="อีเมล" required>
                  <UInput
                    v-model="adminUserForm.email"
                    icon="i-lucide-mail"
                    type="email"
                    placeholder="admin@example.com"
                    size="lg"
                    autocomplete="email"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="รหัสผ่าน" required>
                  <UInput
                    v-model="adminUserForm.password"
                    icon="i-lucide-lock"
                    type="password"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    size="lg"
                    autocomplete="new-password"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="ยืนยันรหัสผ่าน" required>
                  <UInput
                    v-model="adminUserForm.confirmPassword"
                    icon="i-lucide-lock-keyhole"
                    type="password"
                    placeholder="กรอกอีกครั้ง"
                    size="lg"
                    autocomplete="new-password"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <div class="mt-4 flex flex-col gap-2 sm:flex-row">
                <UButton
                  type="submit"
                  label="เพิ่ม admin"
                  icon="i-lucide-user-round-plus"
                  color="primary"
                  class="flex-1"
                  :loading="isCreatingAdminUser"
                />
                <UButton
                  type="button"
                  label="ล้างฟอร์ม"
                  icon="i-lucide-rotate-ccw"
                  color="neutral"
                  variant="soft"
                  @click="resetAdminUserForm"
                />
              </div>
            </form>

            <div class="rounded-xl border border-muted bg-default">
              <div class="flex items-center justify-between gap-3 border-b border-muted px-4 py-3">
                <div>
                  <h3 class="font-semibold text-default">รายชื่อ admin</h3>
                  <p class="text-sm text-muted">แสดงเฉพาะบัญชีที่มี role เป็น admin</p>
                </div>
                <UButton
                  icon="i-lucide-refresh-cw"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :loading="loadingUsers"
                  @click="refreshUsers"
                />
              </div>

              <div v-if="loadingUsers" class="space-y-3 p-4" aria-hidden="true">
                <USkeleton v-for="i in 3" :key="`admin-user-skeleton-${i}`" class="h-16 rounded-xl" />
              </div>

              <div v-else-if="adminUsers.length" class="divide-y divide-muted">
                <div
                  v-for="user in adminUsers"
                  :key="user.id"
                  class="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <p class="truncate font-semibold text-default">{{ user.username }}</p>
                      <UBadge label="admin" color="primary" variant="subtle" />
                    </div>
                    <p class="truncate text-sm text-muted">{{ user.email }}</p>
                  </div>
                  <p class="text-xs text-muted">{{ formatDate(user.created_at) }}</p>
                </div>
              </div>

              <div v-else class="p-8 text-center">
                <UIcon name="i-lucide-shield-alert" class="mx-auto mb-3 size-9 text-muted" />
                <p class="font-medium text-default">ยังไม่มีรายชื่อ admin</p>
                <p class="text-sm text-muted">เพิ่มบัญชี admin เพื่อให้ทีมงานเข้าใช้งานหลังบ้าน</p>
              </div>
            </div>
          </div>
        </UCard>

        <div class="grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <UCard v-if="isSuperAdmin">
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
            <UCard v-if="isSuperAdmin">
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

        <div v-if="isSuperAdmin" class="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
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
