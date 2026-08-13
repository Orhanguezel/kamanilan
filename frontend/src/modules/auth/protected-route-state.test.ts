import { describe, expect, test } from "bun:test";
import {
  canRenderProtectedRoute,
  shouldRedirectFromProtectedRoute,
} from "./protected-route-state";

describe("protected route hydration", () => {
  test("waits for persisted auth state before redirecting or rendering", () => {
    const state = { hasHydrated: false, isAuthenticated: false };
    expect(shouldRedirectFromProtectedRoute(state)).toBe(false);
    expect(canRenderProtectedRoute(state)).toBe(false);
  });

  test("renders authenticated users after hydration", () => {
    const state = { hasHydrated: true, isAuthenticated: true };
    expect(shouldRedirectFromProtectedRoute(state)).toBe(false);
    expect(canRenderProtectedRoute(state)).toBe(true);
  });

  test("redirects unauthenticated users only after hydration", () => {
    const state = { hasHydrated: true, isAuthenticated: false };
    expect(shouldRedirectFromProtectedRoute(state)).toBe(true);
    expect(canRenderProtectedRoute(state)).toBe(false);
  });
});
