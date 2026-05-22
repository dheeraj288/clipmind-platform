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

  return {
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
    surrounding_text: message.surrounding_text || null
  }
}

async function saveClipLocally(message) {
  const clip = buildClipPayload(message)

  if (!clip.content) return

  const result = await chrome.storage.local.get(["clips"])
  let clips = result.clips || []

  clips = clips.filter((item) => item.content !== clip.content)

  clips.unshift({
    id: Date.now(),
    ...clip,
    created_at: new Date().toISOString()
  })

  clips = clips.slice(0, 300)

  await chrome.storage.local.set({ clips })
}

async function syncClipToServer(message) {
  const token = await getToken()

  if (!token) {
    console.warn("ClipMind: user not logged in")
    return
  }

  const clip = buildClipPayload(message)

  if (!clip.content) return

  const response = await fetch(`${API_BASE_URL}/clips`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ clip })
  })

  const data = await response.json().catch(() => ({}))

  if (response.status === 401) {
    await chrome.storage.local.remove(["token", "currentUser"])
    console.error("ClipMind: unauthorized, login again")
    return
  }

  if (!response.ok) {
    console.error("ClipMind sync failed", data)
    return
  }

  console.log("ClipMind synced", data)
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
      await saveClipLocally(message)
      await syncClipToServer(message)

      chrome.runtime.sendMessage({
        type: "CLIP_UPDATED"
      })

      sendResponse({ success: true })
    } catch (error) {
      console.error("ClipMind save error", error)
      sendResponse({
        success: false,
        error: error.message
      })
    }
  })()

  return true
})