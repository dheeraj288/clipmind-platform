class AiMemoryController < ApplicationController
  skip_before_action :authenticate_request!

  def index
    user = current_user

    @memory_clips =
      user
        &.clips
        &.active
        &.where("copy_count > 0")
        &.order(copy_count: :desc, updated_at: :desc)
        &.limit(8) || Clip.none

    @favorite_memory =
      user
        &.clips
        &.active
        &.where(is_favorite: true)
        &.order(updated_at: :desc)
        &.limit(4) || Clip.none

    @recent_memory =
      user
        &.clips
        &.active
        &.order(created_at: :desc)
        &.limit(4) || Clip.none
  end
end