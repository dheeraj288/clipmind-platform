import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["checkbox", "bar", "count"]

  connect() {
    this.update()
  }

  toggleAll(event) {
    this.checkboxTargets.forEach((checkbox) => {
      checkbox.checked = event.target.checked
    })

    this.update()
  }

  update() {
    const selected = this.checkboxTargets.filter((checkbox) => checkbox.checked)

    this.countTarget.textContent = selected.length

    if (selected.length > 0) {
      this.barTarget.classList.remove("hidden")
    } else {
      this.barTarget.classList.add("hidden")
    }
  }
};
