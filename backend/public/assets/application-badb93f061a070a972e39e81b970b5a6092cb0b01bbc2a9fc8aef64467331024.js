import "@hotwired/turbo-rails"
import "controllers"


import "@hotwired/turbo-rails"
import "controllers"

import Prism from "prismjs"
import "prismjs/components/prism-ruby"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-css"
import "prismjs/components/prism-markup"

document.addEventListener("turbo:load", () => {
  Prism.highlightAll()
})

document.addEventListener("turbo:render", () => {
  Prism.highlightAll()
})

document.addEventListener("toggle", (event) => {
  if (event.target.open) {
    Prism.highlightAllUnder(event.target)
  }
}, true);
