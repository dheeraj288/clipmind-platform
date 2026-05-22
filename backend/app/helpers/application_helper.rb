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
    content = clip.content.to_s.strip

    return clip.page_title if clip.page_title.present?

    case clip.clip_type

    when "code"

      # Ruby class
      if content.match(/class\s+([A-Z]\w+)/)
        return "#{$1} Class"
      end

      # Ruby module
      if content.match(/module\s+([A-Z]\w+)/)
        return "#{$1} Module"
      end

      # Methods/functions
      if content.match(/def\s+([a-z_]\w*)/)
        return "#{$1} Method"
      end

      "Code Snippet"

    when "link"
      URI.parse(clip.source_url).host.gsub("www.","") rescue "Website"

    when "json"
      "JSON Data"

    when "command"
      "Command Snippet"

    when "email"
      "Email Content"

    else
      content.split(".").first.truncate(50)
    end
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