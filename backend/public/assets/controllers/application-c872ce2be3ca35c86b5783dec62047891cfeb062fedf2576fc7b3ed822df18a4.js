import { Application } from "@hotwired/stimulus"

const application = Application.start()

// Configure Stimulus development experience
application.debug = false
window.Stimulus   = application

export { application }

import "prismjs/themes/prism-tomorrow.css"

import "prismjs/components/prism-ruby"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-css"
import "prismjs/components/prism-markup"


import Prism from "prismjs"

document.addEventListener("turbo:load", () => {
  Prism.highlightAll()
})

document.addEventListener("turbo:render", () => {
  Prism.highlightAll()
});
