class Api::V1::ClipsController < Api::V1::BaseController
  before_action :set_clip, only: [:show, :update, :destroy]

 def index

  clips = current_user.clips.active

  if params[:favorites] == "true"

    clips = clips.where(
      is_favorite: true
    )
  end
  if params[:q].present?

    query = "%#{params[:q]}%"

    clips = clips.where(
      "title ILIKE :query OR content ILIKE :query",
      query: query
    )
  end
  clips = clips.order(created_at: :desc)
  page = params[:page].to_i
  page = 1 if page <= 0

  limit = params[:limit].to_i
  limit = 20 if limit <= 0

  total_count = clips.count

  clips = clips
            .offset((page - 1) * limit)
            .limit(limit)

  render json: {
    clips: clips,
    pagination: {
      current_page: page,
      limit: limit,
      total_count: total_count,
      total_pages: (total_count / limit.to_f).ceil
    }
  }
end

  def create

    existing_clip = current_user.clips
      .where(content: clip_params[:content])
      .where(
        "created_at > ?",
        5.minutes.ago
      )
      .first

    if existing_clip

      render json: {
        message: 'Duplicate clip ignored'
      }, status: :ok

      return
    end

    detection = ClipDetectorService.detect(clip_params[:content])

    clip = current_user.clips.new(
      clip_params.merge(
        clip_type: detection[:clip_type],
        language: detection[:language],
        deleted_at: nil
      )
    )

    if clip.save

      AutoCollectionService
        .new(
          user: current_user,
          clip: clip
        )
        .call

      clip.reload

      clip.update!(
        tags: SmartTagService
          .new(clip)
          .call
      )

      render json: clip,
             status: :created
  
    else
      render json: {
        errors: clip.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def show
    render json: @clip
  end


  def update
  if clip_params[:collection_id].present?
    current_user
      .collections
      .find(clip_params[:collection_id])
  end

  if @clip.update(clip_params)
    render json: @clip
  else
    render json: {
      errors: @clip.errors.full_messages
    }, status: :unprocessable_entity
  end
end

  def destroy

  @clip.update(
    deleted_at: Time.current
  )

  render json: {
    message: 'Clip moved to trash'
  }
end


  def toggle_favorite

  @clip = current_user.clips.find(params[:id])

  @clip.update(
    is_favorite: !@clip.is_favorite
  )

  render json: {
    id: @clip.id,
    is_favorite: @clip.is_favorite
  }
end

def increment_copy
  clip = current_user.clips.find(params[:id])

  Clip.increment_counter(:copy_count, clip.id)

  clip.reload

  ClipCopyLog.create!(
    clip: clip,
    user: current_user
  )

  render json: {
    success: true,
    id: clip.id,
    copy_count: clip.copy_count
  }
end


def trending

  clips = current_user
            .clips
            .active
            .trending
            .limit(10)

  render json: clips
end

def ai_memory

  clips =
    current_user
      .clips
      .active

  ranked_clips =
    clips
      .map do |clip|

        result =
          AiMemoryScoreService
            .new(clip)
            .call

        clip
          .as_json
          .merge(
            "ai_score" => result[:score].to_i,
            "ai_reasons" => result[:reasons] || []
          )
      end
      .sort_by do |clip|
        -clip["ai_score"].to_i
      end
      .first(10)

  render json: ranked_clips
end

def bulk_update

  clips =
    current_user.clips.where(
      id: params[:clip_ids]
    )

  clips.update_all(
    collection_id:
      params[:collection_id]
  )

  render json: {
    success: true
  }
end


def bulk_delete

  clips =
    current_user.clips.where(
      id: params[:clip_ids]
    )

  clips.update_all(
    deleted_at:
      Time.current
  )

  render json: {
    success: true
  }
end

private

  def set_clip
    @clip = current_user.clips.find(params[:id])
  end

  def clip_params
    params.require(:clip).permit(
      :title,
      :content,
      :source,
      :copied_at,
      :is_favorite,
      :clip_type,
      :language,
      :source_url,
      :page_title,
      :collection_id
    )
  end
end