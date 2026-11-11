/** One-time post-login route restoration; no credentials or form data stored. */
const KEY = "thenewstime.admin.return-path";

export function rememberAdminReturnPath(path: string): void {
  if (
    !path.startsWith("/admin") ||
    path.startsWith("/admin/login") ||
    path.startsWith("//")
  )
    return;
  try {
    sessionStorage.setItem(KEY, path);
  } catch {
    /* storage unavailable */
  }
}


export function consumeAdminReturnPath(): string | null {
  try {
    const path = sessionStorage.getItem(KEY);

    sessionStorage.removeItem(KEY);

    if (
      !path ||
      !path.startsWith("/admin") ||
      path.startsWith("/admin/login") ||
      path.startsWith("//")
    ) {
      return null;
    }

    return path;
  } catch {
    return null;
  }
}

