class CollectionsController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    user = User.first

    @collection = Collection.new

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

  def create
    user = User.first

    @collection = user.collections.new(collection_params)

    if @collection.save
      redirect_to collections_path
    else
      redirect_to collections_path, alert: "Collection name can't be blank"
    end
  end

  private

  def collection_params
    params.require(:collection).permit(:name)
  end
end