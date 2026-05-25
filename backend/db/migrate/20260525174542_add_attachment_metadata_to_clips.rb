class AddAttachmentMetadataToClips < ActiveRecord::Migration[7.1]
  def change
    add_column :clips, :attachment_summary, :text
    add_column :clips, :attachment_metadata, :jsonb
  end
end
