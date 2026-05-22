class DashboardController < ApplicationController
  skip_before_action :authenticate_request!

  def index
    user = current_user

    @total_clips = user&.clips&.active&.count || 0
    @favorite_clips = user&.clips&.active&.where(is_favorite: true)&.count || 0
    @collections_count = user&.collections&.count || 0
    @collections = user&.collections&.order(:name) || []

    @today_clips = user&.clips&.active&.where(
      created_at: Time.zone.now.beginning_of_day..Time.zone.now.end_of_day
    ) || Clip.none

    @memory_stats = {
      total: @today_clips.count,
      code: @today_clips.where(clip_type: "code").count,
      links: @today_clips.where(clip_type: "link").count,
      commands: @today_clips.where(clip_type: "command").count
    }

    @top_tags =
      user&.clips&.active
          &.where.not(tags: nil)
          &.pluck(:tags)
          &.flatten
          &.compact
          &.group_by(&:itself)
          &.transform_values(&:count)
          &.sort_by { |_, count| -count }
          &.first(6) || []

    @recent_clips =
      user&.clips&.active
          &.order(created_at: :desc)
          &.limit(6) || []

    @recent_memory = @recent_clips
    @insights = MemoryInsightsService.new(current_user).call
  end
end