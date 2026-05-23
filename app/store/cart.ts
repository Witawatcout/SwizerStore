import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
  id: string        // ✅ เปลี่ยนจาก number เป็น string
  name: string
  price: number
  image: string
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const isOpen = ref(false)

  const totalItems = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0)
  )
  const totalPrice = computed(() =>
    items.value.reduce((total, item) => total + item.price * item.quantity, 0)
  )

  function addItem(
    product: { id: string | number; name: string; price: number | string; image?: string },
    quantity = 1
  ) {
    const productId = String(product.id)           // ✅ ใช้ String() ไม่ใช่ Number()
    const productPrice = Number(product.price)     // ✅ แปลง price string → number

    const existingIndex = items.value.findIndex(i => i.id === productId)

    if (existingIndex !== -1) {
      const updated = [...items.value]
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity
      }
      items.value = updated
    } else {
      items.value = [...items.value, {
        id: productId,
        name: product.name,
        price: productPrice,
        image: product.image ?? '',
        quantity,
      }]
    }
  }

  function removeItem(id: string | number) {
    const targetId = String(id)                   // ✅ String()
    items.value = items.value.filter(i => i.id !== targetId)
  }

  function updateQuantity(id: string | number, quantity: number) {
    const targetId = String(id)                   // ✅ String()
    if (quantity <= 0) {
      removeItem(targetId)
      return
    }
    const updated = [...items.value]
    const index = updated.findIndex(i => i.id === targetId)
    if (index !== -1) {
      updated[index] = { ...updated[index], quantity }
      items.value = updated
    }
  }

  function clearCart() {
    items.value = []
  }

  function openCart() {
    isOpen.value = true
  }

  function closeCart() {
    isOpen.value = false
  }

  function toggleCart() {
    isOpen.value = !isOpen.value
  }

  return {
    items,
    isOpen,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
  }
}, {
  persist: {
    pick: ['items'],
  },
})