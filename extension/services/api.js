const API_BASE_URL = "http://localhost:3000/api/v1";

import { getToken, logoutUser } from "./auth.js";

async function request(url, options = {}) {
  const token = await getToken();

  if (!token) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(url, {
    ...options,

    headers: {
      "Content-Type": "application/json",

      Authorization: `Bearer ${token}`,

      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (response.status === 401) {
    await logoutUser();

    throw new Error("Session expired");
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      "API Error"
    );
  }

  return data;
}

/* FETCH */
export async function fetchClips() {
  const res = await request(`${API_BASE_URL}/clips`);
  return res.clips || res;
}

/* DELETE */
export async function deleteClipApi(id) {
  return request(`${API_BASE_URL}/clips/${id}`, {
    method: "DELETE",
  });
}

/* FAVORITE */
export async function toggleFavoriteApi(id) {
  return request(`${API_BASE_URL}/clips/${id}/toggle_favorite`, {
    method: "PATCH",
  });
}

/* INCREMENT COPY COUNT (IMPORTANT FIX) */
export async function incrementCopyApi(id) {
  return request(`${API_BASE_URL}/clips/${id}/increment_copy`, {
    method: "PATCH",
  });
}