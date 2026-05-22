import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    window.showToast = (message, type = "success") => {
      const toast = document.createElement("div")

      const colors = {
        success: "border-emerald-500/30 bg-emerald-500/10",
        error: "border-red-500/30 bg-red-500/10",
        warning: "border-amber-500/30 bg-amber-500/10",
        info: "border-fuchsia-500/30 bg-fuchsia-500/10"
      }

      toast.className =
        `rounded-2xl border ${colors[type]} px-5 py-4 text-white shadow-xl backdrop-blur transition-all`

      toast.innerHTML = `
        <div class="flex items-center gap-3">
          <span>${message}</span>
        </div>
      `

      this.element.appendChild(toast)

      setTimeout(() => {
        toast.classList.add("opacity-0","translate-x-10")

        setTimeout(() => {
          toast.remove()
        },300)
      },2500)
    }
  }
};
