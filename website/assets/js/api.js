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

  localStorage.removeItem(
    "currentUser"
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
        method:"POST",

        headers:{
          "Content-Type":
          "application/json"
        },

        body:JSON.stringify({
          email,
          password
        })
      }
    );

  const data =
    await response.json();

  if(!response.ok){
    throw new Error(
      data.error ||
      "Login failed"
    );
  }

  setToken(data.token);

  localStorage.setItem(
    "currentUser",
    JSON.stringify(
      data.user
    )
  );

  return data;
}

export async function signupUser(
  name,
  email,
  password,
  passwordConfirmation
) {
  const response =
    await fetch(
      `${API_BASE_URL}/signup`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          user: {
            name,
            email,
            password,
            password_confirmation:
              passwordConfirmation,
          },
        }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.errors?.[0] ||
      data.error ||
      "Signup failed"
    );
  }

  setToken(data.token);
    localStorage.setItem(
    "currentUser",
    JSON.stringify(
      data.user
    )
  );
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

export async function fetchCollections() {
  return request("/collections");
}

export async function createCollection(name) {
  return request(
    "/collections",
    {
      method: "POST",
      body: JSON.stringify({
        collection: {
          name: name,
        },
      }),
    }
  );
}

export async function deleteCollection(id) {
  return request(
    `/collections/${id}`,
    {
      method: "DELETE",
    }
  );
}

export async function updateClip(id, data) {
  return request(
    `/clips/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        clip: data,
      }),
    }
  );
}

export async function fetchAiMemory() {
  return request(
    "/clips/ai_memory"
  );
}

export async function toggleCollectionPin(id) {
  return request(
    `/collections/${id}/toggle_pin`,
    {
      method: "PATCH",
    }
  );
}

export async function bulkUpdateClips(
  clipIds,
  collectionId
) {
  return request(
    "/clips/bulk_update",
    {
      method: "PATCH",

      body: JSON.stringify({
        clip_ids: clipIds,
        collection_id: collectionId,
      }),
    }
  );
}

export async function bulkDeleteClips(
  clipIds
) {
  return request(
    "/clips/bulk_delete",
    {
      method: "DELETE",

      body: JSON.stringify({
        clip_ids: clipIds,
      }),
    }
  );
}

export async function fetchRelatedClips(id) {
  return request(
    `/clips/${id}/related`
  );
}

export async function togglePin(id) {
  return request(
    `/clips/${id}/toggle_pin`,
    {
      method: "PATCH",
    }
  );
} 

export function getCurrentUser() {
  return JSON.parse(
    localStorage.getItem(
      "currentUser"
    )
  );
}