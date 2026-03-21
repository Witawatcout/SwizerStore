<script setup lang="ts">
import { useAuthStore } from "@/store/auth";
const auth = useAuthStore();

const username = ref("");
const password = ref("");

async function handleLogin() {
  try {
    await auth.login(username.value, password.value);
    navigateTo("/");
  } catch (err) {
    alert("Login failed");
  }
}
</script>

<template>
  <div>
    <input v-model="username" placeholder="Username" />
    <input v-model="password" type="password" placeholder="Password" />
    <button @click="handleLogin">Login</button>
  </div>
</template>
