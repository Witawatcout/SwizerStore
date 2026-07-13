<script setup lang="ts">
import { DEFAULT_LINE_URL, type StorefrontSettings } from "~/composables/useStorefrontSettings";

definePageMeta({ layout: "admin" });

useHead({ title: "Settings | Swizer Superfoods" });

const toast = useToast();
const { refresh: refreshPublicSettings } = useStorefrontSettings();
const isLoading = ref(true);
const isSaving = ref(false);
const form = reactive({
  payment_enabled: false,
  line_url: DEFAULT_LINE_URL,
});

function normalizePaymentEnabled(value: unknown) {
  return value === true || value === 1 || value === "1";
}

function applySettings(settings?: StorefrontSettings | null) {
  if (!settings) return;
  form.payment_enabled = normalizePaymentEnabled(settings.payment_enabled);
  form.line_url = settings.line_url || DEFAULT_LINE_URL;
}

async function loadSettings() {
  isLoading.value = true;
  try {
    const settings = await $authFetch<StorefrontSettings>("/api/admin/settings/payment");
    applySettings(settings);
  } catch (error: any) {
    toast.add({
      title: "โหลดการตั้งค่าไม่สำเร็จ",
      description: error?.data?.statusMessage || error?.message || "กรุณาลองรีเฟรชอีกครั้ง",
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadSettings();
});

async function saveSettings() {
  isSaving.value = true;
  try {
    const settings = await $authFetch<StorefrontSettings>("/api/admin/settings/payment", {
      method: "PUT",
      body: {
        payment_enabled: form.payment_enabled,
        line_url: form.line_url,
      },
    });

    applySettings(settings);
    await refreshPublicSettings();
    toast.add({
      title: "บันทึกการตั้งค่าแล้ว",
      description: form.payment_enabled ? "ลูกค้าสามารถใช้ตะกร้าและชำระเงินบนเว็บได้" : "ลูกค้าจะถูกพาไปติดต่อทาง LINE แทนตะกร้า",
      color: "success",
      icon: "i-lucide-check-circle",
    });
  } catch (error: any) {
    toast.add({
      title: "บันทึกการตั้งค่าไม่สำเร็จ",
      description: error?.data?.statusMessage || error?.message || "กรุณาลองใหม่อีกครั้ง",
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Settings">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="ghost"
            :loading="isLoading"
            @click="loadSettings"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="mx-auto flex w-full max-w-4xl flex-col gap-5">
        <UAlert
          :color="form.payment_enabled ? 'success' : 'warning'"
          variant="soft"
          :icon="form.payment_enabled ? 'i-lucide-shopping-cart' : 'i-lucide-message-circle'"
          :title="form.payment_enabled ? 'ระบบชำระเงินบนเว็บเปิดอยู่' : 'ระบบชำระเงินบนเว็บปิดอยู่'"
          :description="form.payment_enabled ? 'ลูกค้าจะเห็นตะกร้าและสามารถ checkout ได้ตามปกติ' : 'ลูกค้าจะไม่เห็นตะกร้า ปุ่มเลือกสินค้าจะพาไปคุยทาง LINE'"
        />

        <UCard>
          <template #header>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="font-semibold text-default">Checkout Mode</h2>
                <p class="text-sm text-muted">ควบคุมว่าหน้าร้านใช้ตะกร้าเว็บ หรือส่งลูกค้าไป LINE</p>
              </div>
              <UBadge
                :label="form.payment_enabled ? 'Online payment' : 'LINE only'"
                :color="form.payment_enabled ? 'success' : 'warning'"
                variant="subtle"
              />
            </div>
          </template>

          <form class="space-y-5" @submit.prevent="saveSettings">
            <UFormField
              label="เปิดระบบตะกร้าและชำระเงิน"
              description="ปิดสวิตช์นี้เมื่อต้องการให้ลูกค้าติดต่อสั่งซื้อทาง LINE แทน"
            >
              <USwitch v-model="form.payment_enabled" :disabled="isLoading" />
            </UFormField>

            <UFormField
              label="LINE URL"
              description="ลิงก์นี้จะใช้กับปุ่มสั่งซื้อเมื่อระบบชำระเงินถูกปิด"
            >
              <UInput
                v-model="form.line_url"
                icon="i-lucide-message-circle"
                placeholder="https://page.line.me/swizer_superfood?openQrModal=true"
                class="w-full"
              />
            </UFormField>

            <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <UButton
                type="button"
                label="คืนค่า LINE เดิม"
                icon="i-lucide-rotate-ccw"
                color="neutral"
                variant="soft"
                @click="form.line_url = DEFAULT_LINE_URL"
              />
              <UButton
                type="submit"
                label="บันทึกการตั้งค่า"
                icon="i-lucide-save"
                :loading="isSaving"
              />
            </div>
          </form>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
