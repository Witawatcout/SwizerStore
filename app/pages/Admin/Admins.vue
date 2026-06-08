<script setup lang="ts">
import { ADMIN_ROLE, SUPER_ADMIN_ROLE, adminRoleLabel, isAdminRole, isSuperAdminRole } from "@/utils/adminAccess";

definePageMeta({ layout: "admin" });

useHead({ title: "Admins | Swizer Superfoods" });

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
const {
  data: emailRecipientsData,
  status: emailRecipientsStatus,
  refresh: refreshEmailRecipients,
} = useAuthFetch<AdminEmailRecipient[]>("/api/admin/email-recipients");
const {
  data: usersData,
  status: usersStatus,
  refresh: refreshUsers,
} = useAuthFetch<{ users: AdminUser[] }>("/api/admin/users");

const emailRecipients = computed(() => emailRecipientsData.value || []);
const activeEmailRecipientCount = computed(() =>
  emailRecipients.value.filter((recipient) => Boolean(Number(recipient.is_active))).length
);
const loadingEmailRecipients = computed(() => emailRecipientsStatus.value === "pending" || emailRecipientsStatus.value === "idle");
const adminUsers = computed(() => (usersData.value?.users || []).filter((user) => isAdminRole(user.role)));
const loadingUsers = computed(() => usersStatus.value === "pending" || usersStatus.value === "idle");
const adminRoleOptions = [
  { label: "Admin", value: ADMIN_ROLE },
  { label: "Super Admin", value: SUPER_ADMIN_ROLE },
];

const isSavingEmailRecipient = ref(false);
const deletingEmailRecipientId = ref<number | null>(null);
const isCreatingAdminUser = ref(false);
const changingAdminRoleId = ref<number | null>(null);

const emailRecipientForm = reactive({
  id: null as number | null,
  name: "",
  email: "",
  is_active: true,
});
const adminUserForm = reactive({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: ADMIN_ROLE,
});
const isEditingEmailRecipient = computed(() => Boolean(emailRecipientForm.id));

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function errorMessage(error: any, fallback: string) {
  return error?.data?.statusMessage || error?.statusMessage || error?.message || fallback;
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

async function saveEmailRecipient() {
  if (!emailRecipientForm.email.trim()) {
    toast.add({ title: "กรุณากรอกอีเมล", color: "warning", icon: "i-lucide-mail-warning" });
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
      await $authFetch(`/api/admin/email-recipients/${emailRecipientForm.id}`, { method: "PUT", body });
    } else {
      await $authFetch("/api/admin/email-recipients", { method: "POST", body });
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
      description: errorMessage(error, "กรุณาลองใหม่อีกครั้ง"),
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
      description: errorMessage(error, "กรุณาลองใหม่อีกครั้ง"),
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
    toast.add({ title: "ลบผู้รับอีเมลแล้ว", color: "success", icon: "i-lucide-trash-2" });
    await refreshEmailRecipients();
  } catch (error: any) {
    toast.add({
      title: "ลบผู้รับอีเมลไม่สำเร็จ",
      description: errorMessage(error, "กรุณาลองใหม่อีกครั้ง"),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    deletingEmailRecipientId.value = null;
  }
}

function resetAdminUserForm() {
  adminUserForm.username = "";
  adminUserForm.email = "";
  adminUserForm.password = "";
  adminUserForm.confirmPassword = "";
  adminUserForm.role = ADMIN_ROLE;
}

async function createAdminUser() {
  if (!adminUserForm.username.trim() || !adminUserForm.email.trim() || !adminUserForm.password) {
    toast.add({ title: "กรุณากรอกข้อมูล admin ให้ครบ", color: "warning", icon: "i-lucide-user-round-plus" });
    return;
  }

  if (adminUserForm.password !== adminUserForm.confirmPassword) {
    toast.add({ title: "รหัสผ่านไม่ตรงกัน", color: "warning", icon: "i-lucide-lock-keyhole" });
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
        role: adminUserForm.role,
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
      description: errorMessage(error, "กรุณาลองใหม่อีกครั้ง"),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    isCreatingAdminUser.value = false;
  }
}

async function updateAdminRole(user: AdminUser, role: string) {
  const nextRole = role === SUPER_ADMIN_ROLE ? SUPER_ADMIN_ROLE : ADMIN_ROLE;
  if (nextRole === user.role || changingAdminRoleId.value) return;

  changingAdminRoleId.value = user.id;
  try {
    await $authFetch(`/api/admin/users/${user.id}/role`, {
      method: "PUT",
      body: { role: nextRole },
    });
    toast.add({
      title: "บันทึกสิทธิ admin แล้ว",
      description: `${user.username} เป็น ${adminRoleLabel(nextRole)} แล้ว`,
      color: "success",
      icon: "i-lucide-shield-check",
    });
    await refreshUsers();
  } catch (error: any) {
    toast.add({
      title: "แก้ไขสิทธิไม่สำเร็จ",
      description: errorMessage(error, "กรุณาลองใหม่อีกครั้ง"),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    changingAdminRoleId.value = null;
  }
}

async function refreshAll() {
  await Promise.all([refreshEmailRecipients(), refreshUsers()]);
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Admins">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            icon="i-lucide-refresh-cw"
            label="รีเฟรช"
            color="neutral"
            variant="soft"
            :loading="loadingEmailRecipients || loadingUsers"
            @click="refreshAll"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6 p-6">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-primary">Admin Control</p>
          <h1 class="text-2xl font-bold text-default">จัดการแอดมิน</h1>
          <p class="mt-1 text-muted">จัดการผู้รับอีเมลแจ้งเตือน และเพิ่มบัญชี admin สำหรับเข้าใช้งานหลังบ้าน</p>
        </div>

        <UCard>
          <template #header>
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 class="font-semibold text-default">ผู้รับอีเมลแอดมิน</h2>
                <p class="text-sm text-muted">รายชื่อที่เปิดใช้งานจะได้รับเมลเมื่อมี order ชำระเงินสำเร็จ และข้อความจากหน้า Contact</p>
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
                  <h3 class="font-semibold text-default">{{ isEditingEmailRecipient ? "แก้ไขผู้รับอีเมล" : "เพิ่มผู้รับอีเมล" }}</h3>
                  <p class="text-sm text-muted">ใช้สำหรับเมลแจ้งเตือนฝั่ง admin</p>
                </div>
                <UButton
                  v-if="isEditingEmailRecipient"
                  icon="i-lucide-x"
                  label="ยกเลิก"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  @click="resetEmailRecipientForm"
                />
              </div>

              <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <UFormField label="ชื่อ">
                  <UInput v-model="emailRecipientForm.name" icon="i-lucide-user" placeholder="เช่น Witawat" size="lg" class="w-full" />
                </UFormField>
                <UFormField label="อีเมล" required>
                  <UInput v-model="emailRecipientForm.email" icon="i-lucide-mail" type="email" placeholder="admin@example.com" size="lg" class="w-full" />
                </UFormField>
              </div>

              <button
                type="button"
                class="mt-4 flex w-full items-center justify-between gap-4 rounded-xl border border-muted bg-default p-4 text-left"
                @click="emailRecipientForm.is_active = !emailRecipientForm.is_active"
              >
                <div>
                  <p class="font-semibold text-default">{{ emailRecipientForm.is_active ? "เปิดรับอีเมล" : "ปิดรับอีเมล" }}</p>
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
                <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" size="sm" :loading="loadingEmailRecipients" @click="refreshEmailRecipients" />
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
                      <UBadge :label="Number(recipient.is_active) ? 'รับอีเมล' : 'ปิดอยู่'" :color="Number(recipient.is_active) ? 'success' : 'neutral'" variant="subtle" />
                    </div>
                    <p class="truncate text-sm text-muted">{{ recipient.email }}</p>
                  </div>

                  <div class="flex items-center gap-2">
                    <USwitch :model-value="Boolean(Number(recipient.is_active))" @update:model-value="(value) => toggleEmailRecipient(recipient, Boolean(value))" />
                    <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" size="sm" @click="editEmailRecipient(recipient)" />
                    <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="sm" :loading="deletingEmailRecipientId === recipient.id" @click="deleteEmailRecipient(recipient)" />
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

        <UCard>
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
                  <UInput v-model="adminUserForm.username" icon="i-lucide-user" placeholder="admin-name" size="lg" autocomplete="username" class="w-full" />
                </UFormField>
                <UFormField label="อีเมล" required>
                  <UInput v-model="adminUserForm.email" icon="i-lucide-mail" type="email" placeholder="admin@example.com" size="lg" autocomplete="email" class="w-full" />
                </UFormField>
                <UFormField label="สิทธิการใช้งาน" required>
                  <USelect
                    v-model="adminUserForm.role"
                    :items="adminRoleOptions"
                    icon="i-lucide-shield-check"
                    size="lg"
                    class="w-full"
                  />
                </UFormField>
                <UFormField label="รหัสผ่าน" required>
                  <UInput v-model="adminUserForm.password" icon="i-lucide-lock" type="password" placeholder="อย่างน้อย 8 ตัวอักษร" size="lg" autocomplete="new-password" class="w-full" />
                </UFormField>
                <UFormField label="ยืนยันรหัสผ่าน" required>
                  <UInput v-model="adminUserForm.confirmPassword" icon="i-lucide-lock-keyhole" type="password" placeholder="กรอกอีกครั้ง" size="lg" autocomplete="new-password" class="w-full" />
                </UFormField>
              </div>

              <div class="mt-4 flex flex-col gap-2 sm:flex-row">
                <UButton type="submit" label="เพิ่ม admin" icon="i-lucide-user-round-plus" color="primary" class="flex-1" :loading="isCreatingAdminUser" />
                <UButton type="button" label="ล้างฟอร์ม" icon="i-lucide-rotate-ccw" color="neutral" variant="soft" @click="resetAdminUserForm" />
              </div>
            </form>

            <div class="rounded-xl border border-muted bg-default">
              <div class="flex items-center justify-between gap-3 border-b border-muted px-4 py-3">
                <div>
                  <h3 class="font-semibold text-default">รายชื่อ admin</h3>
                  <p class="text-sm text-muted">แสดงเฉพาะบัญชีที่มี role เป็น admin</p>
                </div>
                <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" size="sm" :loading="loadingUsers" @click="refreshUsers" />
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
                      <UBadge
                        :label="adminRoleLabel(user.role)"
                        :color="isSuperAdminRole(user.role) ? 'warning' : 'primary'"
                        variant="subtle"
                      />
                    </div>
                    <p class="truncate text-sm text-muted">{{ user.email }}</p>
                  </div>
                  <div class="flex flex-col gap-2 sm:items-end">
                    <USelect
                      :model-value="user.role"
                      :items="adminRoleOptions"
                      size="sm"
                      class="w-40"
                      :loading="changingAdminRoleId === user.id"
                      :disabled="Boolean(changingAdminRoleId)"
                      @update:model-value="updateAdminRole(user, String($event))"
                    />
                    <p class="text-xs text-muted">{{ formatDate(user.created_at) }}</p>
                  </div>
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
      </div>
    </template>
  </UDashboardPanel>
</template>
