import {
  fetchClips,
  getToken,
  logout,
  toggleFavorite,
  deleteClip,
  incrementCopy,
} from "./api.js";

const list =
  document.getElementById("clips-list");

const search =
  document.getElementById("clip-search");

const logoutBtn =
  document.getElementById("logout-btn");

let clips = [];

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

function renderClips(items = []) {
  if (!items.length) {
    list.innerHTML = `
      <div class="empty-state">
        No clips found
      </div>
    `;
    return;
  }

  list.innerHTML = items
    .map((clip) => `
      <div class="web-clip-card" data-id="${clip.id}">

        <div class="clip-meta">
          <span>
            ${clip.clip_type || "text"}
          </span>

          <span>
            📋 ${clip.copy_count || 0}
          </span>
        </div>

        <div class="clip-content">
          ${escapeHtml(clip.content || "")}
        </div>

        <div class="web-card-actions">

          <button
            class="web-action-btn copy-btn"
            data-copy="${clip.id}"
          >
            Copy
          </button>

          <button
            class="web-action-btn fav-btn"
            data-fav="${clip.id}"
          >
            ${clip.is_favorite ? "⭐ Favorited" : "☆ Favorite"}
          </button>

          <button
            class="web-action-btn delete-btn"
            data-delete="${clip.id}"
          >
            Delete
          </button>

        </div>

      </div>
    `)
    .join("");
}

async function loadClips() {
  try {
    const response =
      await fetchClips();

    clips =
      Array.isArray(response)
        ? response
        : response.clips || [];

    renderClips(clips);

  } catch (err) {
    console.error(err);

    list.innerHTML = `
      <div class="empty-state">
        Failed to load clips ❌
      </div>
    `;
  }
}

list.addEventListener(
  "click",
  async (e) => {
    const copyId =
      e.target.dataset.copy;

    const favId =
      e.target.dataset.fav;

    const deleteId =
      e.target.dataset.delete;

    if (copyId) {
      const clip =
        clips.find(
          (item) =>
            String(item.id) === String(copyId)
        );

      if (!clip) return;

      await navigator.clipboard.writeText(
        clip.content || ""
      );

      const res =
        await incrementCopy(copyId);

      clip.copy_count =
        res.copy_count;

      renderClips(clips);

      return;
    }

    if (favId) {
      await toggleFavorite(favId);
      await loadClips();
      return;
    }

    if (deleteId) {
      await deleteClip(deleteId);
      await loadClips();
    }
  }
);

search?.addEventListener(
  "input",
  (e) => {
    const query =
      e.target.value
        .toLowerCase()
        .trim();

    const filtered =
      clips.filter((clip) =>
        clip.content
          ?.toLowerCase()
          .includes(query)
      );

    renderClips(filtered);
  }
);

loadClips();