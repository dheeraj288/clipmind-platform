class AutoCollectionService
  COLLECTION_RULES = {
    "Ruby On Rails" => %w[ruby rails model controller migration active_record],
    "React" => %w[react jsx component usestate useeffect],
    "JavaScript" => %w[javascript nodejs typescript],
    "Python" => %w[python django flask fastapi pandas numpy],
    "Frontend" => %w[frontend html css tailwind vue angular],
    "Database" => %w[database sql mongodb redis postgres mysql],
    "API & Auth" => %w[api auth jwt token authentication login],
    "DevOps" => %w[docker kubernetes aws linux],
    "GitHub" => %w[github git],
    "Videos" => %w[youtube video],
    "Articles" => %w[article blog],
    "Terminal Commands" => %w[command terminal bash shell]
  }.freeze

  def initialize(user:, clip:)
    @user = user
    @clip = clip
  end

  def call
    return if @clip.collection_id.present?

    ensure_tags!

    @tags = Array(@clip.tags).map(&:to_s)

    collection_name = detect_collection_name
    return if collection_name.blank?

    collection = @user.collections.find_or_create_by!(name: collection_name)

    @clip.update_column(:collection_id, collection.id)

    collection
  end

  private

  def ensure_tags!
    return if @clip.tags.present?

    tags = SmartTagService.new(@clip).call
    @clip.update_column(:tags, tags)
    @clip.reload
  end

  def detect_collection_name
    COLLECTION_RULES
      .map { |name, keywords| [name, (@tags & keywords).size] }
      .select { |_, score| score.positive? }
      .max_by { |_, score| score }
      &.first
  end
end