class FavoritesController < ApplicationController
  skip_before_action :authenticate_request!

  def index
    user = current_user

    @collections = user&.collections&.order(:name) || Collection.none

    @favorites =
      user
        &.clips
        &.where(is_favorite: true)
        &.active
        &.order(created_at: :desc) || Clip.none
  end
end
