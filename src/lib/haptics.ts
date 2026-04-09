const INTERACTIVE_SELECTOR = [
  "button",
  "a[href]",
  "[role='button']",
  "input[type='button']",
  "input[type='submit']",
  "input[type='reset']",
  "summary",
  "[data-haptic='true']",
].join(", ");

let lastHapticAt = 0;

export function triggerHaptic(pattern: number | number[] = 10) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }

  const now = Date.now();
  if (now - lastHapticAt < 35) {
    return;
  }
  lastHapticAt = now;

  navigator.vibrate(pattern);
}

export function setupGlobalHaptics() {
  if (typeof document === "undefined") {
    return () => undefined;
  }

  const onPointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const interactive = target.closest(INTERACTIVE_SELECTOR);
    if (!interactive) {
      return;
    }

    if (interactive.closest("[disabled], [aria-disabled='true']")) {
      return;
    }

    triggerHaptic();
  };

  document.addEventListener("pointerdown", onPointerDown, true);
  return () => document.removeEventListener("pointerdown", onPointerDown, true);
}
