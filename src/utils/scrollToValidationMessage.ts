/** Scroll and focus the first visible validation message after React commits it. */
export function scrollToValidationMessage(container: HTMLElement | null): void {
  if (!container) return;
  requestAnimationFrame(() => {
    if (!container.isConnected) return;
    container.scrollIntoView({ behavior: "smooth", block: "center" });
    container.focus({ preventScroll: true });
  });
}
