export const COMPOSER_PREFILL = "interlock:composer-prefill";

/** Asks the conversation's composer to take focus, starting from `prefill` when it is empty. */
export const focusComposer = (prefill = "") =>
  window.dispatchEvent(new CustomEvent<string>(COMPOSER_PREFILL, { detail: prefill }));
