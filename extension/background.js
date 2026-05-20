console.log("Background Running");

/* API CONFIG */
const API_BASE_URL =
  "http://localhost:3000/api/v1";

/* DUPLICATE STORE */
const recentClips = new Map();

/* GET AUTH TOKEN */
async function getToken() {
  const result =
    await chrome.storage.local.get(
      "token"
    );

  return result.token;
}

/* DUPLICATE CHECK */
function isDuplicate(text) {
  const now = Date.now();

  if (recentClips.has(text)) {
    const lastTime =
      recentClips.get(text);

    if (now - lastTime < 2000) {
      return true;
    }
  }

  recentClips.set(text, now);

  return false;
}

/* NORMALIZE CLIP MESSAGE */
function normalizeClipMessage(message) {
  const text =
    message.content?.trim() || "";

  return {
    text,

    title:
      text.substring(0, 30),

    source_url:
      message.source_url || null,

    page_title:
      message.page_title || null,

    site_name:
      message.site_name || null,

    favicon_url:
      message.favicon_url || null,

    preview_image:
      message.preview_image || null,

    page_description:
      message.page_description || null,

    content_kind:
      message.content_kind || "page",

    surrounding_text:
      message.surrounding_text || null,
  };
}

/* SYNC TO RAILS */
async function syncClipToServer(message) {
  try {
    const token =
      await getToken();

    if (!token) {
      console.log(
        "No authenticated user"
      );

      return;
    }

    const clipData =
      normalizeClipMessage(message);

    if (!clipData.text) return;

    const response =
      await fetch(
        `${API_BASE_URL}/clips`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            clip: {
              title:
                clipData.title,

              content:
                clipData.text,

              source:
                "chrome-extension",

              copied_at:
                new Date().toISOString(),

              is_favorite:
                false,

              source_url:
                clipData.source_url,

              page_title:
                clipData.page_title,

              site_name:
                clipData.site_name,

              favicon_url:
                clipData.favicon_url,

              preview_image:
                clipData.preview_image,

              page_description:
                clipData.page_description,

              content_kind:
                clipData.content_kind,

              surrounding_text:
                clipData.surrounding_text,
            },
          }),
        }
      );

    if (response.status === 401) {
      console.error(
        "Unauthorized user"
      );

      await chrome.storage.local.remove([
        "token",
        "currentUser",
      ]);

      return;
    }

    const data =
      await response.json();

    if (!response.ok) {
      console.error(
        "SYNC FAILED:",
        data
      );

      return;
    }

    console.log(
      "SYNCED:",
      data
    );

  } catch (error) {
    console.error(
      "SYNC ERROR:",
      error
    );
  }
}

/* LOCAL STORAGE SAVE */
async function saveClipLocally(message) {
  const clipData =
    normalizeClipMessage(message);

  const res =
    await chrome.storage.local.get(
      ["clips"]
    );

  let clips =
    res.clips || [];

  clips =
    clips.filter(
      (item) =>
        item.text !== clipData.text
    );

  clips.unshift({
    id: Date.now(),

    text:
      clipData.text,

    time:
      new Date()
        .toLocaleString(),

    pinned:
      false,

    source_url:
      clipData.source_url,

    page_title:
      clipData.page_title,

    site_name:
      clipData.site_name,

    favicon_url:
      clipData.favicon_url,

    preview_image:
      clipData.preview_image,

    page_description:
      clipData.page_description,

    content_kind:
      clipData.content_kind,

    surrounding_text:
      clipData.surrounding_text,
  });

  clips =
    clips.slice(0, 300);

  await chrome.storage.local.set({
    clips,
  });
}

/* INJECT CONTENT SCRIPT */
async function injectContentScript() {
  const tabs =
    await chrome.tabs.query({});

  for (const tab of tabs) {
    if (
      tab.url &&
      (
        tab.url.startsWith("http://") ||
        tab.url.startsWith("https://")
      )
    ) {
      try {
        await chrome.scripting
          .executeScript({
            target: {
              tabId: tab.id,
            },

            files: [
              "content.js",
            ],
          });

        console.log(
          "Injected:",
          tab.id
        );

      } catch (error) {
        /* ignore restricted pages */
      }
    }
  }
}

injectContentScript();

/* MESSAGE HANDLER */
chrome.runtime.onMessage
  .addListener(
    (
      message,
      sender,
      sendResponse
    ) => {

      if (
        message.type !==
        "SAVE_CLIP"
      ) {
        return;
      }

      const text =
        message.content?.trim();

      if (!text) {
        sendResponse({
          success: false,
          error: "empty_content",
        });

        return;
      }

      if (isDuplicate(text)) {
        sendResponse({
          success: false,
          duplicate: true,
        });

        return;
      }

      (async () => {
        try {
          await saveClipLocally(
            message
          );

          await syncClipToServer(
            message
          );

          chrome.runtime
            .sendMessage({
              type:
                "CLIP_UPDATED",
            });

          sendResponse({
            success: true,
          });

        } catch (error) {
          console.error(
            "SAVE_CLIP ERROR:",
            error
          );

          sendResponse({
            success: false,
            error:
              error.message,
          });
        }
      })();

      return true;
    }
  );