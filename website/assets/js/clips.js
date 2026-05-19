import {
  showToast,
} from "./toast.js";

import {
  fetchClips,
  getToken,
  logout,
  toggleFavorite,
  deleteClip,
  incrementCopy,
  fetchCollections,
  updateClip,
} from "./api.js";

const list =
  document.getElementById("clips-list");

const search =
  document.getElementById("clip-search");

const logoutBtn =
  document.getElementById("logout-btn");

let clips = [];
let collections = [];

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

        <div class="collection-select-wrap">

          <select
            class="collection-select"
            data-collection="${clip.id}"
          >

            <option value="">
              No Collection
            </option>

            ${collections.map((collection) => `
              <option
                value="${collection.id}"
                ${
                  String(clip.collection_id || "") ===
                  String(collection.id)
                    ? "selected"
                    : ""
                }
              >
                ${escapeHtml(collection.name)}
              </option>
            `).join("")}

          </select>

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
    const [
      clipsResponse,
      collectionsResponse,
    ] = await Promise.all([
      fetchClips(),
      fetchCollections(),
    ]);

    clips =
      Array.isArray(clipsResponse)
        ? clipsResponse
        : clipsResponse.clips || [];

    collections =
      Array.isArray(collectionsResponse)
        ? collectionsResponse
        : [];

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

      showToast("Copied ✔");

      renderClips(clips);

      return;
    }

    if (favId) {
      await toggleFavorite(favId);

      showToast("Favorite updated ⭐");

      await loadClips();

      return;
    }

    if (deleteId) {
      await deleteClip(deleteId);

      showToast("Deleted 🗑");

      await loadClips();
    }
  }
);

list.addEventListener(
  "change",
  async (e) => {
    const clipId =
      e.target.dataset.collection;

    if (!clipId) return;

    const collectionId =
      e.target.value || null;

    await updateClip(
      clipId,
      {
        collection_id: collectionId,
      }
    );

    const clip =
      clips.find(
        (item) =>
          String(item.id) === String(clipId)
      );

    if (clip) {
      clip.collection_id =
        collectionId;
    }

    showToast("Collection updated 📚");

    renderClips(clips);
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