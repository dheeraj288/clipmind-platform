require "faraday"
require "json"

class ClipSummaryService
  MODEL = ENV.fetch("GEMINI_MODEL", "gemini-2.0-flash").freeze

  def initialize(clip)
    @clip = clip
    @content = clip.content.to_s.strip
  end

  def call
    return @clip.ai_summary if cached_summary?
    return error_message("No content available to summarize.") if @content.blank?
    return error_message("Gemini API key missing. Add GEMINI_API_KEY in backend/.env") if api_key.blank?

    response = Faraday.post(gemini_url) do |req|
      req.headers["Content-Type"] = "application/json"
      req.body = payload.to_json
      req.options.timeout = 30
      req.options.open_timeout = 10
    end

    unless response.success?
      Rails.logger.error("Gemini summary failed: #{response.status} #{response.body.inspect}")
      return error_message("Gemini API error: #{response.status}. Check API key, model, or free-tier limit.")
    end

    summary = parse_response(response.body).presence || error_message("Gemini returned empty summary.")

    @clip.update(
      ai_summary: summary,
      ai_summary_generated_at: Time.current
    )

    summary
  rescue StandardError => e
    Rails.logger.error("Gemini summary exception: #{e.class} - #{e.message}")
    error_message("AI summary unavailable right now. #{e.message}")
  end

  private

  def cached_summary?
    @clip.respond_to?(:ai_summary) &&
      @clip.ai_summary.present? &&
      @clip.ai_summary_generated_at.present?
  end

  def api_key
    ENV["GEMINI_API_KEY"].to_s.strip
  end

  def gemini_url
    "https://generativelanguage.googleapis.com/v1beta/models/#{MODEL}:generateContent?key=#{api_key}"
  end

  def payload
    {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 450
      }
    }
  end

  def prompt
    <<~PROMPT
      You are ClipMind AI, a premium clipboard memory assistant.

      Summarize this saved clipboard item.

      Return only this exact format:

      Summary:
      short useful summary

      Key Points:
      • point 1
      • point 2
      • point 3

      Suggested Action:
      • one practical next action

      Rules:
      - If content is code, explain what the code does.
      - If content is a command, explain why it is used.
      - If content is Hinglish/Indian context, use Hinglish.
      - Keep it short, useful, and premium.

      Clip type: #{@clip.clip_type}
      Language: #{@clip.language}
      Page title: #{@clip.page_title}
      Source URL: #{@clip.source_url}

      Content:
      #{@content.truncate(7_000)}
    PROMPT
  end

  def parse_response(body)
    json = JSON.parse(body)

    json
      .dig("candidates", 0, "content", "parts", 0, "text")
      .to_s
      .strip
  end

  def error_message(message)
    <<~TEXT.strip
      Summary:
      #{message}

      Key Points:
      • Gemini real AI summary abhi generate nahi hui.
      • Rails logs me exact API error check karo.

      Suggested Action:
      • GEMINI_API_KEY, GEMINI_MODEL aur server restart check karo.
    TEXT
  end
end