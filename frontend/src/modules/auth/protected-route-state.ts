interface ProtectedRouteState {
  hasHydrated: boolean;
  isAuthenticated: boolean;
}

export function shouldRedirectFromProtectedRoute({
  hasHydrated,
  isAuthenticated,
}: ProtectedRouteState): boolean {
  return hasHydrated && !isAuthenticated;
}

export function canRenderProtectedRoute({
  hasHydrated,
  isAuthenticated,
}: ProtectedRouteState): boolean {
  return hasHydrated && isAuthenticated;
}
