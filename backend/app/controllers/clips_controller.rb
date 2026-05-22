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

  def toggle_pin
    @clip = current_user.clips.find(params[:id])
    @clip.update!(is_pinned: !@clip.is_pinned?)

    refresh_clip_card
  end

  def bulk_favorite
    clip_ids = params[:clip_ids].to_s.split(",")

    current_user
      .clips
      .where(id: clip_ids)
      .update_all(is_favorite: true, updated_at: Time.current)

    redirect_to clips_path, notice: "Selected clips added to favorites"
  end

  def bulk_pin
    clip_ids = params[:clip_ids].to_s.split(",")

    current_user
      .clips
      .where(id: clip_ids)
      .update_all(is_pinned: true, updated_at: Time.current)

    redirect_to clips_path, notice: "Selected clips pinned"
  end

  def bulk_delete
    clip_ids = params[:clip_ids].to_s.split(",")

    current_user
      .clips
      .where(id: clip_ids)
      .update_all(deleted_at: Time.current, updated_at: Time.current)

    redirect_to clips_path, notice: "Selected clips deleted"
  end

  def clear_all
    current_user
      .clips
      .active
      .update_all(deleted_at: Time.current, updated_at: Time.current)

    redirect_to clips_path, notice: "All clips cleared successfully"
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