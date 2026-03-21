// /store/auth.ts
import { defineStore } from "pinia";

interface Auth {
  user: { username: string; email: string; role: string; token: string };
}

interface User {
  username: string;
  email: string;
  role: string;
}

export const useAuthStore = defineStore(
  "auth",
  () => {
    // state
    const user = ref<User | undefined>();
    const token = ref<string | undefined>();

    // actions
    async function login(username: string, password: string) {
      const res: Auth = await $fetch("/api/auth/login", {
        method: "POST",
        body: { username, password },
      });

      console.log(res);

      user.value = { username: res.user.username, email: res.user.email, role: res.user.role };
      token.value = res.user.token;
    }

    function logout() {
      user.value = undefined;
      token.value = undefined;
    }

    // async function fetchUser() {
    //   if (!token.value) return
    //   try {
    //     const data = await $fetch("/api/auth/me", {
    //       headers: { Authorization: `Bearer ${token.value}` },
    //     })
    //     user.value = data.user
    //   } catch (e) {
    //     logout()
    //   }
    // }

    // expose
    return {
      user,
      token,
      login,
      logout,
      // fetchUser,
    };
  },
  {
    persist: true, // ใช้ pinia-plugin-persistedstate
  }
);
