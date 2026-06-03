<template>
  <div
    class="relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-neutral-100 bg-white p-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)]"
    aria-hidden="true"
  >
    <USkeleton class="mb-8 aspect-square rounded-[2.2rem]" />

    <div class="flex flex-1 flex-col px-2">
      <div class="mb-4 space-y-3">
        <USkeleton class="h-3 w-28 rounded-full" />
        <USkeleton class="h-7 w-4/5 rounded-full" />
        <USkeleton class="h-7 w-3/5 rounded-full" />
      </div>

      <div class="mb-8 flex-1 space-y-2">
        <USkeleton class="h-4 w-full rounded-full" />
        <USkeleton class="h-4 w-3/4 rounded-full" />
      </div>

      <div class="flex items-center justify-between border-t border-neutral-100/80 pt-6">
        <div class="space-y-2">
          <USkeleton class="h-3 w-12 rounded-full" />
          <USkeleton class="h-7 w-24 rounded-full" />
        </div>
        <USkeleton class="size-14 rounded-2xl" />
      </div>
    </div>
  </div>
</template>
