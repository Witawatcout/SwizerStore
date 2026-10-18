// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: 'th',
      },
      title: 'Swizer Store | ผลิตภัณฑ์ซุปเปอร์ฟู้ดและอาหารเพื่อสุขภาพระดับพรีเมียม',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Swizer Store (สไวเซอร์) แบรนด์ผู้พัฒนาและจัดจำหน่ายผลิตภัณฑ์ Superfoods อาซาอิ เมล็ดเจีย คีนัว กาแฟและโปรตีนเพื่อสุขภาพ คัดสรรวัตถุดิบชั้นเลิศจากต้นตำรับ เพื่อผู้บริโภคชาวไทย',
        },
        { name: 'application-name', content: 'Swizer Store' },
        { name: 'apple-mobile-web-app-title', content: 'Swizer Store' },
        { name: 'theme-color', content: '#83c63d' },
        { property: 'og:site_name', content: 'Swizer Store' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'th_TH' },
        {
          property: 'og:title',
          content: 'Swizer Store | ผลิตภัณฑ์ซุปเปอร์ฟู้ดและอาหารเพื่อสุขภาพระดับพรีเมียม',
        },
        {
          property: 'og:description',
          content: 'Swizer Store (สไวเซอร์) แบรนด์ผู้พัฒนาและจัดจำหน่ายผลิตภัณฑ์ Superfoods อาซาอิ เมล็ดเจีย คีนัว กาแฟและโปรตีนเพื่อสุขภาพ คัดสรรวัตถุดิบชั้นเลิศจากต้นตำรับ เพื่อผู้บริโภคชาวไทย',
        },
        { property: 'og:image', content: 'https://www.swizerstore.com/Home/1200x600-1-scaled.jpg' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48x48.png' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icon-192x192.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: [
        "outsell-illicitly-scary.ngrok-free.dev",
        ".ngrok-free.dev",
        ".ngrok-free.app",
      ],
    },
  },

  runtimeConfig: {
    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbPass: process.env.DB_PASS,
    dbName: process.env.DB_NAME,
    dbPort: process.env.DB_PORT,
    baseUrl: process.env.BASE_URL || "http://localhost:3000",
    omiseSecretKey: process.env.OMISE_SECRET_KEY,
    omiseWebhookSecret: process.env.OMISE_WEBHOOK_SECRET,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    smtpFrom: process.env.SMTP_FROM,
    smtpSecure: process.env.SMTP_SECURE,
    adminEmail: process.env.ADMIN_EMAIL,

    envName: process.env.ENV_NAME,

    tokenSecret: process.env.TOKEN_SECRET,
    tokenExpires: process.env.TOKEN_EXPIRES,
    tokenName: process.env.TOKEN_NAME,

    // ค่า public จะถูก expose ไป client ได้
    public: {
      apiBase: process.env.API_BASE || "http://localhost:3000",
      omisePublicKey: process.env.OMISE_PUBLIC_KEY || "",
    },
  },
  fonts: {
    families: [
      { name: "Epilogue", provider: "none" },
      { name: "Noto Sans Thai", provider: "none" },
    ],
  },
  ui: {
    colorMode: false,
  },
  modules: [
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/ui",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
  ],
});
