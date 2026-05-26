import { createCard } from "./components/ClipCard.js";
import { groupItems } from "./utils/groupItems.js";
import { sortData } from "./utils/smartScore.js";
import { fetchClips, fetchTrendingClips } from "../services/api.js";
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
const filterData = (items) =>
  currentFilter === "all"
    ? items
    : items.filter((i) => i.clip_type === currentFilter);

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
  list.innerHTML = "";

  const finalData = filterData(sortData(items));

  if (!finalData.length) {
    list.innerHTML = `<div class="empty">No clips found 🚀</div>`;
    return;
  }

  const groups = groupItems(finalData);
  const recommended = getRecommendations(finalData);
  if (recommended.length) {

  const recSection =
    document.createElement("div");

  recSection.className =
    "timeline-section";

  recSection.innerHTML = `
    <div class="timeline-title">
      🧠 RECOMMENDED FOR YOU
    </div>
  `;

  recommended.forEach((item) => {

    recSection.appendChild(
      createCard(item, {
        showToast: (message) =>
          showToast(toast, message),

        load,
        render,
        data,
      })
    );

  });

  list.appendChild(recSection);
}

  Object.entries(groups).forEach(([title, items]) => {
    if (!items.length) return;

    const section = document.createElement("div");
    section.className = "timeline-section";

    section.innerHTML = `
      <div class="timeline-title">
        ${title.toUpperCase()}
      </div>
    `;

    items.forEach((item) => {
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

    if (syncResult.synced > 0) {
      showToast(toast, `${syncResult.synced} pending clips synced ✅`);
    }

    const response = await fetchClips();

    data = Array.isArray(response) ? response : [];

    render(data);
  } catch (error) {
    console.error(error);

    const local = await chrome.storage.local.get("clips");
    data = local.clips || [];

    render(data);

    if (data.length) {
      showToast(toast, "Showing local clips. Server unavailable.");
    } else {
      list.innerHTML = `<div class="empty">Failed to load clips ❌</div>`;
    }
  }
}

/* SEARCH */
search?.addEventListener(
  "input",
  (e) => {

    const query =
      e.target.value;

    const filtered =
      smartSearch(
        data,
        query
      );

    render(filtered);
  }
);

/* FILTER TABS */
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));

    tab.classList.add("active");
    currentFilter = tab.dataset.type;

    render(data);
  });
});

/* TRENDING */
async function loadTrending() {

  try {

    const trending =
      await fetchTrendingClips();

    if (
      !Array.isArray(trending) ||
      !trending.length
    ) {
      return;
    }

    /* REMOVE OLD */
    document
      .querySelector(
        ".trending-section"
      )
      ?.remove();

    const section =
      document.createElement("div");

    section.className =
      "timeline-section trending-section";

    section.innerHTML = `
      <div class="timeline-title">
        🔥 TRENDING
      </div>
    `;

    trending.forEach((item) => {

      section.appendChild(
        createCard(item, {
          showToast: (message) =>
            showToast(toast, message),

          load,
          render,
          data,
        })
      );
    });

    list.prepend(section);

  } catch (err) {

    console.error(
      "Trending error:",
      err
    );
  }
}

/* INIT */
async function init() {

  const token =
    await getToken();

  if (!token) {

    app.classList.add(
      "hidden"
    );

    renderAuth(
      authContainer,

      async () => {

        authContainer.innerHTML =
          "";

        app.classList.remove(
          "hidden"
        );

        await load();

        await loadTrending();

        setupLogout();
      }
    );

    return;
  }

  app.classList.remove(
    "hidden"
  );

  await load();

  await loadTrending();

  setupLogout();
}

document
  .querySelectorAll(".smart-chip")
  .forEach((chip) => {

    chip.addEventListener(
      "click",
      () => {

        const query =
          chip.dataset.smart;

        search.value =
          query;

        const filtered =
          smartSearch(
            data,
            query
          );

        render(filtered);
      }
    );
  });

init();