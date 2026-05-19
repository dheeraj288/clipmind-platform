class Api::V1::CollectionsController < Api::V1::BaseController

  def index
    collections =
      current_user
        .collections
        .order(created_at: :desc)

    render json: collections
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

  private

  def collection_params
    params
      .require(:collection)
      .permit(:name)
  end
end