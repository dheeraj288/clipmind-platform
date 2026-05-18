const API_BASE_URL =
  "http://localhost:3000/api/v1";

/* TOKEN */
export function getToken() {
  return localStorage.getItem(
    "token"
  );
}

export function setToken(token) {
  localStorage.setItem(
    "token",
    token
  );
}

export function logout() {

  localStorage.removeItem(
    "token"
  );

  window.location.href =
    "login.html";
}

/* REQUEST */
export async function request(
  endpoint,
  options = {}
) {

  const token = getToken();

  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,

          ...(options.headers || {}),
        },
      }
    );

  const data =
    await response.json();

  if (response.status === 401) {

    logout();

    throw new Error(
      "Unauthorized"
    );
  }

  if (!response.ok) {

    throw new Error(
      data.error ||
      data.message ||
      "API Error"
    );
  }

  return data;
}

/* LOGIN */
export async function loginUser(
  email,
  password
) {

  const response =
    await fetch(
      `${API_BASE_URL}/login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(
      data.error ||
      "Login failed"
    );
  }

  setToken(data.token);

  return data;
}

/* FETCH CLIPS */
export async function fetchClips() {

  return request("/clips");
}

/* TRENDING */
export async function fetchTrending() {

  return request(
    "/clips/trending"
  );
}

export async function toggleFavorite(id) {
  return request(
    `/clips/${id}/toggle_favorite`,
    {
      method: "PATCH",
    }
  );
}

export async function deleteClip(id) {
  return request(
    `/clips/${id}`,
    {
      method: "DELETE",
    }
  );
}

export async function incrementCopy(id) {
  return request(
    `/clips/${id}/increment_copy`,
    {
      method: "PATCH",
    }
  );
}