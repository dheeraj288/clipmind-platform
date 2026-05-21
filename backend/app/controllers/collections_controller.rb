class CollectionsController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    user = User.first

    @collections =
      user
        &.collections
        &.left_joins(:clips)
        &.select("collections.*, COUNT(clips.id) AS clips_count")
        &.group("collections.id")
        &.order(is_pinned: :desc, created_at: :desc) || Collection.none
  end

  def show
    user = User.first

    @collection = user.collections.find(params[:id])

    @clips =
      @collection
        .clips
        .active
        .order(is_pinned: :desc, created_at: :desc)
  end
end