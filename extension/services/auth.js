import { API_BASE_URL } from "./config.js";

/* SAFE JSON PARSER */
async function safeJson(response) {
  try {
    return await response.json();
  } catch (e) {
    return {};
  }
}

/* LOGIN */
export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await safeJson(response);

  if (!response.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      "Invalid email or password"
    );
  }

  if (!data.token) {
    throw new Error("Token missing from server response");
  }

  await chrome.storage.local.set({
    token: data.token,
    currentUser: data.user || null,
  });

  return data;
}

/* SIGNUP */
export async function signupUser(payload) {
  const response = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user: payload,
    }),
  });

  const data = await safeJson(response);

  if (!response.ok) {
    const message =
      data?.errors?.join(", ") ||
      data?.error ||
      data?.message ||
      "Signup failed";

    throw new Error(message);
  }

  if (!data.token) {
    throw new Error("Token missing from server response");
  }

  await chrome.storage.local.set({
    token: data.token,
    currentUser: data.user || null,
  });

  return data;
}

/* LOGOUT */
export async function logoutUser() {
  await chrome.storage.local.remove(["token", "currentUser"]);
}

/* GET TOKEN */
export async function getToken() {
  const result = await chrome.storage.local.get("token");
  return result.token;
}

/* GET USER */
export async function getCurrentUser() {
  const result = await chrome.storage.local.get("currentUser");
  return result.currentUser;
}