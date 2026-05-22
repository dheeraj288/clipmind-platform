module ApplicationHelper
  def collection_gradients
    [
      "from-rose-500 to-red-600",
      "from-fuchsia-500 to-pink-600",
      "from-sky-500 to-blue-600",
      "from-emerald-400 to-green-500",
      "from-violet-500 to-purple-600",
      "from-amber-400 to-orange-500"
    ]
  end

  def collection_icons
    ["🚂", "🤖", "🔌", "💻", "🎨", "▣"]
  end

  def clean_clip_title(clip)
    title = clip.title.presence || clip.page_title.presence || clip.content.to_s.lines.first

    title = title.to_s.strip
    title = title.gsub(/\s+/, " ")
    title = title.gsub(/class\s+/, "Class: ")
    title = title.gsub(/def\s+/, "Method: ")

    title.truncate(70)
  end

  def clip_domain(clip)
    return nil if clip.source_url.blank?

    URI.parse(clip.source_url).host.to_s.sub(/\Awww\./, "")
  rescue URI::InvalidURIError
    clip.source_url
  end

  def clip_favicon_url(clip)
    return clip.favicon_url if clip.favicon_url.present?
    return nil if clip.source_url.blank?

    host = URI.parse(clip.source_url).host
    return nil if host.blank?

    "https://www.google.com/s2/favicons?domain=#{host}&sz=64"
  rescue URI::InvalidURIError
    nil
  end
end