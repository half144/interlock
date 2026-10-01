export const COMPOSER_ID = "composer-input";

export function focusComposer(prefill?: string) {
  const input = document.getElementById(COMPOSER_ID) as HTMLTextAreaElement | null;
  if (!input) return;
  if (prefill && !input.value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
    setter?.call(input, prefill);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}
