import {
  showToast,
} from "./toast.js";

import {
  fetchClips,
  getToken,
  logout,
  toggleFavorite,
  togglePin,
  deleteClip,
  incrementCopy,
  fetchCollections,
  updateClip,
  bulkUpdateClips,
  bulkDeleteClips,
  fetchRelatedClips,
} from "./api.js";

const list =
  document.getElementById("clips-list");

const search =
  document.getElementById("clip-search");

const logoutBtn =
  document.getElementById("logout-btn");

const bulkDeleteBtn =
  document.getElementById(
    "bulk-delete-btn"
  );

const bulkCollectionSelect =
  document.getElementById(
    "bulk-collection-select"
  );

let clips = [];
let collections = [];
let selectedClipIds = [];
let relatedMap = {};

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

function getCodeLanguage(clip) {
  const language =
    clip.language ||
    clip.clip_type ||
    "javascript";

  if (language === "ruby") return "ruby";
  if (language === "javascript") return "javascript";
  if (language === "js") return "javascript";
  if (language === "css") return "css";
  if (language === "html") return "markup";
  if (language === "erb") return "markup";
  if (language === "json") return "javascript";

  return "javascript";
}

function renderCodeBlock(clip) {
  return `
    <div class="web-code-wrapper">

      <pre
        class="web-code-block"
        id="code-${clip.id}"
      ><code class="language-${getCodeLanguage(clip)}">${escapeHtml(
        clip.content || ""
      )}</code></pre>

      <div class="code-controls">

        <button
          class="code-btn"
          data-toggle="${clip.id}"
        >
          Show More
        </button>

        <button
          class="code-btn"
          data-copy-code="${clip.id}"
        >
          Copy Code
        </button>

      </div>

    </div>
  `;
}

function fillBulkCollectionSelect() {
  if (!bulkCollectionSelect) return;

  bulkCollectionSelect.innerHTML = `
    <option value="">
      Move Selected To...
    </option>

    ${collections.map((collection) => `
      <option value="${collection.id}">
        ${escapeHtml(collection.name)}
      </option>
    `).join("")}
  `;
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

        <label class="bulk-check">

          <input
            type="checkbox"
            data-select="${clip.id}"
            ${
              selectedClipIds.includes(
                String(clip.id)
              )
                ? "checked"
                : ""
            }
          />

          <span>Select</span>

        </label>

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
            ? renderCodeBlock(clip)
            : `
              <div class="clip-content">
                ${escapeHtml(clip.content || "")}
              </div>
            `
        }

        ${
          clip.tags && clip.tags.length
            ? `
              <div class="tag-list">
                ${clip.tags.map((tag) => `
                  <span class="tag-pill">
                    #${escapeHtml(tag)}
                  </span>
                `).join("")}
              </div>
            `
            : ""
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

        <div class="web-card-actions premium-actions">

          <button
            class="web-action-btn action-copy"
            data-copy="${clip.id}"
          >
            📋 Copy
          </button>

          <button
            class="web-action-btn action-fav"
            data-fav="${clip.id}"
          >
            ${clip.is_favorite ? "⭐ Favorited" : "☆ Favorite"}
          </button>

          <button
            class="web-action-btn action-pin"
            data-pin="${clip.id}"
          >
            ${clip.is_pinned ? "📌 Pinned" : "📍 Pin"}
          </button>

          <button
            class="web-action-btn action-related"
            data-related="${clip.id}"
          >
            🔗 Related
          </button>

          <button
            class="web-action-btn action-delete"
            data-delete="${clip.id}"
          >
            🗑 Delete
          </button>

        </div>

        ${
          relatedMap[clip.id]
            ? `
              <div class="related-box">

                <h4>
                  Related Clips
                </h4>

                ${
                  relatedMap[clip.id].length
                    ? relatedMap[clip.id]
                        .map((item) => `
                            <div class="related-item">

                              <div class="related-meta">
                                <span>
                                  ${(item.clip_type || "text").toUpperCase()}
                                </span>

                                ${
                                  item.language
                                    ? `
                                      <span>
                                        ${escapeHtml(item.language)}
                                      </span>
                                    `
                                    : ""
                                }
                              </div>

                              ${
                                item.clip_type === "code"
                                  ? `
                                    <pre class="related-code-preview"><code class="language-${getCodeLanguage(
                                      item
                                    )}">${escapeHtml(
                                      item.content.slice(0, 220)
                                    )}</code></pre>
                                  `
                                  : `
                                    <div class="related-preview">
                                      ${escapeHtml(
                                        item.content.slice(0, 140)
                                      )}
                                    </div>
                                  `
                              }

                              ${
                                item.tags && item.tags.length
                                  ? `
                                    <div class="related-tags">
                                      ${item.tags.slice(0, 4).map((tag) => `
                                        <span>
                                          #${escapeHtml(tag)}
                                        </span>
                                      `).join("")}
                                    </div>
                                  `
                                  : ""
                              }

                              <div class="related-actions">

                                <button
                                  class="code-btn"
                                  data-open-related="${item.id}"
                                >
                                  Open
                                </button>

                              </div>

                            </div>
                          `)
                        .join("")
                    : `
                      <div class="related-item muted">
                        No related clips found
                      </div>
                    `
                }

              </div>
            `
            : ""
        }

      </div>
    `)
    .join("");

  if (window.Prism) {
    Prism.highlightAllUnder(list);
  }
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

    fillBulkCollectionSelect();

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

    const pinId =
      e.target.dataset.pin;

    const deleteId =
      e.target.dataset.delete;

    const toggleId =
      e.target.dataset.toggle;

    const relatedId =
      e.target.dataset.related;

    const openRelatedId =
      e.target.dataset.openRelated;

    const copyCodeId =
      e.target.dataset.copyCode;

    if (toggleId) {
      const code =
        document.getElementById(
          `code-${toggleId}`
        );

      if (!code) return;

      code.classList.toggle(
        "expanded"
      );

      e.target.textContent =
        code.classList.contains(
          "expanded"
        )
          ? "Hide"
          : "Show More";

      return;
    }

    if (pinId) {

      await togglePin(
        pinId
      );

      showToast(
        "Pin updated 📌"
      );

      await loadClips();

      return;
    }

    if (openRelatedId) {

      const targetCard =
        document.querySelector(
          `[data-id="${openRelatedId}"]`
        );

      if (!targetCard) {
        showToast(
          "Clip is not on this page"
        );

        return;
      }

      targetCard.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      targetCard.classList.add(
        "focused-card"
      );

      setTimeout(() => {
        targetCard.classList.remove(
          "focused-card"
        );
      }, 1400);

      return;
    }

    if (relatedId) {

      if (relatedMap[relatedId]) {
        delete relatedMap[relatedId];
        renderClips(clips);
        return;
      }

      const related =
        await fetchRelatedClips(
          relatedId
        );

      relatedMap[relatedId] =
        related;

      renderClips(clips);

      showToast(
        related.length
          ? `Related found: ${related.length}`
          : "No related clips"
      );

      return;
    }

    if (copyCodeId) {
      const clip =
        clips.find(
          (item) =>
            String(item.id) ===
            String(copyCodeId)
        );

      if (!clip) return;

      await navigator.clipboard.writeText(
        clip.content || ""
      );

      showToast(
        "Code copied ✔"
      );

      return;
    }

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

      selectedClipIds =
        selectedClipIds.filter(
          (id) => id !== String(deleteId)
        );

      showToast("Deleted 🗑");

      await loadClips();
    }
  }
);

list.addEventListener(
  "change",
  async (e) => {
    const selectId =
      e.target.dataset.select;

    if (selectId) {
      if (e.target.checked) {
        if (
          !selectedClipIds.includes(
            String(selectId)
          )
        ) {
          selectedClipIds.push(
            String(selectId)
          );
        }
      } else {
        selectedClipIds =
          selectedClipIds.filter(
            (id) => id !== String(selectId)
          );
      }

      return;
    }

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

bulkDeleteBtn?.addEventListener(
  "click",
  async () => {
    if (!selectedClipIds.length) {
      showToast("Select clips first");
      return;
    }

    await bulkDeleteClips(
      selectedClipIds
    );

    selectedClipIds = [];

    await loadClips();

    showToast(
      "Selected clips deleted 🗑"
    );
  }
);

bulkCollectionSelect?.addEventListener(
  "change",
  async (e) => {
    const collectionId =
      e.target.value;

    if (!collectionId) return;

    if (!selectedClipIds.length) {
      showToast("Select clips first");
      e.target.value = "";
      return;
    }

    await bulkUpdateClips(
      selectedClipIds,
      collectionId
    );

    selectedClipIds = [];

    e.target.value = "";

    await loadClips();

    showToast(
      "Selected clips moved 📚"
    );
  }
);

search?.addEventListener(
  "input",
  (e) => {
    const query =
      e.target.value
        .toLowerCase()
        .trim()
        .replace("#", "");

    const filtered =
      clips.filter((clip) => {
        const contentMatch =
          clip.content
            ?.toLowerCase()
            .includes(query);

        const tagMatch =
          (clip.tags || []).some((tag) =>
            tag
              .toLowerCase()
              .includes(query)
          );

        const languageMatch =
          clip.language
            ?.toLowerCase()
            .includes(query);

        const typeMatch =
          clip.clip_type
            ?.toLowerCase()
            .includes(query);

        return (
          contentMatch ||
          tagMatch ||
          languageMatch ||
          typeMatch
        );
      });

    renderClips(filtered);
  }
);

loadClips();