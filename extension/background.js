console.log("Background Running");

/* API CONFIG */
const API_BASE_URL =
  "http://localhost:3000/api/v1";

const TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxfQ.XzMXe6mosyQyDkynFFqMXpggArBY8q9qrErV_OuVbgk";

/* DUPLICATE STORE */
const recentClips = new Map();

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

/* SYNC TO RAILS */
async function syncClipToServer(
  message
) {

  try {

    const text =
      message.content;

    const response =
      await fetch(
        `${API_BASE_URL}/clips`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${TOKEN}`,
          },

          body: JSON.stringify({
            clip: {

              title:
                text.substring(0, 30),

              content: text,

              source:
                "chrome-extension",

              copied_at:
                new Date().toISOString(),

              is_favorite: false,

              source_url:
                message.source_url,

              page_title:
                message.page_title,
            },
          }),
        }
      );

    const data =
      await response.json();

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

/* INJECT CONTENT SCRIPT */
async function injectContentScript() {

  const tabs =
    await chrome.tabs.query({});

  for (const tab of tabs) {

    if (
      tab.url &&
      (
        tab.url.startsWith(
          "http://"
        ) ||

        tab.url.startsWith(
          "https://"
        )
      )
    ) {

      try {

        await chrome.scripting
          .executeScript({

            target: {
              tabId: tab.id
            },

            files: [
              "content.js"
            ],
          });

        console.log(
          "Injected:",
          tab.id
        );

      } catch (error) {
        /* ignore */
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

      if (!text) return;

      /* DUPLICATE BLOCK */
      if (
        isDuplicate(text)
      ) {

        sendResponse({
          success: false,
          duplicate: true,
        });

        return;
      }

      chrome.storage.local.get(
        ["clips"],

        (res) => {

          let clips =
            res.clips || [];

          /* REMOVE DUPLICATES */
          clips =
            clips.filter(
              (i) =>
                i.text !== text
            );

          /* ADD NEW */
          clips.unshift({

            id: Date.now(),

            text,

            time:
              new Date()
                .toLocaleString(),

            pinned: false,

            source_url:
              message.source_url,

            page_title:
              message.page_title,
          });

          /* LIMIT */
          clips =
            clips.slice(0, 300);

          chrome.storage.local.set(
            { clips },

            async () => {

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
            }
          );
        }
      );

      return true;
    }
  );