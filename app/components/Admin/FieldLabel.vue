<script setup lang="ts">
defineProps<{
  label: string
  tooltip: string
}>()
</script>

<template>
  <span class="inline-flex items-center gap-1.5">
    <span>{{ label }}</span>
    <UPopover
      mode="click"
      arrow
      :content="{ side: 'top', sideOffset: 8, collisionPadding: 12 }"
      :ui="{ content: 'max-w-xs p-3' }"
    >
      <button
        type="button"
        class="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        :aria-label="`คำอธิบายช่อง ${label}`"
        @click.stop.prevent
      >
        <UIcon name="i-lucide-circle-help" class="size-4" />
      </button>

      <template #content>
        <div class="flex max-w-xs items-start gap-2.5 text-left">
          <UIcon name="i-lucide-info" class="mt-0.5 size-4 shrink-0 text-primary" />
          <p class="whitespace-normal text-sm leading-6 text-default">{{ tooltip }}</p>
        </div>
      </template>
    </UPopover>
  </span>
</template>
