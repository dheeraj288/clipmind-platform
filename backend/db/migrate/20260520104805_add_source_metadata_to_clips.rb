class AddSourceMetadataToClips < ActiveRecord::Migration[7.1]
  def change
    add_column :clips, :site_name, :string
    add_column :clips, :favicon_url, :string
    add_column :clips, :preview_image, :string
    add_column :clips, :page_description, :text
    add_column :clips, :content_kind, :string
    add_column :clips, :surrounding_text, :text
  end
end
