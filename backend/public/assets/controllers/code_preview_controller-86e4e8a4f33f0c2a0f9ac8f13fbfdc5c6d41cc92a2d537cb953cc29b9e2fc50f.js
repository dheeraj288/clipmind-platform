import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["content"]

  connect() {
    this.expanded = false
  }

  toggle() {
    this.expanded = !this.expanded

    if (this.expanded) {
      this.contentTarget.classList.remove("max-h-40")
    } else {
      this.contentTarget.classList.add("max-h-40")
    }
  }
};
