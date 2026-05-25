class AiMemoryController < ApplicationController
  def index
    @query = params[:q].to_s.strip
    @filter = params[:filter].presence || "all"

    memories =
      current_user
        .clips
        .active
        .where(ai_memory: true)
        .where.not(ai_summary: [nil, ""])
        .order(ai_memory_saved_at: :desc)

    memories = memories.where(clip_type: @filter) unless @filter == "all"

    if @query.present?
      search = "%#{@query.downcase}%"

      memories = memories.where(
        "LOWER(title) LIKE :q OR LOWER(content) LIKE :q OR LOWER(ai_summary) LIKE :q OR LOWER(page_title) LIKE :q",
        q: search
      )
    end

    @memories = memories

    @timeline =
      memories.group_by do |clip|
        date = (clip.ai_memory_saved_at || clip.created_at).to_date

        if date == Date.current
          "Today"
        elsif date == Date.yesterday
          "Yesterday"
        else
          date.strftime("%d %b %Y")
        end
      end
  end
end