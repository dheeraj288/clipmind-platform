import { Application } from "@hotwired/stimulus"

const application = Application.start()

// Configure Stimulus development experience
application.debug = false
window.Stimulus   = application

export { application }


import Prism from "prismjs"

document.addEventListener("turbo:load", () => {
  Prism.highlightAll()
})

document.addEventListener("turbo:render", () => {
  Prism.highlightAll()
});
