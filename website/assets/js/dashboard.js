import {
  fetchClips,
  fetchTrending,
  fetchCollections,
  getToken,
  logout,
  toggleFavorite,
  incrementCopy,
} from "./api.js";

const totalClips =
  document.getElementById("total-clips");

const favoriteClips =
  document.getElementById("favorite-clips");

const trendingCount =
  document.getElementById("trending-count");

const collectionsCount =
  document.getElementById("collections-count");

const topTagsList =
  document.getElementById("top-tags-list");

const trendingList =
  document.getElementById("trending-list");

const logoutBtn =
  document.getElementById("logout-btn");

if (!getToken()) {
  window.location.href =
    "login.html";
}

logoutBtn?.addEventListener(
  "click",
  () => {
    logout();
  }
);

function renderStats(
  clips,
  trending,
  collections
) {
  totalClips.textContent =
    clips.length;

  favoriteClips.textContent =
    clips.filter(
      (clip) => clip.is_favorite
    ).length;

  trendingCount.textContent =
    trending.length;

  collectionsCount.textContent =
    collections.length;
}

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

function renderTrending(clips) {
  if (!clips.length) {
    trendingList.innerHTML = `
      <div class="empty-state">
        No trending clips yet
      </div>
    `;

    return;
  }

  trendingList.innerHTML =
    clips.map((clip, index) => `
      <div
        class="web-clip-card premium-trend-card"
        data-id="${clip.id}"
      >

        <div class="clip-meta">
          <span class="type-badge">
            ${clip.clip_type || "text"}
          </span>

          <span>
            🔥 #${index + 1}
          </span>
        </div>

        ${
          clip.clip_type === "code"
            ? `
              <pre class="web-code-block"><code class="language-${getCodeLanguage(
                clip
              )}">${escapeHtml(
                clip.content || ""
              )}</code></pre>
            `
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

        <div class="trend-footer">

          <span class="copy-count-pill">
            📋 ${clip.copy_count || 0} copies
          </span>

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
              ${clip.is_favorite ? "⭐" : "☆"}
            </button>

          </div>

        </div>

      </div>
    `).join("");

  if (window.Prism) {
    Prism.highlightAllUnder(trendingList);
  }
}

trendingList?.addEventListener(
  "click",
  async (e) => {
    const copyId =
      e.target.dataset.copy;

    const favId =
      e.target.dataset.fav;

    if (copyId) {
      const clip =
        Array.from(
          trendingList.querySelectorAll(
            ".web-clip-card"
          )
        ).find(
          (card) =>
            card.dataset.id === String(copyId)
        );

      const original =
        clip?.querySelector(
          ".clip-content, .web-code-block"
        );

      await navigator.clipboard.writeText(
        original?.textContent?.trim() || ""
      );

      await incrementCopy(copyId);

      await loadDashboard();

      return;
    }

    if (favId) {
      await toggleFavorite(favId);
      await loadDashboard();
    }
  }
);




async function loadDashboard() {
  try {
    const [
      clipsResponse,
      trending,
      collections,
    ] = await Promise.all([
      fetchClips(),
      fetchTrending(),
      fetchCollections(),
    ]);

    const clips =
      Array.isArray(clipsResponse)
        ? clipsResponse
        : clipsResponse.clips || [];

    renderStats(
      clips,
      trending,
      collections
    );

    renderTopTags(clips);

    renderTrending(
      trending
    );

  } catch (err) {
    console.error(err);

    trendingList.innerHTML = `
      <div class="empty-state">
        Failed to load dashboard ❌
      </div>
    `;
  }
}

function renderTopTags(clips = []) {
  if (!topTagsList) return;
  const tagCounts = {};

  clips.forEach((clip) => {
    (clip.tags || []).forEach((tag) => {
      tagCounts[tag] =
        (tagCounts[tag] || 0) + 1;
    });
  });

  const topTags =
    Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

  if (!topTags.length) {
    topTagsList.innerHTML = `
      <div class="empty-state">
        No tags yet
      </div>
    `;
    return;
  }

  topTagsList.innerHTML =
    topTags.map(([tag, count]) => `
      <div class="top-tag-card">
        <span>#${escapeHtml(tag)}</span>
        <strong>${count} clip </strong>
      </div>
    `).join("");
}

loadDashboard();

