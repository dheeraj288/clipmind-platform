import { API_BASE_URL } from "./config.js";

const LOCAL_CLIPS_KEY = "clips";

async function getToken() {
  const result = await chrome.storage.local.get("token");
  return result.token;
}

function normalizeClipForServer(clip) {
  return {
    title: clip.title || clip.content?.slice(0, 80) || "Untitled Clip",
    content: clip.content,
    source: clip.source || "chrome-extension",
    copied_at: clip.copied_at || new Date().toISOString(),
    is_favorite: clip.is_favorite || false,
    source_url: clip.source_url || null,
    page_title: clip.page_title || null,
    site_name: clip.site_name || null,
    favicon_url: clip.favicon_url || null,
    preview_image: clip.preview_image || null,
    page_description: clip.page_description || null,
    content_kind: clip.content_kind || "selection",
    surrounding_text: clip.surrounding_text || null,
  };
}

export async function getLocalClips() {
  const result = await chrome.storage.local.get(LOCAL_CLIPS_KEY);
  return result[LOCAL_CLIPS_KEY] || [];
}

export async function setLocalClips(clips) {
  await chrome.storage.local.set({
    [LOCAL_CLIPS_KEY]: clips.slice(0, 300),
  });
}

export async function markClipPending(localId, reason = "pending_sync") {
  const clips = await getLocalClips();

  const updated = clips.map((clip) => {
    if (clip.local_id === localId || clip.id === localId) {
      return {
        ...clip,
        pending_sync: true,
        sync_status: "pending",
        sync_error: reason,
        updated_at: new Date().toISOString(),
      };
    }

    return clip;
  });

  await setLocalClips(updated);
}

export async function syncPendingClips() {
  const token = await getToken();

  if (!token) {
    return {
      synced: 0,
      failed: 0,
      skipped: true,
      reason: "not_logged_in",
    };
  }

  const clips = await getLocalClips();

  const pending = clips.filter((clip) => {
    return clip.pending_sync === true || clip.sync_status === "pending";
  });

  if (!pending.length) {
    return {
      synced: 0,
      failed: 0,
      skipped: false,
    };
  }

  let synced = 0;
  let failed = 0;

  const updatedClips = [...clips];

  for (const localClip of pending) {
    try {
      if (!localClip.content) continue;

      const response = await fetch(`${API_BASE_URL}/clips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clip: normalizeClipForServer(localClip),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        await chrome.storage.local.remove(["token", "currentUser"]);

        return {
          synced,
          failed,
          skipped: true,
          reason: "unauthorized",
        };
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Sync failed");
      }

      synced += 1;

      const index = updatedClips.findIndex((clip) => {
        return (
          clip.local_id === localClip.local_id ||
          clip.id === localClip.id ||
          clip.content === localClip.content
        );
      });

      if (index >= 0) {
        updatedClips[index] = {
          ...updatedClips[index],
          id: data.clip?.id || data.id || updatedClips[index].id,
          server_id: data.clip?.id || data.id || null,
          pending_sync: false,
          sync_status: "synced",
          sync_error: null,
          synced_at: new Date().toISOString(),
        };
      }
    } catch (error) {
      failed += 1;

      const index = updatedClips.findIndex((clip) => {
        return (
          clip.local_id === localClip.local_id ||
          clip.id === localClip.id ||
          clip.content === localClip.content
        );
      });

      if (index >= 0) {
        updatedClips[index] = {
          ...updatedClips[index],
          pending_sync: true,
          sync_status: "pending",
          sync_error: error.message,
          last_sync_attempt_at: new Date().toISOString(),
        };
      }
    }
  }

  await setLocalClips(updatedClips);

  return {
    synced,
    failed,
    skipped: false,
  };
}