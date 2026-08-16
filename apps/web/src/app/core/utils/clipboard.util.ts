import { signal } from '@angular/core';

export function createClipboard() {
  const isCopied = signal(false);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    isCopied.set(true);
    setTimeout(() => isCopied.set(false), 2000);
  }

  return {
    isCopied,
    copy
  };
}
