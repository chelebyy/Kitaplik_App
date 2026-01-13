import { useEffect } from "react";

declare global {
  // eslint-disable-next-line no-var
  var frameworkReady: (() => void) | undefined;
}

export function useFrameworkReady() {
  useEffect(() => {
    globalThis.frameworkReady?.();
  }, []);
}
