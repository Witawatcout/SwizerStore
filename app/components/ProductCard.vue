<script setup lang="ts">
import { useCartStore } from '~/store/cart'

const props = defineProps<{
  product: {
    id: string
    name: string
    description: string
    price: number | string
    sale_price?: number | string | null
    image: string
    badge?: string
    is_featured?: number | boolean
    unit?: string
  }
}>()

const cartStore = useCartStore()
const added = ref(false)  // ✅ เพิ่ม state
const { fly } = useFlyToCart()
const btnRef = ref<HTMLElement | null>(null)
const regularPrice = computed(() => Number(props.product.price || 0))
const salePrice = computed(() => Number(props.product.sale_price || 0))
const hasSalePrice = computed(() => salePrice.value > 0 && salePrice.value < regularPrice.value)
const effectivePrice = computed(() => hasSalePrice.value ? salePrice.value : regularPrice.value)
const discountPercent = computed(() => hasSalePrice.value
  ? Math.round((1 - salePrice.value / regularPrice.value) * 100)
  : 0
)
const plainDescription = computed(() =>
  String(props.product.description || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
)
const addToCart = () => {

  if (added.value) return  // กันกด spam

  cartStore.addItem({
    id: props.product.id,
    name: props.product.name,
    price: effectivePrice.value,
    image: props.product.image
  })

  // ✅ trigger animation
  added.value = true
  setTimeout(() => {
    added.value = false
  }, 1500)

  if (btnRef.value) fly(btnRef.value)
}
</script>

<template>
  <NuxtLink :to="`/products/${product.id}`"
    class="group relative bg-white rounded-[2.5rem] p-4 transition-all duration-500 hover:-translate-y-2 transform-gpu border border-neutral-100 hover:border-primary-200/50 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(66,105,0,0.15)] flex flex-col h-full overflow-hidden">
    <!-- Image Wrapper -->
    <div
      class="relative aspect-square rounded-[2.2rem] bg-neutral-50/50 overflow-hidden mb-8 shadow-inner group-hover:shadow-none transition-all duration-700">
      <img :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110 will-change-transform"
        :src="product.image" loading="lazy" />

      <div v-if="product.badge || hasSalePrice || product.is_featured" class="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
        <span
          v-if="product.badge"
          class="px-4 py-1.5 bg-primary-600/10 backdrop-blur-md border border-primary-600/20 text-primary-700 rounded-full text-[10px] font-black tracking-[0.1em] uppercase shadow-sm">
          {{ product.badge }}
        </span>
        <span
          v-if="product.is_featured"
          class="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-white/90 px-3 py-1.5 text-[10px] font-black text-warning shadow-sm backdrop-blur-md">
          <UIcon name="i-lucide-star" class="size-3" /> แนะนำ
        </span>
        <span
          v-if="hasSalePrice"
          class="rounded-full border border-error/25 bg-error/90 px-3 py-1.5 text-[10px] font-black text-white shadow-sm backdrop-blur-md">
          ลด {{ discountPercent }}%
        </span>
      </div>

      <div
        class="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10 hidden md:block">
        <div
          class="w-full py-3 bg-white/90 backdrop-blur-xl rounded-2xl text-center text-xs font-bold text-neutral-900 shadow-xl border border-white/20">
          QUICK VIEW
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="px-2 flex flex-col flex-grow">
      <div class="mb-4">
        <span class="text-[10px] font-bold text-primary-500 uppercase tracking-[0.2em] mb-2 block">Premium
          Superfood</span>
        <h3
          class="font-headline text-2xl font-black text-neutral-950 leading-[1.2] group-hover:text-primary-700 transition-colors line-clamp-2 min-h-[58px]">
          {{ product.name }}
        </h3>
      </div>

      <p
        class="text-neutral-500 text-sm leading-relaxed line-clamp-2 font-medium mb-8 flex-grow opacity-80 group-hover:opacity-100 transition-opacity">
        {{ plainDescription }}
      </p>

      <!-- Bottom Bar -->
      <div class="pt-6 border-t border-neutral-100/80 flex items-center justify-between">
        <div class="flex flex-col">
          <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Price</span>
          <span v-if="hasSalePrice" class="text-xs font-semibold text-neutral-400 line-through">฿{{ regularPrice.toLocaleString() }}</span>
          <span class="text-2xl font-black tracking-tighter" :class="hasSalePrice ? 'text-error' : 'text-neutral-900'">
            <span class="text-sm mr-0.5 font-bold italic" :class="hasSalePrice ? 'text-error' : 'text-primary-600'">฿</span>{{ effectivePrice.toLocaleString() }}
          </span>
        </div>

        <!-- ✅ ปุ่มที่มี animation -->
        <button @click.stop.prevent="addToCart" :class="[
          'w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 transform-gpu cursor-pointer z-20',
          added
            ? 'bg-primary-600 scale-110 shadow-primary-600/30'
            : 'bg-neutral-950 group-hover:bg-primary-600 group-hover:scale-110 shadow-neutral-950/10 group-hover:shadow-primary-600/20'
        ]" ref="btnRef">
          <Transition name="cart-icon" mode="out-in">
            <!-- ✅ ไอคอน + -->
            <Icon v-if="!added" key="plus" name="mynaui:plus" class="text-2xl text-white" />
            <!-- ✅ ไอคอน ✓ -->
            <Icon v-else key="check" name="mynaui:check" class="text-2xl text-white" />
          </Transition>
        </button>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
/* ✅ Animation เปลี่ยนไอคอน */
.cart-icon-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cart-icon-leave-active {
  transition: all 0.15s ease-in;
}

.cart-icon-enter-from {
  opacity: 0;
  transform: scale(0.3) rotate(-20deg);
}

.cart-icon-leave-to {
  opacity: 0;
  transform: scale(0.3) rotate(20deg);
}
</style>
