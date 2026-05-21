class ClipsController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    user = User.first

    @query = params[:q].to_s.strip
    @filter = params[:filter].presence || "all"

    @clips = user&.clips&.active || Clip.none
    @collections = user&.collections&.order(:name) || Collection.none

    if @query.present?
      @clips = @clips.where(
        "title ILIKE :query OR content ILIKE :query",
        query: "%#{@query}%"
      )
    end

    if @filter != "all"
      @clips = @clips.where(clip_type: @filter)
    end

    @clips = @clips.order(is_pinned: :desc, created_at: :desc)
  end

  def toggle_favorite
    user = User.first
    @clip = user.clips.find(params[:id])

    @clip.update!(is_favorite: !@clip.is_favorite?)
    @collections = user.collections.order(:name)

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          @clip,
          partial: "shared/clip_card",
          locals: { clip: @clip }
        )
      end

      format.html { redirect_back fallback_location: clips_path }
    end
  end

  def increment_copy
    user = User.first
    @clip = user.clips.find(params[:id])

    @clip.increment!(:copy_count)
    @collections = user.collections.order(:name)

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          @clip,
          partial: "shared/clip_card",
          locals: { clip: @clip }
        )
      end

      format.html { redirect_back fallback_location: clips_path }
    end
  end

 def destroy
  @clip = Clip.find(params[:id])
  @clip.update!(deleted_at: Time.current)

  respond_to do |format|
    format.turbo_stream do
      render turbo_stream: turbo_stream.remove(@clip)
    end

    format.html do
      redirect_back fallback_location: clips_path, notice: "Clip deleted successfully."
    end
  end
end

  def update_collection
    user = User.first
    @clip = user.clips.find(params[:id])

    collection_id = params[:clip][:collection_id].presence

    if collection_id.present?
      collection = user.collections.find(collection_id)
      @clip.update!(collection_id: collection.id)
    else
      @clip.update!(collection_id: nil)
    end

    @collections = user.collections.order(:name)

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          @clip,
          partial: "shared/clip_card",
          locals: { clip: @clip }
        )
      end

      format.html { redirect_back fallback_location: clips_path }
    end
  end
end
