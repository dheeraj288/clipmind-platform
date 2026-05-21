class DashboardController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    user = User.first

    @total_clips = user&.clips&.active&.count || 0
    @favorite_clips = user&.clips&.active&.where(is_favorite: true)&.count || 0
    @trending_count = user&.clips&.active&.trending&.limit(10)&.count || 0
    @trending_count =user&.clips&.active&.order(copy_count: :desc)&.limit(10)&.count || 0
    @collections_count = user&.collections&.count || 0

    @recent_clips =
      user
        &.clips
        &.active
        &.order(created_at: :desc)
        &.limit(5) || []
  end
end