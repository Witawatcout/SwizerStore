// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbPass: process.env.DB_PASS,
    dbName: process.env.DB_NAME,
    dbPort: process.env.DB_PORT,

    envName: process.env.ENV_NAME,

    tokenSecret: process.env.TOKEN_SECRET,
    tokenExpires: process.env.TOKEN_EXPIRES,
    tokenName: process.env.TOKEN_NAME,

    // ค่า public จะถูก expose ไป client ได้
    public: {
      apiBase: process.env.API_BASE || "http://localhost:3000",
    },
  },
  modules: [
    "@nuxt/image",
    "@nuxt/ui",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
  ],
});
