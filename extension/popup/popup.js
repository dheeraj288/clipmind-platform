import { createCard } from "./components/ClipCard.js";
import { groupItems } from "./utils/groupItems.js";
import { sortData } from "./utils/smartScore.js";
import { fetchClips, fetchTrendingClips, checkBackendHealth } from "../services/api.js";
import { syncPendingClips } from "../services/syncQueue.js";
import { smartSearch } from "./utils/smartSearch.js";
import { getRecommendations } from "./utils/aiMemory.js";
import { getToken, logoutUser } from "../services/auth.js";
import { renderAuth } from "./authView.js";
import { showToast } from "./utils/showToast.js";

/* ELEMENTS */
const app = document.getElementById("app");
const authContainer = document.getElementById("auth-container");
const list = document.getElementById("list");
const search = document.getElementById("search");
const toast = document.getElementById("toast");

/* STATE */
let data = [];
let currentFilter = "all";

/* FILTER */
const filterData = (items = []) => {
  if (currentFilter === "all") return items;

  return items.filter((item) => item.clip_type === currentFilter);
};

/* SERVER STATUS */
async function updateBackendStatus() {
  const indicator = document.getElementById("server-status");
  if (!indicator) return;

  indicator.innerHTML = "Checking...";

  const healthy = await checkBackendHealth();

  indicator.innerHTML = healthy
    ? "🟢 Backend Online"
    : "🔴 Backend Offline";
}

/* LOGOUT */
function setupLogout() {
  const logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) return;

  logoutBtn.onclick = async () => {
    await logoutUser();
    location.reload();
  };
}

/* RENDER */
function render(items = []) {
  if (!list) return;

  list.innerHTML = "";

  const finalData = filterData(sortData(items));

  if (!finalData.length) {
    list.innerHTML = `<div class="empty">No clips found 🚀</div>`;
    return;
  }

  const recommended = getRecommendations(finalData);

  if (recommended.length) {
    const recSection = document.createElement("div");
    recSection.className = "timeline-section";

    recSection.innerHTML = `
      <div class="timeline-title">
        🧠 RECOMMENDED FOR YOU
      </div>
    `;

    recommended.forEach((item) => {
      recSection.appendChild(
        createCard(item, {
          showToast: (message) => showToast(toast, message),
          load,
          render,
          data,
        })
      );
    });

    list.appendChild(recSection);
  }

  const groups = groupItems(finalData);

  Object.entries(groups).forEach(([title, groupItems]) => {
    if (!groupItems.length) return;

    const section = document.createElement("div");
    section.className = "timeline-section";

    section.innerHTML = `
      <div class="timeline-title">
        ${title.toUpperCase()}
      </div>
    `;

    groupItems.forEach((item) => {
      section.appendChild(
        createCard(item, {
          showToast: (message) => showToast(toast, message),
          load,
          render,
          data,
        })
      );
    });

    list.appendChild(section);
  });
}

/* LOAD */
async function load() {
  try {
    const syncResult = await syncPendingClips();

    if (syncResult?.synced > 0) {
      showToast(toast, `${syncResult.synced} pending clips synced ✅`);
    }

    const response = await fetchClips();

    data = Array.isArray(response) ? response : [];

    render(data);
  } catch (error) {
    console.error("Load error:", error);

    const local = await chrome.storage.local.get("clips");
    data = local.clips || [];

    render(data);

    if (data.length) {
      showToast(toast, "Showing local clips. Server unavailable.");
    } else if (list) {
      list.innerHTML = `<div class="empty">Failed to load clips ❌</div>`;
    }
  }
}

/* SEARCH */
search?.addEventListener("input", (event) => {
  const query = event.target.value;

  const filtered = smartSearch(data, query);

  render(filtered);
});

/* FILTER TABS */
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((button) => button.classList.remove("active"));

    tab.classList.add("active");
    currentFilter = tab.dataset.type || "all";

    render(data);
  });
});

/* TRENDING */
async function loadTrending() {
  try {
    const trending = await fetchTrendingClips();

    if (!Array.isArray(trending) || !trending.length || !list) return;

    document.querySelector(".trending-section")?.remove();

    const section = document.createElement("div");
    section.className = "timeline-section trending-section";

    section.innerHTML = `
      <div class="timeline-title">
        🔥 TRENDING
      </div>
    `;

    trending.forEach((item) => {
      section.appendChild(
        createCard(item, {
          showToast: (message) => showToast(toast, message),
          load,
          render,
          data,
        })
      );
    });

    list.prepend(section);
  } catch (error) {
    console.error("Trending error:", error);
  }
}

/* SMART CHIPS */
function setupSmartChips() {
  document.querySelectorAll(".smart-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const query = chip.dataset.smart || "";

      if (search) {
        search.value = query;
      }

      const filtered = smartSearch(data, query);

      render(filtered);
    });
  });
}

/* GLOBAL ERROR UI */
function showGlobalError(message) {
  const errorBox = document.getElementById("global-error");
  if (!errorBox) return;

  errorBox.innerHTML = `
    <div class="error-content">
      <span>❌ ${message}</span>

      <button id="retry-btn">
        Retry
      </button>
    </div>
  `;

  errorBox.classList.remove("hidden");

  document
    .getElementById("retry-btn")
    ?.addEventListener("click", () => {
      location.reload();
    });

  setTimeout(() => {
    errorBox.classList.add("hidden");
  }, 5000);
}

window.addEventListener("error", (event) => {
  console.error("ClipMind Error:", event.error);

  showGlobalError(event.error?.message || "Unexpected error occurred");
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("ClipMind Promise Error:", event.reason);

  showGlobalError(event.reason?.message || "Request failed");
});

/* INIT */
async function init() {
  await updateBackendStatus();

  const token = await getToken();

  if (!token) {
    app?.classList.add("hidden");

    renderAuth(authContainer, async () => {
      authContainer.innerHTML = "";

      app?.classList.remove("hidden");

      await updateBackendStatus();
      await load();
      await loadTrending();

      setupLogout();
      setupSmartChips();
    });

    return;
  }

  app?.classList.remove("hidden");

  await load();
  await loadTrending();

  setupLogout();
  setupSmartChips();
}

init();