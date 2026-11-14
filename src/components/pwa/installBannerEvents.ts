/** User-initiated installation invitations bypass automatic dismissal/snooze. */
export const PUBLIC_INSTALL_EVENT = "tnt:open-public-install";
export const ADMIN_INSTALL_EVENT = "tnt:open-admin-install";

export function openPublicInstallBanner(): void {
  window.dispatchEvent(new Event(PUBLIC_INSTALL_EVENT));
}

export function openAdminInstallBanner(): void {
  window.dispatchEvent(new Event(ADMIN_INSTALL_EVENT));
}
