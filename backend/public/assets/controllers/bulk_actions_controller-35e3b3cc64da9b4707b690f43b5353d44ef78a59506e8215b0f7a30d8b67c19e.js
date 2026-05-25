import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["checkbox", "selectAll", "bar", "count", "clipIds"]

  connect() {
    this.update()
  }

  toggleAll(event) {
    const checked = event.target.checked

    this.checkboxTargets.forEach((checkbox) => {
      checkbox.checked = checked
    })

    this.update()
  }

  update() {
    const selectedIds = this.selectedIds()
    const selectedCount = selectedIds.length
    const totalCount = this.checkboxTargets.length

    if (this.hasCountTarget) {
      this.countTarget.textContent = selectedCount
    }

    this.clipIdsTargets.forEach((input) => {
      input.value = selectedIds.join(",")
    })

    if (this.hasBarTarget) {
      if (selectedCount > 0) {
        this.barTarget.classList.remove("hidden")
        this.barTarget.classList.add("flex")
      } else {
        this.barTarget.classList.add("hidden")
        this.barTarget.classList.remove("flex")
      }
    }

    if (this.hasSelectAllTarget) {
      this.selectAllTarget.checked = totalCount > 0 && selectedCount === totalCount
      this.selectAllTarget.indeterminate = selectedCount > 0 && selectedCount < totalCount
    }
  }

  selectedIds() {
    return this.checkboxTargets
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value)
      .filter(Boolean)
  }
};
