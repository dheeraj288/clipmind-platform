class ClipsController < ApplicationController
  def index
    @query = params[:q].to_s.strip
    @filter = params[:filter].presence || "all"

    @clips = current_user.clips.active
    @collections = current_user.collections.order(:name)

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
    @clip = current_user.clips.find(params[:id])
    @clip.update!(is_favorite: !@clip.is_favorite?)

    refresh_clip_card
  end

  def increment_copy
    @clip = current_user.clips.find(params[:id])
    @clip.increment!(:copy_count)

    refresh_clip_card
  end

  def update_collection
    @clip = current_user.clips.find(params[:id])
    collection_id = params[:clip][:collection_id].presence

    if collection_id.present?
      collection = current_user.collections.find(collection_id)
      @clip.update!(collection_id: collection.id)
    else
      @clip.update!(collection_id: nil)
    end

    refresh_clip_card
  end

  def destroy
    @clip = current_user.clips.find(params[:id])
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

  private

  def refresh_clip_card
    @collections = current_user.collections.order(:name)

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