/**
 * Commerce stays disabled until card payments, shipping and fulfilment are ready.
 * Change this single flag only when the complete purchase flow is launched.
 */
export const COMMERCE_ENABLED = false;

export const DISABLED_COMMERCE_ROUTES = ["/sepet", "/odeme", "/siparis/basarili"] as const;

export function isCommerceRoute(pathname: string): boolean {
  return DISABLED_COMMERCE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
