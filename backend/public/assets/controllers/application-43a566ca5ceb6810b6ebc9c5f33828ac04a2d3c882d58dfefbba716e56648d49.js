import { Application } from "@hotwired/stimulus"

const application = Application.start()

// Configure Stimulus development experience
application.debug = false
window.Stimulus   = application

export { application }

import Prism from "prismjs"

import "prismjs/themes/prism-tomorrow.css"

import "prismjs/components/prism-ruby"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-json"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-css"
import "prismjs/components/prism-markup"

function highlightCode() {
  document.querySelectorAll("pre code").forEach((block) => {
    Prism.highlightElement(block)
  })
}

document.addEventListener("turbo:load", highlightCode)

document.addEventListener(
  "turbo:frame-load",
  highlightCode
)

document.addEventListener(
  "turbo:render",
  highlightCode
);
