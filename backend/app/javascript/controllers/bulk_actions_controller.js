import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["checkbox", "bar", "count", "clipIds"]

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
    const selectedIds = this.selectedIds()

    this.countTarget.textContent = selectedIds.length

    this.clipIdsTargets.forEach((input) => {
      input.value = selectedIds.join(",")
    })

    if (selectedIds.length > 0) {
      this.barTarget.classList.remove("hidden")
      this.barTarget.classList.add("flex")
    } else {
      this.barTarget.classList.add("hidden")
      this.barTarget.classList.remove("flex")
    }
  }

  selectedIds() {
    return this.checkboxTargets
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value)
  }
}