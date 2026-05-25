class ClipPostProcessJob < ApplicationJob
  queue_as :clips

  discard_on ActiveJob::DeserializationError

  def perform(clip_id)
    clip = Clip.active.find_by(id: clip_id)
    return unless clip

    if clip.tags.blank?
      clip.update_columns(
        tags: SmartTagService.new(clip).call,
        updated_at: Time.current
      )
    end

    if clip.collection_id.blank?
      AutoCollectionService.new(
        user: clip.user,
        clip: clip
      ).call
    end

    ClipAiSummaryJob.perform_later(clip.id)
  end
end