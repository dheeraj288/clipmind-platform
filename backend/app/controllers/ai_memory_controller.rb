class AiMemoryController < ApplicationController
  def index
    @timeline =
      current_user
        .clips
        .active
        .order(created_at: :desc)
        .group_by do |clip|

          date = clip.created_at.to_date

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