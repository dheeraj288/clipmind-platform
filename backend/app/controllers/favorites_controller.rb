class FavoritesController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    user = User.first

    @collections = user&.collections&.order(:name) || Collection.none

    @favorites =
      user
        &.clips
        &.where(is_favorite: true)
        &.active
        &.order(created_at: :desc) || Clip.none
  end
end
