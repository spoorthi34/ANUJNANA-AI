export function oauthReturnPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) return "/";
  // A fixed parsing origin keeps validation independent of the current page.
  const origin = "https://app.invalid";
  try {
    const target = new URL(value, origin);
    if (target.origin !== origin || target.pathname.startsWith("//")) return "/";
    return target.pathname + target.search + target.hash;
  } catch {
    return "/";
  }
}

const PENDING_NEXT_KEY = "anujnana-auth-next";

/** Validated in-app path to open after sign-in; falls back to the dashboard. */
export function postLoginPath(rawNext: string | null): string {
  const path = oauthReturnPath(rawNext);
  return path === "/" ? "/dashboard" : path;
}

/** Remember the return path across a social sign-in redirect. */
export function rememberPendingNext(path: string) {
  try {
    if (path === "/dashboard") sessionStorage.removeItem(PENDING_NEXT_KEY);
    else sessionStorage.setItem(PENDING_NEXT_KEY, path);
  } catch {
    /* storage unavailable */
  }
}

export function takePendingNext(): string | null {
  try {
    const value = sessionStorage.getItem(PENDING_NEXT_KEY);
    sessionStorage.removeItem(PENDING_NEXT_KEY);
    return value;
  } catch {
    return null;
  }
}
