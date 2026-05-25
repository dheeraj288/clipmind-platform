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

    summary = build_attachment_summary(metadata)

    clip.update!(
      attachment_metadata: metadata,
      attachment_summary: summary,
      ai_status: "completed"
    )

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
  end

  private

  def build_attachment_summary(metadata)
    total_files = metadata.size
    image_count = metadata.count { |file| file[:image] }
    file_types = metadata.map { |file| file[:content_type] }.compact.uniq.join(", ")

    <<~SUMMARY.strip
      Summary:
      This clip has #{total_files} attachment#{'s' if total_files > 1}.

      Key Points:
      • Images: #{image_count}
      • File types: #{file_types.presence || "unknown"}
      • Files: #{metadata.map { |file| file[:filename] }.join(", ")}

      Suggested Action:
      • Review the attachment preview and use AI summary for context.
    SUMMARY
  end
end