class SmartTagService
  TECH_RULES = {

    ruby: %w[class module def end puts attr_accessor initialize],
    rails: %w[applicationrecord applicationcontroller has_many belongs_to validates before_action],
    python: %w[def import self flask django fastapi pandas numpy],
    javascript: %w[const let function async await fetch document window],
    typescript: %w[interface type enum readonly],
    react: %w[usestate useeffect jsx react reactdom],
    nextjs: %w[getserversideprops app-router nextconfig],
    vue: %w[v-model v-bind v-for vue],
    angular: %w[@component ngif ngfor],
    nodejs: %w[express require npm node],
    html: %w[html div section header footer],
    css: %w[display flex margin padding],
    tailwind: %w[bg- text- flex grid rounded-],
    java: %w[public static void spring],
    csharp: %w[namespace using console writeline],
    php: %w[laravel artisan php],
    golang: %w[func package fmt],
    rust: %w[cargo println fn mut],
    sql: %w[select insert update delete join where],
    mongodb: %w[mongodb mongoose],
    redis: %w[redis cache],
    graphql: %w[graphql mutation query],
    docker: %w[dockerfile docker compose],
    kubernetes: %w[kubectl deployment service pod],
    git: %w[git commit push pull checkout],
    aws: %w[s3 ec2 lambda iam],
    linux: %w[sudo chmod systemctl apt]
  }.freeze

  def initialize(clip)
    @clip = clip
    @content = clip.content.to_s.downcase
    @url = clip.source_url.to_s.downcase
  end

  def call
    tags=[]

    TECH_RULES.each do |tag,keywords|
      if keywords.any? { |word| @content.include?(word.downcase) }
        tags << tag.to_s
      end
    end

    tags << "github" if @url.include?("github")
    tags << "youtube" if @url.include?("youtube")
    tags << "article" if article?

    tags.uniq.first(10)
  end

  private

  def article?
    @url.include?("medium") ||
    @url.include?("dev.to") ||
    @url.include?("hashnode") ||
    @url.include?("blog")
  end
end