export default defineNuxtPlugin(() => {
  const debugState = {
    active: false,
    reducedMotion: false,
    wheelEvents: 0,
    skippedScrollableParent: 0,
  };
  Object.defineProperty(window, "__swizerSmoothScroll", {
    value: debugState,
    configurable: true,
  });

  debugState.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  debugState.active = true;

  let currentY = window.scrollY;
  let targetY = window.scrollY;
  let frame = 0;
  let isAnimating = false;
  const lerp = 0.06;
  const wheelStrength = 0.72;

  function maxScrollY() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function clampScroll(value: number) {
    return Math.max(0, Math.min(maxScrollY(), value));
  }

  function normalizedDelta(event: WheelEvent) {
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 18;
    if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight;
    return event.deltaY;
  }

  function hasScrollableParent(element: Element | null) {
    let current = element;

    while (current && current !== document.body && current !== document.documentElement) {
      const style = window.getComputedStyle(current);
      const rect = current.getBoundingClientRect();
      const isViewportLike = rect.height >= window.innerHeight - 4;
      const canScrollY =
        /(auto|scroll)/.test(style.overflowY) &&
        current.scrollHeight > current.clientHeight &&
        !isViewportLike;

      if (canScrollY) return true;
      current = current.parentElement;
    }

    return false;
  }

  function tick() {
    const diff = targetY - currentY;
    currentY += diff * lerp;

    if (Math.abs(diff) < 0.35) {
      currentY = targetY;
      window.scrollTo(0, currentY);
      frame = 0;
      isAnimating = false;
      return;
    }

    window.scrollTo(0, currentY);
    frame = window.requestAnimationFrame(tick);
  }

  function startAnimation() {
    if (frame) return;
    isAnimating = true;
    frame = window.requestAnimationFrame(tick);
  }

  function onWheel(event: WheelEvent) {
    if (event.defaultPrevented || event.ctrlKey || Math.abs(event.deltaY) < 1) return;
    debugState.wheelEvents += 1;
    if (event.target instanceof Element && hasScrollableParent(event.target)) {
      debugState.skippedScrollableParent += 1;
      return;
    }

    event.preventDefault();

    if (!isAnimating) {
      currentY = window.scrollY;
      targetY = currentY;
    }

    targetY = clampScroll(targetY + normalizedDelta(event) * wheelStrength);
    startAnimation();
  }

  function syncToNativeScroll() {
    if (isAnimating) return;
    currentY = window.scrollY;
    targetY = currentY;
  }

  function cancelSmoothScroll() {
    if (frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }

    isAnimating = false;
    currentY = window.scrollY;
    targetY = currentY;
  }

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("scroll", syncToNativeScroll, { passive: true });
  window.addEventListener("touchstart", cancelSmoothScroll, { passive: true });
  window.addEventListener("keydown", cancelSmoothScroll);
  window.addEventListener("resize", cancelSmoothScroll);
});
