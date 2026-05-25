import "@hotwired/turbo-rails"
import "controllers"

import Prism from "prismjs"
import "prismjs/components/prism-ruby"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-css"
import "prismjs/components/prism-markup"

function highlightClipMindCode() {
  if (Prism) Prism.highlightAll()
}

document.addEventListener("turbo:load", highlightClipMindCode)
document.addEventListener("turbo:render", highlightClipMindCode)
document.addEventListener("turbo:frame-load", highlightClipMindCode)

document.addEventListener("toggle", (event) => {
  if (event.target.open && Prism) {
    Prism.highlightAllUnder(event.target)
  }
}, true);
