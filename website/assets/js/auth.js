import {
  getToken,
} from "./api.js";

export function requireAuth() {
  if (!getToken()) {
    window.location.href =
      "login.html";
  }
}

export function redirectIfLoggedIn() {
  if (getToken()) {
    window.location.href =
      "clips.html";
  }
}