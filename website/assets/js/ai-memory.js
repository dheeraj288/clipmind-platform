import {
  fetchClips,
  getToken,
  logout,
  toggleFavorite,
  incrementCopy,
} from "./api.js";

const list =
  document.getElementById(
    "memory-list"
  );

const logoutBtn =
  document.getElementById(
    "logout-btn"
  );

let memoryClips = [];

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

function getMemoryScore(clip) {
  let score = 0;

  if (clip.is_favorite) {
    score += 100;
  }

  score +=
    (clip.copy_count || 0) * 10;

  if (clip.clip_type === "code") {
    score += 20;
  }

  if (clip.clip_type === "link") {
    score += 8;
  }

  return score;
}

function getRecommendations(clips) {
  return [...clips]
    .sort(
      (a, b) =>
        getMemoryScore(b) -
        getMemoryScore(a)
    )
    .slice(0, 10);
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

function renderMemory(items = []) {

  if (!items.length) {

    list.innerHTML = `
      <div class="empty-state">
        No memory recommendations yet 🧠
      </div>
    `;

    return;
  }

  list.innerHTML =
    items.map((clip, index) => `

      <div
        class="web-clip-card premium-trend-card"
        data-id="${clip.id}"
      >

        <div class="clip-meta">

          <span class="type-badge">
            🧠 Memory #${index + 1}
          </span>

          <span>
            Score ${getMemoryScore(clip)}
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

        <div class="trend-footer">

          <span class="copy-count-pill">
            📋 ${clip.copy_count || 0} copies
          </span>

          <div class="web-card-actions">

            <button
              class="web-action-btn"
              data-copy="${clip.id}"
            >
              Copy
            </button>

            <button
              class="web-action-btn"
              data-fav="${clip.id}"
            >
              ${clip.is_favorite ? "⭐" : "☆"}
            </button>

          </div>

        </div>

      </div>

    `).join("");

    if (window.Prism) {
    Prism.highlightAllUnder(list);
  }
}

async function loadMemory() {

  try {

    const response =
      await fetchClips();

    const clips =
      Array.isArray(response)
        ? response
        : response.clips || [];

    memoryClips =
      getRecommendations(clips);

    renderMemory(
      memoryClips
    );

  } catch (err) {

    console.error(err);

    list.innerHTML = `
      <div class="empty-state">
        Failed to load AI memory ❌
      </div>
    `;
  }
}

list?.addEventListener(
  "click",

  async (e) => {

    const copyId =
      e.target.dataset.copy;

    const favId =
      e.target.dataset.fav;

    if (copyId) {

      const clip =
        memoryClips.find(
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

      await loadMemory();

      return;
    }

    if (favId) {

      await toggleFavorite(
        favId
      );

      await loadMemory();
    }
  }
);

loadMemory();