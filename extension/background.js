console.log("ClipMind background running")

const API_BASE_URL = "http://localhost:3000/api/v1"

const recentClips = new Map()
const DUPLICATE_WINDOW = 3000

async function getToken() {
  const result = await chrome.storage.local.get("token")
  return result.token
}

function cleanText(text) {
  return (text || "").replace(/\s+/g, " ").trim()
}

function isDuplicate(text) {
  const key = cleanText(text).slice(0, 500)
  const now = Date.now()

  if (recentClips.has(key)) {
    const lastTime = recentClips.get(key)

    if (now - lastTime < DUPLICATE_WINDOW) {
      return true
    }
  }

  recentClips.set(key, now)

  setTimeout(() => {
    recentClips.delete(key)
  }, DUPLICATE_WINDOW)

  return false
}

function buildClipPayload(message) {
  const content = (message.content || "").trim()

  const localId = `local_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}`

  return {
    local_id: localId,
    title: content.slice(0, 80),
    content,
    source: "chrome-extension",
    copied_at: new Date().toISOString(),
    is_favorite: false,
    source_url: message.source_url || null,
    page_title: message.page_title || null,
    site_name: message.site_name || null,
    favicon_url: message.favicon_url || null,
    preview_image: message.preview_image || null,
    page_description: message.page_description || null,
    content_kind: message.content_kind || "selection",
    surrounding_text: message.surrounding_text || null,
    pending_sync: true,
    sync_status: "pending",
    sync_error: null,
  }
}

async function getLocalClips() {
  const result = await chrome.storage.local.get("clips")
  return result.clips || []
}

async function setLocalClips(clips) {
  await chrome.storage.local.set({
    clips: clips.slice(0, 300),
  })
}

async function saveClipLocally(message) {
  const clip = buildClipPayload(message)

  if (!clip.content) return null

  let clips = await getLocalClips()

  clips = clips.filter((item) => item.content !== clip.content)

  clips.unshift({
    id: clip.local_id,
    ...clip,
    created_at: new Date().toISOString(),
  })

  await setLocalClips(clips)

  return clip
}

async function updateLocalClipAfterSync(localClip, serverData) {
  const clips = await getLocalClips()

  const serverId = serverData?.clip?.id || serverData?.id || null

  const updated = clips.map((item) => {
    if (
      item.local_id === localClip.local_id ||
      item.id === localClip.local_id ||
      item.content === localClip.content
    ) {
      return {
        ...item,
        id: serverId || item.id,
        server_id: serverId,
        pending_sync: false,
        sync_status: "synced",
        sync_error: null,
        synced_at: new Date().toISOString(),
      }
    }

    return item
  })

  await setLocalClips(updated)
}

async function markLocalClipFailed(localClip, errorMessage) {
  const clips = await getLocalClips()

  const updated = clips.map((item) => {
    if (
      item.local_id === localClip.local_id ||
      item.id === localClip.local_id ||
      item.content === localClip.content
    ) {
      return {
        ...item,
        pending_sync: true,
        sync_status: "pending",
        sync_error: errorMessage,
        last_sync_attempt_at: new Date().toISOString(),
      }
    }

    return item
  })

  await setLocalClips(updated)
}

async function syncClipToServer(localClip) {
  const token = await getToken()

  if (!token) {
    await markLocalClipFailed(localClip, "Login required")
    console.warn("ClipMind: user not logged in, saved locally")
    return {
      synced: false,
      reason: "not_logged_in",
    }
  }

  if (!localClip.content) return { synced: false }

  try {
    const response = await fetch(`${API_BASE_URL}/clips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        clip: {
          title: localClip.title,
          content: localClip.content,
          source: localClip.source,
          copied_at: localClip.copied_at,
          is_favorite: localClip.is_favorite,
          source_url: localClip.source_url,
          page_title: localClip.page_title,
          site_name: localClip.site_name,
          favicon_url: localClip.favicon_url,
          preview_image: localClip.preview_image,
          page_description: localClip.page_description,
          content_kind: localClip.content_kind,
          surrounding_text: localClip.surrounding_text,
        },
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (response.status === 401) {
      await chrome.storage.local.remove(["token", "currentUser"])
      await markLocalClipFailed(localClip, "Session expired")
      return {
        synced: false,
        reason: "unauthorized",
      }
    }

    if (!response.ok) {
      throw new Error(data?.error || data?.message || "Server sync failed")
    }

    await updateLocalClipAfterSync(localClip, data)

    console.log("ClipMind synced", data)

    return {
      synced: true,
      data,
    }
  } catch (error) {
    await markLocalClipFailed(localClip, error.message)

    console.error("ClipMind sync failed, saved locally", error)

    return {
      synced: false,
      reason: error.message,
    }
  }
}

async function syncPendingClipsFromBackground() {
  const token = await getToken()

  if (!token) return

  const clips = await getLocalClips()

  const pending = clips.filter((clip) => {
    return clip.pending_sync === true || clip.sync_status === "pending"
  })

  for (const clip of pending) {
    await syncClipToServer(clip)
  }

  chrome.runtime.sendMessage({
    type: "CLIP_UPDATED",
  }).catch(() => {})
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SYNC_PENDING_CLIPS") {
    ;(async () => {
      try {
        await syncPendingClipsFromBackground()
        sendResponse({ success: true })
      } catch (error) {
        sendResponse({
          success: false,
          error: error.message,
        })
      }
    })()

    return true
  }

  if (message.type !== "SAVE_CLIP") return

  const text = (message.content || "").trim()

  if (!text) {
    sendResponse({ success: false, error: "empty_content" })
    return
  }

  if (isDuplicate(text)) {
    sendResponse({ success: false, duplicate: true })
    return
  }

  ;(async () => {
    try {
      const localClip = await saveClipLocally(message)

      if (localClip) {
        await syncClipToServer(localClip)
      }

      chrome.runtime.sendMessage({
        type: "CLIP_UPDATED",
      }).catch(() => {})

      sendResponse({ success: true })
    } catch (error) {
      console.error("ClipMind save error", error)

      sendResponse({
        success: false,
        error: error.message,
      })
    }
  })()

  return true
})

chrome.runtime.onStartup?.addListener(() => {
  syncPendingClipsFromBackground()
})

chrome.runtime.onInstalled?.addListener(() => {
  syncPendingClipsFromBackground()
})