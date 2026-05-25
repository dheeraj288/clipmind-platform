class ClipAiSummaryJob < ApplicationJob
  queue_as :ai

  def perform(clip_id)
    clip = Clip.find_by(id: clip_id)

    return unless clip

    clip.update!(
      ai_status: "processing",
      ai_error: nil
    )

    begin
      ClipSummaryService.new(clip).call

      clip.update!(ai_status: "completed")

      Turbo::StreamsChannel.broadcast_replace_to(
        "user_#{clip.user_id}_clips",
        target: ActionView::RecordIdentifier.dom_id(clip),
        partial: "shared/clip_card",
        locals: { clip: clip.reload }
      )

    rescue => e
      clip.update!(
        ai_status: "failed",
        ai_error: e.message
      )

      Rails.logger.error e.message
    end
  end
end