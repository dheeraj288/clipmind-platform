class CollectionsController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    user = User.first

    @collection = Collection.new
    @collections = collections_for(user)
  end

  def show
    user = User.first

    @collection = user.collections.find(params[:id])
    @collections = user.collections.order(:name)

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
      @collections = collections_for(user)

      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.replace(
              "collection_form",
              partial: "shared/collection_form",
              locals: { collection: Collection.new }
            ),
            turbo_stream.replace(
              "collections_list",
              partial: "collections/list",
              locals: { collections: @collections }
            )
          ]
        end

        format.html { redirect_to collections_path }
      end
    else
      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace(
            "collection_form",
            partial: "shared/collection_form",
            locals: { collection: @collection }
          ), status: :unprocessable_entity
        end

        format.html { redirect_to collections_path, alert: "Collection name can't be blank" }
      end
    end
  end

  private

  def collections_for(user)
    user
      &.collections
      &.left_joins(:clips)
      &.select("collections.*, COUNT(clips.id) AS clips_count")
      &.group("collections.id")
      &.order(is_pinned: :desc, created_at: :desc) || Collection.none
  end

  def collection_params
    params.require(:collection).permit(:name)
  end
end
