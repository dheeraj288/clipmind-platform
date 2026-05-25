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

    @today_clips = current_user.clips.active.where(
      created_at: Time.zone.now.beginning_of_day..Time.zone.now.end_of_day
    )

    @memory_stats = {
      total: @today_clips.count,
      code: @today_clips.where(clip_type: "code").count,
      links: @today_clips.where(clip_type: "link").count,
      commands: @today_clips.where(clip_type: "command").count
    }

    @top_tags =
      current_user.clips.active
                  .where.not(tags: nil)
                  .pluck(:tags)
                  .flatten
                  .compact
                  .group_by(&:itself)
                  .transform_values(&:count)
                  .sort_by { |_, count| -count }
                  .first(5)

    @recent_memory =
      current_user.clips.active
                  .order(created_at: :desc)
                  .limit(5)
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

  def quick_add
    @clip = current_user.clips.new
    @collections = current_user.collections.order(:name)
  end

  def create
    detection = ClipDetectorService.detect(clip_params[:content])

    @clip = current_user.clips.new(clip_params)
    @clip.clip_type = detection[:clip_type]
    @clip.language = detection[:language]
    @clip.source = "manual"
    @clip.copied_at = Time.current
    @clip.copy_count ||= 0
    @clip.is_favorite ||= false
    @clip.is_pinned ||= false
    @clip.tags = SmartTagService.new(@clip).call

    if @clip.save
      AutoCollectionService.new(user: current_user, clip: @clip).call if @clip.collection_id.blank?

      redirect_to clips_path, notice: "Clip added successfully"
    else
      @collections = current_user.collections.order(:name)
      render :quick_add, status: :unprocessable_entity
    end
  end

  def quick_create
    detection = ClipDetectorService.detect(params[:content])

    clip = current_user.clips.new(
      content: params[:content],
      title: params[:title],
      clip_type: detection[:clip_type],
      language: detection[:language],
      source: "command_palette",
      copied_at: Time.current,
      copy_count: 0,
      is_favorite: false,
      is_pinned: false
    )

    clip.tags = SmartTagService.new(clip).call

    if clip.save
      AutoCollectionService.new(user: current_user, clip: clip).call if clip.collection_id.blank?
      redirect_to clips_path, notice: "Clip added"
    else
      redirect_to clips_path, alert: "Clip could not be added"
    end
  end

  def summarize
    @clip = current_user.clips.find(params[:id])
    @summary = ClipSummaryService.new(@clip).call

    respond_to do |format|
      format.turbo_stream
      format.html { redirect_back fallback_location: clips_path, notice: "Summary generated." }
    end
  end

  def save_ai_memory
    @clip = current_user.clips.find(params[:id])

    @clip.update!(
      ai_memory: true,
      ai_memory_saved_at: Time.current
    )

    respond_to do |format|
      format.turbo_stream
      format.html do
        redirect_back(
          fallback_location: clips_path,
          notice: "Saved to AI Memory"
        )
      end
    end
  end

  def regenerate_summary
    @clip = current_user.clips.find(params[:id])

    @clip.update(
      ai_summary: nil,
      ai_summary_generated_at: nil
    )

    @summary = ClipSummaryService.new(@clip.reload).call

    respond_to do |format|
      format.turbo_stream { render :summarize }
    end
  end

  def hide_summary
    @clip = current_user.clips.find(params[:id])

    respond_to do |format|
      format.turbo_stream
      format.html { redirect_back fallback_location: clips_path }
    end
  end

  private

  def clip_params
    params.require(:clip).permit(
      :title,
      :content,
      :collection_id
    )
  end

  def refresh_clip_card
    @collections = current_user.collections.order(:name)

    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          @clip,
          partial: "shared/clip_card",
          locals: {clip: @clip,collections: @collections}
        )
      end

      format.html { redirect_back fallback_location: clips_path }
    end
  end
end