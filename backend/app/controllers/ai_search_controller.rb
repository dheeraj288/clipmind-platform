class AiSearchController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    user = User.first

    @query = params[:q].to_s.strip
    @results = Clip.none

    return if @query.blank?

    @results =
      user
        .clips
        .active
        .where(
          "title ILIKE :query OR content ILIKE :query OR clip_type ILIKE :query",
          query: "%#{@query}%"
        )
        .order(copy_count: :desc, created_at: :desc)
  end
end