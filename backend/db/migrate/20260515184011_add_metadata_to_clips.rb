class AddMetadataToClips < ActiveRecord::Migration[7.1]
  def change
    add_column :clips, :source_url, :string
    add_column :clips, :page_title, :string
  end
end
