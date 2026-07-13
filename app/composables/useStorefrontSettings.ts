export interface StorefrontSettings {
  payment_enabled: boolean;
  line_url: string;
}

export const DEFAULT_LINE_URL = "https://page.line.me/swizer_superfood?openQrModal=true";

const defaultStorefrontSettings = (): StorefrontSettings => ({
  payment_enabled: false,
  line_url: DEFAULT_LINE_URL,
});

export function useStorefrontSettings() {
  const { data, status, refresh, error } = useFetch<StorefrontSettings>("/api/settings/storefront", {
    key: "storefront-settings",
  });

  const settings = computed<StorefrontSettings>(() => ({
    ...defaultStorefrontSettings(),
    ...(data.value || {}),
  }));
  const paymentEnabled = computed(() => settings.value.payment_enabled === true);
  const lineUrl = computed(() => settings.value.line_url || DEFAULT_LINE_URL);

  function openLine() {
    if (!import.meta.client) return;
    window.open(lineUrl.value, "_blank", "noopener,noreferrer");
  }

  return {
    settings,
    paymentEnabled,
    lineUrl,
    status,
    error,
    refresh,
    openLine,
  };
}
