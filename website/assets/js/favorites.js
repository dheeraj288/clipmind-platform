import {
  fetchClips,
  getToken,
  logout,
  toggleFavorite,
  deleteClip,
  incrementCopy,
} from "./api.js";

const list =
  document.getElementById(
    "favorites-list"
  );

const logoutBtn =
  document.getElementById(
    "logout-btn"
  );

let favorites = [];

if (!getToken()) {
  window.location.href =
    "login.html";
}

logoutBtn?.addEventListener(
  "click",
  () => logout()
);

function escapeHtml(text = "") {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderFavorites(items = []) {

  if (!items.length) {

    list.innerHTML = `
      <div class="empty-state">
        No favorite clips yet ⭐
      </div>
    `;

    return;
  }

  list.innerHTML =
    items.map((clip) => `

      <div
        class="web-clip-card"
        data-id="${clip.id}"
      >

        <div class="clip-meta">

          <span class="type-badge">
            ${clip.clip_type || "text"}
          </span>

          <span>
            📋 ${clip.copy_count || 0}
          </span>

        </div>

        ${
          clip.clip_type === "code"
            ? `
              <pre class="web-code-block"><code>${escapeHtml(
                clip.content || ""
              )}</code></pre>
            `
            : `
              <div class="clip-content">
                ${escapeHtml(clip.content || "")}
              </div>
            `
        }

        <div class="web-card-actions">

          <button
            class="web-action-btn"
            data-copy="${clip.id}"
          >
            Copy
          </button>

          <button
            class="web-action-btn"
            data-unfav="${clip.id}"
          >
            ⭐ Remove
          </button>

          <button
            class="web-action-btn delete-btn"
            data-delete="${clip.id}"
          >
            Delete
          </button>

        </div>

      </div>

    `).join("");
}

async function loadFavorites() {

  try {

    const response =
      await fetchClips();

    const clips =
      Array.isArray(response)
        ? response
        : response.clips || [];

    favorites =
      clips.filter(
        (clip) => clip.is_favorite
      );

    renderFavorites(
      favorites
    );

  } catch (err) {

    console.error(err);

    list.innerHTML = `
      <div class="empty-state">
        Failed to load favorites ❌
      </div>
    `;
  }
}

list?.addEventListener(
  "click",

  async (e) => {

    const copyId =
      e.target.dataset.copy;

    const unfavId =
      e.target.dataset.unfav;

    const deleteId =
      e.target.dataset.delete;

    /* COPY */
    if (copyId) {

      const clip =
        favorites.find(
          (item) =>
            String(item.id) ===
            String(copyId)
        );

      if (!clip) return;

      await navigator.clipboard.writeText(
        clip.content || ""
      );

      await incrementCopy(
        copyId
      );

      await loadFavorites();

      return;
    }

    /* REMOVE FAVORITE */
    if (unfavId) {

      await toggleFavorite(
        unfavId
      );

      await loadFavorites();

      return;
    }

    /* DELETE */
    if (deleteId) {

      await deleteClip(
        deleteId
      );

      await loadFavorites();
    }
  }
);

loadFavorites();