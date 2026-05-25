import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["checkbox", "bar", "count", "clipIds"]

  connect() {
    console.log("✅ Bulk Actions Connected")
    console.log("Checkbox targets:", this.checkboxTargets.length)
    console.log("Bar target:", this.hasBarTarget)
    console.log("Count target:", this.hasCountTarget)
    console.log("ClipIds targets:", this.clipIdsTargets.length)

    this.update()
  }

  toggleAll(event) {
    console.log("✅ Select all clicked:", event.target.checked)

    this.checkboxTargets.forEach((checkbox) => {
      checkbox.checked = event.target.checked
    })

    this.update()
  }

  update() {
    const selectedIds = this.selectedIds()

    console.log("Selected IDs:", selectedIds)

    if (this.hasCountTarget) {
      this.countTarget.textContent = selectedIds.length
    }

    this.clipIdsTargets.forEach((input) => {
      input.value = selectedIds.join(",")
    })

    if (this.hasBarTarget) {
      if (selectedIds.length > 0) {
        this.barTarget.classList.remove("hidden")
        this.barTarget.classList.add("flex")
      } else {
        this.barTarget.classList.add("hidden")
        this.barTarget.classList.remove("flex")
      }
    }
  }

  selectedIds() {
    return this.checkboxTargets
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value)
      .filter(Boolean)
  }
};
