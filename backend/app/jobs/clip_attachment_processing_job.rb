class ClipAttachmentProcessingJob < ApplicationJob
  queue_as :clips

  def perform(clip_id)
    clip = Clip.active.find_by(id: clip_id)
    return unless clip
    return unless clip.attachments.attached?

    clip.update!(
      ai_status: "processing",
      ai_error: nil
    )

    metadata = clip.attachments.map do |attachment|
      {
        filename: attachment.filename.to_s,
        content_type: attachment.content_type,
        byte_size: attachment.byte_size,
        image: attachment.image?,
        created_at: attachment.created_at
      }
    end

    extracted_text = clip.attachments.map do |attachment|
      AttachmentAiService.new(attachment).call
    end.join("\n\n")

    attachment_summary = build_attachment_summary(metadata, extracted_text)

    clip.update!(
      attachment_metadata: metadata,
      attachment_summary: attachment_summary,
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

  def build_attachment_summary(metadata, extracted_text)
    filenames = metadata.map { |file| file[:filename] }.join(", ")
    file_types = metadata.map { |file| file[:content_type] }.compact.uniq.join(", ")

    <<~SUMMARY.strip
      Summary:
      This clip includes attachment content that was processed in the background.

      Key Points:
      • Files: #{filenames}
      • File types: #{file_types.presence || "unknown"}
      • Extracted content preview: #{extracted_text.to_s.truncate(600)}

      Suggested Action:
      • Use this attachment summary to quickly understand the uploaded file.
    SUMMARY
  end

  def broadcast_clip(clip)
    Turbo::StreamsChannel.broadcast_replace_to(
      "user_#{clip.user_id}_clips",
      target: ActionView::RecordIdentifier.dom_id(clip),
      partial: "shared/clip_card",
      locals: { clip: clip.reload }
    )
  end
end