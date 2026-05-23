export function useFlyToCart() {
    function fly(fromEl: HTMLElement) {
        const cartEl = document.querySelector('[data-cart-icon]') as HTMLElement
        if (!cartEl) return

        const from = fromEl.getBoundingClientRect()
        const to = cartEl.getBoundingClientRect()

        const dot = document.createElement('div')
        dot.style.cssText = `
      position: fixed;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #4ade80;
      pointer-events: none;
      z-index: 9999;
      left: ${from.left + from.width / 2 - 11}px;
      top: ${from.top + from.height / 2 - 11}px;
      transition: none;
      box-shadow: 0 0 10px rgba(74, 222, 128, 0.6);
    `
        document.body.appendChild(dot)

        dot.getBoundingClientRect()

        dot.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)'  // ⬆️ 0.65s → 1s
        dot.style.left = `${to.left + to.width / 2 - 11}px`
        dot.style.top = `${to.top + to.height / 2 - 11}px`
        dot.style.width = '8px'      // ⬆️ 6px → 8px ตอนหด
        dot.style.height = '8px'
        dot.style.opacity = '0'
        dot.style.transform = 'scale(0)'

        setTimeout(() => {
            document.body.removeChild(dot)
            cartEl.classList.add('cart-pulse')
            setTimeout(() => cartEl.classList.remove('cart-pulse'), 400)
        }, 1000)  // ⬆️ ให้ตรงกับ duration
    }

    return { fly }
}