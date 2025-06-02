const isBrowser = () =>
  typeof window !== "undefined" && typeof localStorage !== "undefined";

export function isLoggedIn(): boolean {
  if (!isBrowser()) return false;
  try {
    const token = localStorage.getItem("token");
    return !!token && token !== "";
  } catch (e) {
    console.error("Error accessing localStorage:", e);
    return false;
  }
}

export function getUserRole(): string {
  if (!isBrowser()) return "user";
  try {
    const role = localStorage.getItem("userRole");
    return role || "user";
  } catch (e) {
    console.error("Error accessing localStorage:", e);
    return "user";
  }
}

export function getUserId(): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem("userId");
  } catch (e) {
    console.error("Error accessing localStorage:", e);
    return null;
  }
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem("token");
  } catch (e) {
    console.error("Error accessing localStorage:", e);
    return null;
  }
}

export function setAuthData(
  token: string,
  user: { id: string; role: string }
): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", user.role.toLowerCase()); // Pastikan role dalam huruf kecil
    localStorage.setItem("userId", user.id);
    console.log("Auth data saved to localStorage");
  } catch (e) {
    console.error("Error saving to localStorage:", e);
  }
}

export function clearAuth(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    console.log("Auth data cleared from localStorage");
  } catch (e) {
    console.error("Error clearing localStorage:", e);
  }
}
