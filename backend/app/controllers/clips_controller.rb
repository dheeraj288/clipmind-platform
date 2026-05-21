class ClipsController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    user = User.first

    @query = params[:q].to_s.strip
    @filter = params[:filter].presence || "all"

    @clips = user&.clips&.active || Clip.none

    if @query.present?
      @clips = @clips.where(
        "title ILIKE :query OR content ILIKE :query",
        query: "%#{@query}%"
      )
    end

    if @filter != "all"
      @clips = @clips.where(clip_type: @filter)
    end

    @clips = @clips.order(is_pinned: :desc, created_at: :desc)
  end
end