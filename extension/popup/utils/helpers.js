export const escapeHtml = (text = "") =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const safeTime = (item) =>
  new Date(
    item.created_at || Date.now()
  ).toLocaleString();

export const getBadge = (type) => ({
  code: "💻 CODE",
  text: "📝 TEXT",
  link: "🌐 LINK",
  json: "📦 JSON",
  email: "📧 EMAIL",
  command: "⚡ COMMAND",
}[type] || "📋 CLIP");

export const copyToClipboard = async (text) => {
  await navigator.clipboard.writeText(text);
};