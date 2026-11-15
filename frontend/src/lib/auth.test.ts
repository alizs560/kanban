import { describe, expect, it, beforeEach } from "vitest";
import {
  authenticateUser,
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  isAuthenticatedSession,
  saveAuthSession,
} from "./auth";

describe("auth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("authenticateUser", () => {
    it("returns success and token for valid credentials", () => {
      const result = authenticateUser("user", "password");
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.token?.startsWith("token-user-")).toBe(true);
      expect(result.user?.username).toBe("user");
    });

    it("rejects incorrect password", () => {
      const result = authenticateUser("user", "wrong-password");
      expect(result.success).toBe(false);
      expect(result.error).toBe("invalid_credentials");
      expect(result.token).toBeUndefined();
    });

    it("rejects incorrect username", () => {
      const result = authenticateUser("admin", "password");
      expect(result.success).toBe(false);
      expect(result.error).toBe("invalid_credentials");
    });

    it("handles whitespace in credentials gracefully", () => {
      const result = authenticateUser(" user ", " password ");
      expect(result.success).toBe(true);
    });

    it("rejects empty credentials", () => {
      const result = authenticateUser("", "");
      expect(result.success).toBe(false);
    });
  });

  describe("session storage", () => {
    it("saves and retrieves session properly", () => {
      expect(isAuthenticatedSession()).toBe(false);
      expect(getStoredToken()).toBeNull();
      expect(getStoredUser()).toBeNull();

      saveAuthSession("token-user-123", { username: "user" });

      expect(isAuthenticatedSession()).toBe(true);
      expect(getStoredToken()).toBe("token-user-123");
      expect(getStoredUser()).toEqual({ username: "user" });
    });

    it("clears session on logout", () => {
      saveAuthSession("token-user-123", { username: "user" });
      expect(isAuthenticatedSession()).toBe(true);

      clearAuthSession();

      expect(isAuthenticatedSession()).toBe(false);
      expect(getStoredToken()).toBeNull();
      expect(getStoredUser()).toBeNull();
    });
  });
});
