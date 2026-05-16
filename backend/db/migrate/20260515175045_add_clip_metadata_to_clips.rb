class AddClipMetadataToClips < ActiveRecord::Migration[7.1]
  def change
    add_column :clips, :clip_type, :string
    add_column :clips, :language, :string
  end
end
