class Api::V1::CollectionsController < Api::V1::BaseController

   def index
    collections =
      current_user
        .collections
        .left_joins(:clips)
        .where(
          "clips.id IS NULL OR clips.deleted_at IS NULL"
        )
        .select(
          "collections.*",
          "COUNT(clips.id) AS clips_count",
          "COALESCE(SUM(clips.copy_count), 0) AS total_copies"
        )
        .group("collections.id")
        .order(
          is_pinned: :desc,
          created_at: :desc
        )

    render json: collections.as_json(
      methods: [
        :clips_count,
        :total_copies
      ]
    )
  end

  def show
    collection =
      current_user
        .collections
        .find(params[:id])

    render json: {
      collection: collection,
      clips: collection
               .clips
               .active
               .order(created_at: :desc)
    }
  end

  def create
    collection =
      current_user
        .collections
        .new(collection_params)

    if collection.save
      render json: collection,
             status: :created
    else
      render json: {
        errors: collection.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def update
    collection =
      current_user
        .collections
        .find(params[:id])

    if collection.update(collection_params)
      render json: collection
    else
      render json: {
        errors: collection.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def destroy
    collection =
      current_user
        .collections
        .find(params[:id])

    collection.destroy

    render json: {
      message: "Collection deleted"
    }
  end


  def toggle_pin

    collection =
      current_user
        .collections
        .find(params[:id])

    collection.update!(
      is_pinned: !collection.is_pinned
    )

    render json: {
      id: collection.id,
      is_pinned: collection.is_pinned
    }
  end

  private

  def collection_params
    params
      .require(:collection)
      .permit(:name)
  end
end