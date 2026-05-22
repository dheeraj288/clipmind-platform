class ProfileController < ApplicationController
  def show
    @total_clips = current_user.clips.active.count
    @collections_count = current_user.collections.count
    @favorites_count = current_user.clips.active.where(is_favorite: true).count
    @copies_count = current_user.clips.active.sum(:copy_count)
    @recent_clips = current_user.clips.active.order(created_at: :desc).limit(4)
  end
end