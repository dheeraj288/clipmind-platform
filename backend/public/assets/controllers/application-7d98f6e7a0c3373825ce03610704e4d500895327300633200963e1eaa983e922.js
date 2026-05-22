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

document.addEventListener("turbo:load", () => {
  Prism.highlightAll()
})

document.addEventListener("turbo:frame-load", () => {
  Prism.highlightAll()
});
