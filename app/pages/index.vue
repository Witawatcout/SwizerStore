<template>
  <div>
    <h1>หน้าหลัก</h1>
    <p>ยินดีต้อนรับเข้าสู่ระบบ user: {{ auth.user?.username }} 🚀</p>
    <p>token {{ auth.user }}</p>
  </div>
</template>
<script setup lang="ts">
import { useAuthStore } from "@/store/auth";
const auth = useAuthStore();
</script>