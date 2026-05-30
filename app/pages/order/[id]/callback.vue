<script setup lang="ts">
const route = useRoute()
await navigateTo(`/order/${route.params.id}/success`, { replace: true })
</script>

<template>
  <div />
</template>
