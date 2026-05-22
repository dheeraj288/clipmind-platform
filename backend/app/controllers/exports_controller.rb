require "csv"

class ExportsController < ApplicationController
  def download
    clips = current_user.clips.active

    respond_to do |format|

      format.json do
        render json: clips.as_json(
          only: [
            :title,
            :content,
            :clip_type,
            :copy_count,
            :is_favorite,
            :is_pinned,
            :source_url,
            :created_at
          ]
        )
      end

      format.csv do
        csv_data = CSV.generate(headers: true) do |csv|

          csv << [
            "Title",
            "Content",
            "Type",
            "Copies",
            "Favorite",
            "Pinned",
            "Source",
            "Created At"
          ]

          clips.each do |clip|
            csv << [
              clip.title,
              clip.content,
              clip.clip_type,
              clip.copy_count,
              clip.is_favorite,
              clip.is_pinned,
              clip.source_url,
              clip.created_at
            ]
          end
        end

        send_data csv_data,
          filename: "clipmind-#{Date.today}.csv",
          type: "text/csv"
      end
    end
  end
end