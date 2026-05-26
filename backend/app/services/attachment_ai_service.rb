class AttachmentAiService
  def initialize(attachment)
    @attachment = attachment
  end

  def call
    if pdf?
      extract_pdf_text
    elsif image?
      image_context
    else
      file_context
    end
  end

  private

  attr_reader :attachment

  def pdf?
    attachment.content_type == "application/pdf"
  end

  def image?
    attachment.content_type.to_s.start_with?("image/")
  end

  def extract_pdf_text
    file = Tempfile.new(["attachment", ".pdf"])
    file.binmode
    file.write(attachment.download)
    file.rewind

    reader = PDF::Reader.new(file.path)

    text = reader.pages.first(5).map(&:text).join("\n").squish

    text.presence || file_context
  ensure
    file.close
    file.unlink
  end

  def image_context
    <<~TEXT.squish
      Image attachment uploaded.
      Filename: #{attachment.filename}
      Content type: #{attachment.content_type}
      Size: #{attachment.byte_size} bytes.
    TEXT
  end

  def file_context
    <<~TEXT.squish
      File attachment uploaded.
      Filename: #{attachment.filename}
      Content type: #{attachment.content_type}
      Size: #{attachment.byte_size} bytes.
    TEXT
  end
end