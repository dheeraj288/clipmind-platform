class ClipAiSummaryJob < ApplicationJob
  queue_as :ai

  def perform(clip_id)
    clip = Clip.active.find_by(id: clip_id)
    return unless clip

    if clip.ai_summary.present?
      clip.update!(
        ai_status: "completed",
        ai_error: nil
      )

      broadcast_clip(clip)
      return
    end

    clip.update!(ai_status: "processing", ai_error: nil)

    ClipSummaryService.new(clip).call

    clip.reload.update!(
      ai_status: "completed",
      ai_error: nil
    )

    broadcast_clip(clip)
  rescue => e
    clip&.update!(
      ai_status: "failed",
      ai_error: e.message
    )

    broadcast_clip(clip) if clip
    Rails.logger.error(e.message)
  end

  private

  def broadcast_clip(clip)
    Turbo::StreamsChannel.broadcast_replace_to(
      "user_#{clip.user_id}_clips",
      target: ActionView::RecordIdentifier.dom_id(clip),
      partial: "shared/clip_card",
      locals: { clip: clip.reload }
    )
  end
end