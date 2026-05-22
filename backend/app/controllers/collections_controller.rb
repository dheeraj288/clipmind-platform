class CollectionsController < ApplicationController
  def index
    @collection = Collection.new
    @collections = collections_for(current_user)
  end

  def show
    @collection = current_user.collections.find(params[:id])
    @collections = current_user.collections.order(:name)

    @clips =
      @collection
        .clips
        .active
        .order(is_pinned: :desc, created_at: :desc)
  end

  def create
    @collection = current_user.collections.new(collection_params)

    if @collection.save
      redirect_to collections_path, notice: "Collection created successfully"
    else
      redirect_to collections_path, alert: "Collection name can't be blank"
    end
  end

  private

  def collections_for(user)
    user
      .collections
      .left_joins(:clips)
      .select(
        "collections.*, COUNT(clips.id) FILTER (WHERE clips.deleted_at IS NULL) AS clips_count"
      )
      .group("collections.id")
      .order(is_pinned: :desc, created_at: :desc)
  end

  def collection_params
    params.require(:collection).permit(:name)
  end
end